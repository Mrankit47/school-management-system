from django.urls import path
from .views import TimetableListView

urlpatterns = [
    path('', TimetableListView.as_view(), name='timetable-list'),
]
