"""
Tests unitarios para PasswordResetService - FagSol Escuela Virtual
"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from infrastructure.services.password_reset_service import PasswordResetService

User = get_user_model()


class PasswordResetServiceTestCase(TestCase):
    """Tests unitarios para PasswordResetService"""
    
    def setUp(self):
        """Configuración inicial"""
        self.service = PasswordResetService()
        self.test_user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='oldpassword123',
            first_name='Test',
            last_name='User'
        )
        # Limpiar cache antes de cada test
        cache.clear()
    
    def tearDown(self):
        """Limpieza después de cada test"""
        cache.clear()
    
    def test_request_password_reset_user_exists(self):
        """Test: Solicitar reset para usuario existente"""
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        self.assertTrue(success)
        self.assertIsNotNone(data)
        self.assertIn('uid', data)
        self.assertIn('token', data)
        self.assertIn('reset_url', data)
        self.assertEqual(data['user'], self.test_user)
        self.assertIn('http://localhost:3000/auth/reset-password/', data['reset_url'])
    
    def test_request_password_reset_user_not_exists(self):
        """Test: Solicitar reset para usuario no existente (no revela información)"""
        success, message, data = self.service.request_password_reset(
            email='nonexistent@example.com',
            frontend_url='http://localhost:3000'
        )
        
        # Por seguridad, siempre retorna éxito
        self.assertTrue(success)
        # Pero no hay datos (usuario no existe)
        self.assertIsNone(data)
    
    def test_request_password_reset_invalid_email(self):
        """Test: Solicitar reset con email inválido"""
        success, message, data = self.service.request_password_reset(
            email='invalid-email',
            frontend_url='http://localhost:3000'
        )
        
        self.assertFalse(success)
        self.assertIn('inválido', message.lower())
    
    def test_rate_limiting(self):
        """Test: Rate limiting funciona correctamente"""
        email = 'test@example.com'
        
        # Hacer 3 solicitudes (límite por defecto)
        for i in range(3):
            success, message, data = self.service.request_password_reset(
                email=email,
                frontend_url='http://localhost:3000'
            )
            self.assertTrue(success)
        
        # La 4ta solicitud debe ser bloqueada
        success, message, data = self.service.request_password_reset(
            email=email,
            frontend_url='http://localhost:3000'
        )
        
        # Por seguridad, retorna éxito pero sin datos
        self.assertTrue(success)
        self.assertIsNone(data)
    
    def test_validate_token_valid(self):
        """Test: Validar token válido"""
        # Generar token
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        self.assertTrue(success)
        self.assertIsNotNone(data)
        
        uid = data['uid']
        token = data['token']
        
        # Validar token
        is_valid, user, error = self.service.validate_token(uid, token)
        
        self.assertTrue(is_valid)
        self.assertIsNotNone(user)
        self.assertEqual(user, self.test_user)
        self.assertIsNone(error)
    
    def test_validate_token_invalid_uid(self):
        """Test: Validar token con UID inválido"""
        # Generar token válido
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        token = data['token']
        invalid_uid = 'invalid_uid'
        
        # Validar con UID inválido
        is_valid, user, error = self.service.validate_token(invalid_uid, token)
        
        self.assertFalse(is_valid)
        self.assertIsNone(user)
        self.assertIsNotNone(error)
    
    def test_validate_token_invalid_token(self):
        """Test: Validar token inválido"""
        # Generar token válido
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        uid = data['uid']
        invalid_token = 'invalid_token'
        
        # Validar con token inválido
        is_valid, user, error = self.service.validate_token(uid, invalid_token)
        
        self.assertFalse(is_valid)
        self.assertIsNone(user)
        self.assertIsNotNone(error)
    
    def test_reset_password_success(self):
        """Test: Restablecer contraseña exitosamente"""
        # Generar token
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        uid = data['uid']
        token = data['token']
        new_password = 'newpassword123'
        
        # Resetear contraseña
        success, message, user = self.service.reset_password(uid, token, new_password)
        
        self.assertTrue(success)
        self.assertIsNotNone(user)
        self.assertEqual(user, self.test_user)
        
        # Verificar que la contraseña cambió
        user.refresh_from_db()
        self.assertTrue(user.check_password(new_password))
        self.assertFalse(user.check_password('oldpassword123'))
    
    def test_reset_password_invalid_token(self):
        """Test: Intentar resetear con token inválido"""
        # Generar token válido
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        uid = data['uid']
        invalid_token = 'invalid_token'
        new_password = 'newpassword123'
        
        # Intentar resetear con token inválido
        success, message, user = self.service.reset_password(uid, invalid_token, new_password)
        
        self.assertFalse(success)
        self.assertIsNone(user)
        self.assertIn('inválido', message.lower() or '')
    
    def test_reset_password_short_password(self):
        """Test: Intentar resetear con contraseña muy corta"""
        # Generar token
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        uid = data['uid']
        token = data['token']
        short_password = 'short'  # Menos de 8 caracteres
        
        # Intentar resetear con contraseña corta
        success, message, user = self.service.reset_password(uid, token, short_password)
        
        self.assertFalse(success)
        self.assertIsNone(user)
        self.assertIn('8 caracteres', message)
    
    def test_reset_password_token_invalidated_after_use(self):
        """Test: Token se invalida después de usar"""
        # Generar token
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        uid = data['uid']
        token = data['token']
        new_password = 'newpassword123'
        
        # Resetear contraseña (primer uso)
        success, message, user = self.service.reset_password(uid, token, new_password)
        self.assertTrue(success)
        
        # Intentar usar el mismo token de nuevo (debe fallar)
        # Nota: Django PasswordResetTokenGenerator invalida automáticamente
        # cuando cambia la contraseña porque el hash de la contraseña cambia
        success2, message2, user2 = self.service.reset_password(uid, token, 'anotherpassword123')
        
        self.assertFalse(success2)
        self.assertIsNone(user2)
    
    def test_reset_password_inactive_user(self):
        """Test: No se puede resetear contraseña para usuario inactivo"""
        # Desactivar usuario
        self.test_user.is_active = False
        self.test_user.save()
        
        # Intentar generar token
        success, message, data = self.service.request_password_reset(
            email='test@example.com',
            frontend_url='http://localhost:3000'
        )
        
        # Por seguridad, retorna éxito pero sin datos
        self.assertTrue(success)
        self.assertIsNone(data)

