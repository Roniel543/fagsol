"""
Caso de uso: Reset de contraseña - FagSol Escuela Virtual
"""

import logging
from typing import Tuple, Optional
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.cache import cache
from django.conf import settings
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')
User = get_user_model()


class PasswordResetUseCase:
    """
    Caso de uso: Restablecimiento de contraseña
    
    Responsabilidades:
    - Solicitar reset de contraseña
    - Validar tokens
    - Restablecer contraseña
    - Rate limiting
    """
    
    def __init__(self):
        self.token_generator = PasswordResetTokenGenerator()
        self.token_expiry_hours = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRY_HOURS', 1)
        self.rate_limit_requests = getattr(settings, 'PASSWORD_RESET_RATE_LIMIT', 3)
        self.rate_limit_window = 3600  # 1 hora
    
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
        request_count = cache.get(cache_key, 0)
        
        if request_count >= self.rate_limit_requests:
            return False, f'Has excedido el límite de solicitudes. Intenta nuevamente en 1 hora.'
        
        cache.set(cache_key, request_count + 1, self.rate_limit_window)
        return True, None
    
    def request_password_reset(self, email: str, frontend_url: str = None) -> UseCaseResult:
        """
        Solicita restablecimiento de contraseña
        
        Args:
            email: Email del usuario
            frontend_url: URL del frontend para construir el link de reset
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            email = email.lower().strip() if email else ''
            
            # Validar formato de email básico
            if not email or '@' not in email:
                return UseCaseResult(
                    success=False,
                    error_message='Email inválido'
                )
            
            # Verificar rate limiting
            allowed, error_message = self._check_rate_limit(email)
            if not allowed:
                logger.warning(f'Rate limit excedido para reset password: {email}')
                # Por seguridad, retornar mensaje genérico
                return UseCaseResult(
                    success=True,
                    data={'message': 'Si el email existe, se enviará un link de restablecimiento'}
                )
            
            # Buscar usuario
            try:
                user = User.objects.get(email=email, is_active=True)
            except User.DoesNotExist:
                logger.info(f'Intento de reset password para email no existente: {email}')
                # Por seguridad, no revelar si el email existe
                return UseCaseResult(
                    success=True,
                    data={'message': 'Si el email existe, se enviará un link de restablecimiento'}
                )
            
            # Generar token
            token = self.token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Construir URL de reset
            if not frontend_url:
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            
            reset_url = f"{frontend_url}/auth/reset-password/{uid}/{token}/"
            
            return UseCaseResult(
                success=True,
                data={
                    'message': 'Si el email existe, se enviará un link de restablecimiento',
                    'uid': uid,
                    'token': token,
                    'reset_url': reset_url
                },
                extra={'user': user}
            )
            
        except Exception as e:
            logger.error(f'Error en request_password_reset para {email}: {str(e)}', exc_info=True)
            # Por seguridad, retornar mensaje genérico
            return UseCaseResult(
                success=True,
                data={'message': 'Si el email existe, se enviará un link de restablecimiento'}
            )
    
    def validate_token(self, uid: str, token: str) -> UseCaseResult:
        """
        Valida si un token de reset es válido
        
        Args:
            uid: User ID codificado en base64
            token: Token de reset
            
        Returns:
            UseCaseResult con el resultado de la validación
        """
        try:
            # Decodificar uid
            try:
                user_id = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=user_id, is_active=True)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return UseCaseResult(
                    success=False,
                    error_message='Token inválido o expirado'
                )
            
            # Validar token
            if not self.token_generator.check_token(user, token):
                return UseCaseResult(
                    success=False,
                    error_message='Token inválido o expirado'
                )
            
            return UseCaseResult(
                success=True,
                data={'user_id': user.id},
                extra={'user': user}
            )
            
        except Exception as e:
            logger.error(f'Error validando token de reset: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message='Error al validar token'
            )
    
    def reset_password(self, uid: str, token: str, new_password: str) -> UseCaseResult:
        """
        Restablece la contraseña del usuario
        
        Args:
            uid: User ID codificado en base64
            token: Token de reset
            new_password: Nueva contraseña
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # Limpiar espacios en blanco de la contraseña
            new_password = new_password.strip() if new_password else ''
            
            # Validar contraseña
            if not new_password or len(new_password) < 8:
                return UseCaseResult(
                    success=False,
                    error_message='La contraseña debe tener al menos 8 caracteres'
                )
            
            # Validar token
            validation_result = self.validate_token(uid, token)
            if not validation_result.success:
                return validation_result
            
            user = validation_result.extra.get('user')
            if not user:
                return UseCaseResult(
                    success=False,
                    error_message='Token inválido o expirado'
                )
            
            # Asegurar que username coincida con email
            email_normalized = user.email.lower().strip()
            if user.username != email_normalized:
                logger.warning(f'Username no coincide con email para {user.email}. Actualizando username.')
                user.username = email_normalized
            
            # Actualizar contraseña
            user.set_password(new_password)
            user.save()
            
            logger.info(f'Contraseña restablecida para usuario: {user.email}')
            
            # Limpiar rate limiting
            cache_key = self._get_rate_limit_key(email_normalized)
            cache.delete(cache_key)
            
            # Limpiar bloqueos de AXES
            try:
                from axes.utils import reset as axes_reset
                from axes.models import AccessAttempt
                
                username_for_axes = user.username or email_normalized
                axes_reset(username=username_for_axes)
                
                if email_normalized != username_for_axes:
                    axes_reset(username=email_normalized)
                
                attempts = AccessAttempt.objects.filter(
                    username__in=[username_for_axes, email_normalized]
                )
                
                ips_to_reset = set()
                for attempt in attempts:
                    if attempt.ip_address:
                        ips_to_reset.add(attempt.ip_address)
                
                for ip in ips_to_reset:
                    try:
                        axes_reset(ip=ip)
                        logger.info(f'Bloqueo de AXES reseteado para IP: {ip} (usuario: {user.email})')
                    except Exception as ip_error:
                        logger.warning(f'No se pudo resetear bloqueo de IP {ip}: {str(ip_error)}')
                
                logger.info(f'Bloqueos de AXES limpiados para usuario: {user.email}')
                
            except ImportError:
                logger.warning('AXES no está disponible, no se pueden limpiar bloqueos')
            except Exception as axes_error:
                logger.error(f'Error al limpiar bloqueos de AXES para {user.email}: {str(axes_error)}', exc_info=True)
            
            return UseCaseResult(
                success=True,
                data={'message': 'Contraseña restablecida exitosamente'},
                extra={'user': user}
            )
            
        except Exception as e:
            logger.error(f'Error en reset_password: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message='Error al restablecer la contraseña'
            )

