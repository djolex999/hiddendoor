from rest_framework import serializers

from .models import Message


class StartChatSerializer(serializers.Serializer):
    unlock_token = serializers.CharField(max_length=200)


class ResumeChatSerializer(serializers.Serializer):
    resume_phrase = serializers.CharField(max_length=100)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "sender", "body", "created_at"]


class MessageCreateSerializer(serializers.Serializer):
    # trim_whitespace is on by default; allow_blank is off, so "   " is rejected.
    body = serializers.CharField(max_length=2000)


class MessagesQuerySerializer(serializers.Serializer):
    """Validates ?after=<message_id> for polling."""

    after = serializers.IntegerField(min_value=0, default=0)
