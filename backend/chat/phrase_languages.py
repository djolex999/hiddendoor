"""
Resume-phrase words in every cover-site language.

Each language has 105 food words in the SAME ORDER as chat.words.FOOD_WORDS
(Serbian). Position is what matters: word 3 in any language means Serbian
word 3. The cover site shows a phrase in her language and turns what she
types back into the Serbian words before sending, so the server, the hashing
and the 105**4 phrase space stay exactly as they are.

Matching is forgiving per language: case, diacritics ("c" for "č", "e" for
"ë"), grammatical endings and small filler words. Building the forms raises
if any form could mean two different words within one language.

Translations are drafts for the demo; a native speaker should review them.
"""

import unicodedata

from .words import CASE_ENDINGS, FILLER_WORDS, FOOD_WORDS, word_stems


def fold(text: str) -> str:
    """Lowercase, đ -> dj, strip diacritics (č -> c, ë -> e, ѓ -> г)."""
    text = text.lower().replace("đ", "dj")
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if not unicodedata.category(ch).startswith("M"))


def _words(text: str) -> tuple[str, ...]:
    return tuple(text.split())


LANGUAGE_WORDS: dict[str, tuple[str, ...]] = {
    "sr": FOOD_WORDS,
    "hr": _words("""
        cimet pita limun jabuka banana kivi ananas mango dinja lubenica
        malina kupina borovnica jagoda marelica breskva smokva datulja orah badem
        kikiriki sezam mak med mlijeko jogurt kefir vrhnje kajmak sir
        maslac jaje kvasac papar origano bosiljak kopar metvica timijan ružmarin
        lovor vanilija kakao kava keks torta krafna burek gibanica kukuruznjak
        kruh kifla lepinja kora tijesto tjestenina riža kukuruz zob heljda
        luk poriluk paprika rajčica krastavac tikvica kupus kelj brokula cvjetača
        blitva salata rotkva cikla celer krumpir grah slanutak tikva bundeva
        maslina ulje senf pekmez slatko sok sirup kompot juha sarma
        musaka riba losos tuna piletina kobasica slanina ajvar urnebes kiflica
        muffin štrudla rolada kugla knedla
    """),
    "bs": _words("""
        cimet pita limun jabuka banana kivi ananas mango dinja lubenica
        malina kupina borovnica jagoda kajsija breskva smokva hurma orah badem
        kikiriki susam mak med mlijeko jogurt kefir pavlaka kajmak sir
        maslac jaje kvasac biber origano bosiljak mirođija nana timijan ruzmarin
        lovor vanilija kakao kahva keks torta krofna burek gibanica proja
        hljeb kifla lepinja kora tijesto pasta riža kukuruz zob heljda
        luk praziluk paprika paradajz krastavac tikvica kupus kelj brokula karfiol
        blitva salata rotkva cvekla celer krompir grah leblebija tikva bundeva
        maslina ulje senf pekmez slatko sok sirup kompot supa sarma
        musaka riba losos tuna piletina kobasica slanina ajvar urnebes kiflica
        mafin štrudla rolat kugla knedla
    """),
    "cnr": _words("""
        cimet pita limun jabuka banana kivi ananas mango dinja lubenica
        malina kupina borovnica jagoda kajsija breskva smokva hurma orah badem
        kikiriki susam mak med mlijeko jogurt kefir pavlaka kajmak sir
        maslac jaje kvasac biber origano bosiljak mirođija nana timijan ruzmarin
        lovor vanila kakao kafa keks torta krofna burek gibanica proja
        hljeb kifla lepinja kora tijesto pasta pirinač kukuruz ovas heljda
        luk praziluk paprika paradajz krastavac tikvica kupus kelj brokoli karfiol
        blitva salata rotkva cvekla celer krompir pasulj leblebija tikva bundeva
        maslina ulje senf pekmez slatko sok sirup kompot supa sarma
        musaka riba losos tuna piletina kobasica slanina ajvar urnebes kiflica
        mafin štrudla rolat kugla knedla
    """),
    "sl": _words("""
        cimet pita limona jabolko banana kivi ananas mango melona lubenica
        malina robida borovnica jagoda marelica breskev figa datelj oreh mandelj
        arašid sezam mak med mleko jogurt kefir smetana kajmak sir
        maslo jajce kvas poper origano bazilika koper meta timijan rožmarin
        lovor vanilija kakav kava piškot torta krof burek gibanica proja
        kruh kifeljc lepinja kora testo testenine riž koruza oves ajda
        čebula por paprika paradižnik kumara bučka zelje ohrovt brokoli cvetača
        blitva solata redkev pesa zelena krompir fižol čičerika tikva buča
        oliva olje gorčica marmelada sladko sok sirup kompot juha sarma
        musaka riba losos tuna piščanec klobasa slanina ajvar urnebes rogljiček
        mafin štrudelj rulada kepica cmok
    """),
    "mk": _words("""
        цимет пита лимон јаболко банана киви ананас манго диња лубеница
        малина капина боровинка јагода кајсија праска смоква урма орев бадем
        кикиритка сусам мак мед млеко јогурт кефир павлака кајмак сирење
        путер јајце квасец бибер оригано босилек копар нане тимијан рузмарин
        ловор ванила какао кафе бисквит торта крофна бурек гибаница проја
        леб кифла лепче кора тесто тестенини ориз пченка овес елда
        кромид праз пиперка домат краставица тиквичка зелка кељ брокула карфиол
        блитва салата ротква цвекло целер компир грав леблебија тиква бундева
        маслинка масло сенф пекмез слатко сок сируп компот супа сарма
        мусака риба лосос туна пилешко колбас сланина ајвар урнебес кифличка
        мафин штрудла ролат топка кнедла
    """),
    "sq": _words("""
        kanellë pite limon mollë banane kivi ananas mango pjepër shalqi
        mjedër manaferrë boronicë luleshtrydhe kajsi pjeshkë fik hurmë arrë bajame
        kikirik susam lulëkuqe mjaltë qumësht kos kefir ajkë kajmak djathë
        gjalpë vezë maja piper rigon borzilok kopër mendër trumzë rozmarinë
        dafinë vanilje kakao kafe biskotë tortë petull byrek lakror kulaç
        bukë kifle pogaçe petë brumë makarona oriz misër tërshërë hikërr
        qepë presh spec domate kastravec kungulleshë lakër kale brokoli lulelakër
        seskël sallatë rrepkë panxhar selino patate fasule qiqër kungull bostan
        ulli vaj mustardë reçel ëmbëlsirë lëng shurup komposto supë sarma
        musaka peshk salmon ton pulë sallam proshutë ajvar urnebes kroasant
        mafin shtrudel rollë top qofte
    """),
    "en": _words("""
        cinnamon pie lemon apple banana kiwi pineapple mango melon watermelon
        raspberry blackberry blueberry strawberry apricot peach fig date walnut almond
        peanut sesame poppy honey milk yogurt kefir cream kaymak cheese
        butter egg yeast pepper oregano basil dill mint thyme rosemary
        bay vanilla cocoa coffee biscuit cake doughnut burek gibanica cornbread
        bread roll flatbread pastry dough pasta rice corn oats buckwheat
        onion leek paprika tomato cucumber zucchini cabbage kale broccoli cauliflower
        chard salad radish beet celery potato beans chickpea squash pumpkin
        olive oil mustard jam preserve juice syrup compote soup sarma
        moussaka fish salmon tuna chicken sausage bacon ajvar urnebes croissant
        muffin strudel roulade scoop dumpling
    """),
}

SLAVIC_LATIN = ("sr", "hr", "bs", "cnr")

ENDINGS: dict[str, tuple[str, ...]] = {
    **{lang: CASE_ENDINGS for lang in SLAVIC_LATIN},
    "sl": ("a", "e", "i", "o", "u", "om", "em", "ah", "ov", "ami", "ih", "je"),
    "mk": ("а", "и", "о", "е", "от", "та", "то", "те", "ов", "на", "ни", "ва"),
    "sq": ("a", "i", "u", "t", "ja", "ri", "te", "ve", "n", "ne", "et", "at", "in", "it"),
    "en": ("", "s", "es", "ies"),
}

FILLERS: dict[str, frozenset[str]] = {
    **{lang: FILLER_WORDS for lang in SLAVIC_LATIN},
    "sl": frozenset({"in", "z", "s", "ter", "ali", "pa", "za", "od", "a"}),
    "mk": frozenset({"и", "со", "за", "од", "или", "па", "а"}),
    "sq": frozenset({"dhe", "me", "e", "ose", "per", "nga", "te"}),
    "en": frozenset({"and", "with", "the", "a", "or", "some", "of", "plus"}),
}


def stems_for(language: str, word: str) -> tuple[str, ...]:
    """Folded stems the language's endings attach to."""
    w = fold(word)
    if language in SLAVIC_LATIN:
        return tuple(fold(s) for s in word_stems(fold(word)))
    stems = {w}
    if language == "sl":
        stems = set(word_stems(w))
        if w.endswith("ev"):
            stems.add(w[:-2] + "v")  # breskev -> breskve
    elif language == "mk":
        # Articles attach to the whole word (јаболко -> јаболкото), plurals
        # to the stem (јаболко -> јаболка), so keep both.
        if w[-1] in "аеоу":
            stems.add(w[:-1])
        elif w.endswith("и"):
            stems.add(w[:-1])
        if w.endswith("ец"):
            stems.add(w[:-2] + "ц")  # квасец -> квасца
    elif language == "sq":
        if w.endswith("e"):
            stems.add(w[:-1])  # molle -> moll(a); kafe -> kafe(n) stays too
    elif language == "en":
        if w.endswith("y"):
            stems.add(w[:-1])  # strawberry -> strawberr(ies)
        if w.endswith("s"):
            stems.add(w[:-1])  # beans -> bean
    return tuple(sorted(s for s in stems if len(s) >= 2))


def build_language_forms(language: str) -> dict[str, int]:
    """Every accepted folded form in one language -> word position (0..104)."""
    words = LANGUAGE_WORDS[language]
    if len(words) != len(FOOD_WORDS):
        raise ValueError(f"{language}: {len(words)} words, expected {len(FOOD_WORDS)}")
    forms: dict[str, int] = {}
    for index, word in enumerate(words):
        owner = forms.setdefault(fold(word), index)
        if owner != index:
            raise ValueError(f"{language}: {word!r} appears twice")
    for index, word in enumerate(words):
        for stem in stems_for(language, word):
            for ending in ENDINGS[language]:
                owner = forms.setdefault(stem + ending, index)
                if owner != index:
                    raise ValueError(
                        f"{language}: form {stem + ending!r} means {words[owner]} and {word}"
                    )
    clash = FILLERS[language] & forms.keys()
    if clash:
        raise ValueError(f"{language}: filler words collide with forms: {sorted(clash)}")
    return forms


LANGUAGE_FORMS: dict[str, dict[str, int]] = {
    language: build_language_forms(language) for language in LANGUAGE_WORDS
}
