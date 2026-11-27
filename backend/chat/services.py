"""
Chat business logic, kept out of the views so views stay thin (parse input,
call a service, shape the response) and the logic is easy to test.
"""

import re
import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import F
from django.utils import timezone

from config.crypto import hmac_hash

from .models import ChatSession, Message, ResumeFailureWindow
from .words import FOOD_WORDS, WORD_FORMS

SECRET_PURPOSE = "chat.secret"  # noqa: S105 (HMAC salt, not a password)
RESUME_PURPOSE = "chat.resume"
PHRASE_WORDS = 4


@dataclass(frozen=True)
class NewCredentials:
    session: ChatSession
    secret: str
    resume_phrase: str | None = None


def generate_resume_phrase() -> str:
    return "-".join(secrets.choice(FOOD_WORDS) for _ in range(PHRASE_WORDS))


def normalize_resume_phrase(raw: str) -> str:
    """
    'Jaja, KRASTAVCA kafu-limun' -> 'jaje-krastavac-kafa-limun'.

    Forgiving about case, separators and grammatical case forms: each word is
    mapped back to its list word (chat.words.WORD_FORMS) before hashing.
    """
    words = re.findall(r"[a-zčćđšž]+", raw.lower())
    return "-".join(WORD_FORMS.get(word, word) for word in words)


def _new_secret() -> tuple[str, str]:
    secret = secrets.token_urlsafe(32)
    return secret, hmac_hash(secret, SECRET_PURPOSE)


def purge_expired() -> int:
    """Delete expired sessions. Messages go with them (on_delete=CASCADE)."""
    _, per_model = ChatSession.objects.expired().delete()
    # Old failure counters are useless after their minute; drop them too.
    ResumeFailureWindow.objects.filter(minute__lt=_current_minute()).delete()
    return per_model.get("chat.ChatSession", 0)


def start_session() -> NewCredentials:
    purge_expired()  # lazy cleanup, so we do not depend on a cron job
    secret, secret_hash = _new_secret()
    # Phrase collisions are rare but possible; the unique index catches them.
    for _ in range(5):
        phrase = generate_resume_phrase()
        try:
            with transaction.atomic():
                session = ChatSession.objects.create(
                    secret_hash=secret_hash,
                    resume_phrase_hash=hmac_hash(phrase, RESUME_PURPOSE),
                )
        except IntegrityError:
            continue
        return NewCredentials(session=session, secret=secret, resume_phrase=phrase)
    raise RuntimeError("Could not generate a unique resume phrase")


def _current_minute() -> int:
    return int(timezone.now().timestamp()) // 60


def seconds_until_next_minute() -> int:
    return 60 - int(timezone.now().timestamp()) % 60


def global_resume_locked() -> bool:
    """True when this minute already has too many failed resume lookups."""
    failures = (
        ResumeFailureWindow.objects.filter(minute=_current_minute())
        .values_list("failures", flat=True)
        .first()
    )
    return failures is not None and failures >= settings.RESUME_GLOBAL_FAILURES_PER_MINUTE


def record_resume_failure() -> None:
    """
    Count one failed lookup in this minute's window, atomically.

    The UPDATE with F() runs as a single SQL statement, so two requests at the
    same moment both get counted. If the row does not exist yet we create it;
    if another request created it first, the unique primary key raises
    IntegrityError and we fall back to the increment.
    """
    minute = _current_minute()
    window = ResumeFailureWindow.objects.filter(minute=minute)
    if window.update(failures=F("failures") + 1):
        return
    try:
        with transaction.atomic():
            ResumeFailureWindow.objects.create(minute=minute, failures=1)
    except IntegrityError:
        window.update(failures=F("failures") + 1)


def resume_session(raw_phrase: str) -> NewCredentials | None:
    """
    Find a live, open session by its phrase and issue a NEW secret.

    We only store the secret's hash, so we cannot hand back the old one.
    Rotating also cuts off any other tab still holding the old secret.
    """
    phrase_hash = hmac_hash(normalize_resume_phrase(raw_phrase), RESUME_PURPOSE)
    session = (
        ChatSession.objects.live()
        .exclude(status=ChatSession.Status.CLOSED)
        .filter(resume_phrase_hash=phrase_hash)
        .first()
    )
    if session is None:
        return None
    secret, session.secret_hash = _new_secret()
    session.last_activity = timezone.now()
    session.save(update_fields=["secret_hash", "last_activity"])
    return NewCredentials(session=session, secret=secret)


MAX_MESSAGES_PER_POLL = 200


def messages_after(session: ChatSession, after_id: int) -> list[Message]:
    """The polling query. Served by the (session, id) index."""
    return list(session.messages.filter(id__gt=after_id).order_by("id")[:MAX_MESSAGES_PER_POLL])


def add_message(session: ChatSession, sender: str, body: str) -> Message:
    message = Message.objects.create(session=session, sender=sender, body=body)
    session.last_activity = message.created_at
    update_fields = ["last_activity"]
    if sender == Message.Sender.COUNSELOR and session.status == ChatSession.Status.WAITING:
        session.status = ChatSession.Status.ACTIVE
        update_fields.append("status")
    session.save(update_fields=update_fields)
    return message


def close_session(session: ChatSession) -> None:
    """Counselor ends the chat. Data lives a few more minutes so her poll sees 'closed'."""
    grace_end = timezone.now() + timedelta(minutes=settings.CHAT_CLOSED_GRACE_MINUTES)
    session.status = ChatSession.Status.CLOSED
    session.expires_at = min(session.expires_at, grace_end)
    session.save(update_fields=["status", "expires_at"])
