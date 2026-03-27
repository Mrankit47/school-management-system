from django.urls import path
from .views import AdminTeacherCreateView, TeacherListView

urlpatterns = [
    path('', TeacherListView.as_view(), name='teachers-list'),
    path('admin/create-teacher/', AdminTeacherCreateView.as_view(), name='admin-create-teacher'),
]
