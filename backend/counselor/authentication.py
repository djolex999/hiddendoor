"""
Counselor auth: one shared password (env) exchanged for a signed Bearer token.

The token is stateless: a TimestampSigner signature over the word "counselor"
with its own salt. Checking it needs no database. Trade-off: it cannot be
revoked before its 12h max_age except by rotating SECRET_KEY.
"""

from django.conf import settings
from django.core import signing
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request

TOKEN_SALT = "counselor.login"  # noqa: S105 (signing salt, not a password)
TOKEN_VALUE = "counselor"  # noqa: S105 (signed payload, not a password)


class Counselor:
    """Stands in for request.user on counselor routes. Not a Django user."""

    is_authenticated = True
    is_anonymous = False


def make_counselor_token() -> str:
    return signing.TimestampSigner(salt=TOKEN_SALT).sign(TOKEN_VALUE)


class CounselorTokenAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request: Request) -> tuple[Counselor, str] | None:
        parts = get_authorization_header(request).split()
        if not parts or parts[0].lower() != self.keyword.lower().encode():
            return None  # no credentials; the permission class turns this into 401
        if len(parts) != 2:
            raise AuthenticationFailed("Invalid Authorization header.")

        token = parts[1].decode(errors="replace")
        try:
            # unsign() checks the HMAC signature with a constant-time compare.
            value = signing.TimestampSigner(salt=TOKEN_SALT).unsign(
                token, max_age=settings.COUNSELOR_TOKEN_MAX_AGE
            )
        except signing.BadSignature:  # includes SignatureExpired
            raise AuthenticationFailed("Invalid or expired token.") from None
        if value != TOKEN_VALUE:
            raise AuthenticationFailed("Invalid or expired token.")
        return Counselor(), token

    def authenticate_header(self, request: Request) -> str:
        # Present, so DRF answers auth failures with 401 + WWW-Authenticate: Bearer.
        return self.keyword
