from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicSchoolInfoView, SuperadminSchoolViewSet, BulkIDCardGenerationView

router = DefaultRouter()
router.register(r'admin-schools', SuperadminSchoolViewSet, basename='admin-schools')

urlpatterns = [
    path('school-info/<str:school_id>/', PublicSchoolInfoView.as_view(), name='school-info'),
    path('bulk-id-cards/', BulkIDCardGenerationView.as_view(), name='bulk-id-cards'),
    path('', include(router.urls)),
]
