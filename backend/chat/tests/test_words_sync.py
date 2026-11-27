import pytest

from chat.management.commands.export_food_words import FRONTEND_FILE, render_frontend_module
from chat.services import normalize_resume_phrase
from chat.words import FOOD_WORDS, WORD_FORMS, build_word_forms


def test_frontend_word_file_is_up_to_date():
    # The cover site only sends a search to /api/chat/resume when it recognizes
    # all four words; a stale copy would lock women out of their chat.
    # Fix: uv run python manage.py export_food_words
    assert FRONTEND_FILE.read_text() == render_frontend_module()


def test_no_form_means_two_words():
    # build_word_forms raises on ambiguity; building it again proves the list is clean.
    assert build_word_forms() == WORD_FORMS
    assert all(WORD_FORMS[word] == word for word in FOOD_WORDS)


@pytest.mark.parametrize(
    ("typed", "expected"),
    [
        ("Jaja, KRASTAVCA kafu-limuna", "jaje-krastavac-kafa-limun"),
        ("jajeta kvasca oraha mleka", "jaje-kvasac-orah-mleko"),
        ("kivija tikve tikvice sira", "kivi-tikva-tikvica-sir"),
        ("cimet pita limun med", "cimet-pita-limun-med"),
        ("nepoznata rec ostaje ista", "nepoznata-rec-ostaje-ista"),
    ],
)
def test_case_forms_normalize_to_list_words(typed, expected):
    assert normalize_resume_phrase(typed) == expected
