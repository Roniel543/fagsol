"""
Endpoints de autenticación - FagSol Escuela Virtual
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from infrastructure.services.auth_service import AuthService
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
            'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD, description='Contraseña del usuario'),
            'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Nombre del usuario'),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Apellido del usuario'),
            'role': openapi.Schema(
                type=openapi.TYPE_STRING,
                enum=['instructor', 'student'],
                default='student',
                description='Rol del usuario (por defecto: student). Nota: No se permite registrar como admin desde este endpoint.'
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
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        role = request.data.get('role', 'student')
        
        # 2. Validar datos requeridos
        if not all([email, password, first_name, last_name]):
            return Response({
                'success': False,
                'message': 'Todos los campos son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Validar que no se intente registrar como admin (seguridad)
        if role == 'admin':
            return Response({
                'success': False,
                'message': 'No se puede registrar como administrador. Los administradores deben ser creados por otros administradores.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 4. Usar el servicio de autenticación
        auth_service = AuthService()
        result = auth_service.register(email, password, first_name, last_name, role)
        
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