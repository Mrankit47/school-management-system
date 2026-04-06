from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealerViewSet, DealerSchoolViewSet

router = DefaultRouter()
router.register(r'management', DealerViewSet, basename='dealer-management')
router.register(r'schools', DealerSchoolViewSet, basename='dealer-schools')

urlpatterns = [
    path('', include(router.urls)),
]
