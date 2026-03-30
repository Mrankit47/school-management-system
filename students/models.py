from django.db import models
from django.conf import settings

class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    admission_number = models.CharField(max_length=50, unique=True)
    rfid_code = models.CharField(max_length=100, unique=True, blank=True, null=True)
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    parent_guardian_name = models.CharField(max_length=255, blank=True, null=True)
    parent_contact_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_admission = models.DateField(blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.admission_number})"
