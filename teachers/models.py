from django.db import models
from django.conf import settings

class TeacherProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    subject_specialization = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.PositiveIntegerField(blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, default='Active')
    profile_image_base64 = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='teacher_photos/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.name} ({self.employee_id})"

class TeacherDocument(models.Model):
    """
    Optional teacher documents (certificates, resume, etc.).
    Teachers can upload and view them from their profile.
    """
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='teacher_documents/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.teacher.employee_id}"
