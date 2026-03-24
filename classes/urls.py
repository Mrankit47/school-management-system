from django.urls import path
from .views import ClassSectionListView

urlpatterns = [
    path('sections/', ClassSectionListView.as_view(), name='class-sections-list'),
]
