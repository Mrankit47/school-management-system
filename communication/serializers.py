from rest_framework import serializers
from .models import Notification, Message

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    receiver_role = serializers.CharField(source='receiver.role', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'sender',
            'sender_name',
            'sender_role',
            'receiver',
            'receiver_name',
            'receiver_role',
            'content',
            'attachment',
            'attachment_url',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['sender', 'receiver', 'is_read', 'created_at', 'attachment_url']

    def get_sender_name(self, obj):
        return obj.sender.name or obj.sender.username

    def get_receiver_name(self, obj):
        return obj.receiver.name or obj.receiver.username

    def get_attachment_url(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None

    def validate_attachment(self, file_obj):
        if not file_obj:
            return file_obj
        name = (file_obj.name or '').lower()
        allowed = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf')
        if not name.endswith(allowed):
            raise serializers.ValidationError('Only images and PDF files are allowed')
        if file_obj.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Attachment size must be <= 10 MB')
        return file_obj
