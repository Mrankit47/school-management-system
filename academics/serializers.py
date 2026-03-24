from rest_framework import serializers
from .models import Exam, Result

class ExamSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_section.class_ref.name', read_only=True)
    section_name = serializers.CharField(source='class_section.section_ref.name', read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'name', 'class_section', 'class_name', 'section_name', 'date']

class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)

    class Meta:
        model = Result
        fields = ['id', 'student', 'student_name', 'exam', 'exam_name', 'subject', 'marks', 'max_marks']
