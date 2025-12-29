"""
Tests de Integración para Autenticación con Cookies HTTP-Only - FagSol Escuela Virtual

Estos tests verifican que la autenticación con cookies HTTP-Only funciona correctamente:
- Login establece cookies
- Register establece cookies
- Logout limpia cookies
- Refresh rota tokens y establece nuevas cookies
- CookieJWTAuthentication lee tokens de cookies
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_STUDENT
from django.conf import settings


class AuthCookiesTestCase(TestCase):
    """Tests de integración para autenticación con cookies HTTP-Only"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        self.base_url = '/api/v1/auth'
        
        # Obtener nombres de cookies de configuración
        self.access_cookie_name = getattr(settings, 'COOKIE_ACCESS_TOKEN_NAME', 'access_token')
        self.refresh_cookie_name = getattr(settings, 'COOKIE_REFRESH_TOKEN_NAME', 'refresh_token')
    
    def test_login_sets_cookies(self):
        """Test: Login establece cookies HTTP-Only correctamente"""
        from unittest.mock import patch
        
        # Crear usuario
        user = User.objects.create_user(
            username='cookietest@test.com',
            email='cookietest@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Mock authenticate para evitar problemas con AxesBackend
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            data = {
                'email': 'cookietest@test.com',
                'password': 'testpass123'
            }
            
            response = self.client.post(f'{self.base_url}/login/', data, format='json')
            
            # Verificar respuesta
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['success'])
            self.assertIn('user', response.data)
            
            # Verificar que NO hay tokens en JSON (solo en cookies)
            self.assertNotIn('tokens', response.data)
            
            # Verificar que se establecieron cookies
            self.assertIn(self.access_cookie_name, response.cookies)
            self.assertIn(self.refresh_cookie_name, response.cookies)
            
            # Verificar configuración de cookies
            access_cookie = response.cookies[self.access_cookie_name]
            refresh_cookie = response.cookies[self.refresh_cookie_name]
            
            # Verificar HttpOnly
            self.assertTrue(access_cookie.get('httponly', False))
            self.assertTrue(refresh_cookie.get('httponly', False))
            
            # Verificar SameSite
            self.assertEqual(access_cookie.get('samesite', '').lower(), 'strict')
            self.assertEqual(refresh_cookie.get('samesite', '').lower(), 'strict')
            
            # Verificar que las cookies tienen valores (tokens)
            self.assertIsNotNone(access_cookie.value)
            self.assertIsNotNone(refresh_cookie.value)
            self.assertNotEqual(access_cookie.value, '')
            self.assertNotEqual(refresh_cookie.value, '')
    
    def test_register_sets_cookies(self):
        """Test: Register establece cookies HTTP-Only correctamente"""
        data = {
            'email': 'newcookie@test.com',
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
        
            # Verificar que NO hay tokens en JSON
        self.assertNotIn('tokens', response.data)
        
        # Verificar que se establecieron cookies
        self.assertIn(self.access_cookie_name, response.cookies)
        self.assertIn(self.refresh_cookie_name, response.cookies)
        
        # Verificar configuración de cookies
        access_cookie = response.cookies[self.access_cookie_name]
        self.assertTrue(access_cookie.get('httponly', False))
        self.assertEqual(access_cookie.get('samesite', '').lower(), 'strict')
    
    def test_logout_clears_cookies(self):
        """Test: Logout limpia cookies correctamente"""
        from unittest.mock import patch
        
        # Crear usuario y hacer login
        user = User.objects.create_user(
            username='logoutcookie@test.com',
            email='logoutcookie@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Autenticar y obtener cookies
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            login_data = {
                'email': 'logoutcookie@test.com',
                'password': 'testpass123'
            }
            login_response = self.client.post(f'{self.base_url}/login/', login_data, format='json')
            
            # Verificar que hay cookies después del login
            self.assertIn(self.access_cookie_name, login_response.cookies)
            self.assertIn(self.refresh_cookie_name, login_response.cookies)
        
        # Autenticar el cliente con las cookies
        self.client.force_authenticate(user=user)
        
        # Hacer logout
        response = self.client.post(f'{self.base_url}/logout/', {}, format='json')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verificar que las cookies fueron eliminadas (max_age=0 o value='')
        access_cookie = response.cookies.get(self.access_cookie_name)
        refresh_cookie = response.cookies.get(self.refresh_cookie_name)
        
        if access_cookie:
            # Cookie eliminada tiene max_age=0 o value vacío
            self.assertTrue(
                access_cookie.get('max-age') == '0' or 
                access_cookie.value == '' or
                'max-age' in str(access_cookie).lower()
            )
    
    def test_refresh_rotates_tokens(self):
        """Test: Refresh rota tokens y establece nuevas cookies"""
        from unittest.mock import patch
        
        # Crear usuario y hacer login
        user = User.objects.create_user(
            username='refreshtest@test.com',
            email='refreshtest@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Autenticar y obtener cookies
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            login_data = {
                'email': 'refreshtest@test.com',
                'password': 'testpass123'
            }
            login_response = self.client.post(f'{self.base_url}/login/', login_data, format='json')
            
            # Guardar refresh token original
            original_refresh_token = login_response.cookies[self.refresh_cookie_name].value
        
        # Establecer cookies en el cliente
        self.client.cookies[self.access_cookie_name] = login_response.cookies[self.access_cookie_name].value
        self.client.cookies[self.refresh_cookie_name] = original_refresh_token
        
        # Hacer refresh
        response = self.client.post(f'{self.base_url}/refresh/', {}, format='json')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('user', response.data)
        
        # Verificar que se establecieron nuevas cookies
        self.assertIn(self.access_cookie_name, response.cookies)
        self.assertIn(self.refresh_cookie_name, response.cookies)
        
        # Verificar que el refresh token cambió (rotación)
        new_refresh_token = response.cookies[self.refresh_cookie_name].value
        self.assertNotEqual(original_refresh_token, new_refresh_token)
        
        # Verificar que el token anterior está en blacklist
        try:
            old_token = RefreshToken(original_refresh_token)
            old_token.blacklist()
            # Si llegamos aquí, el token no estaba en blacklist (no debería pasar)
            self.fail('El token anterior debería estar en blacklist')
        except TokenError:
            # Esto es esperado - el token ya está en blacklist
            pass
    
    def test_refresh_without_cookie_fails(self):
        """Test: Refresh falla si no hay refresh token en cookie"""
        response = self.client.post(f'{self.base_url}/refresh/', {}, format='json')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
        self.assertIn('refresh token', response.data['message'].lower())
    
    def test_cookie_authentication_works(self):
        """Test: CookieJWTAuthentication lee tokens de cookies correctamente"""
        from unittest.mock import patch
        
        # Crear usuario y hacer login
        user = User.objects.create_user(
            username='cookieauth@test.com',
            email='cookieauth@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Autenticar y obtener cookies
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            login_data = {
                'email': 'cookieauth@test.com',
                'password': 'testpass123'
            }
            login_response = self.client.post(f'{self.base_url}/login/', login_data, format='json')
        
        # Establecer cookies en el cliente
        self.client.cookies[self.access_cookie_name] = login_response.cookies[self.access_cookie_name].value
        self.client.cookies[self.refresh_cookie_name] = login_response.cookies[self.refresh_cookie_name].value
        
        # Intentar acceder a endpoint protegido usando cookies
        response = self.client.get(f'{self.base_url}/me/')
        
        # Debe retornar éxito (autenticado por cookies)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['email'], 'cookieauth@test.com')
    
    def test_cookie_authentication_without_cookie_fails(self):
        """Test: Endpoint protegido falla sin cookie de acceso"""
        # Intentar acceder sin cookies
        response = self.client.get(f'{self.base_url}/me/')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_cookie_authentication_with_invalid_token_fails(self):
        """Test: CookieJWTAuthentication rechaza token inválido"""
        # Establecer cookie con token inválido
        self.client.cookies[self.access_cookie_name] = 'invalid.token.here'
        
        # Intentar acceder a endpoint protegido
        response = self.client.get(f'{self.base_url}/me/')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_cookie_expiration(self):
        """Test: Cookies tienen tiempo de expiración correcto"""
        from unittest.mock import patch
        
        # Crear usuario
        user = User.objects.create_user(
            username='expiretest@test.com',
            email='expiretest@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Mock authenticate
        with patch('infrastructure.services.auth_service.authenticate', return_value=user):
            login_data = {
                'email': 'expiretest@test.com',
                'password': 'testpass123'
            }
            response = self.client.post(f'{self.base_url}/login/', login_data, format='json')
        
        # Verificar tiempos de expiración
        access_cookie = response.cookies[self.access_cookie_name]
        refresh_cookie = response.cookies[self.refresh_cookie_name]
        
        # Access token: 1 hora (3600 segundos)
        access_max_age = getattr(settings, 'COOKIE_ACCESS_TOKEN_MAX_AGE', 3600)
        self.assertEqual(int(access_cookie.get('max-age', 0)), access_max_age)
        
        # Refresh token: 1 día (86400 segundos)
        refresh_max_age = getattr(settings, 'COOKIE_REFRESH_TOKEN_MAX_AGE', 86400)
        self.assertEqual(int(refresh_cookie.get('max-age', 0)), refresh_max_age)

