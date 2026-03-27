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
            }
            for p in profiles
        ])

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

            # Check if employee_id already exists
            if TeacherProfile.objects.filter(employee_id=data.get('employee_id')).exists():
                return Response({"error": "A teacher with this Employee ID already exists."}, status=status.HTTP_400_BAD_REQUEST)

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
                dob=data.get('dob') if data.get('dob') else None,
                qualification=data.get('qualification'),
                experience_years=int(data.get('experience_years', 0)) if data.get('experience_years') else 0,
                joining_date=data.get('joining_date') if data.get('joining_date') else None,
                status=data.get('status', 'Active'),
                profile_image_base64=data.get('profile_image_base64')
            )
            return Response({"message": "Teacher created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
