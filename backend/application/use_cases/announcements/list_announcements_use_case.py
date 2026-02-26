"""
Caso de uso: Listar anuncios (admin) - FagSol Escuela Virtual
"""

import logging
from application.dtos.use_case_result import UseCaseResult
from apps.announcements.models import Announcement

logger = logging.getLogger('apps')


class ListAnnouncementsUseCase:
    """Lista todos los anuncios para el admin."""

    def execute(self) -> UseCaseResult:
        try:
            announcements = Announcement.objects.all().order_by('-created_at')
            data = [
                {
                    'id': a.id,
                    'slug': a.slug,
                    'title': a.title,
                    'summary': a.summary or '',
                    'active': a.active,
                    'starts_at': a.starts_at.isoformat() if a.starts_at else None,
                    'ends_at': a.ends_at.isoformat() if a.ends_at else None,
                    'created_at': a.created_at.isoformat(),
                    'updated_at': a.updated_at.isoformat(),
                }
                for a in announcements
            ]
            return UseCaseResult(success=True, data={'announcements': data})
        except Exception as e:
            logger.error(f"Error al listar anuncios: {str(e)}", exc_info=True)
            return UseCaseResult(success=False, error_message=str(e))
