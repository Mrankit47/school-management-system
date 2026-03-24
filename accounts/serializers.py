from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role', 'phone']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that includes user data (role, name, etc.)
    in the login response so the frontend can use it directly.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to the response
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name or user.username,
            'role': user.role,
        }

        return data
