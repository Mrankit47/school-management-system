import os

from django.conf import settings
from django.http import HttpResponse
from rest_framework import status, views, permissions
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from accounts.models import User
from .models import StudentProfile
from .pdf_id_card import build_student_id_card_pdf
from core.permissions import IsAdmin
from classes.models import ClassSection, MainClass, MainSection
import re


def _roll_suffix_for_section(class_section):
    if not class_section or not getattr(class_section, 'section_ref', None):
        return ''
    name = (class_section.section_ref.name or '').strip()
    for ch in name:
        if ch.isalpha():
            return ch.upper()
    return (name[:1] or '').upper()


def _next_roll_number_for_class_section(class_section):
    suffix = _roll_suffix_for_section(class_section)
    existing = (
        StudentProfile.objects.filter(class_section=class_section, roll_number__isnull=False)
        .exclude(roll_number='')
        .values_list('roll_number', flat=True)
    )
    max_numeric = 100
    for roll in existing:
        match = re.match(r'^(\d+)', str(roll).strip())
        if match:
            num = int(match.group(1))
            if num > max_numeric:
                max_numeric = num
    return f"{max_numeric + 1}{suffix}"


def _next_admission_number():
    existing = StudentProfile.objects.values_list('admission_number', flat=True)
    used = set()
    for adm in existing:
        match = re.match(r'^ADM(\d+)$', str(adm or '').strip().upper())
        if match:
            used.add(int(match.group(1)))

    # Always start from ADM101 and assign the first free number.
    n = 101
    while n in used:
        n += 1
    return f"ADM{n}"

class StudentListView(views.APIView):
    """
    Admin-only students list.
    Returns flat fields to match existing frontend table rendering.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        records = (
            StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
            .all()
            .order_by('id')
        )

        return Response([
            {
                "id": s.id,
                "admission_number": s.admission_number,
                "roll_number": s.roll_number,
                "name": s.user.name or s.user.username,
                "first_name": s.user.first_name,
                "last_name": s.user.last_name,
                "username": s.user.username,
                "email": s.user.email,
                "dob": s.dob,
                "gender": s.gender,
                "blood_group": s.blood_group,
                "parent_guardian_name": s.parent_guardian_name,
                "parent_contact_number": s.parent_contact_number,
                "address": s.address,
                "date_of_admission": s.date_of_admission,
                "category": s.category,
                "rfid_code": s.rfid_code,
                "class_name": (
                    f"{s.class_section.class_ref.name} - {s.class_section.section_ref.name}"
                    if s.class_section else "N/A"
                ),
            }
            for s in records
        ])


class StudentsByClassSectionView(views.APIView):
    """
    Returns students for a specific `ClassSection`.
    Used by teacher result upload to implement Exam -> Class -> Student flow.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, class_section_id: int):
        if request.user.role not in ('teacher', 'admin'):
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        class_section = (
            ClassSection.objects.select_related('class_ref', 'section_ref', 'class_teacher__user')
            .filter(id=class_section_id)
            .first()
        )
        if not class_section:
            return Response({"error": "Class section not found"}, status=status.HTTP_404_NOT_FOUND)

        # Teachers can only see students from their assigned classes.
        if request.user.role == 'teacher':
            teacher_profile = getattr(request.user, 'teacher_profile', None)
            if not teacher_profile or class_section.class_teacher_id != teacher_profile.id:
                return Response({"error": "Not allowed for this class"}, status=status.HTTP_403_FORBIDDEN)

        records = (
            StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
            .filter(class_section_id=class_section_id)
            .order_by('id')
        )

        return Response([
            {
                "id": s.id,
                "admission_number": s.admission_number,
                "roll_number": s.roll_number,
                "name": s.user.name or s.user.username,
                "username": s.user.username,
                "email": s.user.email,
                "class_name": s.class_section.class_ref.name if s.class_section else None,
                "section_name": s.class_section.section_ref.name if s.class_section else None,
            }
            for s in records
        ])


class StudentDetailView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, student_id: int):
        s = (
            StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
            .filter(id=student_id)
            .first()
        )
        if not s:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "id": s.id,
                "admission_number": s.admission_number,
                "roll_number": s.roll_number,
                "name": s.user.name or s.user.username,
                "first_name": s.user.first_name,
                "last_name": s.user.last_name,
                "username": s.user.username,
                "email": s.user.email,
                "dob": s.dob,
                "gender": s.gender,
                "blood_group": s.blood_group,
                "parent_guardian_name": s.parent_guardian_name,
                "parent_contact_number": s.parent_contact_number,
                "address": s.address,
                "date_of_admission": s.date_of_admission,
                "category": s.category,
                "rfid_code": s.rfid_code,
                "class_name": (
                    f"{s.class_section.class_ref.name} - {s.class_section.section_ref.name}"
                    if s.class_section else "N/A"
                ),
            }
        )


class StudentDeleteView(views.APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, student_id: int):
        s = StudentProfile.objects.select_related('user').filter(id=student_id).first()
        if not s:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        # Delete user first; StudentProfile is OneToOne so deletion should cascade/clean up.
        s.user.delete()
        return Response({"message": "Student deleted successfully"}, status=status.HTTP_200_OK)


class StudentUpdateView(views.APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, student_id: int):
        data = request.data
        s = StudentProfile.objects.select_related('user').filter(id=student_id).first()
        if not s:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        u = s.user
        # Update User fields (no password change here).
        u.first_name = data.get('first_name', u.first_name)
        u.last_name = data.get('last_name', u.last_name)
        u.email = data.get('email', u.email)
        u.name = data.get('name', f"{u.first_name} {u.last_name}".strip())
        u.save()

        # Update StudentProfile fields.
        s.admission_number = data.get('admission_number', s.admission_number)
        if data.get('roll_number') is not None:
            s.roll_number = data.get('roll_number')
        s.dob = data.get('dob', s.dob)
        s.gender = data.get('gender', s.gender)
        s.blood_group = data.get('blood_group', s.blood_group)
        s.parent_guardian_name = data.get('parent_guardian_name', s.parent_guardian_name)
        s.parent_contact_number = data.get('parent_contact_number', s.parent_contact_number)
        s.address = data.get('address', s.address)
        s.date_of_admission = data.get('date_of_admission', s.date_of_admission)
        s.category = data.get('category', s.category)
        s.save()

        return Response({"message": "Student updated successfully"}, status=status.HTTP_200_OK)

class AdminStudentCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                # First/Last name are stored on the User model; `name` is kept for backward compatibility.
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                name=data.get('name') or f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
                role='student'
            )

            class_section_id = data.get('class_section_id')
            if not class_section_id:
                # Support class + section dropdown based creation
                class_id = data.get('class_id')
                section_id = data.get('section_id')
                if class_id and section_id:
                    c_obj = MainClass.objects.get(id=class_id)
                    s_obj = MainSection.objects.get(id=section_id)
                    cs_obj, _ = ClassSection.objects.get_or_create(class_ref=c_obj, section_ref=s_obj)
                    class_section_id = cs_obj.id
                else:
                    return Response(
                        {"error": "Provide either class_section_id OR both class_id and section_id"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            class_section = ClassSection.objects.filter(id=class_section_id).select_related('section_ref').first()
            if not class_section:
                return Response({"error": "Invalid class_section_id"}, status=status.HTTP_400_BAD_REQUEST)

            roll_number = (data.get('roll_number') or '').strip() or _next_roll_number_for_class_section(class_section)

            admission_number = (data.get('admission_number') or '').strip() or _next_admission_number()

            profile = StudentProfile.objects.create(
                user=user,
                admission_number=admission_number,
                roll_number=roll_number,
                rfid_code=data.get('rfid_code'),
                class_section_id=class_section_id,
                dob=data.get('dob'),
                gender=data.get('gender'),
                blood_group=data.get('blood_group'),
                parent_guardian_name=data.get('parent_guardian_name'),
                parent_contact_number=data.get('parent_contact_number'),
                address=data.get('address'),
                date_of_admission=data.get('date_of_admission'),
                category=data.get('category'),
            )
            return Response({"message": "Student created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({"error": "Only students can access this profile"}, status=status.HTTP_403_FORBIDDEN)
        
        s = (
            StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
            .filter(user=request.user)
            .first()
        )
        if not s:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

        photo_url = None
        has_photo = False
        if s.photo and s.photo.name:
            try:
                photo_url = request.build_absolute_uri(s.photo.url)
                has_photo = True
            except ValueError:
                pass

        return Response({
            "id": s.id,
            "admission_number": s.admission_number,
            "roll_number": s.roll_number,
            "name": s.user.name or s.user.username,
            "username": s.user.username,
            "email": s.user.email,
            "phone": s.user.phone,
            "class_name": (
                f"{s.class_section.class_ref.name} - {s.class_section.section_ref.name}"
                if s.class_section else "N/A"
            ),
            "section_name": s.class_section.section_ref.name if s.class_section else "N/A",
            "class_ref_name": s.class_section.class_ref.name if s.class_section else "N/A",
            "date_of_admission": s.date_of_admission,
            "dob": s.dob,
            "gender": s.gender,
            "parent_guardian_name": s.parent_guardian_name,
            "parent_contact_number": s.parent_contact_number,
            "address": s.address,
            "photo_url": photo_url,
            "has_photo": has_photo,
        })


_ALLOWED_PHOTO_CT = frozenset(
    {
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/octet-stream',  # some browsers; extension is still validated
    }
)


class StudentProfilePhotoView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if request.user.role != 'student':
            return Response(
                {"error": "Only students can update their profile photo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        s = StudentProfile.objects.filter(user=request.user).first()
        if not s:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

        f = request.FILES.get('photo')
        if not f:
            return Response({"error": "Send a file in field \"photo\""}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(f.name or '')[1].lower()
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            return Response({"error": "Allowed types: JPG, PNG, WebP, GIF"}, status=status.HTTP_400_BAD_REQUEST)

        ctype = (getattr(f, 'content_type', None) or '').lower()
        if ctype and ctype not in _ALLOWED_PHOTO_CT:
            return Response({"error": "Invalid image content type"}, status=status.HTTP_400_BAD_REQUEST)

        max_bytes = 4 * 1024 * 1024
        if getattr(f, 'size', 0) > max_bytes:
            return Response({"error": "Image must be 4MB or smaller"}, status=status.HTTP_400_BAD_REQUEST)

        if s.photo:
            s.photo.delete(save=False)
        s.photo = f
        s.save()

        photo_url = request.build_absolute_uri(s.photo.url)
        return Response({"message": "Photo saved", "photo_url": photo_url, "has_photo": True})

    def delete(self, request):
        if request.user.role != 'student':
            return Response(
                {"error": "Only students can update their profile photo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        s = StudentProfile.objects.filter(user=request.user).first()
        if not s:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

        if s.photo:
            s.photo.delete(save=False)
        s.photo = None
        s.save(update_fields=['photo'])
        return Response({"message": "Photo removed", "photo_url": None, "has_photo": False})


class StudentIdCardPdfView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response(
                {"error": "Only students can download their ID card"},
                status=status.HTTP_403_FORBIDDEN,
            )
        s = (
            StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
            .filter(user=request.user)
            .first()
        )
        if not s:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

        school_name = getattr(settings, 'SCHOOL_NAME', 'School Management System')
        pdf_bytes = build_student_id_card_pdf(
            s,
            school_name=school_name,
            school_address=getattr(settings, 'SCHOOL_ADDRESS', ''),
            school_phone=getattr(settings, 'SCHOOL_PHONE', ''),
            school_email=getattr(settings, 'SCHOOL_EMAIL', ''),
            school_website=getattr(settings, 'SCHOOL_WEBSITE', ''),
        )
        filename = f"id-card-{s.admission_number or s.id}.pdf"
        disposition = (request.query_params.get('disposition') or 'attachment').lower()
        if disposition == 'inline':
            disp = f'inline; filename="{filename}"'
        else:
            disp = f'attachment; filename="{filename}"'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = disp
        return response
