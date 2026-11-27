import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from door.signing import make_unlock_token


@pytest.fixture(autouse=True)
def _clear_throttle_cache(db):
    """Throttle counters live in the (database) cache; start every test clean."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def started_chat(client, db) -> dict:
    """A fresh chat: {session_id, secret, resume_phrase}."""
    response = client.post("/api/chat/start", {"unlock_token": make_unlock_token()}, format="json")
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def counselor_client(client, settings) -> APIClient:
    response = client.post("/api/c/login", {"password": settings.COUNSELOR_PASSWORD}, format="json")
    assert response.status_code == 200
    authed = APIClient()
    authed.credentials(HTTP_AUTHORIZATION=f"Bearer {response.json()['token']}")
    return authed


def woman_headers(secret: str) -> dict:
    return {"HTTP_X_SESSION_SECRET": secret}
