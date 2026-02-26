"""
Caso de uso: Crear anuncio (admin) - FagSol Escuela Virtual
"""

import logging
from django.utils import timezone
from application.dtos.use_case_result import UseCaseResult
from apps.announcements.models import Announcement

logger = logging.getLogger('apps')

# Límites de longitud para validación
MAX_SLUG = 80
MAX_TITLE = 200
MAX_SUMMARY = 500
MAX_CTA_TEXT = 100
MAX_URL = 500


class CreateAnnouncementUseCase:
    """Crea un nuevo anuncio. Solo admin."""

    def execute(
        self,
        slug: str,
        title: str,
        summary: str = '',
        body: str = '',
        cta_text: str = '',
        cta_url: str = '',
        image_url: str = '',
        active: bool = True,
        starts_at=None,
        ends_at=None,
    ) -> UseCaseResult:
        try:
            slug = (slug or '').strip()
            title = (title or '').strip()
            if not slug:
                return UseCaseResult(success=False, error_message='El slug es requerido.')
            if not title:
                return UseCaseResult(success=False, error_message='El título es requerido.')
            if len(slug) > MAX_SLUG:
                return UseCaseResult(success=False, error_message=f'Slug máximo {MAX_SLUG} caracteres.')
            if len(title) > MAX_TITLE:
                return UseCaseResult(success=False, error_message=f'Título máximo {MAX_TITLE} caracteres.')
            if len(summary or '') > MAX_SUMMARY:
                return UseCaseResult(success=False, error_message=f'Resumen máximo {MAX_SUMMARY} caracteres.')
            if len(cta_text or '') > MAX_CTA_TEXT:
                return UseCaseResult(success=False, error_message=f'CTA text máximo {MAX_CTA_TEXT} caracteres.')
            if len(cta_url or '') > MAX_URL:
                return UseCaseResult(success=False, error_message=f'URL máximo {MAX_URL} caracteres.')
            if len(image_url or '') > MAX_URL:
                return UseCaseResult(success=False, error_message=f'Image URL máximo {MAX_URL} caracteres.')

            if Announcement.objects.filter(slug=slug).exists():
                return UseCaseResult(success=False, error_message='Ya existe un anuncio con ese slug.')

            announcement = Announcement.objects.create(
                slug=slug,
                title=title,
                summary=summary or '',
                body=body or '',
                cta_text=cta_text or '',
                cta_url=cta_url or None,
                image_url=image_url or None,
                active=bool(active),
                starts_at=starts_at,
                ends_at=ends_at,
            )
            logger.info(f"Anuncio creado: id={announcement.id} slug={announcement.slug}")
            return UseCaseResult(
                success=True,
                data={
                    'id': announcement.id,
                    'slug': announcement.slug,
                    'title': announcement.title,
                    'summary': announcement.summary,
                    'body': announcement.body,
                    'cta_text': announcement.cta_text,
                    'cta_url': announcement.cta_url,
                    'image_url': announcement.image_url,
                    'active': announcement.active,
                    'starts_at': announcement.starts_at.isoformat() if announcement.starts_at else None,
                    'ends_at': announcement.ends_at.isoformat() if announcement.ends_at else None,
                    'created_at': announcement.created_at.isoformat(),
                    'updated_at': announcement.updated_at.isoformat(),
                },
            )
        except Exception as e:
            logger.error(f"Error al crear anuncio: {str(e)}", exc_info=True)
            return UseCaseResult(success=False, error_message=str(e))
