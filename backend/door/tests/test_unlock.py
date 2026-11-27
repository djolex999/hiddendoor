import time
from unittest import mock

import pytest

from door.signing import is_valid_unlock_token, make_unlock_token

pytestmark = pytest.mark.django_db

RIGHT = [3, 1, 4, 1]  # matches DOOR_SEQUENCE in config/settings_test.py


def test_right_sequence_returns_token_and_cards(client):
    response = client.post("/api/u/", {"sequence": RIGHT}, format="json")

    assert response.status_code == 200
    data = response.json()
    assert is_valid_unlock_token(data["unlock_token"])
    assert [c["slug"] for c in data["cards"]] == ["nisi-sama", "sos-linija", "tvoj-telefon"]
    assert "0800 300 339" in data["cards"][1]["body"]


@pytest.mark.parametrize(
    "payload",
    [
        {"sequence": [1, 2, 3, 4]},
        {"sequence": RIGHT + [1]},
        {"sequence": []},
        {"sequence": "3,1,4,1"},
        {},
    ],
)
def test_anything_else_is_empty_204(client, payload):
    response = client.post("/api/u/", payload, format="json")

    assert response.status_code == 204
    assert response.content == b""


def test_privacy_headers_on_api_responses(client):
    response = client.post("/api/u/", {"sequence": [9]}, format="json")

    assert response["Cache-Control"] == "no-store"
    assert response["Referrer-Policy"] == "no-referrer"
    assert response["X-Content-Type-Options"] == "nosniff"
    assert "Set-Cookie" not in response


def test_unlock_is_throttled(client):
    for _ in range(10):  # "unlock": "10/min"
        assert client.post("/api/u/", {"sequence": [9]}, format="json").status_code == 204

    response = client.post("/api/u/", {"sequence": RIGHT}, format="json")
    assert response.status_code == 429  # even the right sequence is refused now


def test_unlock_token_expires_after_10_minutes():
    token = make_unlock_token()
    eleven_minutes_later = time.time() + 11 * 60
    with mock.patch("django.core.signing.time.time", return_value=eleven_minutes_later):
        assert not is_valid_unlock_token(token)
