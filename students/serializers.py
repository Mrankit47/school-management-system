from rest_framework import serializers
from .models import StudentProfile
from accounts.serializers import UserSerializer

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class_name = serializers.CharField(source='class_section.class_ref.name', read_only=True)
    section_name = serializers.CharField(source='class_section.section_ref.name', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'admission_number', 'rfid_code', 'class_name', 'section_name', 'dob', 'gender', 'address']
