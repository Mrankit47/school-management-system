import os

from django.core.files.storage import default_storage
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status, views, permissions
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from core.permissions import IsAdmin, IsStudent, IsTeacher
from classes.models import ClassSection
from subjects.models import Subject, TeacherAssignment

from .models import Syllabus
from .serializers import SyllabusSerializer


class TeacherSyllabusOptionsView(views.APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher_profile = getattr(request.user, 'teacher_profile', None)
        if not teacher_profile:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        # Preferred: TeacherAssignment (class_ref + subject mapping).
        qs = TeacherAssignment.objects.select_related('class_ref', 'subject').filter(teacher_id=teacher_profile.id)
        if qs.exists():
            qs = qs.order_by('class_ref__name', 'subject__name')
            options = []
            for ta in qs:
                options.append(
                    {
                        'class_id': ta.class_ref_id,
                        'class_name': ta.class_ref.name,
                        'subject_id': ta.subject_id,
                        'subject_name': ta.subject.name,
                    }
                )
            return Response(options)

        # Fallback: teacher is assigned as `class_teacher` for sections.
        managed_class_ids = (
            ClassSection.objects.filter(class_teacher_id=teacher_profile.id)
            .values_list('class_ref_id', flat=True)
            .distinct()
        )
        if not managed_class_ids:
            # Last fallback: subject-teaching mapping (Subject.teachers M2M).
            subjects = (
                Subject.objects.select_related('class_ref')
                .filter(teachers__id=teacher_profile.id, status='Active')
                .order_by('class_ref__name', 'name')
            )
            options = []
            for s in subjects:
                options.append(
                    {
                        'class_id': s.class_ref_id,
                        'class_name': s.class_ref.name,
                        'subject_id': s.id,
                        'subject_name': s.name,
                    }
                )
            return Response(options)

        # Subject dropdown: all active subjects belonging to those classes.
        subjects = (
            Subject.objects.select_related('class_ref')
            .filter(class_ref_id__in=list(managed_class_ids), status='Active')
            .order_by('class_ref__name', 'name')
        )
        options = []
        for s in subjects:
            options.append(
                {
                    'class_id': s.class_ref_id,
                    'class_name': s.class_ref.name,
                    'subject_id': s.id,
                    'subject_name': s.name,
                }
            )
        return Response(options)


class TeacherSyllabusUploadView(views.APIView):
    permission_classes = [IsTeacher]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        teacher_profile = getattr(request.user, 'teacher_profile', None)
        if not teacher_profile:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

        class_id = request.data.get('class_id')
        subject_id = request.data.get('subject_id')
        title = (request.data.get('title') or '').strip()
        description = request.data.get('description') or ''
        pdf = request.FILES.get('pdf')

        if not class_id or not subject_id:
            return Response({'error': 'class_id and subject_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            return Response({'error': 'title is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not pdf:
            return Response({'error': 'pdf file is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_id = int(class_id)
            subject_id = int(subject_id)
        except Exception:
            return Response({'error': 'Invalid class_id or subject_id'}, status=status.HTTP_400_BAD_REQUEST)

        subject = Subject.objects.select_related('class_ref').filter(id=subject_id, class_ref_id=class_id).first()
        if not subject:
            return Response({'error': 'Selected subject does not belong to selected class'}, status=status.HTTP_400_BAD_REQUEST)

        # Allowed if either TeacherAssignment exists OR teacher manages that class via ClassSection.class_teacher.
        allowed_by_assignment = TeacherAssignment.objects.filter(
            teacher_id=teacher_profile.id,
            class_ref_id=class_id,
            subject_id=subject_id,
        ).exists()
        if not allowed_by_assignment:
            allowed_by_section = ClassSection.objects.filter(class_teacher_id=teacher_profile.id, class_ref_id=class_id).exists()
            if not allowed_by_section:
                allowed_by_subject_teaching = Subject.objects.filter(
                    id=subject_id,
                    class_ref_id=class_id,
                    teachers__id=teacher_profile.id,
                    status='Active',
                ).exists()
                if not allowed_by_subject_teaching:
                    return Response(
                        {'error': 'You are not assigned to this class'},
                        status=status.HTTP_403_FORBIDDEN,
                    )

        try:
            syllabus = Syllabus.objects.create(
                class_ref_id=class_id,
                subject_id=subject_id,
                uploaded_by=teacher_profile,
                title=title,
                description=description,
                pdf=pdf,
            )
        except Exception as e:
            return Response({'error': f'Could not save syllabus: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(SyllabusSerializer(syllabus).data, status=status.HTTP_201_CREATED)


class SyllabusListView(views.APIView):
    """
    Role-based syllabus list.

    - Admin: all syllabi
    - Teacher: only uploaded by self
    - Student: only their class
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset_for_user(self, request):
        if request.user.role == 'admin':
            return Syllabus.objects.select_related('class_ref', 'subject', 'uploaded_by__user')
        if request.user.role == 'teacher':
            teacher_profile = getattr(request.user, 'teacher_profile', None)
            if not teacher_profile:
                return Syllabus.objects.none()
            return Syllabus.objects.select_related('class_ref', 'subject', 'uploaded_by__user').filter(uploaded_by=teacher_profile)
        if request.user.role == 'student':
            sp = getattr(request.user, 'student_profile', None)
            if not sp or not sp.class_section_id:
                return Syllabus.objects.none()
            return Syllabus.objects.select_related('class_ref', 'subject', 'uploaded_by__user').filter(
                class_ref_id=sp.class_section.class_ref_id
            )
        return Syllabus.objects.none()

    def get(self, request):
        qs = self.get_queryset_for_user(request)

        class_id = request.query_params.get('class_id')
        subject_id = request.query_params.get('subject_id')
        search = (request.query_params.get('search') or '').strip()

        # Students always restricted to their class; ignore class_id if mismatch.
        if request.user.role == 'student' and (sp := getattr(request.user, 'student_profile', None)):
            if class_id and sp.class_section and str(sp.class_section.class_ref_id) != str(class_id):
                class_id = None

        if class_id and class_id != '':
            qs = qs.filter(class_ref_id=class_id)
        if subject_id and subject_id != '':
            qs = qs.filter(subject_id=subject_id)

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(subject__name__icontains=search))

        qs = qs.order_by('-uploaded_at')
        return Response(SyllabusSerializer(qs, many=True).data)


class SyllabusDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _get_allowed_object(self, request, syllabus_id):
        syllabus = Syllabus.objects.select_related('class_ref', 'subject', 'uploaded_by__user').filter(id=syllabus_id).first()
        if not syllabus:
            return None

        if request.user.role == 'admin':
            return syllabus

        if request.user.role == 'teacher':
            teacher_profile = getattr(request.user, 'teacher_profile', None)
            if syllabus.uploaded_by_id != (teacher_profile.id if teacher_profile else None):
                return None
            return syllabus

        if request.user.role == 'student':
            sp = getattr(request.user, 'student_profile', None)
            if not sp or not sp.class_section_id:
                return None
            if syllabus.class_ref_id != sp.class_section.class_ref_id:
                return None
            return syllabus

        return None

    def get(self, request, syllabus_id: int):
        syllabus = self._get_allowed_object(request, syllabus_id)
        if not syllabus:
            return Response({'error': 'Syllabus not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SyllabusSerializer(syllabus).data)

    def patch(self, request, syllabus_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

        syllabus = self._get_allowed_object(request, syllabus_id)
        if not syllabus:
            return Response({'error': 'Syllabus not found'}, status=status.HTTP_404_NOT_FOUND)

        title = request.data.get('title', None)
        description = request.data.get('description', None)
        pdf = request.FILES.get('pdf', None)

        # Prevent teacher from changing class/subject by ignoring any extra fields.
        if title is not None:
            title = str(title).strip()
            if not title:
                return Response({'error': 'title cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
            syllabus.title = title
        if description is not None:
            syllabus.description = description
        if pdf is not None:
            syllabus.pdf = pdf

        syllabus.save()
        return Response(SyllabusSerializer(syllabus).data, status=status.HTTP_200_OK)

    def delete(self, request, syllabus_id: int):
        if request.user.role not in ('admin', 'teacher'):
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

        syllabus = self._get_allowed_object(request, syllabus_id)
        if not syllabus:
            return Response({'error': 'Syllabus not found'}, status=status.HTTP_404_NOT_FOUND)

        syllabus.delete()
        return Response({'message': 'Syllabus deleted successfully'}, status=status.HTTP_200_OK)


class StudentSyllabusDownloadView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, syllabus_id: int):
        syllabus = get_object_or_404(Syllabus, id=syllabus_id)
        sp = request.user.student_profile
        if not sp.class_section_id or syllabus.class_ref_id != sp.class_section.class_ref_id:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if not syllabus.pdf:
            return Response({'error': 'PDF not found'}, status=status.HTTP_404_NOT_FOUND)

        # Use Django storage to return the file as attachment.
        file_path = syllabus.pdf.path if hasattr(syllabus.pdf, 'path') else None
        if file_path and default_storage.exists(syllabus.pdf.name):
            fh = syllabus.pdf.open('rb')
            response = FileResponse(fh, content_type='application/pdf')
            filename = os.path.basename(syllabus.pdf.name)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        return Response({'error': 'Could not open PDF'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentSyllabusFiltersView(views.APIView):
    """
    Return the student's class (single option) and subjects for that class.
    """

    permission_classes = [IsStudent]

    def get(self, request):
        sp = request.user.student_profile
        if not sp or not sp.class_section_id:
            return Response({'error': 'Student class not found'}, status=status.HTTP_400_BAD_REQUEST)

        class_ref_id = sp.class_section.class_ref_id
        class_name = sp.class_section.class_ref.name

        subjects = list(
            Subject.objects.filter(class_ref_id=class_ref_id, status='Active')
            .order_by('name')
        )
        return Response(
            {
                'class_id': class_ref_id,
                'class_name': class_name,
                'subjects': [{'id': s.id, 'name': s.name} for s in subjects],
            }
        )

