"""
Caso de uso: Login de usuario - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import UserProfile
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')
User = get_user_model()


class LoginUseCase:
    """
    Caso de uso: Autenticación de usuario
    
    Responsabilidades:
    - Validar credenciales
    - Manejar bloqueos AXES
    - Generar tokens JWT
    - Crear perfil si no existe
    """
    
    def __init__(self, request=None):
        """
        Inicializa el caso de uso
        
        Args:
            request: Objeto request de Django (requerido para AxesBackend)
        """
        self.request = request
    
    def _check_axes_lockout(self, email: str, username: str = None) -> Optional[dict]:
        """
        Verifica si el usuario está bloqueado por AXES
        
        Returns:
            dict con información del bloqueo o None si no está bloqueado
        """
        try:
            from axes.models import AccessAttempt
            from django.conf import settings
            from datetime import timedelta, datetime
            
            failure_limit = getattr(settings, 'AXES_FAILURE_LIMIT', 5)
            cooloff_time = getattr(settings, 'AXES_COOLOFF_TIME', 1)
            
            # Buscar intentos por email y username (AXES puede usar cualquiera de los dos)
            # Usar select_for_update(nowait=True) para asegurar que leemos los datos más recientes
            # pero sin bloquear si no es necesario
            search_terms = [email]
            if username and username != email:
                search_terms.append(username)
            
            attempts = AccessAttempt.objects.filter(
                username__in=search_terms
            ).order_by('-failures_since_start', '-attempt_time')
            
            if not attempts.exists():
                return None
            
            # Refrescar el objeto desde la base de datos para obtener los datos más recientes
            latest_attempt = attempts.first()
            # Forzar refresh del objeto para asegurar que tenemos los datos más recientes
            latest_attempt.refresh_from_db()
            failures = latest_attempt.failures_since_start
            remaining_attempts = max(0, failure_limit - failures)
            
            if failures >= failure_limit:
                lockout_time = latest_attempt.attempt_time
                unlock_time = lockout_time + timedelta(hours=cooloff_time)
                now = datetime.now(lockout_time.tzinfo) if lockout_time.tzinfo else datetime.now()
                
                if unlock_time > now:
                    minutes_remaining = int((unlock_time - now).total_seconds() / 60)
                    return {
                        'is_locked': True,
                        'failures': failures,
                        'limit': failure_limit,
                        'unlock_time': unlock_time,
                        'minutes_remaining': minutes_remaining,
                        'is_permanent': False
                    }
                else:
                    return {
                        'is_locked': False,
                        'failures': failures,
                        'limit': failure_limit,
                        'remaining_attempts': remaining_attempts
                    }
            else:
                return {
                    'is_locked': False,
                    'failures': failures,
                    'limit': failure_limit,
                    'remaining_attempts': remaining_attempts
                }
        except Exception as e:
            logger.error(f'Error al verificar bloqueo AXES: {str(e)}')
            return None
    
    def _clear_axes_lockout(self, email: str, username: str):
        """
        Limpia bloqueos de AXES para un usuario
        """
        try:
            from axes.utils import reset as axes_reset
            from axes.models import AccessAttempt
            
            axes_reset(username=username)
            if email != username:
                axes_reset(username=email)
            
            attempts = AccessAttempt.objects.filter(
                username__in=[username, email]
            )
            ips_to_reset = set()
            for attempt in attempts:
                if attempt.ip_address:
                    ips_to_reset.add(attempt.ip_address)
            
            for ip in ips_to_reset:
                try:
                    axes_reset(ip=ip)
                except Exception:
                    pass
            
            logger.info(f'Bloqueos de AXES limpiados para usuario con contraseña correcta: {email}')
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f'Error al limpiar bloqueos de AXES: {str(e)}')
    
    def execute(self, email: str, password: str) -> UseCaseResult:
        """
        Ejecuta el caso de uso de login
        
        Args:
            email: Email del usuario
            password: Contraseña del usuario
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # Normalizar email y password
            email = email.lower().strip() if email else ''
            password = password.strip() if password else ''
            
            # Buscar usuario y verificar contraseña
            user_obj = None
            username_to_try = email
            password_is_correct = False
            
            try:
                user_obj = User.objects.get(email=email)
                username_field = getattr(User, 'USERNAME_FIELD', 'username')
                
                if username_field == 'email':
                    username_to_try = email
                else:
                    username_to_try = user_obj.username if user_obj.username else email
                    if user_obj.username != email:
                        logger.debug(f'Usuario {email} tiene username diferente: {user_obj.username}')
                
                # Verificar contraseña directamente
                password_is_correct = check_password(password, user_obj.password)
                
                if password_is_correct:
                    # Limpiar bloqueos si la contraseña es correcta
                    self._clear_axes_lockout(email, username_to_try)
                    # Si la contraseña es correcta y el usuario está activo, usar directamente
                    # sin llamar a authenticate() para evitar problemas con AXES después del reset
                    if user_obj.is_active:
                        user = user_obj
                        # Generar tokens JWT
                        refresh = RefreshToken.for_user(user)
                        
                        # Obtener o crear perfil
                        try:
                            profile = user.profile
                        except UserProfile.DoesNotExist:
                            profile = UserProfile.objects.create(user=user, role='student')
                        
                        return UseCaseResult(
                            success=True,
                            data={
                                'user': {
                                    'id': user.id,
                                    'email': user.email,
                                    'first_name': user.first_name,
                                    'last_name': user.last_name,
                                    'role': profile.role,
                                    'is_active': user.is_active
                                }
                            },
                            extra={
                                '_refresh_token_object': refresh,
                                '_user_object': user
                            }
                        )
                    
            except User.DoesNotExist:
                user_obj = None
                username_to_try = email
                password_is_correct = False
            
            # Verificar bloqueo solo si la contraseña NO es correcta
            if not password_is_correct:
                lockout_info = self._check_axes_lockout(email)
                if lockout_info and lockout_info.get('is_locked'):
                    minutes = lockout_info.get('minutes_remaining', 0)
                    hours = minutes // 60
                    mins = minutes % 60
                    
                    if hours > 0:
                        time_str = f"{hours} hora{'s' if hours > 1 else ''} y {mins} minuto{'s' if mins != 1 else ''}"
                    else:
                        time_str = f"{mins} minuto{'s' if mins != 1 else ''}"
                    
                    return UseCaseResult(
                        success=False,
                        error_message=f'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en {time_str}.',
                        extra={'is_locked': True, 'lockout_info': lockout_info}
                    )
            
            # Intentar autenticar
            user = authenticate(request=self.request, username=username_to_try, password=password)
            
            # Si authenticate falla pero la contraseña es correcta, usar usuario directamente
            if not user and user_obj:
                password_is_correct = check_password(password, user_obj.password)
                
                if password_is_correct:
                    logger.info(f'authenticate() falló pero contraseña es correcta para {email}')
                    if user_obj.is_active:
                        user = user_obj
                        self._clear_axes_lockout(email, username_to_try)
                    else:
                        return UseCaseResult(
                            success=False,
                            error_message='Tu cuenta está desactivada. Contacta al administrador.'
                        )
            
            # Verificar bloqueo después del intento fallido
            if not user:
                username_for_lockout = user_obj.username if user_obj and user_obj.username else None
                # Verificar bloqueo después de que authenticate() falla (AXES ya registró el intento)
                # Forzar refresh de la consulta para obtener los datos más recientes
                lockout_info = self._check_axes_lockout(email, username_for_lockout)
                
                if lockout_info and lockout_info.get('is_locked'):
                    minutes = lockout_info.get('minutes_remaining', 0)
                    hours = minutes // 60
                    mins = minutes % 60
                    
                    if hours > 0:
                        time_str = f"{hours} hora{'s' if hours > 1 else ''} y {mins} minuto{'s' if mins != 1 else ''}"
                    else:
                        time_str = f"{mins} minuto{'s' if mins != 1 else ''}"
                    
                    return UseCaseResult(
                        success=False,
                        error_message=f'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en {time_str}.',
                        extra={'is_locked': True, 'lockout_info': lockout_info}
                    )
                elif lockout_info:
                    # Hay intentos previos registrados
                    remaining = lockout_info.get('remaining_attempts', 0)
                    failures = lockout_info.get('failures', 0)
                    limit = lockout_info.get('limit', 5)
                    
                    if remaining > 0:
                        message = f'Credenciales incorrectas. Has fallado {failures} de {limit} intentos permitidos. Te quedan {remaining} intento{"s" if remaining > 1 else ""} antes del bloqueo temporal.'
                    else:
                        message = f'Credenciales incorrectas. Has alcanzado el límite de {limit} intentos fallidos. Tu cuenta será bloqueada temporalmente en el próximo intento fallido.'
                    
                    return UseCaseResult(
                        success=False,
                        error_message=message,
                        extra={'is_locked': False, 'lockout_info': lockout_info}
                    )
                else:
                    # Primer intento fallido o no hay intentos registrados aún
                    # Mostrar mensaje progresivo indicando que es el primer intento
                    from django.conf import settings
                    limit = getattr(settings, 'AXES_FAILURE_LIMIT', 5)
                    remaining = limit - 1
                    message = f'Credenciales incorrectas. Has fallado 1 de {limit} intentos permitidos. Te quedan {remaining} intento{"s" if remaining > 1 else ""} antes del bloqueo temporal.'
                    
                    return UseCaseResult(
                        success=False,
                        error_message=message,
                        extra={'is_locked': False, 'lockout_info': {'failures': 1, 'limit': limit, 'remaining_attempts': remaining}}
                    )
            
            # Si el usuario está autenticado y activo
            if user and user.is_active:
                # Generar tokens JWT
                refresh = RefreshToken.for_user(user)
                
                # Obtener o crear perfil
                try:
                    profile = user.profile
                except UserProfile.DoesNotExist:
                    profile = UserProfile.objects.create(user=user, role='student')
                
                return UseCaseResult(
                    success=True,
                    data={
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'role': profile.role,
                            'is_active': user.is_active
                        }
                    },
                    extra={
                        '_refresh_token_object': refresh,
                        '_user_object': user
                    }
                )
            else:
                if user and not user.is_active:
                    logger.warning(f'Intento de login con usuario inactivo: {email}')
                    return UseCaseResult(
                        success=False,
                        error_message='Tu cuenta está desactivada. Contacta al administrador.'
                    )
                else:
                    logger.warning(f'Intento de login con credenciales inválidas para: {email}')
                    return UseCaseResult(
                        success=False,
                        error_message='Credenciales inválidas. Verifica tu email y contraseña.'
                    )
                    
        except Exception as e:
            logger.error(f'Error en autenticación para {email}: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f'Error en autenticación: {str(e)}'
            )

