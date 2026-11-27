from rest_framework import serializers

from .models import HelpCard


class UnlockSerializer(serializers.Serializer):
    sequence = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=99),
        max_length=32,
    )


class HelpCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpCard
        fields = ["slug", "topic", "title", "body"]
