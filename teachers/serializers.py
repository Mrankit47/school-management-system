from rest_framework import serializers
from .models import TeacherProfile
from accounts.serializers import UserSerializer

class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            'id',
            'user',
            'employee_id',
            'subject_specialization',
            'phone_number',
            'gender',
            'dob',
            'qualification',
            'experience_years',
            'joining_date',
            'status',
            'profile_image_base64',
        ]
