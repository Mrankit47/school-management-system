from rest_framework import status, views, permissions
from rest_framework.response import Response
from accounts.models import User
from .models import StudentProfile
from core.permissions import IsAdmin
from classes.models import ClassSection, MainClass, MainSection

class StudentListView(views.APIView):
    """
    Admin-only students list.
    Returns flat fields to match existing frontend table rendering.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        school = request.user.school
        qs = StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            )
        if not request.user.is_superuser:
            qs = qs.filter(user__school=school)
        records = qs.order_by('id')

        return Response([
            {
                "id": s.id,
                "admission_number": s.admission_number,
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

        school = request.user.school
        qs = StudentProfile.objects.select_related('user').filter(class_section_id=class_section_id)
        if not request.user.is_superuser:
            qs = qs.filter(user__school=school)
        records = qs.order_by('id')

        return Response([
            {
                "id": s.id,
                "name": s.user.name or s.user.username,
                "username": s.user.username,
            }
            for s in records
        ])


class StudentDetailView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request, student_id: int):
        school = request.user.school
        qs = StudentProfile.objects.select_related(
                'user',
                'class_section__class_ref',
                'class_section__section_ref',
            ).filter(id=student_id)
        if not request.user.is_superuser:
            qs = qs.filter(user__school=school)
            
        s = qs.first()
        if not s:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "id": s.id,
                "admission_number": s.admission_number,
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
        school = request.user.school
        qs = StudentProfile.objects.select_related('user').filter(id=student_id)
        if not request.user.is_superuser:
            qs = qs.filter(user__school=school)
            
        s = qs.first()
        if not s:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        # Delete user first; StudentProfile is OneToOne so deletion should cascade/clean up.
        s.user.delete()
        return Response({"message": "Student deleted successfully"}, status=status.HTTP_200_OK)


class StudentUpdateView(views.APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, student_id: int):
        data = request.data
        school = request.user.school
        qs = StudentProfile.objects.select_related('user').filter(id=student_id)
        if not request.user.is_superuser:
            qs = qs.filter(user__school=school)
            
        s = qs.first()
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
                role='student',
                school=request.user.school
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

            profile = StudentProfile.objects.create(
                user=user,
                admission_number=data['admission_number'],
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

        return Response({
            "id": s.id,
            "admission_number": s.admission_number,
            "name": s.user.name or s.user.username,
            "username": s.user.username,
            "email": s.user.email,
            "class_name": (
                f"{s.class_section.class_ref.name} - {s.class_section.section_ref.name}"
                if s.class_section else "N/A"
            ),
            "section_name": s.class_section.section_ref.name if s.class_section else "N/A",
            "class_ref_name": s.class_section.class_ref.name if s.class_section else "N/A",
            "date_of_admission": s.date_of_admission,
            "dob": s.dob,
            "gender": s.gender,
        })
