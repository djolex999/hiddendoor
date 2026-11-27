"""
Unlock token: proof that this browser entered the right tap sequence recently.

TimestampSigner signs a value plus the time it was signed, using SECRET_KEY.
The server can check it later without storing anything, and max_age makes it
expire. The salt keeps it from being accepted anywhere else we sign things.
"""

import secrets

from django.conf import settings
from django.core import signing

UNLOCK_SALT = "door.unlock"


def make_unlock_token() -> str:
    # A random nonce so two unlocks in the same second get different tokens.
    return signing.TimestampSigner(salt=UNLOCK_SALT).sign(secrets.token_hex(8))


def is_valid_unlock_token(token: str) -> bool:
    try:
        signing.TimestampSigner(salt=UNLOCK_SALT).unsign(
            token, max_age=settings.UNLOCK_TOKEN_MAX_AGE
        )
    except signing.BadSignature:  # SignatureExpired is a subclass
        return False
    return True
