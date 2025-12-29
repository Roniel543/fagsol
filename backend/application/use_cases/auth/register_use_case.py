"""
Caso de uso: Registro de usuario - FagSol Escuela Virtual
"""

import logging
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import UserProfile
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')
User = get_user_model()


class RegisterUseCase:
    """
    Caso de uso: Registro de nuevo usuario
    
    Responsabilidades:
    - Validar datos de registro
    - Crear usuario y perfil
    - Generar tokens JWT
    - IMPORTANTE: El registro público solo permite estudiantes
    """
    
    def execute(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: str = 'student',
        confirm_password: str = None
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de registro
        
        Args:
            email: Email del usuario
            password: Contraseña del usuario
            first_name: Nombre del usuario
            last_name: Apellido del usuario
            role: Rol del usuario (siempre 'student' en registro público)
            confirm_password: Confirmación de contraseña (opcional)
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # Normalizar email
            email = email.lower().strip() if email else ''
            
            # Validar confirmación de contraseña
            if confirm_password and password != confirm_password:
                return UseCaseResult(
                    success=False,
                    error_message='Las contraseñas no coinciden'
                )
            
            # Validar longitud mínima de contraseña
            if len(password) < 8:
                return UseCaseResult(
                    success=False,
                    error_message='La contraseña debe tener al menos 8 caracteres'
                )
            
            # IMPORTANTE: Forzar role='student' siempre, rechazar cualquier otro rol
            if role != 'student':
                logger.warning(f'Intento de registro con rol no permitido: {role} para email: {email}')
                return UseCaseResult(
                    success=False,
                    error_message='El registro público solo permite estudiantes. Para ser instructor, solicita aprobación después de registrarte.'
                )
            
            # Validar que no se intente registrar como admin
            if role == 'admin':
                return UseCaseResult(
                    success=False,
                    error_message='No se puede registrar como administrador. Los administradores deben ser creados por otros administradores.'
                )
            
            # Forzar role='student' para seguridad adicional
            role = 'student'
            
            # Verificar si el usuario ya existe
            if User.objects.filter(email=email).exists():
                return UseCaseResult(
                    success=False,
                    error_message='El email ya está registrado'
                )
            
            # Crear usuario (usar email como username para consistencia)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Crear perfil (siempre como estudiante)
            profile = UserProfile.objects.create(
                user=user,
                role='student'
            )
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
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
            
        except Exception as e:
            logger.error(f'Error en registro para {email}: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f'Error en registro: {str(e)}'
            )

