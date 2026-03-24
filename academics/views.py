from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Exam, Result
from .serializers import ExamSerializer, ResultSerializer
from core.permissions import IsTeacher, IsStudent, IsAdmin

class ExamListView(views.APIView):
    """
    List exams. Teachers/Admins can see all, students see their class's exams.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'student':
            student_profile = request.user.student_profile
            exams = Exam.objects.filter(class_section=student_profile.class_section)
        else:
            exams = Exam.objects.all()
        
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)

class ResultUploadView(views.APIView):
    """
    Teacher can POST student results.
    """
    permission_classes = [IsTeacher | IsAdmin]

    def post(self, request):
        serializer = ResultSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyResultsView(views.APIView):
    """
    Student sees their own results.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        results = Result.objects.filter(student__user=request.user)
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)
