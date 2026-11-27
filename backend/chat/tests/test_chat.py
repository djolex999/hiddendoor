from datetime import timedelta

import pytest
from django.utils import timezone

from chat import services
from chat.models import ChatSession, Message, ResumeFailureWindow
from chat.words import FOOD_WORDS
from conftest import woman_headers
from door.signing import make_unlock_token

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _frozen_minute(monkeypatch):
    """Pin the failure-counter window so no test straddles a minute boundary."""
    monkeypatch.setattr(services, "_current_minute", lambda: 29_000_000)


def messages_url(session_id: str) -> str:
    return f"/api/chat/{session_id}/messages"


# start


def test_start_needs_a_valid_unlock_token(client):
    response = client.post("/api/chat/start", {"unlock_token": "forged"}, format="json")
    assert response.status_code == 403
    assert ChatSession.objects.count() == 0


def test_start_with_a_teen_token_is_refused_and_creates_nothing(client):
    response = client.post(
        "/api/chat/start", {"unlock_token": make_unlock_token("teen")}, format="json"
    )
    assert response.status_code == 403
    assert response.json() == {"detail": "Chat is not available here."}
    assert ChatSession.objects.count() == 0


def test_start_with_an_adult_token_from_the_door_works(client):
    unlock = client.post("/api/u/", {"sequence": [3, 1, 4, 1]}, format="json").json()
    response = client.post(
        "/api/chat/start", {"unlock_token": unlock["unlock_token"]}, format="json"
    )
    assert response.status_code == 201
    assert ChatSession.objects.count() == 1


def test_start_with_a_teen_token_from_the_door_is_refused(client):
    unlock = client.post(
        "/api/u/", {"sequence": [3, 1, 4, 1], "audience": "teen"}, format="json"
    ).json()
    response = client.post(
        "/api/chat/start", {"unlock_token": unlock["unlock_token"]}, format="json"
    )
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


def test_global_resume_cap_counts_failures_across_ips(client, started_chat, settings):
    settings.RESUME_GLOBAL_FAILURES_PER_MINUTE = 3
    for n in range(3):  # 3 failed guesses from 3 different clients
        response = client.post(
            "/api/chat/resume",
            {"resume_phrase": "a-b-c-d"},
            format="json",
            REMOTE_ADDR=f"10.0.{n}.1",
        )
        assert response.status_code == 404

    # Now even the right phrase from a fresh client waits for the next minute.
    response = client.post(
        "/api/chat/resume",
        {"resume_phrase": started_chat["resume_phrase"]},
        format="json",
        REMOTE_ADDR="10.9.9.9",
    )
    assert response.status_code == 429
    assert 1 <= int(response["Retry-After"]) <= 60


def test_client_blocked_per_ip_does_not_use_up_the_global_cap(client, started_chat, settings):
    settings.RESUME_GLOBAL_FAILURES_PER_MINUTE = 6
    # One client hammers: 5 guesses reach the view (per-IP "5/min"), the
    # other 35 are stopped by the per-IP throttle before the view runs.
    for _ in range(40):
        client.post(
            "/api/chat/resume", {"resume_phrase": "a-b-c-d"}, format="json", REMOTE_ADDR="10.0.0.1"
        )
    assert ResumeFailureWindow.objects.get().failures == 5

    response = client.post(
        "/api/chat/resume",
        {"resume_phrase": started_chat["resume_phrase"]},
        format="json",
        REMOTE_ADDR="10.0.0.2",
    )
    assert response.status_code == 200


def test_successful_resume_is_not_counted(client, started_chat):
    client.post("/api/chat/resume", {"resume_phrase": started_chat["resume_phrase"]}, format="json")
    assert not ResumeFailureWindow.objects.exists()


def test_record_resume_failure_increments_one_row():
    services.record_resume_failure()  # creates the row
    services.record_resume_failure()  # atomic UPDATE ... failures + 1
    assert ResumeFailureWindow.objects.get().failures == 2


def test_purge_drops_old_failure_windows():
    ResumeFailureWindow.objects.create(minute=1, failures=9)
    services.record_resume_failure()
    services.purge_expired()
    assert list(ResumeFailureWindow.objects.values_list("failures", flat=True)) == [1]


# counselor presence and reply hours (her side)


def test_her_poll_shows_presence_and_hours_and_nothing_else(client, started_chat, settings):
    settings.COUNSELOR_HOURS = "10:00-18:00"
    url = messages_url(started_chat["session_id"])
    headers = woman_headers(started_chat["secret"])

    data = client.get(url, **headers).json()
    # Exact keys: a future counselor-only field cannot leak to her by accident.
    assert set(data) == {"status", "messages", "alert", "counselor_online", "reply_hours"}
    assert data["counselor_online"] is False
    assert data["reply_hours"] == "10:00-18:00"


def test_counselor_online_after_listing_sessions_then_offline_after_151_seconds(
    client, counselor_client, started_chat, monkeypatch
):
    url = messages_url(started_chat["session_id"])
    headers = woman_headers(started_chat["secret"])
    assert client.get(url, **headers).json()["counselor_online"] is False

    assert counselor_client.get("/api/c/sessions").status_code == 200
    assert client.get(url, **headers).json()["counselor_online"] is True

    later = timezone.now() + timedelta(seconds=151)
    monkeypatch.setattr(services.timezone, "now", lambda: later)
    assert services.counselor_online() is False
    assert client.get(url, **headers).json()["counselor_online"] is False


def test_presence_stores_only_a_timestamp(counselor_client):
    from django.core.cache import cache

    counselor_client.get("/api/c/sessions")
    assert isinstance(cache.get(services.COUNSELOR_SEEN_KEY), float)
