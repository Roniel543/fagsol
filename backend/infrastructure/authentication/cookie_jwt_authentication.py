"""
Autenticación JWT usando cookies HTTP-Only en lugar de headers Authorization

Esta implementación permite usar JWT tokens almacenados en cookies HTTP-Only,
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT usando cookies HTTP-Only.
    
    Busca el access token en la cookie 'access_token' en lugar del header Authorization.
    Si no encuentra token en cookie, retorna None (permite otros métodos de auth).
    """
    
    def authenticate(self, request):
        """
        Intenta autenticar usando el access token de la cookie.
        
        Returns:
            tuple (user, token) si la autenticación es exitosa
            None si no hay token o es inválido
        """
        # Intentar obtener token de cookie
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            # No hay token en cookie, permitir otros métodos de autenticación
            return None
        
        # Validar token usando la lógica heredada de JWTAuthentication
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            
 
            return (user, validated_token)
            
        except (InvalidToken, TokenError) as e:
            # Token inválido o expirado
            if settings.DEBUG:
                logger.debug(f'Token inválido en cookie: {str(e)}')
            return None
        except Exception as e:
            # Error inesperado
            logger.error(f'Error en autenticación por cookie: {str(e)}', exc_info=True)
            return None

