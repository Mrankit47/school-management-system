from rest_framework import viewsets, permissions
from .models import Shop
from .serializers import ShopSerializer

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all().order_by('-created_at')
    serializer_class = ShopSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
