from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalleryImageViewSet

router = DefaultRouter()
router.register(r'images', GalleryImageViewSet, basename='gallery-image')

urlpatterns = [
    path('', include(router.urls)),
]
