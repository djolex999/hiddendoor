"""
Urgency triage for her messages: flags immediate danger so it is never left
unread when no counselor is looking. It NEVER calls anyone on her behalf:
calling the police without her consent can put her in more danger.

Two layers:
1. A short list of unmistakable danger words in every site language. Works
   offline and without an API key.
2. Claude, when ANTHROPIC_API_KEY is set: one Messages API call per message,
   structured JSON output, short timeout. Only the message text is sent (no
   session id, nothing else). If the call fails or is declined, layer 1 decides.

Runs in a background thread after the message is saved, so sending is never
slowed down by the AI call.
"""

import json
import logging
import threading

import anthropic
from django.conf import settings
from django.db import close_old_connections, transaction
from django.utils import timezone

from .models import ChatSession, Message
from .phrase_languages import fold

logger = logging.getLogger(__name__)

TRIAGE_MODEL = "claude-opus-5-5"

# Folded stems (lowercase, no diacritics) that on their own signal danger now.
DANGER_STEMS: tuple[str, ...] = (
    # sr / hr / bs / cnr
    "ubic",
    "ubij",
    "ubit",
    "noz",
    "pistolj",
    "pusk",
    "krvar",
    "davi",
    "gusi",
    "zaklj",
    "udara",
    "tuce",
    "prebi",
    "hitno",
    "upomoc",
    "ubicu se",
    # sl
    "ubil",
    "pistol",
    "kri ",
    "duši",
    "dusi",
    "zaklen",
    "pomagaj",
    # mk
    "убие",
    "убиј",
    "нож",
    "пиштол",
    "крвар",
    "дави",
    "заклучи",
    "итно",
    # sq
    "vras",
    "thike",
    "arm",
    "gjakos",
    "mbyt",
    "ndihme",
    "urgjent",
    # en
    "kill",
    "knife",
    "gun",
    "bleeding",
    "chok",
    "strangl",
    "locked in",
    "emergency",
)

SYSTEM_PROMPT = (
    "You triage messages sent to an anonymous domestic-violence support chat. "
    "Set urgent to true only when the message indicates immediate danger to "
    "someone's life or physical safety right now or within hours: an attack in "
    "progress, threats to kill, a weapon, strangulation, serious injury, being "
    "locked in, children in danger now, or intent to self-harm. Past abuse, "
    "general fear, or asking for advice without immediate danger is not urgent. "
    "Messages may be in Serbian, Croatian, Bosnian, Montenegrin, Slovenian, "
    "Macedonian, Albanian or English."
)

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {"urgent": {"type": "boolean"}},
    "required": ["urgent"],
    "additionalProperties": False,
}

_client: anthropic.Anthropic | None = None


def keyword_urgent(text: str) -> bool:
    folded = f" {fold(text)} "
    return any(fold(stem) in folded for stem in DANGER_STEMS)


def _ai_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        # Short timeout and one retry: triage must not hang a worker thread.
        _client = anthropic.Anthropic(timeout=8.0, max_retries=1)
    return _client


def ai_urgent(text: str) -> bool | None:
    """Claude's verdict, or None when unavailable (no key, error, refusal)."""
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        response = _ai_client().beta.messages.create(
            model=TRIAGE_MODEL,
            max_tokens=2048,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            system=SYSTEM_PROMPT,
            output_config={
                "effort": "low",
                "format": {"type": "json_schema", "schema": OUTPUT_SCHEMA},
            },
            messages=[{"role": "user", "content": text}],
        )
    except anthropic.APIError as err:
        # Never log the message text; the error type is enough to debug.
        logger.warning("Triage AI unavailable: %s", type(err).__name__)
        return None
    if response.stop_reason == "refusal":
        return None
    for block in response.content:
        if block.type == "text":
            try:
                return bool(json.loads(block.text)["urgent"])
            except (ValueError, KeyError, TypeError):
                return None
    return None


def is_urgent(text: str) -> bool:
    if keyword_urgent(text):
        return True
    return ai_urgent(text) is True


def triage_message(message_id: int) -> None:
    """Classify one saved message and flag its session if urgent."""
    message = Message.objects.filter(pk=message_id, sender=Message.Sender.WOMAN).first()
    if message is None:  # deleted meanwhile (she pressed exit)
        return
    if is_urgent(message.body):
        ChatSession.objects.filter(pk=message.session_id, urgent_since__isnull=True).update(
            urgent_since=timezone.now()
        )


def _run_in_background(message_id: int) -> None:
    try:
        triage_message(message_id)
    finally:
        close_old_connections()  # a thread has its own DB connection


def schedule_triage(message: Message) -> None:
    """Start triage once the message is committed, off the request thread."""
    if not settings.TRIAGE_IN_BACKGROUND:
        # Inline (tests, debugging): the message is already saved in this
        # same connection, so classify it right away.
        triage_message(message.pk)
        return
    transaction.on_commit(
        lambda: threading.Thread(target=_run_in_background, args=(message.pk,), daemon=True).start()
    )
