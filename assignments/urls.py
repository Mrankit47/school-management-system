from django.urls import path
from .views import AssignmentListView, AssignmentCreateView

urlpatterns = [
    path('', AssignmentListView.as_view(), name='assignment-list'),
    path('create/', AssignmentCreateView.as_view(), name='assignment-create'),
]
