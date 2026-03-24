from django.db import models

class Timetable(models.Model):
    DAY_CHOICES = (
        ('Monday', 'Monday'), ('Tuesday', 'Tuesday'), ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'), ('Friday', 'Friday'), ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday')
    )

    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='timetables')
    day = models.CharField(max_length=15, choices=DAY_CHOICES)
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='timetables')
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('class_section', 'day', 'start_time')

    def __str__(self):
        return f"{self.day} | {self.subject} | {self.class_section}"
