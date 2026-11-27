"""
Data migration: placeholder help cards for the seven non-Serbian languages.

The SOS card deliberately has NO phone numbers outside Serbia: each country's
real hotline and police number must be checked and typed in via the admin.
A wrong number in this product is dangerous, so it is never guessed here.
Translations are drafts for the demo and need a native speaker's review.
"""

from django.db import migrations

CARDS = {
    "hr": [
        ("nisi-sama", "Nisi sama", "[Placeholder] Ono što ti se događa nije tvoja krivnja. Ovdje možeš anonimno razgovarati sa savjetnicom."),
        ("sos-linija", "SOS linija", "[Placeholder] SOS linija za žene: **[upiši broj]**. Ako si u neposrednoj opasnosti, nazovi policiju: **[upiši broj]**."),
        ("tvoj-telefon", "Tvoj telefon", "[Placeholder] Ova stranica ne ostavlja tragove na tvom uređaju. Izlaz te odmah vraća na recept."),
    ],
    "bs": [
        ("nisi-sama", "Nisi sama", "[Placeholder] Ono što ti se dešava nije tvoja krivica. Ovdje možeš anonimno razgovarati sa savjetnicom."),
        ("sos-linija", "SOS linija", "[Placeholder] SOS linija za žene: **[upiši broj]**. Ako si u neposrednoj opasnosti, pozovi policiju: **[upiši broj]**."),
        ("tvoj-telefon", "Tvoj telefon", "[Placeholder] Ova stranica ne ostavlja tragove na tvom uređaju. Izlaz te odmah vraća na recept."),
    ],
    "cnr": [
        ("nisi-sama", "Nijesi sama", "[Placeholder] Ono što ti se dešava nije tvoja krivica. Ovdje možeš anonimno da razgovaraš sa savjetnicom."),
        ("sos-linija", "SOS linija", "[Placeholder] SOS linija za žene: **[upiši broj]**. Ako si u neposrednoj opasnosti, pozovi policiju: **[upiši broj]**."),
        ("tvoj-telefon", "Tvoj telefon", "[Placeholder] Ova stranica ne ostavlja tragove na tvom uređaju. Izlaz te odmah vraća na recept."),
    ],
    "sl": [
        ("nisi-sama", "Nisi sama", "[Placeholder] To, kar se ti dogaja, ni tvoja krivda. Tukaj se lahko anonimno pogovoriš s svetovalko."),
        ("sos-linija", "SOS telefon", "[Placeholder] SOS telefon za ženske: **[vpiši številko]**. Če si v neposredni nevarnosti, pokliči policijo: **[vpiši številko]**."),
        ("tvoj-telefon", "Tvoj telefon", "[Placeholder] Ta stran na tvoji napravi ne pušča sledi. Izhod te takoj vrne na recept."),
    ],
    "mk": [
        ("nisi-sama", "Не си сама", "[Placeholder] Тоа што ти се случува не е твоја вина. Овде можеш анонимно да разговараш со советничка."),
        ("sos-linija", "SOS линија", "[Placeholder] SOS линија за жени: **[внеси број]**. Ако си во непосредна опасност, јави се во полиција: **[внеси број]**."),
        ("tvoj-telefon", "Твојот телефон", "[Placeholder] Оваа страница не остава траги на твојот уред. Излезот веднаш те враќа на рецептот."),
    ],
    "sq": [
        ("nisi-sama", "Nuk je vetëm", "[Placeholder] Ajo që po të ndodh nuk është faji yt. Këtu mund të flasësh në mënyrë anonime me një këshilltare."),
        ("sos-linija", "Linja SOS", "[Placeholder] Linja SOS për gratë: **[shkruaj numrin]**. Nëse je në rrezik të menjëhershëm, telefono policinë: **[shkruaj numrin]**."),
        ("tvoj-telefon", "Telefoni yt", "[Placeholder] Kjo faqe nuk lë gjurmë në pajisjen tënde. Dalja të kthen menjëherë te receta."),
    ],
    "en": [
        ("nisi-sama", "You are not alone", "[Placeholder] What is happening to you is not your fault. Here you can talk to a counselor anonymously."),
        ("sos-linija", "SOS line", "[Placeholder] SOS line for women: **[add number]**. If you are in immediate danger, call the police: **[add number]**."),
        ("tvoj-telefon", "Your phone", "[Placeholder] This page leaves no trace on your device. The exit takes you straight back to the recipe."),
    ],
}


def seed_cards(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    for language, cards in CARDS.items():
        for order, (slug, title, body) in enumerate(cards, start=1):
            HelpCard.objects.update_or_create(
                language=language,
                slug=slug,
                defaults={"title": title, "body": body, "order": order, "is_active": True},
            )


def remove_cards(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    HelpCard.objects.filter(language__in=list(CARDS)).delete()


class Migration(migrations.Migration):
    dependencies = [("door", "0004_help_card_language")]

    operations = [migrations.RunPython(seed_cards, remove_cards)]
