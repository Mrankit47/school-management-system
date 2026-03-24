from django.db import models
from django.conf import settings

class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='assignments')
    due_date = models.DateField()
    file_url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.class_section}"

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='submissions')
    submission_date = models.DateTimeField(auto_now_add=True)
    file_url = models.URLField()
    marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"Submission: {self.assignment.title} by {self.student.user.username}"
