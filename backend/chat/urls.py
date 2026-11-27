from django.urls import path

from .views import ChatMessagesView, EndChatView, ResumeChatView, StartChatView

urlpatterns = [
    path("start", StartChatView.as_view(), name="chat-start"),
    path("resume", ResumeChatView.as_view(), name="chat-resume"),
    path("<uuid:session_id>/messages", ChatMessagesView.as_view(), name="chat-messages"),
    path("<uuid:session_id>/end", EndChatView.as_view(), name="chat-end"),
]
