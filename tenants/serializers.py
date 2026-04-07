from rest_framework import serializers
from .models import School
from django.contrib.auth import get_user_model

User = get_user_model()

class PublicSchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'school_id', 'logo', 'about', 'contact_email']

class SchoolAdminSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField(read_only=True)
    teacher_count = serializers.IntegerField(read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    
    admin_name = serializers.CharField(write_only=True, required=False)
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_username = serializers.CharField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False)
    admin_phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = School
        fields = [
            'id', 'name', 'school_id', 'location', 'dealer', 'logo', 'about', 
            'contact_email', 'is_active', 'created_at', 'user_count', 
            'teacher_count', 'student_count',
            'admin_name', 'admin_email', 'admin_username', 'admin_password', 'admin_phone'
        ]

    def create(self, validated_data):
        admin_name = validated_data.pop('admin_name', None)
        admin_email = validated_data.pop('admin_email', None)
        admin_username = validated_data.pop('admin_username', None)
        admin_password = validated_data.pop('admin_password', None)
        admin_phone = validated_data.pop('admin_phone', None)

        school = super().create(validated_data)

        if admin_email and admin_username and admin_password:
            # Check if email/username already exists
            if User.objects.filter(email=admin_email).exists() or User.objects.filter(username=admin_username).exists():
                raise serializers.ValidationError("A user with this email or username already exists.")
                
            User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                name=admin_name or admin_username,
                role='admin',
                school=school,
                phone=admin_phone,
                is_staff=True # Admins might need some staff privileges in future
            )
        
        return school
