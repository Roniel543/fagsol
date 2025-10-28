"""
Endpoints de autenticación - FagSol Escuela Virtual
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from infrastructure.services.auth_service import AuthService


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
        
        # 3. Usar el servicio de autenticación
        auth_service = AuthService()
        result = auth_service.login(email, password)
        
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
        
        # 3. Usar el servicio de autenticación
        auth_service = AuthService()
        result = auth_service.register(email, password, first_name, last_name, role)
        
        # 4. Retornar respuesta según el resultado
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
