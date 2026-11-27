"""
Privacy middleware for every /api/ response.

1. Marks requests to the woman-facing endpoints as sensitive, so the logging
   filter (config/logging_filters.py) drops any log record about them.
2. Adds headers that stop browsers and proxies from caching responses or
   leaking the URL to other sites.

Note: middleware cannot reach gunicorn's or the host's access logs. Gunicorn's
access log is turned off in gunicorn.conf.py; the host's edge logs are outside
our code (see README).
"""

from collections.abc import Callable

from django.http import HttpRequest, HttpResponse

SENSITIVE_PREFIXES = ("/api/u/", "/api/chat/")

API_HEADERS = {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
}


def is_sensitive_path(path: str) -> bool:
    return path.startswith(SENSITIVE_PREFIXES)


class ApiPrivacyMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        request.is_sensitive = is_sensitive_path(request.path)
        response = self.get_response(request)
        if request.path.startswith("/api/"):
            for header, value in API_HEADERS.items():
                response[header] = value
        return response
