from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role', 'phone', 'school']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that includes user data (role, name, etc.)
    in the login response so the frontend can use it directly.
    """

    def validate(self, attrs):
        username = attrs.get('username')
        if '@' in username:
            # If an email is provided, find the corresponding user's username
            user_obj = User.objects.filter(email__iexact=username).first()
            if user_obj:
                attrs['username'] = user_obj.username

        data = super().validate(attrs)

        # Add user info to the response
        user = self.user
        request = self.context.get('request')
        
        # Superadmins don't belong to any school and bypass school check
        if not user.is_superuser:
            if not user.school:
                raise serializers.ValidationError("This user is not assigned to any school.")
            
            if not user.school.is_active:
                raise serializers.ValidationError("Your school account is suspended. Please contact support.")

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name or user.username,
            'role': 'superadmin' if user.is_superuser else user.role,
            'school_id': getattr(user.school, 'school_id', None),
            'school_name': getattr(user.school, 'name', None),
        }

        return data
