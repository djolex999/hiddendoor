import re
from pathlib import Path

from chat.words import FOOD_WORDS

FRONTEND_LIST = Path(__file__).resolve().parents[3] / "frontend" / "src" / "foodWords.ts"


def test_frontend_word_list_matches_server():
    # The cover site only sends a search to /api/chat/resume when all four
    # words are on its copy of this list; a drifted copy would lock women out.
    frontend_words = re.findall(r'"([a-z]+)"', FRONTEND_LIST.read_text())
    assert sorted(frontend_words) == sorted(FOOD_WORDS)
