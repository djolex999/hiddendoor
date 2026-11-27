"""Clean up seeded help cards she can see.

1. Drop the "[Placeholder] " prefix from card text seeded in 0002 and 0005.
   The cards stay team drafts (see REVIEW.md).
2. Hide every card whose text still has a bracket placeholder such as
   "[upiši broj]" (enter number). Her emergency card already shows the
   verified number for her language (frontend/src/emergency.ts).
"""

from django.db import migrations

PREFIX = "[Placeholder] "


def strip_prefix(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    for card in HelpCard.objects.filter(body__startswith=PREFIX):
        card.body = card.body.removeprefix(PREFIX)
        card.save(update_fields=["body"])
    HelpCard.objects.filter(is_active=True, body__contains="[").update(is_active=False)


class Migration(migrations.Migration):
    dependencies = [("door", "0007_seed_topic_cards")]

    operations = [migrations.RunPython(strip_prefix, migrations.RunPython.noop)]
