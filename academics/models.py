from django.db import models
from django.utils import timezone

class Subject(models.Model):
    name = models.CharField(max_length=150)
    class_ref = models.ForeignKey('classes.MainClass', on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
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
    name = models.CharField(max_length=150)
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='exams')
    date = models.DateField(null=True, blank=True) # Retained for backwards compatibility
    
    # New Extended Fields
    exam_type = models.CharField(max_length=50, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, default='Draft')
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.class_section}"

class Result(models.Model):
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='student_results')
    subject = models.CharField(max_length=100)
    marks = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ('student', 'exam', 'subject')

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.name} ({self.subject})"
