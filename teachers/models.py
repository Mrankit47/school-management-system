from django.db import models
from django.conf import settings

class TeacherProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    subject_specialization = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.name} ({self.employee_id})"
