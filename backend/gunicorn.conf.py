# Production server config. Picked up automatically by `gunicorn config.wsgi`.
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", "2"))
timeout = 30

# Access log OFF: it would record every request line (path, IP, user agent).
accesslog = None
# Error log stays on (stderr) for crashes. It does not include request lines.
errorlog = "-"
loglevel = "info"
