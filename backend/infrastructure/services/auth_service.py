"""
Servicio de autenticación - FagSol Escuela Virtual

⚠️ DEPRECATED: Este servicio ha sido migrado a casos de uso.
Usar application.use_cases.auth en su lugar:
- LoginUseCase - Reemplaza AuthService.login()
- RegisterUseCase - Reemplaza AuthService.register()

Este archivo se mantiene temporalmente para compatibilidad.
Se eliminará en una versión futura.
"""

from typing import Optional
from datetime import datetime
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import UserProfile


class AuthService:
    """
    Servicio de autenticación que implementa la lógica de negocio
    """
    
    def __init__(self):
        pass

    def _check_axes_lockout(self, email: str, username: str = None) -> dict:
        """
        Verifica si el usuario está bloqueado por AXES y retorna información detallada
        
        Returns:
            dict con información del bloqueo o None si no está bloqueado
        """
        try:
            from axes.models import AccessAttempt
            from django.conf import settings
            from datetime import timedelta
            
            failure_limit = getattr(settings, 'AXES_FAILURE_LIMIT', 5)
            cooloff_time = getattr(settings, 'AXES_COOLOFF_TIME', 1)
            
            # Buscar intentos por email y username
            # Necesitamos obtener el que tenga el mayor número de fallos
            attempts = AccessAttempt.objects.filter(
                username__in=[email, username] if username else [email]
            ).order_by('-failures_since_start', '-attempt_time')
            
            if not attempts.exists():
                return None
            
            # Obtener el AccessAttempt con más fallos (puede haber múltiples)
            latest_attempt = attempts.first()
            failures = latest_attempt.failures_since_start
            
            # Si hay múltiples AccessAttempt, sumar los fallos (pero esto no debería pasar si está bien configurado)
            # Por ahora, solo usamos el que tiene más fallos
            remaining_attempts = max(0, failure_limit - failures)
            
            # Verificar si está bloqueado
            if failures >= failure_limit:
                # Calcular tiempo de desbloqueo
                lockout_time = latest_attempt.attempt_time
                unlock_time = lockout_time + timedelta(hours=cooloff_time)
                now = datetime.now(latest_attempt.attempt_time.tzinfo) if latest_attempt.attempt_time.tzinfo else datetime.now()
                
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
                    # El bloqueo expiró, pero aún hay intentos fallidos
                    return {
                        'is_locked': False,
                        'failures': failures,
                        'limit': failure_limit,
                        'remaining_attempts': remaining_attempts
                    }
            else:
                # No está bloqueado, pero hay intentos fallidos
                return {
                    'is_locked': False,
                    'failures': failures,
                    'limit': failure_limit,
                    'remaining_attempts': remaining_attempts
                }
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error al verificar bloqueo AXES: {str(e)}')
            return None

    def login(self, email: str, password: str, request=None) -> dict:
        """
        Autentica un usuario y retorna tokens JWT
        Incluye detección de bloqueos AXES y feedback progresivo
        
        Args:
            email: Email del usuario
            password: Contraseña del usuario
            request: Objeto request de Django (requerido para AxesBackend)
        """
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Normalizar email (lowercase, strip)
            email = email.lower().strip() if email else ''
            
            # IMPORTANTE: Limpiar espacios de la contraseña
            # Esto previene problemas cuando el usuario copia/pega contraseñas con espacios
            password = password.strip() if password else ''
            
            # IMPORTANTE: Buscar el usuario PRIMERO y verificar la contraseña ANTES de verificar bloqueo
            # Si la contraseña es correcta, limpiar bloqueos automáticamente
            # Esto previene bloqueos falsos cuando la contraseña es correcta
            user_obj = None
            username_to_try = email  # Por defecto, usar email
            password_is_correct = False
            
            try:
                user_obj = User.objects.get(email=email)
                # Determinar qué usar para autenticar basado en USERNAME_FIELD del modelo
                # Si USERNAME_FIELD = 'email', usar email
                # Si USERNAME_FIELD = 'username', usar username real
                username_field = getattr(User, 'USERNAME_FIELD', 'username')
                
                if username_field == 'email':
                    # El modelo usa email como USERNAME_FIELD
                    username_to_try = email
                else:
                    # El modelo usa username como USERNAME_FIELD (Django default)
                    # Usar el username real del usuario
                    username_to_try = user_obj.username if user_obj.username else email
                    
                    # Log para debugging (solo en desarrollo)
                    import logging
                    logger = logging.getLogger(__name__)
                    if user_obj.username != email:
                        logger.debug(f'Usuario {email} tiene username diferente: {user_obj.username}. Usando username para autenticar.')
                
                # IMPORTANTE: Verificar la contraseña DIRECTAMENTE antes de verificar bloqueo
                # Si la contraseña es correcta, limpiar bloqueos automáticamente
                # Esto permite que usuarios con contraseña correcta puedan hacer login incluso si están bloqueados
                import logging
                logger = logging.getLogger(__name__)
                from django.contrib.auth.hashers import check_password
                
                password_is_correct = check_password(password, user_obj.password)
                
                if password_is_correct:
                    # La contraseña es correcta, limpiar bloqueos de AXES si existen
                    # Esto permite que el usuario pueda autenticarse inmediatamente
                    try:
                        from axes.utils import reset as axes_reset
                        from axes.models import AccessAttempt
                        
                        # Limpiar bloqueos por username y email
                        axes_reset(username=username_to_try)
                        if email != username_to_try:
                            axes_reset(username=email)
                        
                        # También limpiar por IP si hay bloqueos relacionados
                        attempts = AccessAttempt.objects.filter(
                            username__in=[username_to_try, email]
                        )
                        ips_to_reset = set()
                        for attempt in attempts:
                            if attempt.ip_address:
                                ips_to_reset.add(attempt.ip_address)
                        
                        for ip in ips_to_reset:
                            try:
                                axes_reset(ip=ip)
                            except Exception:
                                pass  # Ignorar errores al resetear IPs
                                
                        logger.info(f'Bloqueos de AXES limpiados para usuario con contraseña correcta: {email}')
                    except ImportError:
                        pass  # AXES no está disponible
                    except Exception as axes_error:
                        logger.warning(f'Error al limpiar bloqueos de AXES: {str(axes_error)}')
                        
            except User.DoesNotExist:
                # Usuario no existe, usar email de todas formas (para no revelar si existe)
                user_obj = None
                username_to_try = email
            
            # IMPORTANTE: Solo verificar bloqueo si la contraseña NO es correcta
            # Si la contraseña es correcta, ya limpiamos los bloqueos arriba
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
                    
                    return {
                        'success': False,
                        'message': f'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en {time_str}.',
                        'is_locked': True,
                        'lockout_info': {
                            'minutes_remaining': minutes,
                            'is_permanent': False
                        }
                    }
            
            # Intentar autenticar SOLO UNA VEZ con el identificador correcto
            # (email si USERNAME_FIELD='email', username si USERNAME_FIELD='username')
            user = authenticate(request=request, username=username_to_try, password=password)
            
            # IMPORTANTE: Si authenticate() falla, verificar si la contraseña es correcta
            # Si es correcta, usar el usuario directamente (bypass authenticate)
            # Esto previene falsos negativos cuando AxesBackend bloquea incorrectamente
            if not user and user_obj:
                import logging
                logger = logging.getLogger(__name__)
                from django.contrib.auth.hashers import check_password
                
                # Verificar la contraseña directamente
                password_is_correct = check_password(password, user_obj.password)
                
                if password_is_correct:
                    logger.info(f'authenticate() falló pero contraseña es correcta para {email}. Usando usuario directamente.')
                    # Si la contraseña es correcta, usar el usuario directamente
                    # pero solo si está activo
                    if user_obj.is_active:
                        user = user_obj
                        # Limpiar bloqueos de AXES ya que la contraseña es correcta
                        try:
                            from axes.utils import reset as axes_reset
                            axes_reset(username=username_to_try)
                            if email != username_to_try:
                                axes_reset(username=email)
                            logger.info(f'Bloqueos de AXES limpiados para {email} (contraseña correcta)')
                        except Exception:
                            pass  # Ignorar errores de AXES
                    else:
                        logger.warning(f'Usuario {email} tiene contraseña correcta pero está inactivo')
                        # No asignar usuario si está inactivo
                        return {
                            'success': False,
                            'message': 'Tu cuenta está desactivada. Contacta al administrador.'
                        }
            
            # Verificar bloqueo DESPUÉS del intento fallido
            # IMPORTANTE: Solo mostrar error si realmente la contraseña es incorrecta
            # Si la contraseña es correcta, el usuario ya debería estar asignado arriba
            if not user:
                # La contraseña es incorrecta o el usuario no existe
                # Obtener username solo si user_obj existe y no es None
                username_for_lockout = user_obj.username if user_obj and user_obj.username else None
                lockout_info = self._check_axes_lockout(email, username_for_lockout)
                
                if lockout_info and lockout_info.get('is_locked'):
                    # La contraseña es incorrecta, mostrar información de bloqueo
                    # Obtener username solo si user_obj existe y no es None
                    username_for_lockout = user_obj.username if user_obj and user_obj.username else None
                    lockout_info = self._check_axes_lockout(email, username_for_lockout)
                    
                    if lockout_info and lockout_info.get('is_locked'):
                        minutes = lockout_info.get('minutes_remaining', 0)
                        hours = minutes // 60
                        mins = minutes % 60
                        
                        if hours > 0:
                            time_str = f"{hours} hora{'s' if hours > 1 else ''} y {mins} minuto{'s' if mins != 1 else ''}"
                        else:
                            time_str = f"{mins} minuto{'s' if mins != 1 else ''}"
                        
                        return {
                            'success': False,
                            'message': f'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en {time_str}.',
                            'is_locked': True,
                            'lockout_info': {
                                'minutes_remaining': minutes,
                                'is_permanent': False
                            }
                        }
                    elif lockout_info:
                        # No está bloqueado, pero hay intentos fallidos - mostrar advertencia
                        # IMPORTANTE: failures ya incluye el intento actual que acaba de fallar
                        # Por lo tanto, el mensaje debe reflejar el estado actual correcto
                        remaining = lockout_info.get('remaining_attempts', 0)
                        failures = lockout_info.get('failures', 0)  # Este ya incluye el intento actual
                        limit = lockout_info.get('limit', 5)
                        
                        # El mensaje es correcto: failures ya incluye el intento actual
                        if remaining > 0:
                            message = f'Credenciales incorrectas. Has fallado {failures} de {limit} intentos permitidos. Te quedan {remaining} intento{"s" if remaining > 1 else ""} antes del bloqueo temporal.'
                        else:
                            message = f'Credenciales incorrectas. Has alcanzado el límite de {limit} intentos fallidos. Tu cuenta será bloqueada temporalmente en el próximo intento fallido.'
                        
                        return {
                            'success': False,
                            'message': message,
                            'is_locked': False,
                            'lockout_info': {
                                'remaining_attempts': remaining,
                                'failures': failures,
                                'limit': limit
                            }
                        }
            
            if user and user.is_active:
                # Generar tokens JWT
                refresh = RefreshToken.for_user(user)
                
                # Obtener perfil del usuario
                profile = None
                try:
                    profile = user.profile
                except UserProfile.DoesNotExist:
                    # Crear perfil si no existe (rol por defecto: student)
                    profile = UserProfile.objects.create(user=user, role='student')
                
                return {
                    'success': True,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': profile.role,
                        'is_active': user.is_active
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    },
                    # Incluir RefreshToken object para establecer cookies (no se serializa en JSON)
                    '_refresh_token_object': refresh,
                    '_user_object': user,  # También incluir user object para evitar queries adicionales
                }
            else:
                # Log para debugging (sin exponer información sensible)
                import logging
                logger = logging.getLogger(__name__)
                if user and not user.is_active:
                    logger.warning(f'Intento de login con usuario inactivo: {email}')
                    return {
                        'success': False,
                        'message': 'Tu cuenta está desactivada. Contacta al administrador.'
                    }
                else:
                    # Si no hay información de bloqueo, mensaje genérico
                    logger.warning(f'Intento de login con credenciales inválidas para: {email}')
                    return {
                        'success': False,
                        'message': 'Credenciales inválidas. Verifica tu email y contraseña.'
                    }
                
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error en autenticación para {email}: {str(e)}', exc_info=True)
            return {
                'success': False,
                'message': f'Error en autenticación: {str(e)}'
            }

    def register(self, email: str, password: str, first_name: str, last_name: str, role: str = 'student', confirm_password: str = None) -> dict:
        """
        Registra un nuevo usuario
        IMPORTANTE: El registro público solo permite estudiantes.
        Para ser instructor, se debe solicitar aprobación mediante el proceso correspondiente.
        """
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Normalizar email
            email = email.lower().strip() if email else ''
            
            # Validar confirmación de contraseña si se proporciona
            if confirm_password and password != confirm_password:
                return {
                    'success': False,
                    'message': 'Las contraseñas no coinciden'
                }
            
            # Validar longitud mínima de contraseña
            if len(password) < 8:
                return {
                    'success': False,
                    'message': 'La contraseña debe tener al menos 8 caracteres'
                }
            
            # Forzar role='student' siempre, rechazar cualquier otro rol
            if role != 'student':
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Intento de registro con rol no permitido: {role} para email: {email}')
                return {
                    'success': False,
                    'message': 'El registro público solo permite estudiantes. Para ser instructor, solicita aprobación después de registrarte.'
                }
            
            # Validar que no se intente registrar como admin (seguridad adicional)
            if role == 'admin':
                return {
                    'success': False,
                    'message': 'No se puede registrar como administrador. Los administradores deben ser creados por otros administradores.'
                }
            
            # Forzar role='student' para seguridad adicional
            role = 'student'
            
            # Verificar si el usuario ya existe
            if User.objects.filter(email=email).exists():
                return {
                    'success': False,
                    'message': 'El email ya está registrado'
                }
            
            # Crear usuario (usar email como username para consistencia)
            user = User.objects.create_user(
                username=email,  # Usar email como username
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Crear perfil (siempre como estudiante)
            profile = UserProfile.objects.create(
                user=user,
                role='student'  # Siempre estudiante en registro público
            )
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': profile.role,
                    'is_active': user.is_active
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                },
                # Incluir RefreshToken object para establecer cookies (no se serializa en JSON)
                '_refresh_token_object': refresh,
                '_user_object': user,  # También incluir user object para evitar queries adicionales
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error en registro: {str(e)}'
            }