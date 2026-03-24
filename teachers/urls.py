from django.urls import path
from .views import AdminTeacherCreateView

urlpatterns = [
    path('admin/create-teacher/', AdminTeacherCreateView.as_view(), name='admin-create-teacher'),
]
