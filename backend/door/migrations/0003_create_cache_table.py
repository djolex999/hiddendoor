"""
Create the DatabaseCache table (settings.CACHES) as part of `migrate`.

Normally you run `manage.py createcachetable` by hand. Doing it here means a
fresh database is never missing it, which would turn every throttled request
into a 500. createcachetable skips tables that already exist, so reverse is a
no-op.
"""

from django.core.management import call_command
from django.db import migrations


def create_cache_table(apps, schema_editor):
    call_command("createcachetable", database=schema_editor.connection.alias)


class Migration(migrations.Migration):
    dependencies = [("door", "0002_seed_help_cards")]

    operations = [migrations.RunPython(create_cache_table, migrations.RunPython.noop)]
