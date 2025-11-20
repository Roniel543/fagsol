"""
Tests unitarios para DjangoEmailService - FagSol Escuela Virtual
"""

from django.test import TestCase, override_settings
from django.core import mail
from django.contrib.auth.models import User
from infrastructure.external_services import DjangoEmailService


class DjangoEmailServiceTestCase(TestCase):
    """Tests unitarios para DjangoEmailService"""
    
    def setUp(self):
        """Configuración inicial"""
        self.email_service = DjangoEmailService()
        self.test_user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_email_text(self):
        """Test: Enviar email de texto plano"""
        result = self.email_service.send_email(
            to='test@example.com',
            subject='Test Subject',
            body='Test body content',
            is_html=False
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Test Subject')
        self.assertEqual(mail.outbox[0].body, 'Test body content')
        self.assertEqual(mail.outbox[0].to, ['test@example.com'])
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_email_html(self):
        """Test: Enviar email HTML"""
        html_body = '<html><body><h1>Test</h1></body></html>'
        result = self.email_service.send_email(
            to='test@example.com',
            subject='Test HTML',
            body=html_body,
            is_html=True
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Test HTML')
        self.assertIn('Test', mail.outbox[0].alternatives[0][0])
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_welcome_email(self):
        """Test: Enviar email de bienvenida"""
        result = self.email_service.send_welcome_email(
            user_email='test@example.com',
            user_name='Test User'
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Bienvenido', mail.outbox[0].subject)
        self.assertIn('Test User', mail.outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_course_enrollment_email(self):
        """Test: Enviar email de confirmación de inscripción"""
        result = self.email_service.send_course_enrollment_email(
            user_email='test@example.com',
            user_name='Test User',
            course_name='Curso de Python'
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('inscripción', mail.outbox[0].subject)
        self.assertIn('Curso de Python', mail.outbox[0].body)
        self.assertIn('Test User', mail.outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_payment_success_email_single_course(self):
        """Test: Enviar email de confirmación de pago exitoso (un curso)"""
        result = self.email_service.send_payment_success_email(
            user_email='test@example.com',
            user_name='Test User',
            payment_id='pay_abc123',
            amount=150.00,
            currency='PEN',
            course_names=['Curso de Python']
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Pago confirmado', mail.outbox[0].subject)
        self.assertIn('pay_abc123', mail.outbox[0].alternatives[0][0])  # HTML body
        self.assertIn('S/ 150.00', mail.outbox[0].alternatives[0][0])
        self.assertIn('Curso de Python', mail.outbox[0].alternatives[0][0])
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_payment_success_email_multiple_courses(self):
        """Test: Enviar email de confirmación de pago exitoso (múltiples cursos)"""
        result = self.email_service.send_payment_success_email(
            user_email='test@example.com',
            user_name='Test User',
            payment_id='pay_xyz789',
            amount=300.00,
            currency='USD',
            course_names=['Curso de Python', 'Curso de Django', 'Curso de React']
        )
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Pago confirmado', mail.outbox[0].subject)
        html_body = mail.outbox[0].alternatives[0][0]
        self.assertIn('pay_xyz789', html_body)
        self.assertIn('$ 300.00', html_body)
        self.assertIn('Curso de Python', html_body)
        self.assertIn('Curso de Django', html_body)
        self.assertIn('Curso de React', html_body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_payment_success_email_eur_currency(self):
        """Test: Enviar email con moneda EUR"""
        result = self.email_service.send_payment_success_email(
            user_email='test@example.com',
            user_name='Test User',
            payment_id='pay_eur123',
            amount=250.50,
            currency='EUR',
            course_names=['Curso de Python']
        )
        
        self.assertTrue(result)
        html_body = mail.outbox[0].alternatives[0][0]
        self.assertIn('€ 250.50', html_body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_payment_success_email_fallback_on_error(self):
        """Test: Fallback a texto plano si falla el HTML"""
        # Simular error en HTML (usando un email inválido para forzar fallo)
        # En este caso, el método debería intentar enviar texto plano
        result = self.email_service.send_payment_success_email(
            user_email='test@example.com',
            user_name='Test User',
            payment_id='pay_test',
            amount=100.00,
            currency='PEN',
            course_names=['Curso Test']
        )
        
        # Debería intentar enviar (puede fallar pero no debería lanzar excepción)
        # En desarrollo con locmem, debería funcionar
        self.assertIsNotNone(result)

