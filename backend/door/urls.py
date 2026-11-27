from django.urls import path

from .views import UnlockView

urlpatterns = [
    # Short, boring path on purpose: it reveals nothing in a network log.
    path("u/", UnlockView.as_view(), name="door-unlock"),
]
