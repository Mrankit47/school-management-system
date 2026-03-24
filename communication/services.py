from .models import Notification, Message

class CommunicationService:
    @staticmethod
    def create_notification(user_id, title, message):
        return Notification.objects.create(user_id=user_id, title=title, message=message)
