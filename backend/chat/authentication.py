"""
DRF authentication for the woman's side: the X-Session-Secret header.

A DRF authentication class answers "who is this request from?". It returns
(user, auth); DRF stores them as request.user and request.auth. Here there is
no real user, so `user` is a tiny marker object and `auth` is the ChatSession
the secret unlocks. Views read request.auth to get the session.
"""

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request

from config.crypto import hmac_hash, hmac_matches

from .models import ChatSession
from .services import SECRET_PURPOSE

# Compared against when the session id is unknown, so "no such session" and
# "wrong secret" take the same time and give the same answer.
_DUMMY_HASH = hmac_hash("no-such-session", SECRET_PURPOSE)


class ChatParticipant:
    """Stands in for request.user. Not a Django user and never saved."""

    is_authenticated = True
    is_anonymous = False


class SessionSecretAuthentication(BaseAuthentication):
    def authenticate(self, request: Request) -> tuple[ChatParticipant, ChatSession]:
        secret = request.headers.get("X-Session-Secret", "")
        session_id = request.parser_context["kwargs"].get("session_id")

        session = ChatSession.objects.live().filter(pk=session_id).first() if session_id else None
        expected = session.secret_hash if session else _DUMMY_HASH

        # Always run the compare, even when we already know it will fail.
        matches = hmac_matches(secret, SECRET_PURPOSE, expected)

        # One generic failure for: missing secret, wrong secret, unknown or
        # expired session. Nothing to enumerate.
        if session is None or not secret or not matches:
            raise AuthenticationFailed("Session not available.")
        return ChatParticipant(), session

    # No authenticate_header() override: DRF then answers failures with 403
    # instead of 401 + WWW-Authenticate, which is what the spec asks for.
