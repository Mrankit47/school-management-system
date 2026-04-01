from rest_framework import serializers
from .models import Assignment, Submission

class AssignmentSerializer(serializers.ModelSerializer):
    attachment_url = serializers.SerializerMethodField(read_only=True)
    teacher_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'subject',
            'teacher_name',
            'class_section',
            'start_date',
            'due_date',
            'total_marks',
            'submission_type',
            'instructions',
            'attachment',
            'attachment_url',
            'file_url',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'attachment_url']

    def get_attachment_url(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None

    def get_teacher_name(self, obj):
        if not obj.created_by:
            return None
        user = getattr(obj.created_by, 'user', None)
        if not user:
            return None
        return user.name or user.username

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        due_date = attrs.get('due_date')
        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError({'due_date': 'Due date cannot be before start date'})
        return attrs

    def validate_attachment(self, file_obj):
        if not file_obj:
            return file_obj
        name = (file_obj.name or '').lower()
        allowed = ('.pdf', '.doc', '.docx')
        if not name.endswith(allowed):
            raise serializers.ValidationError('Only PDF, DOC, and DOCX files are allowed')
        # Keep a conservative cap for assignment uploads.
        if file_obj.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('File size must be <= 10 MB')
        return file_obj

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
