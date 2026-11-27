"""
Woman-side chat endpoints. Anonymous: no cookies, no Django session, no CSRF.
The only credential is the X-Session-Secret header on per-session routes.
"""

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from config.throttles import ResumeThrottle, StartThrottle
from door.signing import TEEN, unlock_token_audience

from . import services
from .authentication import SessionSecretAuthentication
from .models import ChatSession, Message
from .serializers import (
    MessageCreateSerializer,
    MessageSerializer,
    MessagesQuerySerializer,
    ResumeChatSerializer,
    StartChatSerializer,
)


class StartChatView(APIView):
    """POST /api/chat/start {unlock_token} -> 201 {session_id, secret, resume_phrase}"""

    authentication_classes = []
    permission_classes = [AllowAny]
    # One unlock token is reusable for 10 min; this caps how many sessions
    # one client can open with it.
    throttle_classes = [StartThrottle]

    def post(self, request: Request) -> Response:
        serializer = StartChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audience = unlock_token_audience(serializer.validated_data["unlock_token"])
        if audience is None:
            return Response({"detail": "Unlock expired."}, status=status.HTTP_403_FORBIDDEN)
        # The teen site never opens a chat with adult counselors. Enforced here,
        # not in the client: the audience is signed into the token.
        if audience == TEEN:
            return Response(
                {"detail": "Chat is not available here."}, status=status.HTTP_403_FORBIDDEN
            )

        creds = services.start_session(serializer.validated_data.get("topic", ""))
        return Response(
            {
                "session_id": creds.session.id,
                "secret": creds.secret,
                "resume_phrase": creds.resume_phrase,
            },
            status=status.HTTP_201_CREATED,
        )


class ResumeChatView(APIView):
    """POST /api/chat/resume {resume_phrase} -> 200 {session_id, secret}"""

    authentication_classes = []
    permission_classes = [AllowAny]
    # Per-client limit. DRF runs it before post(), so a client it blocks never
    # reaches the global failure counter below and cannot use it up.
    throttle_classes = [ResumeThrottle]

    def post(self, request: Request) -> Response:
        serializer = ResumeChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Global cap across all clients, counting only failed lookups.
        if services.global_resume_locked():
            return Response(
                {"detail": "Too many attempts. Try again in a minute."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(services.seconds_until_next_minute())},
            )

        creds = services.resume_session(serializer.validated_data["resume_phrase"])
        if creds is None:
            services.record_resume_failure()
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"session_id": creds.session.id, "secret": creds.secret})


class SessionSecretView(APIView):
    """Base for routes that need X-Session-Secret. request.auth is the ChatSession."""

    authentication_classes = [SessionSecretAuthentication]
    permission_classes = [IsAuthenticated]


class ChatMessagesView(SessionSecretView):
    """
    GET  /api/chat/<id>/messages?after=<message_id>
         -> {status, messages[], alert, counselor_online, reply_hours}
    POST /api/chat/<id>/messages {body}             -> 201 message
    """

    def get(self, request: Request, session_id: str) -> Response:
        session: ChatSession = request.auth
        query = MessagesQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        messages = services.messages_after(session, query.validated_data["after"])
        return Response(
            {
                "status": session.status,
                "messages": MessageSerializer(messages, many=True).data,
                # Urgent message, no counselor reply yet: show the emergency card.
                "alert": services.needs_emergency_card(session),
                # Only whether anyone is looking, never who or how many.
                "counselor_online": services.counselor_online(),
                "reply_hours": settings.COUNSELOR_HOURS,
            }
        )

    def post(self, request: Request, session_id: str) -> Response:
        session: ChatSession = request.auth
        if session.status == ChatSession.Status.CLOSED:
            return Response({"detail": "Chat is closed."}, status=status.HTTP_409_CONFLICT)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = services.add_message(
            session, Message.Sender.WOMAN, serializer.validated_data["body"]
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class EndChatView(SessionSecretView):
    """POST /api/chat/<id>/end -> 204. Deletes the session and every message now."""

    def post(self, request: Request, session_id: str) -> Response:
        request.auth.delete()  # CASCADE removes the messages in the same query
        return Response(status=status.HTTP_204_NO_CONTENT)
