from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from core.permissions import IsTeacher, IsStudent

class AssignmentListView(views.APIView):
    """
    List assignments. Teachers see their own, students see their class's assignments.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'student':
            student_profile = request.user.student_profile
            assignments = Assignment.objects.filter(class_section=student_profile.class_section)
        elif request.user.role == 'teacher':
            assignments = Assignment.objects.filter(created_by=request.user.teacher_profile)
        else:
            assignments = Assignment.objects.all()

        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

class AssignmentCreateView(views.APIView):
    """
    Teacher can POST new assignments.
    """
    permission_classes = [IsTeacher]

    def post(self, request):
        serializer = AssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user.teacher_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyAssignmentSubmissionsView(views.APIView):
    """
    Student-only: returns student's submissions mapped by assignment id.
    Used by dashboard to show Pending / Submitted status.
    """

    permission_classes = [IsStudent]

    def get(self, request):
        student_profile = request.user.student_profile
        submissions_qs = (
            Submission.objects.select_related('assignment')
            .filter(student=student_profile)
            .order_by('-submission_date')
        )

        # Convert queryset to a compact structure for dashboard UI.
        data = []
        for s in submissions_qs:
            data.append(
                {
                    'assignment_id': s.assignment_id,
                    'submitted': True,
                    'submission_date': s.submission_date,
                    'file_url': getattr(s, 'file_url', None),
                    'marks': s.marks,
                }
            )
        return Response(data)
