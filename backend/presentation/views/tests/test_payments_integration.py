"""
Tests de Integración para Endpoints de Pagos - FagSol Escuela Virtual

Estos tests verifican los flujos completos de pagos:
- Creación de payment intents
- Procesamiento de pagos
- Verificación de ownership
- Validación de roles
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from apps.core.models import UserProfile
from apps.courses.models import Course
from apps.payments.models import PaymentIntent, Payment
from apps.users.models import Enrollment
from apps.users.permissions import ROLE_STUDENT, ROLE_ADMIN, ROLE_INSTRUCTOR


class PaymentsIntegrationTestCase(TestCase):
    """Tests de integración para endpoints de pagos"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        self.base_url = '/api/v1/payments'
        
        # Crear usuarios
        self.student = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student, role=ROLE_STUDENT)
        
        self.admin = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.admin, role=ROLE_ADMIN)
        
        self.instructor = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.instructor, role=ROLE_INSTRUCTOR)
        
        # Crear cursos
        self.course1 = Course.objects.create(
            id='course-1',
            title='Curso 1',
            slug='curso-1',
            description='Descripción',
            price=100.00,
            currency='PEN',
            status='published',
            is_active=True
        )
        
        self.course2 = Course.objects.create(
            id='course-2',
            title='Curso 2',
            slug='curso-2',
            description='Descripción',
            price=200.00,
            currency='PEN',
            status='published',
            is_active=True
        )
    
    def test_create_payment_intent_success(self):
        """Test: Estudiante puede crear payment intent exitosamente"""
        self.client.force_authenticate(user=self.student)
        
        data = {
            'course_ids': [self.course1.id, self.course2.id]
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertIn('id', response.data['data'])
        self.assertEqual(float(response.data['data']['total']), 300.00)  # 100 + 200
        self.assertEqual(response.data['data']['currency'], 'PEN')
        self.assertEqual(len(response.data['data']['items']), 2)
        self.assertEqual(response.data['data']['status'], 'pending')
        
        # Verificar que se creó en la BD
        payment_intent = PaymentIntent.objects.get(id=response.data['data']['id'])
        self.assertEqual(payment_intent.user, self.student)
        self.assertEqual(payment_intent.total, 300.00)
    
    def test_create_payment_intent_admin_forbidden(self):
        """Test: Admin NO puede crear payment intent"""
        self.client.force_authenticate(user=self.admin)
        
        data = {
            'course_ids': [self.course1.id]
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Debe retornar 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Solo los estudiantes', response.data['message'])
    
    def test_create_payment_intent_instructor_forbidden(self):
        """Test: Instructor NO puede crear payment intent"""
        self.client.force_authenticate(user=self.instructor)
        
        data = {
            'course_ids': [self.course1.id]
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Debe retornar 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_payment_intent_unauthenticated(self):
        """Test: Crear payment intent requiere autenticación"""
        data = {
            'course_ids': [self.course1.id]
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_payment_intent_empty_courses(self):
        """Test: No se puede crear payment intent sin cursos"""
        self.client.force_authenticate(user=self.student)
        
        data = {
            'course_ids': []
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # El mensaje puede ser "Debe incluir al menos un curso" o "course_ids es requerido y debe ser una lista"
        self.assertIn(response.data.get('message', ''), [
            'Debe incluir al menos un curso',
            'course_ids es requerido y debe ser una lista'
        ])
    
    def test_create_payment_intent_invalid_course(self):
        """Test: No se puede crear payment intent con curso inexistente"""
        self.client.force_authenticate(user=self.student)
        
        data = {
            'course_ids': ['nonexistent-course']
        }
        
        response = self.client.post(f'{self.base_url}/intent/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_payment_intent_success(self):
        """Test: Obtener payment intent propio"""
        self.client.force_authenticate(user=self.student)
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        response = self.client.get(f'{self.base_url}/intent/{payment_intent.id}/')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['id'], payment_intent.id)
        self.assertEqual(float(response.data['data']['total']), 100.00)
    
    def test_get_payment_intent_other_user(self):
        """Test: NO se puede obtener payment intent de otro usuario (IDOR)"""
        # Crear otro estudiante
        other_student = User.objects.create_user(
            username='other@test.com',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role=ROLE_STUDENT)
        
        # Crear payment intent del otro estudiante
        payment_intent = PaymentIntent.objects.create(
            user=other_student,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        # Intentar acceder con student1
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'{self.base_url}/intent/{payment_intent.id}/')
        
        # Debe retornar 404 (no encontrado para este usuario)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    @patch('infrastructure.services.payment_service.mercadopago')
    def test_process_payment_success(self, mock_mercadopago_module):
        """Test: Procesar pago exitosamente"""
        # Mock de SDK de Mercado Pago
        mock_sdk = MagicMock()
        mock_mercadopago_module.SDK.return_value = mock_sdk
        
        # Mock de respuesta de Mercado Pago con estructura correcta
        mock_payment_response = {
            'status': 201,
            'response': {
                'id': 'mp_payment_123',
                'status': 'approved',
                'status_detail': 'accredited'
            }
        }
        mock_sdk.payment.return_value.create.return_value = mock_payment_response
        
        self.client.force_authenticate(user=self.student)
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        data = {
            'payment_intent_id': payment_intent.id,
            'payment_token': 'test_token_123'
        }
        
        response = self.client.post(f'{self.base_url}/process/', data, format='json')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('payment_id', response.data['data'])
        self.assertEqual(response.data['data']['status'], 'approved')
        self.assertIn('enrollment_ids', response.data['data'])
        
        # Verificar que se creó el payment
        payment = Payment.objects.get(id=response.data['data']['payment_id'])
        self.assertEqual(payment.user, self.student)
        self.assertEqual(payment.status, 'approved')
        
        # Verificar que se creó el enrollment
        enrollment = Enrollment.objects.get(user=self.student, course=self.course1)
        self.assertEqual(enrollment.status, 'active')
        self.assertEqual(enrollment.payment, payment)
    
    def test_process_payment_admin_forbidden(self):
        """Test: Admin NO puede procesar pagos"""
        self.client.force_authenticate(user=self.admin)
        
        # Crear payment intent
        payment_intent = PaymentIntent.objects.create(
            user=self.student,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        data = {
            'payment_intent_id': payment_intent.id,
            'payment_token': 'test_token'
        }
        
        response = self.client.post(f'{self.base_url}/process/', data, format='json')
        
        # Debe retornar 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Solo los estudiantes', response.data['message'])
    
    def test_process_payment_other_user_intent(self):
        """Test: NO se puede procesar pago con payment intent de otro usuario (IDOR)"""
        # Crear otro estudiante
        other_student = User.objects.create_user(
            username='other@test.com',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role=ROLE_STUDENT)
        
        # Crear payment intent del otro estudiante
        payment_intent = PaymentIntent.objects.create(
            user=other_student,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        # Intentar procesar con student1
        self.client.force_authenticate(user=self.student)
        data = {
            'payment_intent_id': payment_intent.id,
            'payment_token': 'test_token'
        }
        
        response = self.client.post(f'{self.base_url}/process/', data, format='json')
        
        # Debe retornar error (el servicio debe validar ownership)
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN
        ])
    
    def test_process_payment_missing_fields(self):
        """Test: Procesar pago falla si faltan campos"""
        self.client.force_authenticate(user=self.student)
        
        data = {
            # Faltan payment_intent_id y payment_token
        }
        
        response = self.client.post(f'{self.base_url}/process/', data, format='json')
        
        # Debe retornar error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('requeridos', response.data['message'])

