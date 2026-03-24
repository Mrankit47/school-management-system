from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer
from core.permissions import IsTeacher, IsStudent

class AttendanceMarkView(views.APIView):
    """
    Teacher can POST attendance for individual students.
    """
    permission_classes = [IsTeacher]

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(marked_by=request.user.teacher_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyAttendanceView(views.APIView):
    """
    Student can see their own attendance history.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        records = Attendance.objects.filter(student__user=request.user).order_by('-date')
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)
