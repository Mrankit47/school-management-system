from django.db import models
from django.conf import settings

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )
    
    VIA_CHOICES = (
        ('manual', 'Manual'),
        ('rfid', 'RFID'),
    )

    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey('teachers.TeacherProfile', on_delete=models.SET_NULL, null=True, blank=True)
    marked_via = models.CharField(max_length=10, choices=VIA_CHOICES, default='manual')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.user.username} - {self.date} ({self.status})"
