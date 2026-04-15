from django.db import models
from django.conf import settings

class GalleryImage(models.Model):
    school = models.ForeignKey(
        'tenants.School', 
        on_delete=models.CASCADE, 
        related_name='gallery_images'
    )
    image = models.ImageField(upload_to='gallery/%Y/%m/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Image for {self.school.name} - {self.created_at}"
