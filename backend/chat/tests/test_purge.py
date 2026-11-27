import logging
from datetime import timedelta

import pytest
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIClient

from chat.models import ChatSession, Message
from config.logging_filters import SensitivePathFilter
from door.signing import make_unlock_token

pytestmark = pytest.mark.django_db


def make_session(expires_in: timedelta, phrase_hash: str) -> ChatSession:
    session = ChatSession.objects.create(
        secret_hash="x", resume_phrase_hash=phrase_hash, expires_at=timezone.now() + expires_in
    )
    Message.objects.create(session=session, sender="woman", body="hi")
    return session


def test_purge_expired_command_removes_only_expired():
    make_session(timedelta(hours=-1), "old")
    keep = make_session(timedelta(hours=1), "new")

    call_command("purge_expired")

    assert list(ChatSession.objects.values_list("pk", flat=True)) == [keep.pk]
    assert Message.objects.count() == 1


def test_chat_start_purges_lazily(started_chat):
    # started_chat ran start once already; add an expired row and start again.
    make_session(timedelta(hours=-1), "old")
    APIClient().post("/api/chat/start", {"unlock_token": make_unlock_token()}, format="json")

    assert not ChatSession.objects.filter(resume_phrase_hash="old").exists()


@pytest.mark.parametrize(
    ("request_line", "kept"),
    [
        ("POST /api/u/ HTTP/1.1", False),
        ("GET /api/chat/abc/messages?after=3 HTTP/1.1", False),
        ("GET /api/c/sessions HTTP/1.1", True),
        ("GET /admin/ HTTP/1.1", True),
    ],
)
def test_logging_filter_drops_sensitive_runserver_lines(request_line, kept):
    record = logging.LogRecord(
        "django.server", logging.INFO, __file__, 1, '"%s" %s %s', (request_line, "200", "0"), None
    )
    assert SensitivePathFilter().filter(record) is kept
