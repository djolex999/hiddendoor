"""
Rate limits against brute force (tap sequence, resume phrase, counselor login).

DRF's AnonRateThrottle keys its cache entry on the client IP. We hash that IP
with a keyed HMAC first, so not even the in-memory throttle cache holds a raw
IP address. The entry expires with the rate window.
"""

from rest_framework.request import Request
from rest_framework.throttling import AnonRateThrottle

from .crypto import hmac_hash


class HashedAnonRateThrottle(AnonRateThrottle):
    def get_ident(self, request: Request) -> str:
        return hmac_hash(super().get_ident(request), "throttle")


class UnlockThrottle(HashedAnonRateThrottle):
    scope = "unlock"


class ResumeThrottle(HashedAnonRateThrottle):
    scope = "resume"


class LoginThrottle(HashedAnonRateThrottle):
    scope = "login"
