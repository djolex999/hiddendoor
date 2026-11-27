"""
Data migration: seed three placeholder help cards.

Uses apps.get_model() (the historical model), not `from door.models import
HelpCard`, so this migration keeps working after the model changes later.
Milica replaces the text in the admin; this only guarantees the demo is never
empty on a fresh database.
"""

from django.db import migrations

CARDS = [
    {
        "slug": "nisi-sama",
        "title": "Nisi sama",
        "body": (
            "[Placeholder] Ono što ti se dešava nije tvoja krivica. "
            "Ovde možeš anonimno da razgovaraš sa savetnicom."
        ),
        "order": 1,
    },
    {
        "slug": "sos-linija",
        "title": "SOS linija",
        "body": (
            "[Placeholder] Besplatna SOS linija: **0800 300 339**. "
            "Poziv je besplatan. Ako si u neposrednoj opasnosti, pozovi **192**."
        ),
        "order": 2,
    },
    {
        "slug": "tvoj-telefon",
        "title": "Tvoj telefon",
        "body": (
            "[Placeholder] Ova stranica ne ostavlja tragove na tvom uređaju. "
            "Dugme za izlaz te odmah vraća na recept."
        ),
        "order": 3,
    },
]


def seed_cards(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    for card in CARDS:
        HelpCard.objects.update_or_create(slug=card["slug"], defaults=card)


def remove_cards(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    HelpCard.objects.filter(slug__in=[c["slug"] for c in CARDS]).delete()


class Migration(migrations.Migration):
    dependencies = [("door", "0001_initial")]

    operations = [migrations.RunPython(seed_cards, remove_cards)]
