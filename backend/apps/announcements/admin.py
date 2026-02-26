"""
Admin de anuncios - FagSol Escuela Virtual
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        'slug',
        'title_short',
        'active',
        'visible_status',
        'image_preview',
        'starts_at',
        'ends_at',
        'created_at',
    ]
    list_filter = ['active', 'created_at']
    search_fields = ['slug', 'title', 'summary']
    readonly_fields = ['created_at', 'updated_at', 'image_preview_readonly']
    fieldsets = (
        ('Identificación', {
            'fields': ('slug', 'title', 'summary', 'body'),
        }),
        ('Llamado a la acción', {
            'fields': ('cta_text', 'cta_url'),
        }),
        ('Imagen', {
            'fields': ('image', 'image_preview_readonly', 'image_url'),
            'description': 'Sube una imagen desde tu ordenador o indica una URL externa. La imagen subida tiene prioridad.',
        }),
        ('Visibilidad', {
            'fields': ('active', 'starts_at', 'ends_at'),
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def title_short(self, obj):
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title

    title_short.short_description = 'Título'

    def visible_status(self, obj):
        if obj.is_visible_now():
            return format_html('<span style="color: green;">Visible</span>')
        return format_html('<span style="color: gray;">No visible</span>')

    visible_status.short_description = 'Estado'

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 60px; object-fit: contain;" />',
                obj.image.url,
            )
        return '-'

    image_preview.short_description = 'Imagen'

    def image_preview_readonly(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 100%; object-fit: contain;" />',
                obj.image.url,
            )
        return mark_safe('<p style="color: #888;">Sin imagen subida.</p>')

    image_preview_readonly.short_description = 'Vista previa'
