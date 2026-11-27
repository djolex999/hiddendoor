from django.db import models


class HelpCard(models.Model):
    """A short help text shown after the door opens. Edited in the admin."""

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    body = models.TextField(help_text="Markdown. No raw HTML.")
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.title
