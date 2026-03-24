from django.db import models

class MainClass(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class MainSection(models.Model):
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

class ClassSection(models.Model):
    class_ref = models.ForeignKey(MainClass, on_delete=models.CASCADE, related_name='sections')
    section_ref = models.ForeignKey(MainSection, on_delete=models.CASCADE, related_name='classes')
    class_teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_class')

    class Meta:
        unique_together = ('class_ref', 'section_ref')

    def __str__(self):
        return f"{self.class_ref.name} - {self.section_ref.name}"
