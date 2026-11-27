from datetime import timedelta
from types import SimpleNamespace
from unittest import mock

import anthropic
import pytest
from django.utils import timezone

from chat import triage
from chat.models import ChatSession
from conftest import woman_headers
from door.signing import make_unlock_token

pytestmark = pytest.mark.django_db


def send(client, chat, body):
    response = client.post(
        f"/api/chat/{chat['session_id']}/messages",
        {"body": body},
        format="json",
        **woman_headers(chat["secret"]),
    )
    assert response.status_code == 201


def poll(client, chat):
    return client.get(
        f"/api/chat/{chat['session_id']}/messages", **woman_headers(chat["secret"])
    ).json()


# Danger words, no AI


@pytest.mark.parametrize(
    "body",
    [
        "Ima nož i kaže da će me ubiti",
        "He has a knife, please",
        "Ме дави, итно",
        "Ka një thikë dhe do më vrasë",
        "Zaklenil me je, pomagaj",
    ],
)
def test_danger_words_flag_the_session_in_every_language(client, started_chat, body):
    send(client, started_chat, body)
    assert ChatSession.objects.get(pk=started_chat["session_id"]).urgent_since is not None


def test_ordinary_message_is_not_flagged(client, started_chat):
    send(client, started_chat, "Zdravo, htela bih savet oko razvoda.")
    assert ChatSession.objects.get(pk=started_chat["session_id"]).urgent_since is None


# Her side: the emergency card


def test_emergency_card_only_after_waiting_and_cleared_by_a_reply(
    client, counselor_client, started_chat
):
    send(client, started_chat, "Udara me, hitno")
    assert poll(client, started_chat)["alert"] is False  # just flagged: give counselors time

    ChatSession.objects.update(urgent_since=timezone.now() - timedelta(seconds=31))
    assert poll(client, started_chat)["alert"] is True

    sid = started_chat["session_id"]
    counselor_client.post(f"/api/c/sessions/{sid}/messages", {"body": "Tu sam."}, format="json")
    assert poll(client, started_chat)["alert"] is False
    assert ChatSession.objects.get(pk=sid).urgent_since is None


# Counselor side


def test_urgent_chats_come_first_for_counselors(client, counselor_client, started_chat):
    calm = client.post(
        "/api/chat/start",
        {"unlock_token": make_unlock_token()},
        format="json",
    ).json()
    send(client, calm, "Samo pitanje.")
    send(client, started_chat, "Ima pištolj")

    listed = counselor_client.get("/api/c/sessions").json()
    assert listed[0]["id"] == started_chat["session_id"]
    assert listed[0]["urgent_since"] is not None
    assert listed[1]["urgent_since"] is None
    thread = counselor_client.get(f"/api/c/sessions/{started_chat['session_id']}/messages")
    assert thread.json()["urgent"] is True


# The AI layer (mocked: tests never call the real API)


def fake_response(text=None, stop_reason="end_turn"):
    content = [SimpleNamespace(type="text", text=text)] if text is not None else []
    return SimpleNamespace(stop_reason=stop_reason, content=content)


@pytest.fixture
def ai(settings):
    settings.ANTHROPIC_API_KEY = "test-key"
    fake = mock.Mock()
    with mock.patch.object(triage, "_ai_client", return_value=fake):
        yield fake.beta.messages.create


def test_ai_flags_danger_the_word_list_misses(client, started_chat, ai):
    ai.return_value = fake_response('{"urgent": true}')
    send(client, started_chat, "Rekao je da ovu noć neću preživeti")
    assert ChatSession.objects.get(pk=started_chat["session_id"]).urgent_since is not None

    # Only the message text goes to the API: no session id, no secret.
    sent = ai.call_args.kwargs
    assert sent["messages"] == [{"role": "user", "content": "Rekao je da ovu noć neću preživeti"}]
    assert started_chat["session_id"] not in str(sent)
    assert sent["model"] == "claude-opus-5-5"


@pytest.mark.parametrize(
    "outcome",
    [
        fake_response('{"urgent": false}'),
        fake_response(stop_reason="refusal"),
        fake_response("not json"),
    ],
)
def test_ai_no_or_unusable_answer_leaves_calm_message_unflagged(client, started_chat, ai, outcome):
    ai.return_value = outcome
    send(client, started_chat, "Kako da se pripremim za razgovor sa advokatom?")
    assert ChatSession.objects.get(pk=started_chat["session_id"]).urgent_since is None


def test_ai_failure_still_lets_the_word_list_decide(client, started_chat, ai):
    ai.side_effect = anthropic.APIConnectionError.__new__(anthropic.APIConnectionError)
    send(client, started_chat, "Ima nož")
    assert ChatSession.objects.get(pk=started_chat["session_id"]).urgent_since is not None


def test_no_api_key_means_no_api_call(client, started_chat):
    with mock.patch.object(triage, "_ai_client") as factory:
        send(client, started_chat, "Kako da se pripremim za sud?")
    factory.assert_not_called()
