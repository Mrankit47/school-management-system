from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from datetime import time

User = get_user_model()

class TimeTableEntry(models.Model):
    DAY_CHOICES = (
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
    )
    PERIOD_CHOICES = [
        (1, '08:00 AM - 09:00 AM'),
        (2, '09:00 AM - 10:00 AM'),
        (3, '10:00 AM - 11:00 AM'),
        (4, '12:00 PM - 01:00 PM'),
        (5, '01:00 PM - 02:00 PM'),
        (6, '02:00 PM - 03:00 PM'),
    ]

    school = models.ForeignKey('tenants.School', on_delete=models.CASCADE, null=True, blank=True, related_name='timetable')
    class_name = models.CharField(max_length=50)
    section = models.CharField(max_length=50)
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timetable_entries')
    day = models.IntegerField(choices=DAY_CHOICES)
    period = models.IntegerField(choices=PERIOD_CHOICES, default=1)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day', 'period']
        unique_together = [
            ('school', 'class_name', 'section', 'day', 'period'),
            ('school', 'teacher', 'day', 'period')
        ]
        indexes = [
            models.Index(fields=['teacher', 'day']),
            models.Index(fields=['class_name', 'section', 'day']),
        ]

    def clean(self):
        if self.period > 6:
            raise ValidationError("Period must be between 1 and 6.")

    def save(self, *args, **kwargs):
        # Auto-set times based on period
        time_map = {
            1: (time(8, 0), time(9, 0)),
            2: (time(9, 0), time(10, 0)),
            3: (time(10, 0), time(11, 0)),
            4: (time(12, 0), time(13, 0)),
            5: (time(13, 0), time(14, 0)),
            6: (time(14, 0), time(15, 0)),
        }
        if getattr(self, 'period', None) in time_map:
            self.start_time, self.end_time = time_map[self.period]
        
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.class_name}-{self.section} | {self.subject} | Day {self.day} Period {self.period}"
