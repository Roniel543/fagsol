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
            from django.contrib.auth.models import User
            
            # Intentar autenticar primero con email como username
            user = authenticate(request=request, username=email, password=password)
            
            # Si no funciona, buscar usuario por email y autenticar con su username
            if not user:
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(request=request, username=user_obj.username, password=password)
                except User.DoesNotExist:
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
                return {
                    'success': False,
                    'message': 'Credenciales inválidas'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'Error en autenticación: {str(e)}'
            }

    def register(self, email: str, password: str, first_name: str, last_name: str, role: str = 'student') -> dict:
        """
        Registra un nuevo usuario
        """
        try:
            from django.contrib.auth.models import User
            
            # Verificar si el usuario ya existe
            if User.objects.filter(email=email).exists():
                return {
                    'success': False,
                    'message': 'El email ya está registrado'
                }
            
            # Crear usuario
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Crear perfil
            profile = UserProfile.objects.create(
                user=user,
                role=role
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