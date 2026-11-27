from django.contrib import admin

from .models import HelpCard


@admin.register(HelpCard)
class HelpCardAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "order", "is_active"]
    list_editable = ["order", "is_active"]
    prepopulated_fields = {"slug": ["title"]}
    search_fields = ["title", "body"]
