"""
Keyed hashing for secrets we must check later but never store in plaintext.

salted_hmac is Django's HMAC helper: the key is derived from SECRET_KEY plus a
per-purpose salt, so a hash made for one purpose is useless for another.
A database leak alone is not enough to brute force these; the attacker would
also need SECRET_KEY.
"""

from django.utils.crypto import constant_time_compare, salted_hmac


def hmac_hash(value: str, purpose: str) -> str:
    """Return a hex HMAC-SHA256 of value, keyed by SECRET_KEY and purpose."""
    return salted_hmac(f"hiddendoor.{purpose}", value, algorithm="sha256").hexdigest()


def hmac_matches(value: str, purpose: str, expected_hash: str) -> bool:
    """Constant-time check, so response timing does not leak how much matched."""
    return constant_time_compare(hmac_hash(value, purpose), expected_hash)
