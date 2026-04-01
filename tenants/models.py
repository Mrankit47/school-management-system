from django.db import models

class School(models.Model):
    name = models.CharField(max_length=255)
    school_id = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='school_logos/', null=True, blank=True)
    about = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.school_id})"
