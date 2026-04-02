from rest_framework import serializers

from .models import Syllabus


class SyllabusSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_ref.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    pdf_url = serializers.SerializerMethodField(read_only=True)
    uploaded_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Syllabus
        fields = [
            'id',
            'class_ref',
            'class_name',
            'subject',
            'subject_name',
            'title',
            'description',
            'pdf',
            'pdf_url',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ['uploaded_by', 'uploaded_by_name', 'uploaded_at', 'updated_at', 'pdf_url', 'pdf']

    def get_pdf_url(self, obj):
        try:
            return obj.pdf.url if obj.pdf else None
        except Exception:
            return None

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return None
        return obj.uploaded_by.user.name or obj.uploaded_by.user.username

