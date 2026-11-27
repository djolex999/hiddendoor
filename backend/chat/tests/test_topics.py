import pytest

from chat.models import ChatSession
from conftest import woman_headers
from door.signing import make_unlock_token

pytestmark = pytest.mark.django_db


def start(client, **extra):
    return client.post(
        "/api/chat/start", {"unlock_token": make_unlock_token(), **extra}, format="json"
    )


def test_cards_carry_their_path(client):
    cards = client.post("/api/u/", {"sequence": [3, 1, 4, 1]}, format="json").json()["cards"]
    topics = {c["slug"]: c["topic"] for c in cards}
    assert topics["nisi-sama"] == "general"
    assert topics["tvoj-telefon"] == "control"
    assert topics["plan-bezbednosti"] == "danger"
    assert topics["moje-slike"] == "grooming"


@pytest.mark.parametrize("language", ["sr", "hr", "bs", "cnr", "sl", "mk", "sq", "en"])
def test_every_language_has_every_path(client, language):
    cards = client.post(
        "/api/u/", {"sequence": [3, 1, 4, 1], "language": language}, format="json"
    ).json()["cards"]
    assert {c["topic"] for c in cards} == {"general", "control", "danger", "grooming"}


def test_topic_is_stored_for_counselors(client, counselor_client):
    sid = start(client, topic="grooming").json()["session_id"]
    assert ChatSession.objects.get(pk=sid).topic == "grooming"
    listed = counselor_client.get("/api/c/sessions").json()
    assert listed[0]["topic"] == "grooming"
    assert counselor_client.get(f"/api/c/sessions/{sid}/messages").json()["topic"] == "grooming"


def test_skipping_the_question_is_fine(client):
    assert start(client).status_code == 201
    assert start(client, topic="").status_code == 201


def test_unknown_topic_is_rejected(client):
    assert start(client, topic="general").status_code == 400
    assert start(client, topic="anything").status_code == 400


@pytest.mark.parametrize(
    "quick_reply",
    [
        "Treba mi policija, šta da radim?",
        "Trebam policiju, što da radim?",
        "Potrebujem policijo, kaj naj naredim?",
        "Ми треба полиција, што да правам?",
        "Më duhet policia, çfarë të bëj?",
        "I need the police. What do I do?",
    ],
)
def test_police_quick_reply_is_urgent_in_every_language(client, quick_reply):
    chat = start(client).json()
    client.post(
        f"/api/chat/{chat['session_id']}/messages",
        {"body": quick_reply},
        format="json",
        **woman_headers(chat["secret"]),
    )
    assert ChatSession.objects.get(pk=chat["session_id"]).urgent_since is not None
