"""
Endpoints de autenticación - FagSol Escuela Virtual
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from infrastructure.services.auth_service import AuthService
from infrastructure.services.instructor_application_service import InstructorApplicationService
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
        
        # 3. Usar el servicio de autenticación (pasar request para AxesBackend)
        auth_service = AuthService()
        result = auth_service.login(email, password, request=request)
        
        # 4. Retornar respuesta según el resultado
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_401_UNAUTHORIZED)
            
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
        
        # 4. Usar el servicio de autenticación (siempre con role='student')
        auth_service = AuthService()
        result = auth_service.register(email, password, first_name, last_name, role, confirm_password=confirm_password)
        
        # 5. Retornar respuesta según el resultado
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
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
        # Obtener refresh token del body
        refresh_token = request.data.get('refresh')
        
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
        
        # Siempre retornar éxito para no revelar información
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error en logout: {str(e)}')
        # Retornar éxito incluso si hay error (seguridad por oscuridad)
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)


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
        
        # 4. Usar el servicio para crear la solicitud
        service = InstructorApplicationService()
        success, application, error_message = service.create_application(
            user=request.user,
            professional_title=professional_title,
            experience_years=experience_years,
            specialization=specialization,
            bio=bio,
            portfolio_url=portfolio_url,
            motivation=motivation,
            cv_file=cv_file
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 5. Retornar respuesta exitosa
        return Response({
            'success': True,
            'message': 'Solicitud enviada. Te notificaremos cuando sea revisada.',
            'data': {
                'id': application.id,
                'status': application.status,
                'created_at': application.created_at.isoformat()
            }
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
        from infrastructure.services.instructor_application_service import InstructorApplicationService
        
        # Obtener la solicitud del usuario
        service = InstructorApplicationService()
        application = service.get_user_application(request.user)
        
        if not application:
            return Response({
                'success': False,
                'message': 'No tienes una solicitud de instructor'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar si puede volver a aplicar (si fue rechazada)
        can_reapply = None
        days_remaining = None
        if application.status == 'rejected':
            can_reapply, days_remaining = service.can_reapply(request.user)
        
        # Serializar datos
        data = {
            'id': application.id,
            'professional_title': application.professional_title,
            'experience_years': application.experience_years,
            'specialization': application.specialization,
            'bio': application.bio,
            'portfolio_url': application.portfolio_url,
            'motivation': application.motivation,
            'cv_file_url': request.build_absolute_uri(application.cv_file.url) if application.cv_file else None,
            'status': application.status,
            'status_display': application.get_status_display(),
            'reviewed_by': {
                'id': application.reviewed_by.id,
                'email': application.reviewed_by.email,
            } if application.reviewed_by else None,
            'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
            'rejection_reason': application.rejection_reason,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
            # Información sobre volver a aplicar
            'can_reapply': can_reapply if application.status == 'rejected' else None,
            'days_remaining': days_remaining if application.status == 'rejected' else None,
        }
        
        return Response({
            'success': True,
            'data': data
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