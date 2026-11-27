from rest_framework import serializers

from chat.models import ChatSession


class LoginSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=200, trim_whitespace=False)


class CounselorSessionSerializer(serializers.ModelSerializer):
    # Not a model field: comes from .annotate(unread=...) in the view.
    unread = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChatSession
        # Never expose secret_hash or resume_phrase_hash.
        fields = ["id", "status", "created_at", "last_activity", "expires_at", "unread"]
