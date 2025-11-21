"""
Servicio de autenticación - FagSol Escuela Virtual
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

    def login(self, email: str, password: str, request=None) -> dict:
        """
        Autentica un usuario y retorna tokens JWT
        
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
            
            # Intentar autenticar primero con email como username
            # (esto funciona si el usuario fue creado con username=email)
            user = authenticate(request=request, username=email, password=password)
            
            # Si no funciona, buscar usuario por email y autenticar con su username real
            if not user:
                try:
                    user_obj = User.objects.get(email=email)
                    # Intentar autenticar con el username real del usuario
                    user = authenticate(request=request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
                except Exception as e:
                    # Log del error para debugging
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f'Error al buscar usuario por email {email}: {str(e)}')
                    user = None
            
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
                    }
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
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error en registro: {str(e)}'
            }