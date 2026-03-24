from django.urls import path
from .views import ExamListView, ResultUploadView, MyResultsView

urlpatterns = [
    path('exams/', ExamListView.as_view(), name='exam-list'),
    path('results/upload/', ResultUploadView.as_view(), name='result-upload'),
    path('results/my/', MyResultsView.as_view(), name='my-results'),
]
