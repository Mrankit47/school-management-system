from django.db.models import Q
from rest_framework import status, views, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Notification, Message
from .serializers import NotificationSerializer, MessageSerializer
from students.models import StudentProfile
from classes.models import ClassSection


def _teacher_allowed_student_ids(teacher_profile_id: int):
    class_ids = ClassSection.objects.filter(class_teacher_id=teacher_profile_id).values_list('id', flat=True)
    return set(StudentProfile.objects.filter(class_section_id__in=list(class_ids)).values_list('user_id', flat=True))


def _student_allowed_teacher_ids(student_user_id: int):
    sp = StudentProfile.objects.select_related('class_section__class_teacher__user').filter(user_id=student_user_id).first()
    if not sp or not sp.class_section or not sp.class_section.class_teacher:
        return set()
    return {sp.class_section.class_teacher.user_id}


def _is_allowed_pair(user, other_user_id: int) -> bool:
    if user.role == 'teacher':
        allowed = _teacher_allowed_student_ids(user.teacher_profile.id)
        return other_user_id in allowed
    if user.role == 'student':
        allowed = _student_allowed_teacher_ids(user.id)
        return other_user_id in allowed
    return False

class MyNotificationsView(views.APIView):
    """
    User can see their own notifications.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MessageThreadsView(views.APIView):
    """
    Teacher/Student inbox threads with unread count.

    Query params:
      - class_section_id (teacher only, optional)
      - unread_only (0/1, optional)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ('teacher', 'student'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

        unread_only = request.query_params.get('unread_only') in ('1', 'true', 'yes')
        class_section_id = request.query_params.get('class_section_id')

        if request.user.role == 'teacher':
            allowed_student_ids = _teacher_allowed_student_ids(request.user.teacher_profile.id)
            if class_section_id:
                try:
                    class_section_id = int(class_section_id)
                except Exception:
                    return Response({'error': 'Invalid class_section_id'}, status=status.HTTP_400_BAD_REQUEST)
                filtered_students = StudentProfile.objects.filter(
                    class_section_id=class_section_id,
                    class_section__class_teacher_id=request.user.teacher_profile.id,
                ).values_list('user_id', flat=True)
                allowed_student_ids = set(filtered_students)

            msgs = (
                Message.objects.select_related('sender', 'receiver')
                .filter(
                    (Q(sender=request.user) & Q(receiver_id__in=list(allowed_student_ids)))
                    | (Q(receiver=request.user) & Q(sender_id__in=list(allowed_student_ids)))
                )
                .order_by('-created_at')
            )
        else:
            allowed_teacher_ids = _student_allowed_teacher_ids(request.user.id)
            msgs = (
                Message.objects.select_related('sender', 'receiver')
                .filter(
                    (Q(sender=request.user) & Q(receiver_id__in=list(allowed_teacher_ids)))
                    | (Q(receiver=request.user) & Q(sender_id__in=list(allowed_teacher_ids)))
                )
                .order_by('-created_at')
            )

        threads_map = {}
        for m in msgs:
            other = m.receiver if m.sender_id == request.user.id else m.sender
            if other.id not in threads_map:
                threads_map[other.id] = {
                    'user_id': other.id,
                    'user_name': other.name or other.username,
                    'user_role': other.role,
                    'last_message_preview': (m.content or '[Attachment]').strip()[:120],
                    'last_message_at': m.created_at,
                    'unread_count': 0,
                    'class_name': None,
                    'section_name': None,
                }
            if m.receiver_id == request.user.id and not m.is_read:
                threads_map[other.id]['unread_count'] += 1

        # Attach class/section details for student participant.
        student_ids = [uid for uid, t in threads_map.items() if t['user_role'] == 'student']
        if student_ids:
            student_profiles = StudentProfile.objects.select_related('class_section__class_ref', 'class_section__section_ref').filter(user_id__in=student_ids)
            for sp in student_profiles:
                t = threads_map.get(sp.user_id)
                if not t:
                    continue
                t['class_name'] = sp.class_section.class_ref.name if sp.class_section else None
                t['section_name'] = sp.class_section.section_ref.name if sp.class_section else None

        threads = list(threads_map.values())
        if unread_only:
            threads = [t for t in threads if t['unread_count'] > 0]
        threads.sort(key=lambda t: t['last_message_at'], reverse=True)
        return Response(threads)


class ConversationView(views.APIView):
    """
    GET: full conversation with one allowed user.
    POST: send message (+ optional attachment).
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, other_user_id: int):
        if request.user.role not in ('teacher', 'student'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        if not _is_allowed_pair(request.user, other_user_id):
            return Response({'error': 'Not allowed for this user'}, status=status.HTTP_403_FORBIDDEN)

        qs = (
            Message.objects.select_related('sender', 'receiver')
            .filter(
                (Q(sender_id=request.user.id) & Q(receiver_id=other_user_id))
                | (Q(sender_id=other_user_id) & Q(receiver_id=request.user.id))
            )
            .order_by('created_at')
        )

        # Mark incoming messages as read.
        Message.objects.filter(sender_id=other_user_id, receiver_id=request.user.id, is_read=False).update(is_read=True)

        return Response(MessageSerializer(qs, many=True).data)

    def post(self, request, other_user_id: int):
        if request.user.role not in ('teacher', 'student'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        if not _is_allowed_pair(request.user, other_user_id):
            return Response({'error': 'Not allowed for this user'}, status=status.HTTP_403_FORBIDDEN)

        content = (request.data.get('content') or '').strip()
        attachment = request.data.get('attachment')
        if not content and not attachment:
            return Response({'error': 'Message content or attachment is required'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageSerializer(data={'content': content, 'attachment': attachment})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        msg = serializer.save(sender=request.user, receiver_id=other_user_id, is_read=False)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
