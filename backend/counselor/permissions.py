from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from .authentication import Counselor


class IsCounselor(BasePermission):
    """Stricter than IsAuthenticated: a chat participant is authenticated too."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return isinstance(request.user, Counselor)
