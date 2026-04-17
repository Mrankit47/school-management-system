from rest_framework import serializers
from .models import StudentProfile
from accounts.serializers import UserSerializer

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class_name = serializers.CharField(source='class_section.class_ref.name', read_only=True)
    section_name = serializers.CharField(source='class_section.section_ref.name', read_only=True)
    class_section_display = serializers.SerializerMethodField()

    def get_class_section_display(self, obj):
        if obj.class_section:
            return f"{obj.class_section.class_ref.name} - {obj.class_section.section_ref.name}"
        return None

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'user',
            'admission_number',
            'rfid_code',
            'class_name',
            'section_name',
            'class_section_display',
            'dob',
            'gender',
            'blood_group',
            'father_name',
            'mother_name',
            'father_contact',
            'mother_contact',
            'bus_no',
            'address',
            'date_of_admission',
            'category',
        ]
