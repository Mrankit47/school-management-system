from django.urls import path
from .views import AttendanceMarkView, MyAttendanceView, MyAttendanceReportPDFView, TeacherClassAttendanceSummaryView

urlpatterns = [
    path('mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
    path('class-summary/', TeacherClassAttendanceSummaryView.as_view(), name='teacher-class-attendance-summary'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('my/report/pdf/', MyAttendanceReportPDFView.as_view(), name='my-attendance-report-pdf'),
]
