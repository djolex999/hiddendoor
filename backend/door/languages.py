"""
Languages the cover site and help cards support.

Codes are what the frontends send. "cnr" is the ISO 639-3 code for
Montenegrin. Serbian is the default and the fallback when a language has no
cards yet.
"""

DEFAULT_LANGUAGE = "sr"

LANGUAGES: tuple[tuple[str, str], ...] = (
    ("sr", "Srpski"),
    ("hr", "Hrvatski"),
    ("bs", "Bosanski"),
    ("cnr", "Crnogorski"),
    ("sl", "Slovenščina"),
    ("mk", "Македонски"),
    ("sq", "Shqip"),
    ("en", "English"),
)

LANGUAGE_CODES: frozenset[str] = frozenset(code for code, _ in LANGUAGES)


def pick_language(value: object) -> str:
    """Any unknown or missing value falls back to the default, never an error."""
    return value if isinstance(value, str) and value in LANGUAGE_CODES else DEFAULT_LANGUAGE
