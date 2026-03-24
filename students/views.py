from rest_framework import status, views, permissions
from rest_framework.response import Response
from accounts.models import User
from .models import StudentProfile
from core.permissions import IsAdmin

class AdminStudentCreateView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                name=data.get('name', ''),
                role='student'
            )
            profile = StudentProfile.objects.create(
                user=user,
                admission_number=data['admission_number'],
                rfid_code=data.get('rfid_code'),
                class_section_id=data.get('class_section_id'),
                dob=data.get('dob'),
                gender=data.get('gender'),
                address=data.get('address')
            )
            return Response({"message": "Student created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
