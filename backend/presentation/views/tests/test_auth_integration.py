"""
Tests de Integración para Endpoints de Autenticación - FagSol Escuela Virtual

Estos tests verifican los flujos completos de autenticación:
- Registro de usuarios
- Login
- Logout con revocación de tokens
- Refresh token
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_STUDENT, ROLE_ADMIN


class AuthIntegrationTestCase(TestCase):
    """Tests de integración para endpoints de autenticación"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        self.base_url = '/api/v1/auth'
    
    def test_register_new_user(self):
        """Test: Registrar un nuevo usuario exitosamente"""
        data = {
            'email': 'newuser@test.com',
            'password': 'SecurePass123!',
            'first_name': 'Nuevo',
            'last_name': 'Usuario',
            'role': 'student'
        }
        
        response = self.client.post(f'{self.base_url}/register/', data, format='json')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('user', response.data)
        # Tokens pueden estar en JSON (modo dual para clientes sin cookies de terceros) y/o en cookies
        if 'tokens' in response.data:
            self.assertIn('access', response.data['tokens'])
            self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'newuser@test.com')
        self.assertEqual(response.data['user']['role'], 'student')
        
        # Verificar que se establecieron cookies
        from django.conf import settings
        access_cookie_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
        refresh_cookie_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
        self.assertIn(access_cookie_name, response.cookies)
        self.assertIn(refresh_cookie_name, response.cookies)
        
        # Verificar que el usuario se creó en la BD
        user = User.objects.get(email='newuser@test.com')
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'Nuevo')
        self.assertEqual(user.last_name, 'Usuario')
        
        # Verificar que se creó el perfil
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.role, 'student')
    
    def test_register_duplicate_email(self):
        """Test: No se puede registrar con email duplicado"""
        # Crear usuario existente
        User.objects.create_user(
            username='existing@test.com',
            email='existing@test.com',
            password='testpass123'
        )
        
        data = {
            'email': 'existing@test.com',
            'password': 'SecurePass123!',
            'first_name': 'Nuevo',
            'last_name': 'Usuario'
        }
        
        response = self.client.post(f'{self.base_url}/register/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('ya está registrado', response.data['message'])
    
    def test_register_missing_fields(self):
        """Test: Registro falla si faltan campos requeridos"""
        data = {
            'email': 'incomplete@test.com',
            # Faltan password, first_name, last_name
        }
        
        response = self.client.post(f'{self.base_url}/register/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('requeridos', response.data['message'])
    
    def test_login_success(self):
        """Test: Login exitoso con credenciales válidas"""
        from unittest.mock import patch
        
        # Crear usuario
        user = User.objects.create_user(
            username='login@test.com',
            email='login@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Mock authenticate en el AuthService para evitar problemas con AxesBackend
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            data = {
                'email': 'login@test.com',
                'password': 'testpass123'
            }
            
            response = self.client.post(f'{self.base_url}/login/', data, format='json')
            
            # Verificar respuesta
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['success'])
            self.assertIn('user', response.data)
            self.assertEqual(response.data['user']['email'], 'login@test.com')
            if 'tokens' in response.data:
                self.assertIn('access', response.data['tokens'])
                self.assertIn('refresh', response.data['tokens'])
            
            # Verificar que se establecieron cookies
            from django.conf import settings
            access_cookie_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
            refresh_cookie_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
            self.assertIn(access_cookie_name, response.cookies)
            self.assertIn(refresh_cookie_name, response.cookies)
    
    def test_login_invalid_credentials(self):
        """Test: Login falla con credenciales inválidas"""
        from unittest.mock import patch
        
        # Crear usuario
        User.objects.create_user(
            username='user@test.com',
            email='user@test.com',
            password='correctpass'
        )
        
        # Mock authenticate en el AuthService para retornar None (credenciales inválidas)
        with patch('infrastructure.services.auth_service.authenticate', return_value=None):
            data = {
                'email': 'user@test.com',
                'password': 'wrongpass'
            }
            
            response = self.client.post(f'{self.base_url}/login/', data, format='json')
            
            # Debe retornar error
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertFalse(response.data['success'])
            # El mensaje puede ser "inválidas" o "incorrectas" (mensaje más descriptivo con intentos)
            self.assertTrue(
                'inválidas' in response.data['message'] or 
                'incorrectas' in response.data['message'] or
                'Credenciales' in response.data['message']
            )
    
    def test_login_nonexistent_user(self):
        """Test: Login falla con usuario inexistente"""
        data = {
            'email': 'nonexistent@test.com',
            'password': 'anypass'
        }
        
        response = self.client.post(f'{self.base_url}/login/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
    
    def test_logout_success(self):
        """Test: Logout exitoso invalida tokens"""
        from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        # Crear usuario y obtener tokens
        user = User.objects.create_user(
            username='logout@test.com',
            email='logout@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Autenticar
        self.client.force_authenticate(user=user)
        
        # Obtener refresh token
        refresh = JWTRefreshToken.for_user(user)
        refresh_token = str(refresh)
        
        # Establecer cookie de refresh token
        from django.conf import settings
        refresh_cookie_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
        self.client.cookies[refresh_cookie_name] = refresh_token
        
        # Hacer logout (puede obtener refresh token de cookie o body)
        response = self.client.post(
            f'{self.base_url}/logout/',
            {'refresh': refresh_token},  # También puede venir del body
            format='json'
        )
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('exitoso', response.data['message'])
        
        # Verificar que las cookies fueron limpiadas
        access_cookie_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
        cleared_access = response.cookies.get(access_cookie_name)
        cleared_refresh = response.cookies.get(refresh_cookie_name)
        # Las cookies limpiadas tienen max-age=0 o value vacío
        if cleared_access:
            self.assertTrue(
                cleared_access.get('max-age') == '0' or 
                cleared_access.value == ''
            )
        
        # Verificar que el token está en blacklist (no se puede usar de nuevo)
        try:
            token = JWTRefreshToken(refresh_token)
            token.blacklist()
            # Si llegamos aquí, el token no estaba en blacklist (no debería pasar)
            self.fail('El token debería estar en blacklist')
        except TokenError:
            # Esto es esperado - el token ya está en blacklist
            pass
    
    def test_logout_without_token(self):
        """Test: Logout funciona incluso sin refresh token"""
        user = User.objects.create_user(
            username='logout2@test.com',
            email='logout2@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        self.client.force_authenticate(user=user)
        
        # Logout sin refresh token
        response = self.client.post(f'{self.base_url}/logout/', {}, format='json')
        
        # Debe retornar éxito (seguridad por oscuridad)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_logout_unauthenticated(self):
        """Test: Logout requiere autenticación"""
        response = self.client.post(f'{self.base_url}/logout/', {}, format='json')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_health_check(self):
        """Test: Health check funciona sin autenticación"""
        response = self.client.get(f'{self.base_url}/health/')
        
        # Debe retornar éxito
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('funcionando', response.data['message'])
    
    def test_login_creates_profile_if_missing(self):
        """Test: Login crea perfil automáticamente si no existe"""
        from unittest.mock import patch
        
        # Crear usuario sin perfil
        user = User.objects.create_user(
            username='noprofile@test.com',
            email='noprofile@test.com',
            password='testpass123'
        )
        # No crear perfil
        
        # Mock authenticate en el AuthService para evitar problemas con AxesBackend
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            data = {
                'email': 'noprofile@test.com',
                'password': 'testpass123'
            }
            
            response = self.client.post(f'{self.base_url}/login/', data, format='json')
            
            # Debe crear perfil automáticamente
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['success'])
            
            # Verificar que se creó el perfil
            profile = UserProfile.objects.get(user=user)
            self.assertEqual(profile.role, 'student')  # Rol por defecto
            
            # Verificar que se establecieron cookies
            from django.conf import settings
            access_cookie_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
            self.assertIn(access_cookie_name, response.cookies)

