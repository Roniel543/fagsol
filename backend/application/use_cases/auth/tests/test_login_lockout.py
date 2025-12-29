"""
Tests para el flujo de bloqueo/desbloqueo de cuentas - LoginUseCase

Verifica:
- Bloqueo después de 5 intentos fallidos
- Desbloqueo automático después de 30 minutos (desarrollo) / 1 hora (producción)
- Contador de intentos progresivo
- Reset de contador al login exitoso
"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
from unittest.mock import patch, MagicMock
from axes.models import AccessAttempt
from application.use_cases.auth.login_use_case import LoginUseCase
from application.dtos.use_case_result import UseCaseResult
from apps.core.models import UserProfile

User = get_user_model()


class LoginLockoutTestCase(TestCase):
    """Tests para el flujo de bloqueo/desbloqueo de cuentas"""
    
    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            username='lockout@test.com',
            email='lockout@test.com',
            password='correctpass123'
        )
        UserProfile.objects.create(user=self.user, role='student')
        # Crear un request mock con META para AXES
        self.request = MagicMock()
        self.request.META = {'REMOTE_ADDR': '127.0.0.1'}
        self.use_case = LoginUseCase(request=self.request)
    
    def _create_failed_attempt(self, email: str, username: str, failures: int, user_agent: str = None):
        """Helper para crear o actualizar un AccessAttempt con fallos específicos"""
        username_for_attempt = username or email
        user_agent = user_agent or f'test-{failures}'  # Diferente user_agent para evitar conflicto de unicidad
        attempt, created = AccessAttempt.objects.get_or_create(
            username=username_for_attempt,
            ip_address='127.0.0.1',
            user_agent=user_agent,
            defaults={
                'failures_since_start': failures,
                'attempt_time': timezone.now()
            }
        )
        if not created:
            # Actualizar intento existente
            attempt.failures_since_start = failures
            attempt.attempt_time = timezone.now()
            attempt.save()
        return attempt
    
    def test_lockout_after_5_failed_attempts(self):
        """Test: Cuenta se bloquea después de 5 intentos fallidos"""
        email = 'lockout@test.com'
        
        # Crear un intento con 5 fallos (bloqueado)
        self._create_failed_attempt(email, self.user.username, 5)
        
        # Verificar que está bloqueado
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertTrue(lockout_info.get('is_locked'))
        self.assertEqual(lockout_info.get('failures'), 5)
        self.assertEqual(lockout_info.get('limit'), 5)
    
    def test_progressive_failure_counting(self):
        """Test: Contador de intentos fallidos es progresivo"""
        email = 'lockout@test.com'
        
        # Verificar progresión de intentos fallidos
        for failures in range(1, 6):
            # Limpiar intentos anteriores para cada iteración
            AccessAttempt.objects.filter(username__in=[email, self.user.username]).delete()
            
            # Crear intento con número específico de fallos
            self._create_failed_attempt(email, self.user.username, failures)
            
            # Verificar estado
            lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
            self.assertIsNotNone(lockout_info)
            
            if failures < 5:
                self.assertFalse(lockout_info.get('is_locked'))
                self.assertEqual(lockout_info.get('failures'), failures)
                self.assertEqual(lockout_info.get('remaining_attempts'), 5 - failures)
            else:
                # 5to intento - bloqueado
                self.assertTrue(lockout_info.get('is_locked'))
                self.assertEqual(lockout_info.get('failures'), 5)
    
    @override_settings(DEBUG=True, AXES_COOLOFF_TIME=0.5, AXES_FAILURE_LIMIT=5)
    def test_unlock_after_30_minutes_development(self):
        """Test: Desbloqueo automático después de 30 minutos en desarrollo"""
        email = 'lockout@test.com'
        
        # Crear intento con 5 fallos (bloqueado)
        attempt = self._create_failed_attempt(email, self.user.username, 5)
        
        # Verificar que está bloqueada
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertTrue(lockout_info.get('is_locked'))
        self.assertGreater(lockout_info.get('minutes_remaining', 0), 0)
        
        # Simular que pasaron 31 minutos (más que el cooloff de 30 min)
        # Retroceder el tiempo del intento
        old_attempt_time = attempt.attempt_time
        new_attempt_time = old_attempt_time - timedelta(minutes=31)
        attempt.attempt_time = new_attempt_time
        attempt.save()
        
        # Verificar que ya no está bloqueada
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertFalse(lockout_info.get('is_locked'))
        # Aún tiene 5 fallos, pero el bloqueo expiró
        self.assertEqual(lockout_info.get('failures'), 5)
    
    @override_settings(DEBUG=False, AXES_COOLOFF_TIME=1, AXES_FAILURE_LIMIT=5)
    def test_unlock_after_1_hour_production(self):
        """Test: Desbloqueo automático después de 1 hora en producción"""
        email = 'lockout@test.com'
        
        # Crear intento con 5 fallos (bloqueado)
        attempt = self._create_failed_attempt(email, self.user.username, 5)
        
        # Verificar que está bloqueada
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertTrue(lockout_info.get('is_locked'))
        
        # Simular que pasó 1 hora y 1 minuto
        old_attempt_time = attempt.attempt_time
        new_attempt_time = old_attempt_time - timedelta(hours=1, minutes=1)
        attempt.attempt_time = new_attempt_time
        attempt.save()
        
        # Verificar que ya no está bloqueada
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertFalse(lockout_info.get('is_locked'))
    
    def test_reset_counter_on_successful_login(self):
        """Test: Contador se resetea al hacer login exitoso"""
        email = 'lockout@test.com'
        correct_password = 'correctpass123'
        
        # Crear 3 intentos fallidos
        self._create_failed_attempt(email, self.user.username, 3)
        
        # Verificar que hay 3 fallos
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertEqual(lockout_info.get('failures'), 3)
        
        # Simular login exitoso - limpiar bloqueos
        from axes.utils import reset as axes_reset
        axes_reset(username=email)
        if self.user.username != email:
            axes_reset(username=self.user.username)
        
        # Verificar que el contador se reseteó
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        # Después del reset, no debería haber intentos
        self.assertIsNone(lockout_info)
    
    def test_lockout_message_includes_time_remaining(self):
        """Test: Mensaje de bloqueo incluye tiempo restante"""
        email = 'lockout@test.com'
        wrong_password = 'wrongpass'
        
        # Crear intento con 5 fallos (bloqueado)
        self._create_failed_attempt(email, self.user.username, 5)
        
        # Verificar que está bloqueada y tiene mensaje con tiempo
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertTrue(lockout_info.get('is_locked'))
        self.assertGreater(lockout_info.get('minutes_remaining', 0), 0)
        
        # Simular intento de login cuando está bloqueada
        with patch('django.contrib.auth.authenticate', return_value=None):
            result = self.use_case.execute(email, wrong_password)
            self.assertFalse(result.success)
            self.assertIn('bloqueada temporalmente', result.error_message)
            self.assertIn('minuto', result.error_message.lower())
    
    def test_correct_password_bypasses_lockout(self):
        """Test: Contraseña correcta permite login incluso si hay bloqueo"""
        email = 'lockout@test.com'
        correct_password = 'correctpass123'
        
        # Crear intento con 5 fallos (bloqueado)
        self._create_failed_attempt(email, self.user.username, 5)
        
        # Verificar que está bloqueada
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        self.assertIsNotNone(lockout_info)
        self.assertTrue(lockout_info.get('is_locked'))
        
        # Intentar login con contraseña correcta
        # Debe funcionar porque verificamos la contraseña antes del bloqueo
        with patch('django.contrib.auth.authenticate', return_value=self.user):
            result = self.use_case.execute(email, correct_password)
            # Debe ser exitoso porque la contraseña es correcta
            self.assertTrue(result.success)
    
    def test_lockout_info_structure(self):
        """Test: Estructura de lockout_info es correcta"""
        email = 'lockout@test.com'
        
        # Crear intento con 5 fallos (bloqueado)
        self._create_failed_attempt(email, self.user.username, 5)
        
        lockout_info = self.use_case._check_axes_lockout(email, self.user.username)
        
        # Verificar estructura
        self.assertIsNotNone(lockout_info)
        self.assertIn('is_locked', lockout_info)
        self.assertIn('failures', lockout_info)
        self.assertIn('limit', lockout_info)
        self.assertIn('minutes_remaining', lockout_info)
        self.assertIn('unlock_time', lockout_info)
        self.assertFalse(lockout_info.get('is_permanent'))
        
        # Verificar valores
        self.assertTrue(lockout_info['is_locked'])
        self.assertEqual(lockout_info['failures'], 5)
        self.assertEqual(lockout_info['limit'], 5)
        self.assertGreater(lockout_info['minutes_remaining'], 0)
        self.assertIsInstance(lockout_info['unlock_time'], datetime)

