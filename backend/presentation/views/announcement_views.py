"""
Endpoints de Anuncios/Convocatorias - FagSol Escuela Virtual

- GET /active/ : público, devuelve el anuncio activo actual (para el banner).
- Admin (IsAdmin): list, create, update.
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from apps.users.permissions import IsAdmin
from application.use_cases.announcements import (
    GetActiveAnnouncementUseCase,
    ListAnnouncementsUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
)

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el anuncio activo a mostrar en el sitio (banner/modal). Público.',
    responses={
        200: openapi.Response(
            description='Anuncio activo o ninguno',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'id': 1,
                        'slug': 'practicantes-2026',
                        'title': 'Oportunidad de prácticas en Metalurgia',
                        'summary': 'Convocatoria abierta.',
                        'body': '',
                        'cta_text': 'Ver más',
                        'cta_url': 'https://fagsol.com/convocatorias',
                        'image_url': 'https://...',
                    }
                }
            }
        ),
        200: openapi.Response(
            description='Sin anuncio activo',
            examples={'application/json': {'success': True, 'data': None}}
        ),
    },
    tags=['Anuncios']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_announcement(request):
    """
    GET /api/v1/announcements/active/
    Devuelve el anuncio actualmente visible (uno solo). Si no hay ninguno, data=null.
    """
    try:
        use_case = GetActiveAnnouncementUseCase()
        result = use_case.execute(request=request)
        if not result.success:
            return Response(
                {'success': False, 'message': result.error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'data': result.data}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error en get_active_announcement: {str(e)}", exc_info=True)
        return Response(
            {'success': False, 'message': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def _list_announcements(request):
    """GET /api/v1/announcements/ (admin)."""
    use_case = ListAnnouncementsUseCase()
    result = use_case.execute()
    if not result.success:
        return Response(
            {'success': False, 'message': result.error_message},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response({'success': True, **result.data}, status=status.HTTP_200_OK)


def _create_announcement_response(request):
    """
    Lógica de creación de anuncio. Recibe el request de DRF (request.data).
    Usado desde list_or_create_announcements para evitar re-decorar con @api_view.
    """
    try:
        data = request.data
        slug = (data.get('slug') or '').strip()
        title = (data.get('title') or '').strip()
        summary = (data.get('summary') or '').strip()
        body = (data.get('body') or '').strip()
        cta_text = (data.get('cta_text') or '').strip()
        cta_url = (data.get('cta_url') or '').strip() or None
        image_url = (data.get('image_url') or '').strip() or None
        active = data.get('active', True)
        starts_at = data.get('starts_at')
        ends_at = data.get('ends_at')
        if starts_at:
            from django.utils.dateparse import parse_datetime
            starts_at = parse_datetime(starts_at)
        if ends_at:
            from django.utils.dateparse import parse_datetime
            ends_at = parse_datetime(ends_at)

        use_case = CreateAnnouncementUseCase()
        result = use_case.execute(
            slug=slug,
            title=title,
            summary=summary,
            body=body,
            cta_text=cta_text,
            cta_url=cta_url,
            image_url=image_url,
            active=active,
            starts_at=starts_at,
            ends_at=ends_at,
        )
        if not result.success:
            return Response(
                {'success': False, 'message': result.error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'data': result.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error en create_announcement: {str(e)}", exc_info=True)
        return Response(
            {'success': False, 'message': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los anuncios. Solo administradores.',
    responses={
        200: openapi.Response(description='Lista de anuncios'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Anuncios - Admin']
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_or_create_announcements(request):
    """GET /api/v1/announcements/ -> list. POST /api/v1/announcements/ -> create."""
    if request.method == 'GET':
        return _list_announcements(request)
    return _create_announcement_response(request)


@swagger_auto_schema(
    method='post',
    operation_description='Crea un anuncio. Solo administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['slug', 'title'],
        properties={
            'slug': openapi.Schema(type=openapi.TYPE_STRING, description='Identificador único'),
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='Título'),
            'summary': openapi.Schema(type=openapi.TYPE_STRING, description='Resumen'),
            'body': openapi.Schema(type=openapi.TYPE_STRING, description='Cuerpo'),
            'cta_text': openapi.Schema(type=openapi.TYPE_STRING, description='Texto del botón'),
            'cta_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL del botón'),
            'image_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL de imagen'),
            'active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Activo'),
            'starts_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
            'ends_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
        },
    ),
    responses={
        201: openapi.Response(description='Anuncio creado'),
        400: openapi.Response(description='Datos inválidos'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Anuncios - Admin']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_announcement(request):
    """POST /api/v1/announcements/ (admin)."""
    try:
        data = request.data
        slug = data.get('slug', '').strip()
        title = data.get('title', '').strip()
        summary = (data.get('summary') or '').strip()
        body = (data.get('body') or '').strip()
        cta_text = (data.get('cta_text') or '').strip()
        cta_url = (data.get('cta_url') or '').strip() or None
        image_url = (data.get('image_url') or '').strip() or None
        active = data.get('active', True)
        starts_at = data.get('starts_at')
        ends_at = data.get('ends_at')
        if starts_at:
            from django.utils.dateparse import parse_datetime
            starts_at = parse_datetime(starts_at)
        if ends_at:
            from django.utils.dateparse import parse_datetime
            ends_at = parse_datetime(ends_at)

        use_case = CreateAnnouncementUseCase()
        result = use_case.execute(
            slug=slug,
            title=title,
            summary=summary,
            body=body,
            cta_text=cta_text,
            cta_url=cta_url,
            image_url=image_url,
            active=active,
            starts_at=starts_at,
            ends_at=ends_at,
        )
        if not result.success:
            return Response(
                {'success': False, 'message': result.error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'data': result.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error en create_announcement: {str(e)}", exc_info=True)
        return Response(
            {'success': False, 'message': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@swagger_auto_schema(
    method='patch',
    operation_description='Actualiza un anuncio (parcial). Solo administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'summary': openapi.Schema(type=openapi.TYPE_STRING),
            'body': openapi.Schema(type=openapi.TYPE_STRING),
            'cta_text': openapi.Schema(type=openapi.TYPE_STRING),
            'cta_url': openapi.Schema(type=openapi.TYPE_STRING),
            'image_url': openapi.Schema(type=openapi.TYPE_STRING),
            'active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'starts_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
            'ends_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
        },
    ),
    responses={
        200: openapi.Response(description='Anuncio actualizado'),
        400: openapi.Response(description='Datos inválidos'),
        404: openapi.Response(description='Anuncio no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Anuncios - Admin']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_announcement(request, announcement_id):
    """PATCH /api/v1/announcements/<id>/ (admin)."""
    try:
        data = request.data
        title = data.get('title')
        if title is not None:
            title = str(title).strip()
        summary = data.get('summary')
        if summary is not None:
            summary = str(summary).strip()
        body = data.get('body')
        cta_text = data.get('cta_text')
        if cta_text is not None:
            cta_text = str(cta_text).strip()
        cta_url = data.get('cta_url')
        if cta_url is not None:
            cta_url = str(cta_url).strip() or None
        image_url = data.get('image_url')
        if image_url is not None:
            image_url = str(image_url).strip() or None
        active = data.get('active')
        starts_at = data.get('starts_at')
        ends_at = data.get('ends_at')
        if starts_at:
            from django.utils.dateparse import parse_datetime
            starts_at = parse_datetime(starts_at)
        if ends_at:
            from django.utils.dateparse import parse_datetime
            ends_at = parse_datetime(ends_at)

        use_case = UpdateAnnouncementUseCase()
        result = use_case.execute(
            announcement_id=announcement_id,
            title=title,
            summary=summary,
            body=body,
            cta_text=cta_text,
            cta_url=cta_url,
            image_url=image_url,
            active=active,
            starts_at=starts_at,
            ends_at=ends_at,
        )
        if not result.success:
            if 'no encontrado' in (result.error_message or '').lower():
                return Response(
                    {'success': False, 'message': result.error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {'success': False, 'message': result.error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'data': result.data}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error en update_announcement: {str(e)}", exc_info=True)
        return Response(
            {'success': False, 'message': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
