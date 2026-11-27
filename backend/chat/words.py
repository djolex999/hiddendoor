"""
Serbian food words for resume phrases, e.g. "cimet-pita-limun-med".

Typed into a page, a phrase looks like a recipe search. ASCII only (no
diacritics) so it is easy to type on any keyboard. 105 words, 4 per phrase:
105**4 = about 121 million phrases. Not strong on its own; together with the
per-client throttle, the global cap on failed resumes and the 24h session lifetime, guessing a
live phrase is impractical.
"""

FOOD_WORDS: tuple[str, ...] = (
    "cimet",
    "pita",
    "limun",
    "jabuka",
    "banana",
    "kivi",
    "ananas",
    "mango",
    "dinja",
    "lubenica",
    "malina",
    "kupina",
    "borovnica",
    "jagoda",
    "kajsija",
    "breskva",
    "smokva",
    "urma",
    "orah",
    "badem",
    "kikiriki",
    "susam",
    "mak",
    "med",
    "mleko",
    "jogurt",
    "kefir",
    "pavlaka",
    "kajmak",
    "sir",
    "maslac",
    "jaje",
    "kvasac",
    "biber",
    "origano",
    "bosiljak",
    "mirodija",
    "nana",
    "timijan",
    "ruzmarin",
    "lovor",
    "vanila",
    "kakao",
    "kafa",
    "keks",
    "torta",
    "krofna",
    "burek",
    "gibanica",
    "proja",
    "hleb",
    "kifla",
    "lepinja",
    "kora",
    "testo",
    "pasta",
    "pirinac",
    "kukuruz",
    "ovas",
    "heljda",
    "luk",
    "praziluk",
    "paprika",
    "paradajz",
    "krastavac",
    "tikvica",
    "kupus",
    "kelj",
    "brokoli",
    "karfiol",
    "blitva",
    "salata",
    "rotkva",
    "cvekla",
    "celer",
    "krompir",
    "pasulj",
    "leblebija",
    "tikva",
    "bundeva",
    "maslina",
    "ulje",
    "senf",
    "pekmez",
    "slatko",
    "sok",
    "sirup",
    "kompot",
    "supa",
    "sarma",
    "musaka",
    "riba",
    "losos",
    "tuna",
    "piletina",
    "kobasica",
    "slanina",
    "ajvar",
    "urnebes",
    "kiflica",
    "mafin",
    "strudla",
    "rolat",
    "kugla",
    "knedla",
)


# Case forms. People type words the way they use them in a sentence ("jaja",
# "krastavca", "kafu"), so every common case ending on a word's stem maps back
# to the list word. The phrase space stays 105**4: forms only map onto words.

CASE_ENDINGS: tuple[str, ...] = (
    "a",
    "e",
    "i",
    "o",
    "u",
    "om",
    "em",
    "ama",
    "ima",
    "ovi",
    "ove",
    "ova",
    "evi",
    "eve",
    "eva",
    "eta",
    "etu",
    "etom",
    "ja",
    "ju",
    "jem",
)


def word_stems(word: str) -> tuple[str, ...]:
    """Stems the case endings attach to: pita -> pit, krastavac -> krastavac + krastavc."""
    stems = {word}
    if word[-1] in "aeou":
        stems = {word[:-1]}  # pita -> pit(e), mleko -> mlek(a), jaje -> jaj(eta)
    elif word.endswith("i"):
        stems.add(word[:-1])  # kivi -> kivi(ja), brokoli -> brokoli(ja)
    if word.endswith("ac"):
        stems.add(word[:-2] + "c")  # krastavac -> krastavc(a), kvasac -> kvasc(a)
    return tuple(sorted(s for s in stems if len(s) >= 2))


def build_word_forms() -> dict[str, str]:
    """Map every accepted form (the word itself included) to its list word.

    Raises if one form could mean two words, so an ambiguous list never ships.
    """
    forms = {word: word for word in FOOD_WORDS}
    for word in FOOD_WORDS:
        for stem in word_stems(word):
            for ending in CASE_ENDINGS:
                owner = forms.setdefault(stem + ending, word)
                if owner != word:
                    raise ValueError(f"Ambiguous form {stem + ending!r}: {owner} or {word}")
    return forms


WORD_FORMS: dict[str, str] = build_word_forms()


# Small words people put between list words ("krofne, kore i maslaca"). They are
# skipped before matching, so a phrase is still exactly four list words.
FILLER_WORDS: frozenset[str] = frozenset({"i", "a", "pa", "sa", "s", "u", "uz", "za", "od", "ili"})

if FILLER_WORDS & WORD_FORMS.keys():
    raise ValueError("A filler word collides with a food word form")
