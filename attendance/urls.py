from django.urls import path
from .views import AttendanceMarkView, MyAttendanceView, MyAttendanceReportPDFView

urlpatterns = [
    path('mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('my/report/pdf/', MyAttendanceReportPDFView.as_view(), name='my-attendance-report-pdf'),
]
