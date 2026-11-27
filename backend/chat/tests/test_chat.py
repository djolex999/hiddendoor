from datetime import timedelta

import pytest
from django.utils import timezone

from chat.models import ChatSession, Message
from chat.words import FOOD_WORDS
from conftest import woman_headers
from door.signing import make_unlock_token

pytestmark = pytest.mark.django_db


def messages_url(session_id: str) -> str:
    return f"/api/chat/{session_id}/messages"


# start


def test_start_needs_a_valid_unlock_token(client):
    response = client.post("/api/chat/start", {"unlock_token": "forged"}, format="json")
    assert response.status_code == 403
    assert ChatSession.objects.count() == 0


def test_start_returns_credentials_and_stores_only_hashes(started_chat):
    words = started_chat["resume_phrase"].split("-")
    assert len(words) == 4 and all(w in FOOD_WORDS for w in words)

    session = ChatSession.objects.get(pk=started_chat["session_id"])
    assert session.status == ChatSession.Status.WAITING
    stored = f"{session.secret_hash} {session.resume_phrase_hash}"
    assert started_chat["secret"] not in stored
    assert started_chat["resume_phrase"] not in stored


# messages + auth


def test_send_and_poll_messages(client, started_chat):
    sid, headers = started_chat["session_id"], woman_headers(started_chat["secret"])

    first = client.post(messages_url(sid), {"body": "  zdravo  "}, format="json", **headers)
    assert first.status_code == 201
    assert first.json()["body"] == "zdravo"
    client.post(messages_url(sid), {"body": "drugo"}, format="json", **headers)

    everything = client.get(messages_url(sid), **headers).json()
    assert everything["status"] == "waiting"
    assert [m["body"] for m in everything["messages"]] == ["zdravo", "drugo"]

    newer = client.get(f"{messages_url(sid)}?after={first.json()['id']}", **headers).json()
    assert [m["body"] for m in newer["messages"]] == ["drugo"]


@pytest.mark.parametrize("secret", ["wrong-secret", ""])
def test_wrong_or_missing_secret_is_403(client, started_chat, secret):
    sid = started_chat["session_id"]
    headers = woman_headers(secret) if secret else {}

    assert client.get(messages_url(sid), **headers).status_code == 403
    assert (
        client.post(messages_url(sid), {"body": "x"}, format="json", **headers).status_code == 403
    )
    assert client.post(f"/api/chat/{sid}/end", **headers).status_code == 403


def test_secret_of_another_session_is_403(client, started_chat):
    other = client.post(
        "/api/chat/start",
        {"unlock_token": make_unlock_token()},
        format="json",
    ).json()
    response = client.get(
        messages_url(started_chat["session_id"]), **woman_headers(other["secret"])
    )
    assert response.status_code == 403


def test_unknown_session_is_403_not_404(client, started_chat):
    response = client.get(
        messages_url("00000000-0000-4000-8000-000000000000"),
        **woman_headers(started_chat["secret"]),
    )
    assert response.status_code == 403


def test_body_over_2000_chars_is_rejected(client, started_chat):
    response = client.post(
        messages_url(started_chat["session_id"]),
        {"body": "a" * 2001},
        format="json",
        **woman_headers(started_chat["secret"]),
    )
    assert response.status_code == 400


def test_expired_session_is_403(client, started_chat):
    ChatSession.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    response = client.get(
        messages_url(started_chat["session_id"]), **woman_headers(started_chat["secret"])
    )
    assert response.status_code == 403


# resume


def test_resume_rotates_the_secret(client, started_chat):
    response = client.post(
        "/api/chat/resume",
        {"resume_phrase": started_chat["resume_phrase"].upper().replace("-", " ")},
        format="json",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == started_chat["session_id"]

    sid = started_chat["session_id"]
    assert client.get(messages_url(sid), **woman_headers(data["secret"])).status_code == 200
    assert client.get(messages_url(sid), **woman_headers(started_chat["secret"])).status_code == 403


def test_resume_unknown_phrase_is_404(client, started_chat):
    response = client.post(
        "/api/chat/resume", {"resume_phrase": "nije-pravi-recept"}, format="json"
    )
    assert response.status_code == 404


def test_resume_expired_session_is_404(client, started_chat):
    ChatSession.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    response = client.post(
        "/api/chat/resume", {"resume_phrase": started_chat["resume_phrase"]}, format="json"
    )
    assert response.status_code == 404


def test_resume_closed_session_is_404(client, started_chat):
    ChatSession.objects.update(status=ChatSession.Status.CLOSED)
    response = client.post(
        "/api/chat/resume", {"resume_phrase": started_chat["resume_phrase"]}, format="json"
    )
    assert response.status_code == 404


def test_resume_is_throttled(client):
    for _ in range(5):  # "resume": "5/min"
        client.post("/api/chat/resume", {"resume_phrase": "a-b-c"}, format="json")
    response = client.post("/api/chat/resume", {"resume_phrase": "a-b-c"}, format="json")
    assert response.status_code == 429


# end


def test_end_deletes_session_and_messages(client, started_chat):
    sid, headers = started_chat["session_id"], woman_headers(started_chat["secret"])
    client.post(messages_url(sid), {"body": "tajna"}, format="json", **headers)
    assert Message.objects.count() == 1

    response = client.post(f"/api/chat/{sid}/end", **headers)

    assert response.status_code == 204
    assert ChatSession.objects.count() == 0
    assert Message.objects.count() == 0
    assert client.get(messages_url(sid), **headers).status_code == 403


def test_start_is_throttled(client):
    for _ in range(5):  # "start": "5/min"
        response = client.post(
            "/api/chat/start", {"unlock_token": make_unlock_token()}, format="json"
        )
        assert response.status_code == 201
    response = client.post("/api/chat/start", {"unlock_token": make_unlock_token()}, format="json")
    assert response.status_code == 429


def test_resume_has_a_global_limit_across_ips(client):
    # 30 guesses from 30 different "clients" exhaust the shared bucket.
    for n in range(30):
        client.post(
            "/api/chat/resume",
            {"resume_phrase": "a-b-c-d"},
            format="json",
            REMOTE_ADDR=f"10.0.{n}.1",
        )
    response = client.post(
        "/api/chat/resume", {"resume_phrase": "a-b-c-d"}, format="json", REMOTE_ADDR="10.1.1.1"
    )
    assert response.status_code == 429
