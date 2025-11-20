"""
Tests unitarios para integración de email en PaymentService - FagSol Escuela Virtual
"""

from django.test import TestCase, override_settings
from django.core import mail
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
from apps.core.models import UserProfile
from apps.courses.models import Course
from apps.payments.models import PaymentIntent, Payment
from apps.users.permissions import ROLE_STUDENT
from infrastructure.services.payment_service import PaymentService
from decimal import Decimal


class PaymentServiceEmailTestCase(TestCase):
    """Tests para verificar que PaymentService envía emails correctamente"""
    
    def setUp(self):
        """Configuración inicial"""
        # No crear PaymentService aquí, se creará en cada test después de mockear
        
        # Crear usuario estudiante
        self.student = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Student'
        )
        UserProfile.objects.create(user=self.student, role=ROLE_STUDENT)
        
        # Crear curso
        self.course = Course.objects.create(
            id='course-1',
            title='Curso de Python',
            slug='curso-python',
            description='Descripción del curso',
            price=Decimal('100.00'),
            currency='PEN',
            status='published',
            is_active=True
        )
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    @override_settings(MERCADOPAGO_ACCESS_TOKEN='test_token')
    @patch('infrastructure.services.payment_service.mercadopago')
    def test_process_payment_sends_email_on_approval(self, mock_mercadopago_module):
        """Test: Se envía email cuando el pago es aprobado"""
        # Mock de SDK de Mercado Pago
        mock_sdk = MagicMock()
        mock_mercadopago_module.SDK.return_value = mock_sdk
        
        # Mock de respuesta aprobada - estructura correcta del SDK
        mock_payment_response = {
            'status': 201,
            'response': {
                'id': 'mp_payment_123',
                'status': 'approved',
                'status_detail': 'accredited'
            }
        }
        
        # Configurar el mock correctamente: mp.payment().create() retorna el dict
        # El SDK hace: mp.payment().create(data)
        mock_payment_instance = MagicMock()
        mock_payment_instance.create.return_value = mock_payment_response
        # payment() debe retornar un objeto que tiene create()
        mock_sdk.payment = MagicMock(return_value=mock_payment_instance)
        
        # Crear PaymentService DESPUÉS de configurar el mock
        payment_service = PaymentService()
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=Decimal('100.00'),
            currency='PEN',
            status='pending',
            course_ids=[self.course.id]
        )
        
        # Procesar pago
        success, payment, error_message = payment_service.process_payment(
            user=self.student,
            payment_intent_id=payment_intent.id,
            payment_token='test_token_123',
            payment_method_id='visa',
            installments=1,
            amount=Decimal('100.00'),
            idempotency_key='test_key_123'
        )
        
        # Verificar que el pago fue exitoso
        self.assertTrue(success)
        self.assertIsNotNone(payment)
        self.assertEqual(payment.status, 'approved')
        
        # Verificar que se envió el email
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('Pago confirmado', email.subject)
        self.assertIn('student@test.com', email.to)
        
        # Verificar contenido del email HTML
        html_body = email.alternatives[0][0]
        self.assertIn('pay_', html_body)  # ID del pago
        self.assertIn('S/ 100.00', html_body)  # Monto
        self.assertIn('Curso de Python', html_body)  # Nombre del curso
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    @override_settings(MERCADOPAGO_ACCESS_TOKEN='test_token')
    @patch('infrastructure.services.payment_service.mercadopago')
    def test_process_payment_no_email_on_rejection(self, mock_mercadopago_module):
        """Test: NO se envía email cuando el pago es rechazado"""
        # Mock de SDK de Mercado Pago
        mock_sdk = MagicMock()
        mock_mercadopago_module.SDK.return_value = mock_sdk
        
        # Mock de respuesta rechazada
        mock_payment_response = {
            'status': 201,
            'response': {
                'id': 'mp_payment_123',
                'status': 'rejected',
                'status_detail': 'cc_rejected_other_reason'
            }
        }
        
        # Configurar el mock correctamente
        mock_payment_instance = MagicMock()
        mock_payment_instance.create.return_value = mock_payment_response
        mock_sdk.payment = MagicMock(return_value=mock_payment_instance)
        
        # Crear PaymentService DESPUÉS de configurar el mock
        payment_service = PaymentService()
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=Decimal('100.00'),
            currency='PEN',
            status='pending',
            course_ids=[self.course.id]
        )
        
        # Procesar pago
        success, payment, error_message = payment_service.process_payment(
            user=self.student,
            payment_intent_id=payment_intent.id,
            payment_token='test_token_123',
            payment_method_id='visa',
            installments=1,
            amount=Decimal('100.00'),
            idempotency_key='test_key_123'
        )
        
        # Verificar que el pago fue rechazado
        self.assertFalse(success)
        self.assertIsNotNone(payment)
        self.assertEqual(payment.status, 'rejected')
        
        # Verificar que NO se envió email
        self.assertEqual(len(mail.outbox), 0)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    @override_settings(MERCADOPAGO_ACCESS_TOKEN='test_token')
    @patch('infrastructure.services.payment_service.mercadopago')
    def test_process_payment_email_multiple_courses(self, mock_mercadopago_module):
        """Test: Email incluye todos los cursos comprados"""
        # Crear segundo curso
        course2 = Course.objects.create(
            id='course-2',
            title='Curso de Django',
            slug='curso-django',
            description='Descripción',
            price=Decimal('200.00'),
            currency='PEN',
            status='published',
            is_active=True
        )
        
        # Mock de SDK de Mercado Pago
        mock_sdk = MagicMock()
        mock_mercadopago_module.SDK.return_value = mock_sdk
        
        mock_payment_response = {
            'status': 201,
            'response': {
                'id': 'mp_payment_123',
                'status': 'approved',
                'status_detail': 'accredited'
            }
        }
        
        # Configurar el mock correctamente
        mock_payment_instance = MagicMock()
        mock_payment_instance.create.return_value = mock_payment_response
        mock_sdk.payment = MagicMock(return_value=mock_payment_instance)
        
        # Crear PaymentService DESPUÉS de configurar el mock
        payment_service = PaymentService()
        
        # Crear payment intent con múltiples cursos
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=Decimal('300.00'),
            currency='PEN',
            status='pending',
            course_ids=[self.course.id, course2.id]
        )
        
        # Procesar pago
        success, payment, error_message = payment_service.process_payment(
            user=self.student,
            payment_intent_id=payment_intent.id,
            payment_token='test_token_123',
            payment_method_id='visa',
            installments=1,
            amount=Decimal('300.00'),
            idempotency_key='test_key_123'
        )
        
        # Verificar email
        self.assertEqual(len(mail.outbox), 1)
        html_body = mail.outbox[0].alternatives[0][0]
        self.assertIn('Curso de Python', html_body)
        self.assertIn('Curso de Django', html_body)
        self.assertIn('S/ 300.00', html_body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    @override_settings(MERCADOPAGO_ACCESS_TOKEN='test_token')
    @patch('infrastructure.services.payment_service.mercadopago')
    @patch('infrastructure.external_services.DjangoEmailService.send_payment_success_email')
    def test_process_payment_email_error_does_not_fail_payment(self, mock_send_email, mock_mercadopago_module):
        """Test: Si el email falla, el pago aún se procesa correctamente"""
        # Mock de SDK de Mercado Pago
        mock_sdk = MagicMock()
        mock_mercadopago_module.SDK.return_value = mock_sdk
        
        mock_payment_response = {
            'status': 201,
            'response': {
                'id': 'mp_payment_123',
                'status': 'approved',
                'status_detail': 'accredited'
            }
        }
        
        # Configurar el mock correctamente
        mock_payment_instance = MagicMock()
        mock_payment_instance.create.return_value = mock_payment_response
        mock_sdk.payment = MagicMock(return_value=mock_payment_instance)
        
        # Simular error al enviar email
        mock_send_email.return_value = False
        
        # Crear PaymentService DESPUÉS de configurar el mock
        payment_service = PaymentService()
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=Decimal('100.00'),
            currency='PEN',
            status='pending',
            course_ids=[self.course.id]
        )
        
        # Procesar pago
        success, payment, error_message = payment_service.process_payment(
            user=self.student,
            payment_intent_id=payment_intent.id,
            payment_token='test_token_123',
            payment_method_id='visa',
            installments=1,
            amount=Decimal('100.00'),
            idempotency_key='test_key_123'
        )
        
        # El pago debe ser exitoso aunque el email falle
        self.assertTrue(success)
        self.assertIsNotNone(payment)
        self.assertEqual(payment.status, 'approved')

