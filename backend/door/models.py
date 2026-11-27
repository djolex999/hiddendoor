from django.db import models

from .languages import DEFAULT_LANGUAGE, LANGUAGES, TOPICS


class HelpCard(models.Model):
    """A short help text shown after the door opens. Edited in the admin."""

    language = models.CharField(
        max_length=5, choices=LANGUAGES, default=DEFAULT_LANGUAGE, db_index=True
    )
    # Which path the card belongs to; "general" shows on every path.
    topic = models.CharField(max_length=10, choices=TOPICS, default="general", db_index=True)
    # Same slug in every language ("sos-linija"), so one card has one identity.
    slug = models.SlugField()
    title = models.CharField(max_length=120)
    body = models.TextField(help_text="Markdown. No raw HTML.")
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["language", "order", "id"]
        constraints = [
            models.UniqueConstraint(fields=["language", "slug"], name="helpcard_language_slug")
        ]

    def __str__(self) -> str:
        return f"[{self.language}] {self.title}"
