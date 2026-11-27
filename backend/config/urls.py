from django.contrib import admin
from django.http import HttpRequest, JsonResponse
from django.urls import include, path


def health(request: HttpRequest) -> JsonResponse:
    """For the host's health check. Touches nothing."""
    return JsonResponse({"ok": True})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health", health),
    path("api/", include("door.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/c/", include("counselor.urls")),
]
