"""
Caso de uso: Obtener anuncio activo - FagSol Escuela Virtual

Devuelve el anuncio actualmente visible para mostrar en el banner del sitio.
Público (AllowAny). Solo uno activo a la vez (el más reciente que cumpla visibilidad).
"""

import logging
from django.utils import timezone
from django.db.models import Q
from application.dtos.use_case_result import UseCaseResult
from apps.announcements.models import Announcement

logger = logging.getLogger('apps')


class GetActiveAnnouncementUseCase:
    """
    Obtiene el anuncio activo a mostrar en el sitio.

    Criterios: active=True, starts_at <= now (si existe), ends_at >= now (si existe).
    Orden: el más reciente por created_at.
    """

    def execute(self, request=None) -> UseCaseResult:
        now = timezone.now()
        qs = Announcement.objects.filter(active=True)
        qs = qs.filter(Q(starts_at__isnull=True) | Q(starts_at__lte=now))
        qs = qs.filter(Q(ends_at__isnull=True) | Q(ends_at__gte=now))
        announcement = qs.order_by('-created_at').first()
        if not announcement:
            return UseCaseResult(success=True, data=None)
        image_url = ''
        if announcement.image:
            if request:
                image_url = request.build_absolute_uri(announcement.image.url)
            else:
                image_url = announcement.image.url or ''
        elif announcement.image_url:
            image_url = announcement.image_url
        return UseCaseResult(
            success=True,
            data={
                'id': announcement.id,
                'slug': announcement.slug,
                'title': announcement.title,
                'summary': announcement.summary or '',
                'body': announcement.body or '',
                'cta_text': announcement.cta_text or '',
                'cta_url': announcement.cta_url or '',
                'image_url': image_url,
            },
        )
