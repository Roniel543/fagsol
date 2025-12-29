"""
Funciones helper para establecer cookies HTTP-Only con tokens JWT

Estas funciones centralizan la lógica de establecer cookies de autenticación
con las configuraciones de seguridad apropiadas.
"""

from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def set_auth_cookies(response: Response, refresh_token: RefreshToken) -> Response:
    """
    Establece cookies HTTP-Only con access y refresh tokens.
    
    Args:
        response: Objeto Response de DRF donde establecer las cookies
        refresh_token: RefreshToken de SimpleJWT (contiene access y refresh)
    
    Returns:
        Response con cookies establecidas
    """
    # Obtener configuración de cookies
    access_token_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
    refresh_token_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
    access_max_age = getattr(settings, 'COOKIE_ACCESS_TOKEN_MAX_AGE', 60 * 60)
    refresh_max_age = getattr(settings, 'COOKIE_REFRESH_TOKEN_MAX_AGE', 24 * 60 * 60)
    httponly = getattr(settings, 'COOKIE_HTTPONLY', True)
    secure = getattr(settings, 'COOKIE_SECURE', not settings.DEBUG)
    samesite = getattr(settings, 'COOKIE_SAMESITE', 'Strict')
    
    # Establecer access token cookie
    response.set_cookie(
        key=access_token_name,
        value=str(refresh_token.access_token),
        max_age=access_max_age,
        httponly=httponly,
        secure=secure,
        samesite=samesite,
        path='/',  # Disponible en todo el sitio
    )
    
    # Establecer refresh token cookie
    response.set_cookie(
        key=refresh_token_name,
        value=str(refresh_token),
        max_age=refresh_max_age,
        httponly=httponly,
        secure=secure,
        samesite=samesite,
        path='/',  # Disponible en todo el sitio
    )
    
    if settings.DEBUG:
        try:
            user_id = refresh_token.get('user_id')
            logger.debug(f'Cookies de autenticación establecidas para usuario {user_id}')
        except (AttributeError, KeyError, TypeError):
            logger.debug('Cookies de autenticación establecidas')
    
    return response


def clear_auth_cookies(response: Response) -> Response:
    """
    Limpia las cookies de autenticación.
    
    Args:
        response: Objeto Response de DRF donde limpiar las cookies
    
    Returns:
        Response con cookies limpiadas
    """
    access_token_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
    refresh_token_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
    
    # Eliminar cookies estableciendo max_age=0
    response.delete_cookie(
        key=access_token_name,
        path='/',
        samesite=getattr(settings, 'COOKIE_SAMESITE', 'Strict'),
    )
    response.delete_cookie(
        key=refresh_token_name,
        path='/',
        samesite=getattr(settings, 'COOKIE_SAMESITE', 'Strict'),
    )
    
    if settings.DEBUG:
        logger.debug('Cookies de autenticación limpiadas')
    
    return response


def get_refresh_token_from_cookie(request) -> Optional[str]:
    """
    Obtiene el refresh token de la cookie del request.
    
    Args:
        request: Objeto request de Django
    
    Returns:
        Refresh token como string, o None si no existe
    """
    refresh_token_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
    return request.COOKIES.get(refresh_token_name)


def get_access_token_from_cookie(request) -> Optional[str]:
    """
    Obtiene el access token de la cookie del request.
    
    Args:
        request: Objeto request de Django
    
    Returns:
        Access token como string, o None si no existe
    """
    access_token_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
    return request.COOKIES.get(access_token_name)

