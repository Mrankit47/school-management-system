from rest_framework import viewsets, permissions
from .models import GalleryImage
from .serializers import GalleryImageSerializer

class GalleryImageViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'school'):
            return GalleryImage.objects.filter(school=user.school)
        return GalleryImage.objects.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)
