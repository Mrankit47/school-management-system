from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class MyNotificationsView(views.APIView):
    """
    User can see their own notifications.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
