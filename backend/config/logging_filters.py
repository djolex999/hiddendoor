import logging

from .middleware import SENSITIVE_PREFIXES


class SensitivePathFilter(logging.Filter):
    """
    Drop log records about woman-facing endpoints.

    Two shapes of record reach us:
    - django.request: record.request is the HttpRequest. The middleware set
      request.is_sensitive on it.
    - django.server (runserver access log): record.args[0] is the raw request
      line, e.g. "POST /api/u/ HTTP/1.1". record.request is a socket there.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        request = getattr(record, "request", None)
        if getattr(request, "is_sensitive", False):
            return False
        path = getattr(request, "path", None)
        if isinstance(path, str) and path.startswith(SENSITIVE_PREFIXES):
            return False
        if record.args and isinstance(record.args, tuple):
            request_line = str(record.args[0])
            if any(f" {prefix}" in request_line for prefix in SENSITIVE_PREFIXES):
                return False
        return True
