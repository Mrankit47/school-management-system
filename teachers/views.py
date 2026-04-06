import os

from django.conf import settings
from django.http import HttpResponse
from rest_framework import views, status, permissions
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from accounts.models import User
from .models import TeacherProfile, TeacherDocument
from .pdf_id_card import build_teacher_id_card_pdf
from .serializers import TeacherProfileSerializer, TeacherDocumentSerializer
from core.permissions import IsAdmin, IsTeacher
from classes.models import ClassSection
from assignments.models import Assignment as AssignmentModel
from attendance.models import Attendance as AttendanceModel
from django.db import transaction
import re


def _next_employee_id():
    existing = TeacherProfile.objects.values_list('employee_id', flat=True)
    used = set()
    for eid in existing:
        match = re.match(r'^T(\d+)$', str(eid or '').strip().upper())
        if match:
            used.add(int(match.group(1)))
    n = 1
    while n in used:
        n += 1
    return f"T{n:03d}"


def _teacher_role_label(profile: TeacherProfile) -> str:
    has_class = ClassSection.objects.filter(class_teacher=profile).exists()
    has_subjects = profile.subjects.exists()
    if has_class and has_subjects:
        return 'Class Teacher & Subject Teacher'
    if has_class:
        return 'Class Teacher'
    if has_subjects:
        return 'Subject Teacher'
    return 'Teacher'


def ensure_teacher_profile(user):
    profile = TeacherProfile.objects.filter(user=user).first()
    if profile:
        return profile
    return TeacherProfile.objects.create(
        user=user,
        employee_id=_next_employee_id(),
        subject_specialization='',
        status='Active',
    )


class TeacherProfileView(views.APIView):
    permission_classes = [IsTeacher]

    def _ensure_teacher_profile(self, user):
        return ensure_teacher_profile(user)

    def get(self, request):
        profile = self._ensure_teacher_profile(request.user)
        if profile:
            data = TeacherProfileSerializer(profile).data

            classes_assigned_qs = (
                ClassSection.objects.select_related('class_ref', 'section_ref')
                .filter(class_teacher=profile)
                .order_by('class_ref__name', 'section_ref__name')
            )
            classes_assigned = []
            total_students = 0
            for cs in classes_assigned_qs:
                scount = cs.students.count()
                total_students += scount
                classes_assigned.append(
                    {
                        'id': cs.id,
                        'class_name': cs.class_ref.name,
                        'section_name': cs.section_ref.name,
                        'room_number': cs.room_number,
                        'student_count': scount,
                    }
                )

            subjects_assigned_qs = profile.subjects.select_related('class_ref').all().order_by('name')
            subjects_assigned = []
            for s in subjects_assigned_qs:
                subjects_assigned.append(
                    {
                        'id': s.id,
                        'name': s.name,
                        'code': s.code,
                        'class_name': s.class_ref.name if s.class_ref else None,
                    }
                )

            role_label = _teacher_role_label(profile)

            assignments_created = AssignmentModel.objects.filter(created_by=profile).count()
            attendance_records = AttendanceModel.objects.filter(marked_by=profile).count()

            data.update(
                {
                    'role_label': role_label,
                    'classes_assigned': classes_assigned,
                    'subjects_assigned': subjects_assigned,
                    'stats': {
                        'total_classes_handled': len(classes_assigned),
                        'total_students': total_students,
                        'assignments_created': assignments_created,
                        'attendance_records': attendance_records,
                    },
                }
            )

            photo_url = None
            has_photo = False
            if profile.photo and profile.photo.name:
                try:
                    photo_url = request.build_absolute_uri(profile.photo.url)
                    has_photo = True
                except ValueError:
                    pass
            data['photo_url'] = photo_url
            data['has_photo'] = has_photo

            return Response(data)
        return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        profile = self._ensure_teacher_profile(request.user)
        if not profile:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        # Update User fields
        if data.get('email') is not None:
            profile.user.email = data.get('email')
        if data.get('name') is not None:
            profile.user.name = data.get('name')
        if data.get('phone') is not None:
            profile.user.phone = data.get('phone')
        profile.user.save()

        # Update TeacherProfile fields
        if data.get('employee_id') is not None:
            profile.employee_id = data.get('employee_id')
        if data.get('subject_specialization') is not None:
            profile.subject_specialization = data.get('subject_specialization')
        if data.get('phone_number') is not None:
            profile.phone_number = data.get('phone_number')
        if data.get('gender') is not None:
            profile.gender = data.get('gender')
        if data.get('dob') is not None:
            profile.dob = data.get('dob')
        if data.get('qualification') is not None:
            profile.qualification = data.get('qualification')
        if data.get('experience_years') is not None:
            profile.experience_years = data.get('experience_years')
        if data.get('joining_date') is not None:
            profile.joining_date = data.get('joining_date')
        if data.get('status') is not None:
            profile.status = data.get('status')
        if data.get('profile_image_base64') is not None:
            profile.profile_image_base64 = data.get('profile_image_base64')
        profile.save()

        return self.get(request)


_ALLOWED_PHOTO_CT = frozenset(
    {
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/octet-stream',
    }
)


class TeacherProfilePhotoView(views.APIView):
    permission_classes = [IsTeacher]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = ensure_teacher_profile(request.user)

        f = request.FILES.get('photo')
        if not f:
            return Response({'error': 'Send a file in field "photo"'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(f.name or '')[1].lower()
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            return Response({'error': 'Allowed types: JPG, PNG, WebP, GIF'}, status=status.HTTP_400_BAD_REQUEST)

        ctype = (getattr(f, 'content_type', None) or '').lower()
        if ctype and ctype not in _ALLOWED_PHOTO_CT:
            return Response({'error': 'Invalid image content type'}, status=status.HTTP_400_BAD_REQUEST)

        if getattr(f, 'size', 0) > 4 * 1024 * 1024:
            return Response({'error': 'Image must be 4MB or smaller'}, status=status.HTTP_400_BAD_REQUEST)

        if profile.photo:
            profile.photo.delete(save=False)
        profile.photo = f
        profile.profile_image_base64 = None
        profile.save()

        photo_url = request.build_absolute_uri(profile.photo.url)
        return Response({'message': 'Photo saved', 'photo_url': photo_url, 'has_photo': True})

    def delete(self, request):
        profile = ensure_teacher_profile(request.user)

        if profile.photo:
            profile.photo.delete(save=False)
        profile.photo = None
        profile.profile_image_base64 = None
        profile.save(update_fields=['photo', 'profile_image_base64'])
        return Response({'message': 'Photo removed', 'photo_url': None, 'has_photo': False})


class TeacherIdCardPdfView(views.APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        profile = ensure_teacher_profile(request.user)
        profile = TeacherProfile.objects.select_related('user').filter(pk=profile.pk).first()
        if not profile:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        role_label = _teacher_role_label(profile)
        school_name = getattr(settings, 'SCHOOL_NAME', 'School Management System')
        pdf_bytes = build_teacher_id_card_pdf(profile, school_name=school_name, role_label=role_label)

        filename = f"teacher-id-card-{profile.employee_id or profile.id}.pdf"
        disposition = (request.query_params.get('disposition') or 'attachment').lower()
        if disposition == 'inline':
            disp = f'inline; filename="{filename}"'
        else:
            disp = f'attachment; filename="{filename}"'

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = disp
        return response


class TeacherDocumentsView(views.APIView):
    permission_classes = [IsTeacher]

    def _ensure_teacher_profile(self, user):
        profile = TeacherProfile.objects.filter(user=user).first()
        if profile:
            return profile

        return TeacherProfile.objects.create(
            user=user,
            employee_id=_next_employee_id(),
            subject_specialization='',
            status='Active',
        )

    def get(self, request):
        profile = self._ensure_teacher_profile(request.user)
        if not profile:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        docs = TeacherDocument.objects.filter(teacher=profile).order_by('-uploaded_at')
        return Response(TeacherDocumentSerializer(docs, many=True).data)

    def post(self, request):
        profile = self._ensure_teacher_profile(request.user)
        if not profile:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

        file_obj = request.data.get('file')
        if not file_obj:
            return Response({'error': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)

        name = (file_obj.name or '').lower()
        allowed_ext = ('.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif')
        if not name.endswith(allowed_ext):
            return Response({'error': 'Unsupported file type'}, status=status.HTTP_400_BAD_REQUEST)

        doc = TeacherDocument.objects.create(teacher=profile, file=file_obj)
        return Response(TeacherDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class TeacherListView(views.APIView):
    """
    Admin-only teacher list.
    Used by frontend `GET /api/teachers/`.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        profiles = (
            TeacherProfile.objects.select_related('user')
            .all()
            .order_by('id')
        )

        return Response([
            {
                "id": p.id,
                "user_id": p.user.id,
                "employee_id": p.employee_id,
                "name": p.user.name or p.user.username,
                "subject_specialization": p.subject_specialization,
                "email": p.user.email,
                "phone_number": p.phone_number,
                "gender": p.gender,
                "dob": p.dob,
                "qualification": p.qualification,
                "experience_years": p.experience_years,
                "joining_date": p.joining_date,
                "status": p.status,
            }
            for p in profiles
        ])


class TeacherDetailView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, teacher_id: int):
        p = (
            TeacherProfile.objects.select_related('user')
            .filter(id=teacher_id)
            .first()
        )
        if not p:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        name = p.user.name or p.user.username
        return Response({
            "id": p.id,
            "user_id": p.user.id,
            "employee_id": p.employee_id,
            "name": name,
            "email": p.user.email,
            "subject_specialization": p.subject_specialization,
            "phone_number": p.phone_number,
            "gender": p.gender,
            "dob": p.dob,
            "qualification": p.qualification,
            "experience_years": p.experience_years,
            "joining_date": p.joining_date,
            "status": p.status,
            "profile_image_base64": p.profile_image_base64,
        })


class TeacherDeleteView(views.APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, teacher_id: int):
        p = TeacherProfile.objects.select_related('user').filter(id=teacher_id).first()
        if not p:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            with transaction.atomic():
                # Keep class sections and attendance records; only detach this teacher.
                ClassSection.objects.filter(class_teacher=p).update(class_teacher=None)
                AttendanceModel.objects.filter(marked_by=p).update(marked_by=None)
                AttendanceModel.objects.filter(verified_by=p).update(verified_by=None)

                # Clear M2M subject links explicitly before profile/user deletion.
                p.subjects.clear()

                # Delete auth user (TeacherProfile will cascade via OneToOne).
                p.user.delete()

            return Response({"message": "Teacher deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error deleting teacher: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class TeacherUpdateView(views.APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, teacher_id: int):
        data = request.data
        p = TeacherProfile.objects.select_related('user').filter(id=teacher_id).first()
        if not p:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update User fields
        u = p.user
        u.email = data.get('email', u.email)

        # Support either `name` or first/last fields.
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        if data.get('name') is not None:
            u.name = data.get('name')
        elif first_name is not None or last_name is not None:
            u.first_name = first_name if first_name is not None else u.first_name
            u.last_name = last_name if last_name is not None else u.last_name
            u.name = f"{u.first_name} {u.last_name}".strip() or u.name
        u.save()

        # Helper to convert empty string to None, and keep default if None (for PATCH)
        def clean_field(val, default):
            if val is None: return default
            return val if val != "" else None

        # Update TeacherProfile fields
        p.employee_id = data.get('employee_id', p.employee_id)
        p.subject_specialization = data.get('subject_specialization', p.subject_specialization)

        p.phone_number = data.get('phone_number', p.phone_number)
        p.gender = data.get('gender', p.gender)
        p.dob = clean_field(data.get('dob'), p.dob)
        p.qualification = data.get('qualification', p.qualification)
        p.experience_years = clean_field(data.get('experience_years'), p.experience_years)
        p.joining_date = clean_field(data.get('joining_date'), p.joining_date)
        p.status = data.get('status', p.status)
        p.profile_image_base64 = data.get('profile_image_base64', p.profile_image_base64)
        p.save()

        return Response({"message": "Teacher updated successfully"}, status=status.HTTP_200_OK)

class AdminTeacherCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        try:
            # Check if email already exists
            if User.objects.filter(email=data.get('email')).exists():
                return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if username already exists
            if User.objects.filter(username=data.get('username')).exists():
                return Response({"error": "A user with this username already exists."}, status=status.HTTP_400_BAD_REQUEST)

            requested_employee_id = (data.get('employee_id') or '').strip().upper()
            if requested_employee_id and TeacherProfile.objects.filter(employee_id=requested_employee_id).exists():
                return Response({"error": "A teacher with this Employee ID already exists."}, status=status.HTTP_400_BAD_REQUEST)

            employee_id = requested_employee_id or _next_employee_id()

            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                name=data.get('name', ''),
                role='teacher'
            )
            # Helper to convert empty string to None
            def clean_field(val):
                return val if val != "" else None

            profile = TeacherProfile.objects.create(
                user=user,
                employee_id=employee_id,
                subject_specialization=data.get('subject_specialization'),
                phone_number=data.get('phone_number'),
                gender=data.get('gender'),
                dob=clean_field(data.get('dob')),
                qualification=data.get('qualification'),
                experience_years=clean_field(data.get('experience_years')),
                joining_date=clean_field(data.get('joining_date')),
                status=data.get('status') or 'Active',
                profile_image_base64=data.get('profile_image_base64'),
            )
            return Response({"message": "Teacher created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
