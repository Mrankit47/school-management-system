from django.urls import path
from .views import AdminStudentCreateView

urlpatterns = [
    path('admin-create/', AdminStudentCreateView.as_view(), name='admin-student-create'),
]
