from django.urls import path
from .views import (
    AdminMainClassCreateView,
    AdminMainSectionCreateView,
    ClassSectionListView,
    MainClassListView,
    MainSectionListView,
)

urlpatterns = [
    path('sections/', ClassSectionListView.as_view(), name='class-sections-list'),
    path('main-classes/', MainClassListView.as_view(), name='main-classes-list'),
    path('main-sections/', MainSectionListView.as_view(), name='main-sections-list'),
    path('admin-create-class/', AdminMainClassCreateView.as_view(), name='admin-create-class'),
    path('admin-create-section/', AdminMainSectionCreateView.as_view(), name='admin-create-section'),
]
