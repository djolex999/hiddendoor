"""
Rate limits against brute force and flooding (tap sequence, chat start,
resume phrase, counselor login).

DRF's AnonRateThrottle keys its cache entry on the client IP. We hash that IP
with a keyed HMAC first, so not even the throttle cache table holds a raw
IP address. The entry expires with the rate window.
"""

from rest_framework.request import Request
from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle
from rest_framework.views import APIView

from .crypto import hmac_hash


class HashedAnonRateThrottle(AnonRateThrottle):
    def get_ident(self, request: Request) -> str:
        return hmac_hash(super().get_ident(request), "throttle")


class UnlockThrottle(HashedAnonRateThrottle):
    scope = "unlock"


class StartThrottle(HashedAnonRateThrottle):
    scope = "start"


class ResumeThrottle(HashedAnonRateThrottle):
    scope = "resume"


class GlobalResumeThrottle(SimpleRateThrottle):
    """
    One bucket shared by every client. Per-IP limits alone do not stop a
    guesser spread over many IPs. Trade-off: a flood of resume calls can
    briefly block real resumes too (they get 429 and retry in a minute).
    """

    scope = "resume_global"

    def get_cache_key(self, request: Request, view: APIView) -> str:
        return self.cache_format % {"scope": self.scope, "ident": "all"}


class LoginThrottle(HashedAnonRateThrottle):
    scope = "login"
