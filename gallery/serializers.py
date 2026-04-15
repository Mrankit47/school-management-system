from rest_framework import serializers
from .models import GalleryImage

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'school', 'image', 'caption', 'created_at']
        read_only_fields = ['school', 'created_at']
