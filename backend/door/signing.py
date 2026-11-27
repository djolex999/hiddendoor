"""
Unlock token: proof that this browser entered the right tap sequence recently.

TimestampSigner signs a value plus the time it was signed, using SECRET_KEY.
The server can check it later without storing anything, and max_age makes it
expire. The salt keeps it from being accepted anywhere else we sign things.

The signed value is "<audience>:<nonce>". The audience ("adult" or "teen")
says which site the door was opened from, and the signature means the client
cannot change it afterwards.
"""

import secrets

from django.conf import settings
from django.core import signing

UNLOCK_SALT = "door.unlock"
ADULT = "adult"
TEEN = "teen"
AUDIENCES = (ADULT, TEEN)


def make_unlock_token(audience: str = ADULT) -> str:
    if audience not in AUDIENCES:
        audience = ADULT
    # A random nonce so two unlocks in the same second get different tokens.
    value = f"{audience}:{secrets.token_hex(8)}"
    return signing.TimestampSigner(salt=UNLOCK_SALT).sign(value)


def unlock_token_audience(token: str) -> str | None:
    """The audience of a valid, unexpired token, or None."""
    try:
        value = signing.TimestampSigner(salt=UNLOCK_SALT).unsign(
            token, max_age=settings.UNLOCK_TOKEN_MAX_AGE
        )
    except signing.BadSignature:  # SignatureExpired is a subclass
        return None
    audience, sep, _ = value.partition(":")
    # Tokens signed before audiences existed carry only a nonce; they were adult.
    return audience if sep and audience in AUDIENCES else ADULT


def is_valid_unlock_token(token: str) -> bool:
    return unlock_token_audience(token) is not None
