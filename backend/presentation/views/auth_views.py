"""
Endpoints de autenticación - FagSol Escuela Virtual
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from infrastructure.services.auth_service import AuthService  # Mantener para compatibilidad temporal
from infrastructure.services.instructor_application_service import InstructorApplicationService  # Mantener para compatibilidad temporal
from infrastructure.services.password_reset_service import PasswordResetService  # Mantener para compatibilidad temporal
from application.use_cases.auth import LoginUseCase, RegisterUseCase, PasswordResetUseCase
from application.use_cases.instructor import CreateApplicationUseCase, GetApplicationUseCase
from infrastructure.external_services import DjangoEmailService
from infrastructure.utils.cookie_helpers import set_auth_cookies, clear_auth_cookies, get_refresh_token_from_cookie
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


@swagger_auto_schema(
    method='post',
    operation_description='Autentica un usuario y retorna tokens JWT',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email', 'password'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL, description='Email del usuario'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD, description='Contraseña del usuario'),
        }
    ),
    responses={
        200: openapi.Response(
            description='Login exitoso',
            examples={
                'application/json': {
                    'success': True,
                    'user': {
                        'id': 1,
                        'email': 'user@example.com',
                        'first_name': 'Juan',
                        'last_name': 'Pérez',
                        'role': 'student',
                        'is_active': True
                    },
                    'tokens': {
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                        'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
                    }
                }
            }
        ),
        401: openapi.Response(description='Credenciales inválidas'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Endpoint de login
    POST /api/v1/auth/login/
    """
    try:
        # 1. Obtener datos del request
        email = request.data.get('email')
        password = request.data.get('password')
        
        # 2. Validar datos requeridos
        if not email or not password:
            return Response({
                'success': False,
                'message': 'Email y contraseña son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Usar el caso de uso de autenticación
        login_use_case = LoginUseCase(request=request)
        result = login_use_case.execute(email, password)
        
        # 4. Retornar respuesta según el resultado
        if result.success:
            refresh_token_obj = result.extra.get('_refresh_token_object') if result.extra else None
            response_data = {
                'success': True,
                'user': result.data.get('user')
            }
            # Incluir tokens en el body para clientes que no usan cookies (ej. navegadores que bloquean third-party cookies)
            if refresh_token_obj:
                response_data['tokens'] = {
                    'access': str(refresh_token_obj.access_token),
                    'refresh': str(refresh_token_obj),
                }
            response = Response(response_data, status=status.HTTP_200_OK)
            if refresh_token_obj:
                set_auth_cookies(response, refresh_token_obj)
            return response
        else:
            # Convertir UseCaseResult a formato de respuesta
            response_data = {
                'success': False,
                'message': result.error_message
            }
            # Agregar información de bloqueo si existe
            if result.extra:
                if result.extra.get('is_locked'):
                    response_data['is_locked'] = True
                if result.extra.get('lockout_info'):
                    response_data['lockout_info'] = result.extra.get('lockout_info')
            
            # Log para debugging (temporal)
            import logging
            logger = logging.getLogger('apps')
            logger.info(f'Login fallido - Mensaje enviado: {result.error_message}')
            
            return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Error interno del servidor',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Registra un nuevo usuario en el sistema',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email', 'password', 'first_name', 'last_name'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL, description='Email del usuario'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD, description='Contraseña del usuario (mínimo 8 caracteres)'),
            'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD, description='Confirmación de contraseña (opcional, pero recomendado)'),
            'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Nombre del usuario'),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Apellido del usuario'),
            'role': openapi.Schema(
                type=openapi.TYPE_STRING,
                enum=['student'],
                default='student',
                description='IMPORTANTE: El registro público solo permite estudiantes. Cualquier otro rol será rechazado. Para ser instructor, solicita aprobación después de registrarte.'
            ),
        }
    ),
    responses={
        201: openapi.Response(description='Usuario registrado exitosamente'),
        400: openapi.Response(description='Datos inválidos o email ya registrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Endpoint de registro
    POST /api/v1/auth/register/
    """
    try:
        # 1. Obtener datos del request
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        
        # IMPORTANTE: El registro público solo permite estudiantes
        # Ignorar cualquier 'role' enviado y forzar 'student'
        role = 'student'
        
        # 2. Validar datos requeridos
        if not all([email, password, first_name, last_name]):
            return Response({
                'success': False,
                'message': 'Todos los campos son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Validar que no se intente registrar como admin (seguridad)
        # (Aunque ya forzamos role='student', esto es una capa adicional de seguridad)
        if request.data.get('role') == 'admin':
            return Response({
                'success': False,
                'message': 'No se puede registrar como administrador. Los administradores deben ser creados por otros administradores.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 4. Usar el caso de uso de registro
        register_use_case = RegisterUseCase()
        result = register_use_case.execute(email, password, first_name, last_name, role, confirm_password)
        
        # 5. Retornar respuesta según el resultado
        if result.success:
            refresh_token_obj = result.extra.get('_refresh_token_object') if result.extra else None
            response_data = {
                'success': True,
                'user': result.data.get('user')
            }
            if refresh_token_obj:
                response_data['tokens'] = {
                    'access': str(refresh_token_obj.access_token),
                    'refresh': str(refresh_token_obj),
                }
            response = Response(response_data, status=status.HTTP_201_CREATED)
            if refresh_token_obj:
                set_auth_cookies(response, refresh_token_obj)
            return response
        else:
            return Response({
                'success': False,
                'message': result.error_message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Error interno del servidor',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Health check del servicio de autenticación',
    responses={
        200: openapi.Response(
            description='Servicio funcionando correctamente',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Servicio de autenticación funcionando',
                    'version': '1.0.0'
                }
            }
        )
    },
    tags=['Autenticación']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def auth_health(request):
    """
    Health check para autenticación
    GET /api/v1/auth/health/
    """
    return Response({
        'success': True,
        'message': 'Servicio de autenticación funcionando',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    operation_description='Invalida los tokens JWT del usuario (logout)',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'refresh': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Refresh token a invalidar (opcional, pero recomendado)'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Logout exitoso',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Logout exitoso'
                }
            }
        ),
        401: openapi.Response(description='No autenticado')
    },
    security=[{'Bearer': []}],
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Endpoint de logout - Invalida tokens JWT
    POST /api/v1/logout/
    
    Requiere autenticación. Invalida el refresh token del usuario.
    """
    from rest_framework.permissions import IsAuthenticated
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.exceptions import TokenError
    import logging
    
    logger = logging.getLogger('apps')
    
    try:
        # Obtener refresh token de cookie o del body (compatibilidad)
        refresh_token = get_refresh_token_from_cookie(request) or request.data.get('refresh')
        
        if refresh_token:
            try:
                # Intentar invalidar el token
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f'Token invalidado para usuario {request.user.id}')
            except TokenError as e:
                # Si el token ya está invalidado o es inválido, no es crítico
                logger.warning(f'Error al invalidar token: {str(e)}')
        else:
            # Si no se envía refresh token, igual retornamos éxito
            # (el token expirará naturalmente)
            logger.info(f'Logout sin refresh token para usuario {request.user.id}')
        
        # Crear respuesta y limpiar cookies
        response = Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
        # Limpiar cookies de autenticación
        clear_auth_cookies(response)
        
        return response
        
    except Exception as e:
        logger.error(f'Error en logout: {str(e)}')
        # Retornar éxito incluso si hay error (seguridad por oscuridad)
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    operation_description='Refresca el access token. Acepta refresh en cookie o en body (para clientes sin cookies de terceros). Devuelve user y tokens en el body.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token (opcional si se envía en cookie)'),
        }
    ),
    responses={
        200: openapi.Response(
            description='Token refrescado exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'user': {'id': 1, 'email': 'user@example.com', 'first_name': 'Juan', 'last_name': 'Pérez', 'role': 'student', 'is_active': True},
                    'tokens': {'access': 'eyJ...', 'refresh': 'eyJ...'}
                }
            }
        ),
        401: openapi.Response(description='Refresh token inválido o expirado')
    },
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresca el access token. Acepta refresh en cookie o en body (para navegadores que bloquean cookies de terceros).
    POST /api/v1/auth/refresh/
    Rota el refresh token (blacklist del anterior). Establece cookies y devuelve tokens en el body.
    """
    import logging
    logger = logging.getLogger('apps')
    
    try:
        # Obtener refresh token de cookie o del body (para clientes sin cookies de terceros)
        refresh_token_str = get_refresh_token_from_cookie(request) or request.data.get('refresh')
        
        if not refresh_token_str:
            return Response({
                'success': False,
                'message': 'No refresh token available'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Validar y obtener token
            refresh = RefreshToken(refresh_token_str)
            
            # Obtener usuario del token
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_id = refresh.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Blacklist del token anterior (rotación)
            refresh.blacklist()
            
            # Generar nuevos tokens
            new_refresh = RefreshToken.for_user(user)
            
            # Obtener perfil del usuario
            from apps.core.models import UserProfile
            try:
                profile = user.profile
                role = profile.role
            except UserProfile.DoesNotExist:
                # Crear perfil si no existe
                profile = UserProfile.objects.create(user=user, role='student')
                role = 'student'
            
            response_data = {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': role,
                    'is_active': user.is_active
                },
                'tokens': {
                    'access': str(new_refresh.access_token),
                    'refresh': str(new_refresh),
                }
            }
            response = Response(response_data, status=status.HTTP_200_OK)
            set_auth_cookies(response, new_refresh)
            
            logger.info(f'Token refrescado para usuario {user.id}')
            return response
            
        except TokenError as e:
            logger.warning(f'Error al refrescar token: {str(e)}')
            return Response({
                'success': False,
                'message': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
    except Exception as e:
        logger.error(f'Error en refresh_token: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': 'Error al refrescar token'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene la información del usuario autenticado actual. Útil para verificar si el token es válido.',
    responses={
        200: openapi.Response(
            description='Usuario autenticado',
            examples={
                'application/json': {
                    'success': True,
                    'user': {
                        'id': 1,
                        'email': 'user@example.com',
                        'first_name': 'Juan',
                        'last_name': 'Pérez',
                        'role': 'admin',
                        'is_active': True
                    }
                }
            }
        ),
        401: openapi.Response(description='No autenticado o token inválido')
    },
    security=[{'Bearer': []}],
    tags=['Autenticación']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Obtiene la información del usuario autenticado actual
    GET /api/v1/auth/me/
    
    Requiere autenticación. Útil para verificar si el token es válido y obtener datos del usuario.
    """
    import logging
    logger = logging.getLogger('apps')
    
    try:
        from apps.core.models import UserProfile
        
        user = request.user
        
        # Obtener perfil del usuario
        try:
            profile = user.profile
            role = profile.role
            
            # Si es superuser pero el perfil no tiene rol admin, actualizarlo
            if user.is_superuser and role != 'admin':
                profile.role = 'admin'
                profile.save()
                role = 'admin'
        except UserProfile.DoesNotExist:
            # Si no tiene perfil, crear uno
            # Si es superuser, asignar rol admin; si no, rol student
            default_role = 'admin' if user.is_superuser else 'student'
            profile = UserProfile.objects.create(user=user, role=default_role)
            role = default_role
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role,
                'is_active': user.is_active
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_current_user: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error al obtener información del usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Solicita convertirse en instructor. Requiere autenticación.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['motivation'],
        properties={
            'professional_title': openapi.Schema(type=openapi.TYPE_STRING, description='Título profesional (opcional)'),
            'experience_years': openapi.Schema(type=openapi.TYPE_INTEGER, description='Años de experiencia (opcional, default: 0)'),
            'specialization': openapi.Schema(type=openapi.TYPE_STRING, description='Especialidad (opcional)'),
            'bio': openapi.Schema(type=openapi.TYPE_STRING, description='Biografía (opcional)'),
            'portfolio_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, description='URL del portfolio (opcional)'),
            'motivation': openapi.Schema(type=openapi.TYPE_STRING, description='Motivación para ser instructor (requerido)'),
        }
    ),
    responses={
        201: openapi.Response(
            description='Solicitud creada exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Solicitud enviada. Te notificaremos cuando sea revisada.',
                    'data': {
                        'id': 1,
                        'status': 'pending'
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos o ya tienes una solicitud pendiente'),
        401: openapi.Response(description='No autenticado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_be_instructor(request):
    """
    Solicitud para convertirse en instructor
    POST /api/v1/auth/apply-instructor/
    
    Requiere autenticación (usuario debe estar registrado)
    """
    try:
        # 1. Obtener datos del request
        professional_title = request.data.get('professional_title', '')
        experience_years = request.data.get('experience_years', 0)
        specialization = request.data.get('specialization', '')
        bio = request.data.get('bio', '')
        portfolio_url = request.data.get('portfolio_url', '')
        motivation = request.data.get('motivation', '')
        cv_file = request.FILES.get('cv_file', None)
        
        # 2. Validar que motivation esté presente
        if not motivation or not motivation.strip():
            return Response({
                'success': False,
                'message': 'La motivación es requerida. Cuéntanos por qué quieres ser instructor.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Validar experience_years
        try:
            experience_years = int(experience_years) if experience_years else 0
        except (ValueError, TypeError):
            experience_years = 0
        
        # 4. Usar caso de uso para crear la solicitud
        create_application_use_case = CreateApplicationUseCase()
        result = create_application_use_case.execute(
            user=request.user,
            professional_title=professional_title,
            experience_years=experience_years,
            specialization=specialization,
            bio=bio,
            portfolio_url=portfolio_url,
            motivation=motivation,
            cv_file=cv_file
        )
        
        if not result.success:
            return Response({
                'success': False,
                'message': result.error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 5. Retornar respuesta exitosa
        return Response({
            'success': True,
            'message': 'Solicitud enviada. Te notificaremos cuando sea revisada.',
            'data': result.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import logging
        logger = logging.getLogger('apps')
        logger.error(f'Error en apply_to_be_instructor: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': 'Error interno del servidor',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene la solicitud de instructor del usuario autenticado. Permite ver el estado de la solicitud (pending, approved, rejected) y el motivo de rechazo si aplica.',
    responses={
        200: openapi.Response(
            description='Solicitud encontrada',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'id': 1,
                        'status': 'pending',
                        'status_display': 'Pendiente',
                        'professional_title': 'Ingeniero',
                        'specialization': 'Metalurgia',
                        'reviewed_by': None,
                        'reviewed_at': None,
                        'rejection_reason': None,
                        'created_at': '2025-01-12T10:00:00Z',
                        'updated_at': '2025-01-12T10:00:00Z'
                    }
                }
            }
        ),
        404: openapi.Response(description='No tienes una solicitud de instructor'),
        401: openapi.Response(description='No autenticado'),
    },
    security=[{'Bearer': []}],
    tags=['Autenticación']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_instructor_application(request):
    """
    Obtiene la solicitud de instructor del usuario autenticado
    GET /api/v1/auth/my-instructor-application/
    
    Permite al usuario ver:
    - Estado de su solicitud (pending, approved, rejected)
    - Motivo de rechazo (si fue rechazada)
    - Fecha de revisión
    - Quién la revisó
    
    Requiere autenticación
    """
    try:
        # Usar caso de uso para obtener la solicitud
        get_application_use_case = GetApplicationUseCase()
        result = get_application_use_case.execute(request.user)
        
        if not result.success:
            return Response({
                'success': False,
                'message': result.error_message
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener la aplicación del resultado extra para el cv_file_url
        application = result.extra.get('application')
        if application and application.cv_file:
            result.data['cv_file_url'] = request.build_absolute_uri(application.cv_file.url)
        else:
            result.data['cv_file_url'] = None
        
        return Response({
            'success': True,
            'data': result.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import logging
        logger = logging.getLogger('apps')
        logger.error(f'Error en get_my_instructor_application: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': 'Error al obtener la solicitud',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Solicita restablecimiento de contraseña. Se enviará un email con un link de reset.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email'],
        properties={
            'email': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_EMAIL,
                description='Email del usuario que solicita reset de contraseña'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Solicitud procesada (siempre retorna éxito por seguridad)',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Si el email existe, se enviará un link de restablecimiento'
                }
            }
        ),
        400: openapi.Response(description='Email inválido'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Solicita restablecimiento de contraseña
    POST /api/v1/auth/forgot-password/
    
    Por seguridad, siempre retorna éxito (no revela si el email existe o no)
    """
    import logging
    logger = logging.getLogger('apps')
    
    try:
        # 1. Obtener email del request
        email = request.data.get('email')
        
        # 2. Validar email
        if not email or not isinstance(email, str):
            return Response({
                'success': False,
                'message': 'Email es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Obtener URL del frontend
        from django.conf import settings
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
        # 4. Usar caso de uso de password reset
        password_reset_use_case = PasswordResetUseCase()
        result = password_reset_use_case.request_password_reset(email, frontend_url)
        
        # 5. Si hay datos (usuario existe y rate limit OK), enviar email
        if result.success and result.extra and result.extra.get('user'):
            try:
                user = result.extra['user']
                user_name = user.get_full_name() or user.first_name or user.email.split('@')[0]
                reset_url = result.data.get('reset_url')
                
                # Enviar email
                email_service = DjangoEmailService()
                email_sent = email_service.send_password_reset_email(
                    user_email=user.email,
                    user_name=user_name,
                    reset_url=reset_url
                )
                
                if email_sent:
                    logger.info(f'Email de reset password enviado a: {user.email}')
                else:
                    logger.warning(f'Error al enviar email de reset password a: {user.email}')
                
            except Exception as email_error:
                logger.error(f'Error al enviar email de reset password: {str(email_error)}', exc_info=True)
        
        # 6. Siempre retornar éxito (por seguridad, no revelar si email existe)
        message = result.data.get('message') if result.data else 'Si el email existe, se enviará un link de restablecimiento'
        return Response({
            'success': True,
            'message': message
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error en forgot_password: {str(e)}', exc_info=True)
        # Por seguridad, retornar éxito incluso si hay error
        return Response({
            'success': True,
            'message': 'Si el email existe, se enviará un link de restablecimiento'
        }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    operation_description='Restablece la contraseña usando un token válido',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['uid', 'token', 'new_password', 'confirm_password'],
        properties={
            'uid': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='User ID codificado en base64 (del link de reset)'
            ),
            'token': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Token de reset (del link de reset)'
            ),
            'new_password': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_PASSWORD,
                description='Nueva contraseña (mínimo 8 caracteres)'
            ),
            'confirm_password': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_PASSWORD,
                description='Confirmación de nueva contraseña'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Contraseña restablecida exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Contraseña restablecida exitosamente'
                }
            }
        ),
        400: openapi.Response(description='Token inválido, expirado o contraseña inválida'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Autenticación']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Restablece la contraseña usando token válido
    POST /api/v1/auth/reset-password/
    """
    import logging
    logger = logging.getLogger('apps')
    
    try:
        # 1. Obtener datos del request
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password', '').strip()  # Limpiar espacios
        confirm_password = request.data.get('confirm_password', '').strip()  # Limpiar espacios
        
        # 2. Validar datos requeridos
        if not all([uid, token, new_password]):
            return Response({
                'success': False,
                'message': 'uid, token y new_password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Validar que las contraseñas coincidan (después de trim)
        if new_password != confirm_password:
            return Response({
                'success': False,
                'message': 'Las contraseñas no coinciden'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Validar longitud mínima (después de trim)
        if len(new_password) < 8:
            return Response({
                'success': False,
                'message': 'La contraseña debe tener al menos 8 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 5. Usar caso de uso de password reset
        password_reset_use_case = PasswordResetUseCase()
        result = password_reset_use_case.reset_password(uid, token, new_password)
        
        # 6. Retornar respuesta
        if result.success:
            user = result.extra.get('user') if result.extra else None
            logger.info(f'Contraseña restablecida exitosamente para usuario: {user.email if user else "unknown"}')
            return Response({
                'success': True,
                'message': result.data.get('message') if result.data else 'Contraseña restablecida exitosamente'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result.error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f'Error en reset_password: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': 'Error al restablecer la contraseña'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Valida si un token de reset es válido (útil para verificar antes de mostrar formulario)',
    responses={
        200: openapi.Response(
            description='Token válido o inválido',
            examples={
                'application/json': {
                    'success': True,
                    'valid': True,
                    'message': 'Token válido'
                }
            }
        ),
        400: openapi.Response(description='Token inválido o expirado')
    },
    tags=['Autenticación']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def validate_reset_token(request, uid, token):
    """
    Valida si un token de reset es válido
    GET /api/v1/auth/reset-password/validate/<uid>/<token>/
    
    Útil para verificar el token antes de mostrar el formulario de reset
    """
    import logging
    logger = logging.getLogger('apps')
    
    try:
        # Validar token usando caso de uso
        password_reset_use_case = PasswordResetUseCase()
        result = password_reset_use_case.validate_token(uid, token)
        is_valid = result.success
        error_message = result.error_message if not result.success else None
        user = result.extra.get('user') if result.extra else None
        
        if is_valid and user:
            return Response({
                'success': True,
                'valid': True,
                'message': 'Token válido'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'valid': False,
                'message': error_message or 'Token inválido o expirado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f'Error en validate_reset_token: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'valid': False,
            'message': 'Error al validar token'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)