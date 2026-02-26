"""
Caso de uso: Actualizar anuncio (admin) - FagSol Escuela Virtual
"""

import logging
from application.dtos.use_case_result import UseCaseResult
from apps.announcements.models import Announcement

logger = logging.getLogger('apps')

MAX_TITLE = 200
MAX_SUMMARY = 500
MAX_CTA_TEXT = 100
MAX_URL = 500


class UpdateAnnouncementUseCase:
    """Actualiza un anuncio existente. Solo admin."""

    def execute(
        self,
        announcement_id: int,
        title: str = None,
        summary: str = None,
        body: str = None,
        cta_text: str = None,
        cta_url: str = None,
        image_url: str = None,
        active: bool = None,
        starts_at=None,
        ends_at=None,
    ) -> UseCaseResult:
        try:
            announcement = Announcement.objects.filter(id=announcement_id).first()
            if not announcement:
                return UseCaseResult(success=False, error_message='Anuncio no encontrado.')

            if title is not None:
                title = str(title).strip()
                if not title:
                    return UseCaseResult(success=False, error_message='El título no puede estar vacío.')
                if len(title) > MAX_TITLE:
                    return UseCaseResult(success=False, error_message=f'Título máximo {MAX_TITLE} caracteres.')
                announcement.title = title
            if summary is not None:
                summary = str(summary).strip()
                if len(summary) > MAX_SUMMARY:
                    return UseCaseResult(success=False, error_message=f'Resumen máximo {MAX_SUMMARY} caracteres.')
                announcement.summary = summary
            if body is not None:
                announcement.body = str(body)
            if cta_text is not None:
                cta_text = str(cta_text).strip()
                if len(cta_text) > MAX_CTA_TEXT:
                    return UseCaseResult(success=False, error_message=f'CTA text máximo {MAX_CTA_TEXT} caracteres.')
                announcement.cta_text = cta_text
            if cta_url is not None:
                cta_url = str(cta_url).strip() or None
                if cta_url and len(cta_url) > MAX_URL:
                    return UseCaseResult(success=False, error_message=f'URL máximo {MAX_URL} caracteres.')
                announcement.cta_url = cta_url
            if image_url is not None:
                image_url = str(image_url).strip() or None
                if image_url and len(image_url) > MAX_URL:
                    return UseCaseResult(success=False, error_message=f'Image URL máximo {MAX_URL} caracteres.')
                announcement.image_url = image_url
            if active is not None:
                announcement.active = bool(active)
            if starts_at is not None:
                announcement.starts_at = starts_at
            if ends_at is not None:
                announcement.ends_at = ends_at

            announcement.save()
            logger.info(f"Anuncio actualizado: id={announcement.id} slug={announcement.slug}")
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
            logger.error(f"Error al actualizar anuncio: {str(e)}", exc_info=True)
            return UseCaseResult(success=False, error_message=str(e))
