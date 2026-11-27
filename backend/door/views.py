from django.conf import settings
from django.utils.crypto import constant_time_compare
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from config.throttles import UnlockThrottle

from .models import HelpCard
from .serializers import HelpCardSerializer, UnlockSerializer
from .signing import make_unlock_token


def _canonical(sequence: list[int] | tuple[int, ...]) -> str:
    return ",".join(str(n) for n in sequence)


class UnlockView(APIView):
    """
    POST /api/u/ {sequence: number[]}

    Right sequence: 200 with an unlock token and the help cards.
    Anything else (wrong, malformed, empty): 204 with no body, so a curious
    caller learns nothing about why it failed.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [UnlockThrottle]

    def post(self, request: Request) -> Response:
        serializer = UnlockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(status=status.HTTP_204_NO_CONTENT)

        submitted = _canonical(serializer.validated_data["sequence"])
        if not constant_time_compare(submitted, _canonical(settings.DOOR_SEQUENCE)):
            return Response(status=status.HTTP_204_NO_CONTENT)

        cards = HelpCard.objects.filter(is_active=True)
        return Response(
            {
                "unlock_token": make_unlock_token(),
                "cards": HelpCardSerializer(cards, many=True).data,
            }
        )
