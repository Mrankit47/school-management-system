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
                subject_specialization=data.get('subject_specialization')
            )
            return Response({"message": "Teacher created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
