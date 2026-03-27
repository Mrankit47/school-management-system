from rest_framework import views, status, permissions
from rest_framework.response import Response
from accounts.models import User
from .models import TeacherProfile
from .serializers import TeacherProfileSerializer
from core.permissions import IsAdmin

class TeacherProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = TeacherProfile.objects.filter(user=request.user).first()
        if profile:
            serializer = TeacherProfileSerializer(profile)
            return Response(serializer.data)
        return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)


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
        p.user.delete()
        return Response({"message": "Teacher deleted successfully"}, status=status.HTTP_200_OK)


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

        # Update TeacherProfile fields
        p.employee_id = data.get('employee_id', p.employee_id)
        p.subject_specialization = data.get('subject_specialization', p.subject_specialization)

        p.phone_number = data.get('phone_number', p.phone_number)
        p.gender = data.get('gender', p.gender)
        p.dob = data.get('dob', p.dob)
        p.qualification = data.get('qualification', p.qualification)
        p.experience_years = data.get('experience_years', p.experience_years)
        p.joining_date = data.get('joining_date', p.joining_date)
        p.status = data.get('status', p.status)
        p.profile_image_base64 = data.get('profile_image_base64', p.profile_image_base64)
        p.save()

        return Response({"message": "Teacher updated successfully"}, status=status.HTTP_200_OK)

class AdminTeacherCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                name=data.get('name', ''),
                role='teacher'
            )
            profile = TeacherProfile.objects.create(
                user=user,
                employee_id=data['employee_id'],
                subject_specialization=data.get('subject_specialization'),
                phone_number=data.get('phone_number'),
                gender=data.get('gender'),
                dob=data.get('dob'),
                qualification=data.get('qualification'),
                experience_years=data.get('experience_years'),
                joining_date=data.get('joining_date'),
                status=data.get('status') or 'Active',
                profile_image_base64=data.get('profile_image_base64'),
            )
            return Response({"message": "Teacher created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
