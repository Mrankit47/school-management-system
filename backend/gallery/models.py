import os

from django.conf import settings
from django.db import models


class GalleryImage(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='school_conduct/gallery/')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gallery_images',
    )
    school = models.ForeignKey('tenants.School', on_delete=models.CASCADE, null=True, blank=True, related_name='gallery_images')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def filename(self):
        return os.path.basename(self.image.name or '')

    def __str__(self):
        return f"{self.title} ({self.id})"

