import os

from django.conf import settings
from django.db import models


class GalleryImage(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='gallery/private/')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gallery_images',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._optimize_image()

    def _optimize_image(self):
        # Keep uploads storage-compatible while reducing very large files.
        try:
            from PIL import Image
        except Exception:
            return
        if not self.image:
            return
        try:
            img = Image.open(self.image.path)
            img_format = (img.format or '').upper()
            if img_format not in {'JPEG', 'JPG', 'PNG', 'WEBP'}:
                return
            max_size = (1920, 1920)
            img.thumbnail(max_size)
            save_kwargs = {}
            if img_format in {'JPEG', 'JPG'}:
                img = img.convert('RGB')
                save_kwargs = {'optimize': True, 'quality': 80}
            elif img_format == 'PNG':
                save_kwargs = {'optimize': True}
            elif img_format == 'WEBP':
                save_kwargs = {'quality': 80}
            img.save(self.image.path, format=img_format if img_format != 'JPG' else 'JPEG', **save_kwargs)
        except Exception:
            # Never block the upload flow if optimization fails.
            return

    def filename(self):
        return os.path.basename(self.image.name or '')

    def __str__(self):
        return f"{self.title} ({self.id})"

