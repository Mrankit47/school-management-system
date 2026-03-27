from django.urls import path
from .views import (
    ExamDetailView,
    ExamListCreateView,
    ExamResultDashboardView,
    ExamScheduleDetailView,
    ExamScheduleListCreateView,
    MyResultsView,
    PublishResultView,
    ResultUploadView,
)

urlpatterns = [
    path('exams/', ExamListCreateView.as_view(), name='exam-list-create'),
    path('exams/<int:exam_id>/', ExamDetailView.as_view(), name='exam-detail'),
    path('exams/<int:exam_id>/schedule/', ExamScheduleListCreateView.as_view(), name='exam-schedule'),
    path('schedule/<int:schedule_id>/', ExamScheduleDetailView.as_view(), name='schedule-detail'),
    path('exams/<int:exam_id>/result-dashboard/', ExamResultDashboardView.as_view(), name='exam-result-dashboard'),
    path('exams/<int:exam_id>/publish-results/', PublishResultView.as_view(), name='exam-publish-results'),
    path('results/upload/', ResultUploadView.as_view(), name='result-upload'),
    path('results/my/', MyResultsView.as_view(), name='my-results'),
]
