from django.core.management.base import BaseCommand

from chat.services import purge_expired


class Command(BaseCommand):
    help = "Delete expired chat sessions and their messages."

    def handle(self, *args, **options) -> None:
        count = purge_expired()
        self.stdout.write(self.style.SUCCESS(f"Purged {count} expired session(s)."))
