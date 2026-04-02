from django.urls import path

from .views import (
    SyllabusDetailView,
    SyllabusListView,
    StudentSyllabusDownloadView,
    StudentSyllabusFiltersView,
    TeacherSyllabusOptionsView,
    TeacherSyllabusUploadView,
)

urlpatterns = [
    path('teacher/options/', TeacherSyllabusOptionsView.as_view(), name='teacher-syllabus-options'),
    path('teacher/upload/', TeacherSyllabusUploadView.as_view(), name='teacher-syllabus-upload'),
    path('teacher/', SyllabusListView.as_view(), name='teacher-syllabus-list'),
    path('admin/', SyllabusListView.as_view(), name='admin-syllabus-list'),
    path('student/', SyllabusListView.as_view(), name='student-syllabus-list'),
    path('student/filters/', StudentSyllabusFiltersView.as_view(), name='student-syllabus-filters'),
    path('<int:syllabus_id>/', SyllabusDetailView.as_view(), name='syllabus-detail'),
    path('student/download/<int:syllabus_id>/', StudentSyllabusDownloadView.as_view(), name='student-syllabus-download'),
]

