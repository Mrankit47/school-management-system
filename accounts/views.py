from rest_framework import status, views, permissions
from rest_framework.response import Response
from .serializers import UserSerializer
from core.permissions import IsAdmin

class UserCreateView(views.APIView):
    """
    Admin-only API to create new users (Students, Teachers, Admins).
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # In a real app, you would handle password hashing properly here
            user = serializer.save()
            user.set_password(request.data.get('password'))
            user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(views.APIView):
    """
    GET the currently logged in user's profile details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
