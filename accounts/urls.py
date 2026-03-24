from django.urls import path
from .views import UserCreateView, UserProfileView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('admin/create-user/', UserCreateView.as_view(), name='admin-create-user'),
]
