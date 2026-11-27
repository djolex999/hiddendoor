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
        ("Krofne, kore, musake i maslaca", "krofna-kora-musaka-maslac"),
        ("jaja sa limunom ili kafa i med", "jaje-limun-kafa-med"),
        ("nepoznata rec ostaje ista", "nepoznata-rec-ostaje-ista"),
    ],
)
def test_case_forms_normalize_to_list_words(typed, expected):
    assert normalize_resume_phrase(typed) == expected


# Every language


def test_every_language_has_105_aligned_words_and_no_ambiguity():
    from chat.phrase_languages import LANGUAGE_FORMS, LANGUAGE_WORDS, build_language_forms

    assert set(LANGUAGE_WORDS) == {"sr", "hr", "bs", "cnr", "sl", "mk", "sq", "en"}
    for language in LANGUAGE_WORDS:
        assert build_language_forms(language) == LANGUAGE_FORMS[language]


@pytest.mark.parametrize(
    ("language", "typed", "serbian"),
    [
        ("hr", "rajčice, kruha i kave", None),  # 3 words: not a phrase
        ("hr", "rajčice kruha kave mlijeka", "paradajz-hleb-kafa-mleko"),
        ("sl", "jabolka in breskve, kruh, med", "jabuka-breskva-hleb-med"),
        ("mk", "јаболкото лимонот питата квасец", "jabuka-limun-pita-kvasac"),
        ("sq", "molla dhe kafen, buke, veze", "jabuka-kafa-hleb-jaje"),
        ("sq", "Mollë kafe bukë vezë", "jabuka-kafa-hleb-jaje"),
        ("en", "strawberries and tomatoes, beans, honey", "jagoda-paradajz-pasulj-med"),
    ],
)
def test_phrases_in_every_language_map_to_serbian(language, typed, serbian):
    from chat.phrase_languages import FILLERS, LANGUAGE_FORMS, LANGUAGE_WORDS, fold

    words = [w for w in fold(typed).replace(",", " ").split() if w not in FILLERS[language]]
    forms = LANGUAGE_FORMS[language]
    if serbian is None:
        assert len(words) != 4
        return
    assert "-".join(LANGUAGE_WORDS["sr"][forms[w]] for w in words) == serbian


def test_typescript_forms_match_python_exactly(tmp_path):
    """Run the generated TypeScript in Node and compare every form, every language."""
    import json
    import shutil
    import subprocess

    from chat.phrase_languages import LANGUAGE_FORMS

    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    module = tmp_path / "foodWords.ts"
    module.write_text(FRONTEND_FILE.read_text())
    script = (
        f"import('{module.as_uri()}').then(m => {{"
        "const out = {};"
        f"for (const l of {json.dumps(list(LANGUAGE_FORMS))}) "
        "out[l] = Object.fromEntries(m.formsOf(l));"
        "console.log(JSON.stringify(out)); })"
    )
    result = subprocess.run(  # noqa: S603 (fixed args, test only)
        [node, "--experimental-strip-types", "--no-warnings", "-e", script],
        capture_output=True,
        text=True,
        check=True,
    )
    assert json.loads(result.stdout) == LANGUAGE_FORMS
