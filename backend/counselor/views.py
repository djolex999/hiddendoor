from django.conf import settings
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils.crypto import constant_time_compare
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from chat import services
from chat.models import ChatSession, Message
from chat.serializers import MessageCreateSerializer, MessageSerializer, MessagesQuerySerializer
from config.throttles import LoginThrottle

from .authentication import CounselorTokenAuthentication, make_counselor_token
from .permissions import IsCounselor
from .serializers import CounselorSessionSerializer, LoginSerializer, SessionNotesSerializer


class LoginView(APIView):
    """POST /api/c/login {password} -> 200 {token, expires_in}"""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not constant_time_compare(
            serializer.validated_data["password"], settings.COUNSELOR_PASSWORD
        ):
            return Response({"detail": "Wrong password."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(
            {"token": make_counselor_token(), "expires_in": settings.COUNSELOR_TOKEN_MAX_AGE}
        )


class CounselorView(APIView):
    authentication_classes = [CounselorTokenAuthentication]
    permission_classes = [IsCounselor]


def get_live_session(session_id: str) -> ChatSession:
    return get_object_or_404(ChatSession.objects.live(), pk=session_id)


class SessionListView(CounselorView, generics.ListAPIView):
    """GET /api/c/sessions -> waiting + active sessions, newest first, with unread counts."""

    serializer_class = CounselorSessionSerializer
    pagination_class = None

    def list(self, request: Request, *args, **kwargs) -> Response:
        # Counselors poll this list constantly, so expired chats are deleted
        # within seconds even when nobody starts a new chat.
        services.purge_expired()
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        # One SQL query: LEFT JOIN messages + COUNT ... FILTER (WHERE ...),
        # grouped per session. No N+1, so no prefetch_related needed.
        unread_filter = Q(
            messages__sender=Message.Sender.WOMAN,
            messages__id__gt=F("counselor_last_read_id"),
        )
        return (
            ChatSession.objects.live()
            .exclude(status=ChatSession.Status.CLOSED)
            .annotate(unread=Count("messages", filter=unread_filter))
            # Urgent chats first (oldest alarm on top), then newest.
            .order_by(F("urgent_since").asc(nulls_last=True), "-created_at")
        )


class SessionMessagesView(CounselorView):
    """
    GET  /api/c/sessions/<id>/messages?after=<id> -> {status, messages[]}, marks them read
    POST /api/c/sessions/<id>/messages {body}     -> 201 message
    """

    def get(self, request: Request, session_id: str) -> Response:
        session = get_live_session(session_id)
        query = MessagesQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        messages = services.messages_after(session, query.validated_data["after"])
        if messages:
            # Conditional UPDATE: never moves the marker backwards, even if two
            # counselor tabs poll at once.
            ChatSession.objects.filter(
                pk=session.pk, counselor_last_read_id__lt=messages[-1].id
            ).update(counselor_last_read_id=messages[-1].id)
        return Response(
            {
                "status": session.status,
                "messages": MessageSerializer(messages, many=True).data,
                "urgent": session.urgent_since is not None,
                "topic": session.topic,
                "notes": SessionNotesSerializer(session).data,
            }
        )

    def post(self, request: Request, session_id: str) -> Response:
        session = get_live_session(session_id)
        if session.status == ChatSession.Status.CLOSED:
            return Response({"detail": "Chat is closed."}, status=status.HTTP_409_CONFLICT)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = services.add_message(
            session, Message.Sender.COUNSELOR, serializer.validated_data["body"]
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class CloseSessionView(CounselorView):
    """POST /api/c/sessions/<id>/close -> 204"""

    def post(self, request: Request, session_id: str) -> Response:
        services.close_session(get_live_session(session_id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionNotesView(CounselorView):
    """
    PATCH /api/c/sessions/<id>/notes {counselor_label?, counselor_notes?} -> 200 both

    Counselor-only. Never exposed on her endpoints; deleted with the session.
    """

    def patch(self, request: Request, session_id: str) -> Response:
        session = get_live_session(session_id)
        serializer = SessionNotesSerializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
