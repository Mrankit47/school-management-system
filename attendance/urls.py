from django.urls import path
from .views import AttendanceMarkView, MyAttendanceView

urlpatterns = [
    path('mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
]
