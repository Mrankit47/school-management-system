from django.urls import path
from .views import (
    AdminStudentCreateView,
    StudentListView,
    StudentDetailView,
    StudentDeleteView,
    StudentUpdateView,
    StudentProfileView,
)

urlpatterns = [
    path('', StudentListView.as_view(), name='students-list'),
    path('admin-create/', AdminStudentCreateView.as_view(), name='admin-student-create'),
    path('detail/<int:student_id>/', StudentDetailView.as_view(), name='student-detail'),
    path('delete/<int:student_id>/', StudentDeleteView.as_view(), name='student-delete'),
    path('update/<int:student_id>/', StudentUpdateView.as_view(), name='student-update'),
    path('profile/', StudentProfileView.as_view(), name='student-profile-me'),
]
