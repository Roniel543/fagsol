"""
Admin de anuncios - FagSol Escuela Virtual

Al subir una imagen desde el ordenador, se envía a Azure Blob (misma lógica que
los posters de cursos) y se guarda la URL en image_url para que se vea en producción.
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
            'description': 'Sube una imagen: se guarda en Blob Storage (como los posters de cursos) y se usa la URL. O pega una URL externa en "URL de imagen".',
        }),
        ('Visibilidad', {
            'fields': ('active', 'starts_at', 'ends_at'),
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def save_model(self, request, obj, form, change):
        # Si subieron un archivo por el campo "image", subirlo a Blob y guardar la URL en image_url
        uploaded_file = form.cleaned_data.get('image')
        if uploaded_file:
            try:
                from infrastructure.services.image_upload_service import ImageUploadService
                upload_service = ImageUploadService()
                success, url_or_error, metadata = upload_service.upload_announcement_image(uploaded_file)
                if success and metadata and metadata.get('url'):
                    obj.image_url = metadata['url']
                    obj.image = None  # No guardar en MEDIA; usamos solo la URL de Blob
                else:
                    from django.contrib import messages
                    messages.warning(request, f'No se pudo subir la imagen a Blob: {url_or_error}')
            except Exception as e:
                from django.contrib import messages
                messages.warning(request, f'Error subiendo imagen a Blob: {e}')
                obj.image = None
        super().save_model(request, obj, form, change)

    def title_short(self, obj):
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title

    title_short.short_description = 'Título'

    def visible_status(self, obj):
        if obj.is_visible_now():
            return format_html('<span style="color: green;">Visible</span>')
        return format_html('<span style="color: gray;">No visible</span>')

    visible_status.short_description = 'Estado'

    def image_preview(self, obj):
        url = None
        if obj.image:
            url = obj.image.url
        elif obj.image_url:
            url = obj.image_url
        if url:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 60px; object-fit: contain;" />',
                url,
            )
        return '-'

    image_preview.short_description = 'Imagen'

    def image_preview_readonly(self, obj):
        url = None
        if obj and obj.image:
            url = obj.image.url
        elif obj and obj.image_url:
            url = obj.image_url
        if url:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 100%; object-fit: contain;" />',
                url,
            )
        return mark_safe('<p style="color: #888;">Sin imagen. Sube un archivo o indica una URL.</p>')

    image_preview_readonly.short_description = 'Vista previa'
