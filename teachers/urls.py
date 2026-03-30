from django.urls import path
from .views import (
    AdminTeacherCreateView,
    TeacherListView,
    TeacherDetailView,
    TeacherDeleteView,
    TeacherUpdateView,
)

urlpatterns = [
    path('', TeacherListView.as_view(), name='teachers-list'),
    path('admin/create-teacher/', AdminTeacherCreateView.as_view(), name='admin-create-teacher'),
    path('detail/<int:teacher_id>/', TeacherDetailView.as_view(), name='teacher-detail'),
    path('delete/<int:teacher_id>/', TeacherDeleteView.as_view(), name='teacher-delete'),
    path('update/<int:teacher_id>/', TeacherUpdateView.as_view(), name='teacher-update'),
]
