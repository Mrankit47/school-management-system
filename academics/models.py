from django.db import models

class Exam(models.Model):
    name = models.CharField(max_length=150)
    class_section = models.ForeignKey('classes.ClassSection', on_delete=models.CASCADE, related_name='exams')
    date = models.DateField()

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
