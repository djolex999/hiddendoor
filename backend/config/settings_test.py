"""
Settings for pytest. Fills in safe test values for the required env vars,
then loads the real settings so tests exercise the same configuration.
"""

import os

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-not-for-real-use")
os.environ.setdefault("DATABASE_URL", "postgres://hiddendoor:hiddendoor@localhost:5433/hiddendoor")
os.environ.setdefault("DOOR_SEQUENCE", "3,1,4,1")
os.environ.setdefault("COUNSELOR_PASSWORD", "test-counselor-pass")
os.environ.setdefault("SECURE_SSL_REDIRECT", "false")
os.environ.setdefault("NUM_PROXIES", "0")

from .settings import *  # noqa: E402, F403
