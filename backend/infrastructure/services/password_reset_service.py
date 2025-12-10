"""
Servicio de restablecimiento de contraseña - FagSol Escuela Virtual
Usa Django PasswordResetTokenGenerator nativo para seguridad
"""

import logging
from typing import Tuple, Optional
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger('apps')

User = get_user_model()


class PasswordResetService:
    """
    Servicio para manejar el restablecimiento de contraseña
    Usa Django PasswordResetTokenGenerator para tokens seguros
    """
    
    def __init__(self):
        self.token_generator = PasswordResetTokenGenerator()
        # Tiempo de expiración del token (1 hora por defecto)
        self.token_expiry_hours = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRY_HOURS', 1)
        # Rate limiting: máximo 3 solicitudes por hora por email
        self.rate_limit_requests = getattr(settings, 'PASSWORD_RESET_RATE_LIMIT', 3)
        self.rate_limit_window = 3600  # 1 hora en segundos
    
    def _get_rate_limit_key(self, email: str) -> str:
        """Genera la clave de cache para rate limiting"""
        return f'password_reset_rate_limit:{email.lower().strip()}'
    
    def _check_rate_limit(self, email: str) -> Tuple[bool, Optional[str]]:
        """
        Verifica si el email ha excedido el límite de solicitudes
        
        Returns:
            (allowed, error_message)
        """
        email_normalized = email.lower().strip()
        cache_key = self._get_rate_limit_key(email_normalized)
        
        # Obtener contador actual
        request_count = cache.get(cache_key, 0)
        
        if request_count >= self.rate_limit_requests:
            return False, f'Has excedido el límite de solicitudes. Intenta nuevamente en 1 hora.'
        
        # Incrementar contador
        cache.set(cache_key, request_count + 1, self.rate_limit_window)
        
        return True, None
    
    def request_password_reset(self, email: str, frontend_url: str = None) -> Tuple[bool, str, Optional[dict]]:
        """
        Solicita restablecimiento de contraseña
        
        Args:
            email: Email del usuario
            frontend_url: URL del frontend para construir el link de reset
            
        Returns:
            (success, message, data)
            data contiene: token, uid (si success=True)
        """
        try:
            # Normalizar email
            email = email.lower().strip() if email else ''
            
            # Validar formato de email básico
            if not email or '@' not in email:
                return False, 'Email inválido', None
            
            # Verificar rate limiting
            allowed, error_message = self._check_rate_limit(email)
            if not allowed:
                logger.warning(f'Rate limit excedido para reset password: {email}')
                # Retornar mensaje genérico para no revelar información
                return True, 'Si el email existe, se enviará un link de restablecimiento', None
            
            # Buscar usuario
            try:
                user = User.objects.get(email=email, is_active=True)
            except User.DoesNotExist:
                # Por seguridad, no revelar si el email existe o no
                logger.info(f'Intento de reset password para email no existente: {email}')
                return True, 'Si el email existe, se enviará un link de restablecimiento', None
            
            # Generar token usando Django PasswordResetTokenGenerator
            # El token se genera basado en:
            # - user.pk
            # - user.password (hash actual)
            # - user.last_login (timestamp)
            # - timestamp actual
            token = self.token_generator.make_token(user)
            
            # Codificar user.pk en base64 para URL segura
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Construir URL de reset
            if not frontend_url:
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            
            reset_url = f"{frontend_url}/auth/reset-password/{uid}/{token}/"
            
            # Retornar datos para enviar email
            return True, 'Si el email existe, se enviará un link de restablecimiento', {
                'uid': uid,
                'token': token,
                'reset_url': reset_url,
                'user': user
            }
            
        except Exception as e:
            logger.error(f'Error en request_password_reset para {email}: {str(e)}', exc_info=True)
            # Por seguridad, retornar mensaje genérico
            return True, 'Si el email existe, se enviará un link de restablecimiento', None
    
    def validate_token(self, uid: str, token: str) -> Tuple[bool, Optional[User], Optional[str]]:
        """
        Valida si un token de reset es válido
        
        Args:
            uid: User ID codificado en base64
            token: Token de reset
            
        Returns:
            (is_valid, user, error_message)
        """
        try:
            # Decodificar uid
            try:
                user_id = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=user_id, is_active=True)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return False, None, 'Token inválido o expirado'
            
            # Validar token usando Django PasswordResetTokenGenerator
            if not self.token_generator.check_token(user, token):
                return False, None, 'Token inválido o expirado'
            
            return True, user, None
            
        except Exception as e:
            logger.error(f'Error validando token de reset: {str(e)}', exc_info=True)
            return False, None, 'Error al validar token'
    
    def reset_password(self, uid: str, token: str, new_password: str) -> Tuple[bool, str, Optional[User]]:
        """
        Restablece la contraseña del usuario
        
        Args:
            uid: User ID codificado en base64
            token: Token de reset
            new_password: Nueva contraseña
            
        Returns:
            (success, message, user)
        """
        try:
            # Validar contraseña
            if not new_password or len(new_password) < 8:
                return False, 'La contraseña debe tener al menos 8 caracteres', None
            
            # Validar token
            is_valid, user, error_message = self.validate_token(uid, token)
            if not is_valid or not user:
                return False, error_message or 'Token inválido o expirado', None
            
            # Actualizar contraseña
            user.set_password(new_password)
            user.save()
            
            # Invalidar token usado (el token ya no será válido porque cambió la contraseña)
            # Django PasswordResetTokenGenerator invalida automáticamente cuando cambia user.password
            
            # Limpiar rate limiting para este email (reset exitoso)
            email_normalized = user.email.lower().strip()
            cache_key = self._get_rate_limit_key(email_normalized)
            cache.delete(cache_key)
            
            logger.info(f'Contraseña restablecida exitosamente para usuario: {user.email}')
            
            return True, 'Contraseña restablecida exitosamente', user
            
        except Exception as e:
            logger.error(f'Error en reset_password: {str(e)}', exc_info=True)
            return False, 'Error al restablecer la contraseña', None

