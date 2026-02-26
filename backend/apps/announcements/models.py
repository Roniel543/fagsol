"""
Modelo de anuncios/convocatorias - FagSol Escuela Virtual

Anuncios mostrados como banner/modal al entrar al sitio (convocatorias,
novedades del sitio). El frontend usa el slug como clave para
"No volver a mostrar" en localStorage.
"""

from django.db import models
from django.utils import timezone


class Announcement(models.Model):
    """
    Anuncio o convocatoria mostrado en el sitio (banner/modal).

    - slug: identificador único; el frontend lo usa como clave de "no volver a mostrar".
    - active: si está desactivado, no se devuelve en GET active.
    - starts_at / ends_at: ventana de visibilidad (opcional).
    """

    slug = models.SlugField(
        max_length=80,
        unique=True,
        help_text='Identificador único (ej: practicantes-2026). Usado para "No volver a mostrar".',
    )
    title = models.CharField(
        max_length=200,
        help_text='Título principal del anuncio.',
    )
    summary = models.CharField(
        max_length=500,
        blank=True,
        help_text='Resumen corto (opcional).',
    )
    body = models.TextField(
        blank=True,
        help_text='Cuerpo del anuncio (texto plano o HTML sanitizado en frontend).',
    )
    cta_text = models.CharField(
        max_length=100,
        blank=True,
        help_text='Texto del botón de acción (ej: Ver más).',
    )
    cta_url = models.URLField(
        blank=True,
        null=True,
        max_length=500,
        help_text='URL del botón de acción.',
    )
    image = models.ImageField(
        upload_to='announcements/',
        blank=True,
        null=True,
        verbose_name='Imagen (subir archivo)',
        help_text='Imagen del anuncio. Se usa en lugar de "URL de imagen" si está definida.',
    )
    image_url = models.URLField(
        blank=True,
        null=True,
        max_length=500,
        help_text='URL externa de imagen (opcional). Solo se usa si no se sube un archivo.',
    )
    active = models.BooleanField(
        default=True,
        help_text='Si está desactivado, no se muestra en el sitio.',
    )
    starts_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha/hora desde la cual se muestra (opcional).',
    )
    ends_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha/hora hasta la cual se muestra (opcional).',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        verbose_name = 'Anuncio'
        verbose_name_plural = 'Anuncios'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['active', '-created_at']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return f"{self.slug}: {self.title}"

    def is_visible_now(self):
        """True si el anuncio debe mostrarse según active y fechas."""
        if not self.active:
            return False
        now = timezone.now()
        if self.starts_at and now < self.starts_at:
            return False
        if self.ends_at and now > self.ends_at:
            return False
        return True
