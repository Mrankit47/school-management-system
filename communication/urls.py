from django.urls import path
from .views import (
    MyNotificationsView,
    NotificationDetailView,
    NotificationMarkAllReadView,
    MessageThreadsView,
    ConversationView,
)

urlpatterns = [
    path('my/', MyNotificationsView.as_view(), name='my-notifications'),
    path('my/mark-all-read/', NotificationMarkAllReadView.as_view(), name='my-notifications-mark-all-read'),
    path('my/<int:notification_id>/', NotificationDetailView.as_view(), name='my-notification-detail'),
    path('threads/', MessageThreadsView.as_view(), name='message-threads'),
    path('conversation/<int:other_user_id>/', ConversationView.as_view(), name='message-conversation'),
]
