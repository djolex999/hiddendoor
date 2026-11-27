import time
from unittest import mock

import pytest
from rest_framework.test import APIClient

from chat.models import ChatSession
from conftest import woman_headers
from counselor.authentication import make_counselor_token

pytestmark = pytest.mark.django_db


# auth


def test_login_with_wrong_password_is_401(client):
    response = client.post("/api/c/login", {"password": "nope-nope"}, format="json")
    assert response.status_code == 401
    assert "token" not in response.json()


def test_login_is_throttled(client):
    for _ in range(5):  # "login": "5/min"
        client.post("/api/c/login", {"password": "nope-nope"}, format="json")
    response = client.post("/api/c/login", {"password": "nope-nope"}, format="json")
    assert response.status_code == 429


@pytest.mark.parametrize("header", [None, "Bearer forged", "Bearer", "Token abc"])
def test_counselor_routes_need_a_valid_token(client, header):
    if header:
        client.credentials(HTTP_AUTHORIZATION=header)
    assert client.get("/api/c/sessions").status_code == 401


def test_token_expires_after_12_hours(client):
    token = make_counselor_token()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    later = time.time() + 12 * 60 * 60 + 1
    with mock.patch("django.core.signing.time.time", return_value=later):
        assert client.get("/api/c/sessions").status_code == 401


def test_woman_secret_does_not_open_counselor_routes(client, started_chat):
    sid = started_chat["session_id"]
    response = client.get(
        f"/api/c/sessions/{sid}/messages", **woman_headers(started_chat["secret"])
    )
    assert response.status_code == 401


def test_unlock_token_is_not_a_counselor_token(client):
    from door.signing import make_unlock_token

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_unlock_token()}")
    assert client.get("/api/c/sessions").status_code == 401


# chat flow


def test_full_counselor_flow(counselor_client, started_chat):
    sid = started_chat["session_id"]
    woman = APIClient()
    woman.credentials(HTTP_X_SESSION_SECRET=started_chat["secret"])
    woman.post(f"/api/chat/{sid}/messages", {"body": "pomoc"}, format="json")
    woman.post(f"/api/chat/{sid}/messages", {"body": "molim"}, format="json")

    listed = counselor_client.get("/api/c/sessions").json()
    assert listed[0]["id"] == sid
    assert listed[0]["unread"] == 2
    assert "secret_hash" not in listed[0] and "resume_phrase_hash" not in listed[0]

    thread = counselor_client.get(f"/api/c/sessions/{sid}/messages").json()
    assert [m["body"] for m in thread["messages"]] == ["pomoc", "molim"]
    assert counselor_client.get("/api/c/sessions").json()[0]["unread"] == 0

    reply = counselor_client.post(
        f"/api/c/sessions/{sid}/messages", {"body": "tu sam"}, format="json"
    )
    assert reply.status_code == 201
    assert ChatSession.objects.get(pk=sid).status == ChatSession.Status.ACTIVE

    seen_by_woman = woman.get(f"/api/chat/{sid}/messages").json()
    last = seen_by_woman["messages"][-1]
    assert (last["sender"], last["body"]) == ("counselor", "tu sam")
    assert seen_by_woman["status"] == "active"


def test_close_hides_session_and_blocks_new_messages(counselor_client, started_chat):
    sid = started_chat["session_id"]
    assert counselor_client.post(f"/api/c/sessions/{sid}/close").status_code == 204

    assert counselor_client.get("/api/c/sessions").json() == []

    woman = APIClient()
    woman.credentials(HTTP_X_SESSION_SECRET=started_chat["secret"])
    assert woman.get(f"/api/chat/{sid}/messages").json()["status"] == "closed"
    assert woman.post(f"/api/chat/{sid}/messages", {"body": "x"}, format="json").status_code == 409
    reply = counselor_client.post(f"/api/c/sessions/{sid}/messages", {"body": "x"}, format="json")
    assert reply.status_code == 409
