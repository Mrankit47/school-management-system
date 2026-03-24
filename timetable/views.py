from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Timetable
from .serializers import TimetableSerializer

class TimetableListView(views.APIView):
    """
    Get timetable. Students get their class schedule, teachers get their personal schedule.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'student':
            student_profile = request.user.student_profile
            records = Timetable.objects.filter(class_section=student_profile.class_section).order_by('day', 'start_time')
        elif request.user.role == 'teacher':
            records = Timetable.objects.filter(teacher=request.user.teacher_profile).order_by('day', 'start_time')
        else:
            records = Timetable.objects.all()

        serializer = TimetableSerializer(records, many=True)
        return Response(serializer.data)
