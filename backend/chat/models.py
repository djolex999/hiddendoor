"""
Chat data. Deliberately holds nothing that identifies the woman: no IP, no
user agent, no account. Secrets and resume phrases are stored only as keyed
HMAC hashes (config/crypto.py).
"""

import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


def default_expiry():
    return timezone.now() + timedelta(hours=settings.CHAT_SESSION_LIFETIME_HOURS)


class ChatSessionQuerySet(models.QuerySet):
    def live(self) -> "ChatSessionQuerySet":
        """Sessions that have not expired yet. Expired rows are as good as deleted."""
        return self.filter(expires_at__gt=timezone.now())

    def expired(self) -> "ChatSessionQuerySet":
        return self.filter(expires_at__lte=timezone.now())


class ChatSession(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"

    # UUID4 so ids cannot be guessed or counted the way 1, 2, 3 can.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    secret_hash = models.CharField(max_length=64)
    # Unique + indexed: resume looks a session up by this hash.
    resume_phrase_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiry, db_index=True)
    last_activity = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.WAITING, db_index=True
    )
    # Highest message id the counselor has seen; drives the unread count.
    counselor_last_read_id = models.PositiveBigIntegerField(default=0)

    objects = ChatSessionQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{self.status} {self.id}"


class ResumeFailureWindow(models.Model):
    """
    Failed resume-phrase lookups per wall-clock minute, across all clients.

    One row per minute that had failures. Incremented with an atomic
    UPDATE ... SET failures = failures + 1, so parallel requests cannot lose
    counts. Holds no client data at all.
    """

    minute = models.PositiveBigIntegerField(primary_key=True)  # unix time // 60
    failures = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"minute {self.minute}: {self.failures}"


class Message(models.Model):
    class Sender(models.TextChoices):
        WOMAN = "woman", "Woman"
        COUNSELOR = "counselor", "Counselor"

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=Sender.choices)
    # Plain text. Frontends render it as text, never as HTML.
    body = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        # Polling query is WHERE session_id = ? AND id > ? ORDER BY id.
        indexes = [models.Index(fields=["session", "id"], name="message_session_id_idx")]

    def __str__(self) -> str:
        return f"{self.sender} #{self.id}"
