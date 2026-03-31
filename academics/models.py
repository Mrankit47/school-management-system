from django.db import models
from django.utils import timezone

class Subject(models.Model):
    name = models.CharField(max_length=150)
    class_ref = models.ForeignKey('classes.MainClass', on_delete=models.CASCADE, related_name='academics_subjects', null=True, blank=True)
    status = models.CharField(max_length=20, default='Active')

    def __str__(self):
        return f"{self.name} - {self.class_ref.name if self.class_ref else 'Common'}"

class SubjectTeacherMapping(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_mappings')
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='subject_teachers')
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='assigned_subjects')
    
    class Meta:
        unique_together = ('subject', 'class_section')

    def __str__(self):
        return f"{self.subject.name} -> {self.teacher.user.username} ({self.class_section})"

class Exam(models.Model):
    EXAM_TYPES = (
        ('Midterm', 'Midterm'),
        ('Final', 'Final'),
        ('Unit Test', 'Unit Test'),
        ('Practical', 'Practical'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Published', 'Published'),
    )

    name = models.CharField(max_length=150)
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='exams')
    exam_type = models.CharField(max_length=30, choices=EXAM_TYPES, default='Midterm')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    passing_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    result_published = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.class_section}"

    def save(self, *args, **kwargs):
        if self.start_date and not self.date:
            self.date = self.start_date
        if self.start_date and self.end_date and self.end_date < self.start_date:
            self.end_date = self.start_date
        if self.date and not self.start_date:
            self.start_date = self.date
        if not self.end_date and self.start_date:
            self.end_date = self.start_date
        super().save(*args, **kwargs)


class ExamSchedule(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='schedules')
    subject = models.CharField(max_length=120)
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['exam_date', 'start_time']
        unique_together = ('exam', 'subject')

    def __str__(self):
        return f"{self.exam.name} - {self.subject}"

class Result(models.Model):
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='student_results')
    subject = models.CharField(max_length=100)
    marks = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)
    absent = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'exam', 'subject')

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.name} ({self.subject})"
