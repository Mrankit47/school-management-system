from django.urls import path
from .views import AssignmentListView, AssignmentCreateView, MyAssignmentSubmissionsView

urlpatterns = [
    path('', AssignmentListView.as_view(), name='assignment-list'),
    path('create/', AssignmentCreateView.as_view(), name='assignment-create'),
    path('my-submissions/', MyAssignmentSubmissionsView.as_view(), name='my-assignment-submissions'),
]
