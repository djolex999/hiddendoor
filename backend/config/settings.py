"""
Django settings for Skrivena vrata.

Every value that differs between laptop and production comes from the
environment. Locally, run commands with `uv run --env-file .env ...`.
"""

import os
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def env(name: str, default: str | None = None) -> str:
    """Read a required env var. Missing and no default means a loud failure at boot."""
    value = os.environ.get(name, default)
    if value is None:
        raise ImproperlyConfigured(f"Missing required environment variable {name}")
    return value


def env_bool(name: str, default: bool) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


# Core

DEBUG = env_bool("DEBUG", False)
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
# Only the admin uses CSRF (it is the only cookie-based part of the site).
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "door",
    "chat",
    "counselor",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    # CorsMiddleware must run before anything that can return a response.
    "corsheaders.middleware.CorsMiddleware",
    "config.middleware.ApiPrivacyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Database

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        conn_max_age=600,
        conn_health_checks=True,
    )
}
if not DATABASES["default"]:
    raise ImproperlyConfigured("Missing required environment variable DATABASE_URL")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Holds only throttle counters (keys are HMAC-hashed client idents). Lives in
# Postgres so every gunicorn worker shares the same counts; a per-process
# memory cache would multiply every limit by the number of workers.
# The table is created by door/migrations/0003_create_cache_table.py.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "throttle_cache",
        # Past MAX_ENTRIES Django culls a third of all rows, which would wipe
        # live throttle counters. The default is 300; a flood from many IPs
        # could reach that. Rows are tiny, so allow far more.
        "OPTIONS": {"MAX_ENTRIES": 100_000},
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Europe/Belgrade"
USE_I18N = True
USE_TZ = True

# Static files (only the admin has any). WhiteNoise serves them from gunicorn.
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Production hardening. Render terminates TLS and forwards X-Forwarded-Proto.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", not DEBUG)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 0 if DEBUG else 60 * 60 * 24 * 30
SECURE_REFERRER_POLICY = "no-referrer"

# Django REST framework

# How many trusted reverse proxies sit in front of Django. DRF uses it to pick
# the client IP for throttling. 0 = use REMOTE_ADDR and ignore X-Forwarded-For
# (plain localhost). 1 = behind Render or a cloudflared tunnel. Left unset, DRF
# would trust the whole client-supplied X-Forwarded-For header, which lets
# anyone fake a new identity per request and skip every throttle. So outside
# DEBUG we refuse to boot without an explicit value.
_num_proxies = os.environ.get("NUM_PROXIES", "").strip()
if not _num_proxies and not DEBUG:
    raise ImproperlyConfigured("Set NUM_PROXIES explicitly (0 = no proxy, 1 = Render/cloudflared)")
NUM_PROXIES = int(_num_proxies or "0")

REST_FRAMEWORK = {
    # No global authentication: nothing reads cookies, so no CSRF on the API.
    # Each view that needs auth names its own class explicitly.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    # Deny by default. Public views opt in with AllowAny.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_THROTTLE_RATES": {
        "unlock": "10/min",
        "start": "5/min",
        "resume": "5/min",
        "login": "5/min",
    },
    "NUM_PROXIES": NUM_PROXIES,
}

# CORS: only our two frontends, never with credentials (we send no cookies).
CORS_ALLOWED_ORIGINS = [
    o for o in (os.environ.get("FRONTEND_ORIGIN"), os.environ.get("COUNSELOR_ORIGIN")) if o
]
CORS_ALLOW_CREDENTIALS = False
CORS_URLS_REGEX = r"^/api/.*$"
CORS_ALLOW_HEADERS = (*default_headers, "x-session-secret")

# Product settings

# The tap sequence that opens the door. Lives only here, never in a bundle.
DOOR_SEQUENCE = tuple(int(n) for n in env_list("DOOR_SEQUENCE"))
if not DOOR_SEQUENCE:
    raise ImproperlyConfigured("DOOR_SEQUENCE must be a comma separated list of integers")

COUNSELOR_PASSWORD = env("COUNSELOR_PASSWORD")
if len(COUNSELOR_PASSWORD) < 8:
    raise ImproperlyConfigured("COUNSELOR_PASSWORD must be at least 8 characters")

UNLOCK_TOKEN_MAX_AGE = 10 * 60  # seconds
COUNSELOR_TOKEN_MAX_AGE = 12 * 60 * 60  # seconds
CHAT_SESSION_LIFETIME_HOURS = 24
CHAT_CLOSED_GRACE_MINUTES = 15  # after a counselor closes, data lives this long
# Failed resume-phrase lookups allowed per minute across ALL clients
# (chat.services.record_resume_failure). Caps guessing spread over many IPs.
RESUME_GLOBAL_FAILURES_PER_MINUTE = 30

# Logging: requests to the woman-facing endpoints never reach any log line.

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "drop_sensitive_paths": {"()": "config.logging_filters.SensitivePathFilter"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "filters": ["drop_sensitive_paths"],
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        # runserver access log
        "django.server": {"handlers": ["console"], "level": "INFO", "propagate": False},
        # 4xx/5xx warnings ("Forbidden: /api/chat/<uuid>/messages")
        "django.request": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}
