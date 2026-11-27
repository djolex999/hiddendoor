from django.urls import path

from .views import (
    CloseSessionView,
    LoginView,
    SessionListView,
    SessionMessagesView,
    SessionNotesView,
)

urlpatterns = [
    path("login", LoginView.as_view(), name="counselor-login"),
    path("sessions", SessionListView.as_view(), name="counselor-sessions"),
    path(
        "sessions/<uuid:session_id>/messages",
        SessionMessagesView.as_view(),
        name="counselor-messages",
    ),
    path("sessions/<uuid:session_id>/close", CloseSessionView.as_view(), name="counselor-close"),
    path("sessions/<uuid:session_id>/notes", SessionNotesView.as_view(), name="counselor-notes"),
]
