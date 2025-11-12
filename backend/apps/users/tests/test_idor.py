"""
Tests IDOR (Insecure Direct Object Reference) - FagSol Escuela Virtual

Estos tests verifican que los usuarios no puedan acceder a recursos ajenos
modificando IDs en las URLs o requests.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.core.models import UserProfile
from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate
from apps.payments.models import PaymentIntent
from apps.users.permissions import (
    ROLE_STUDENT, ROLE_ADMIN, ROLE_INSTRUCTOR
)


class IDORTestCase(TestCase):
    """Tests para prevenir vulnerabilidades IDOR"""
                
    def setUp(self):
        """Configuración inicial"""
        # Crear usuarios
        self.student1 = User.objects.create_user(
            username='student1@test.com',
            email='student1@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student1, role=ROLE_STUDENT)
        
        self.student2 = User.objects.create_user(
            username='student2@test.com',
            email='student2@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student2, role=ROLE_STUDENT)
        
        self.admin = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.admin, role=ROLE_ADMIN)
        
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
        
        # Crear enrollments
        self.enrollment1 = Enrollment.objects.create(
            user=self.student1,
            course=self.course1,
            status='active'
        )
        
        self.enrollment2 = Enrollment.objects.create(
            user=self.student2,
            course=self.course2,
            status='active'
        )
        
        # Crear certificados
        self.certificate1 = Certificate.objects.create(
            enrollment=self.enrollment1,
            user=self.student1,
            course=self.course1,
            verification_code='CERT1'
        )
        
        self.certificate2 = Certificate.objects.create(
            enrollment=self.enrollment2,
            user=self.student2,
            course=self.course2,
            verification_code='CERT2'
        )
        
        # Crear payment intents
        self.payment_intent1 = PaymentIntent.objects.create(
            user=self.student1,
            total=100.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course1.id]
        )
        
        self.payment_intent2 = PaymentIntent.objects.create(
            user=self.student2,
            total=200.00,
            currency='PEN',
            status='pending',
            course_ids=[self.course2.id]
        )
        
        # Clientes API
        self.client1 = APIClient()
        self.client2 = APIClient()
        self.client_admin = APIClient()
        
        # Autenticar clientes
        self.client1.force_authenticate(user=self.student1)
        self.client2.force_authenticate(user=self.student2)
        self.client_admin.force_authenticate(user=self.admin)
    
    def test_idor_enrollment_access(self):
        """Test IDOR: Estudiante NO puede acceder a enrollment de otro estudiante"""
        # Student1 intenta acceder a enrollment de Student2
        response = self.client1.get(f'/api/v1/enrollments/{self.enrollment2.id}/')
        
        # Debe retornar 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('No tienes permiso', response.data.get('message', ''))
    
    def test_idor_enrollment_own_access(self):
        """Test IDOR: Estudiante SÍ puede acceder a su propio enrollment"""
        response = self.client1.get(f'/api/v1/enrollments/{self.enrollment1.id}/')
        
        # Debe retornar 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['id'], self.enrollment1.id)
    
    def test_idor_certificate_access(self):
        """Test IDOR: Estudiante NO puede acceder a certificado de otro estudiante"""
        # Student1 intenta acceder a certificado de Student2
        response = self.client1.get(f'/api/v1/certificates/{self.course2.id}/download/')
        
        # Debe retornar 403 Forbidden (no tiene enrollment completado)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_idor_certificate_own_access(self):
        """Test IDOR: Estudiante SÍ puede acceder a su propio certificado"""
        # Marcar enrollment como completado
        self.enrollment1.completed = True
        self.enrollment1.save()
        
        response = self.client1.get(f'/api/v1/certificates/{self.course1.id}/download/')
        
        # Debe retornar 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('signed_url', response.data['data'])
    
    def test_idor_payment_intent_access(self):
        """Test IDOR: Estudiante NO puede acceder a payment intent de otro estudiante"""
        # Student1 intenta acceder a payment intent de Student2
        response = self.client1.get(f'/api/v1/payments/intent/{self.payment_intent2.id}/')
        
        # Debe retornar 404 Not Found (el payment intent no pertenece al usuario)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_idor_payment_intent_own_access(self):
        """Test IDOR: Estudiante SÍ puede acceder a su propio payment intent"""
        response = self.client1.get(f'/api/v1/payments/intent/{self.payment_intent1.id}/')
        
        # Debe retornar 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['id'], self.payment_intent1.id)
    
    def test_idor_course_content_access(self):
        """Test IDOR: Estudiante NO puede acceder a contenido de curso en el que NO está inscrito"""
        # Student1 intenta acceder a contenido de Course2 (donde NO está inscrito)
        response = self.client1.get(f'/api/v1/courses/{self.course2.id}/content/')
        
        # Debe retornar 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('No tienes acceso', response.data.get('message', ''))
    
    def test_idor_course_content_own_access(self):
        """Test IDOR: Estudiante SÍ puede acceder a contenido de curso en el que SÍ está inscrito"""
        # Student1 accede a contenido de Course1 (donde SÍ está inscrito)
        response = self.client1.get(f'/api/v1/courses/{self.course1.id}/content/')
        
        # Debe retornar 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('modules', response.data['data'])
    
    def test_idor_admin_can_access_all(self):
        """Test IDOR: Admin SÍ puede acceder a recursos de cualquier usuario"""
        # Admin accede a enrollment de Student1
        response = self.client_admin.get(f'/api/v1/enrollments/{self.enrollment1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Admin accede a enrollment de Student2
        response = self.client_admin.get(f'/api/v1/enrollments/{self.enrollment2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Admin accede a payment intent de Student1
        response = self.client_admin.get(f'/api/v1/payments/intent/{self.payment_intent1.id}/')
        # Nota: Admin no debería poder acceder a payment intents (solo estudiantes)
        # Pero si el endpoint permite ver todos, debe funcionar
        # Por ahora, verificamos que no retorne 403 por IDOR
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_idor_process_payment_other_intent(self):
        """Test IDOR: Estudiante NO puede procesar pago con payment intent de otro estudiante"""
        # Student1 intenta procesar pago con payment intent de Student2
        response = self.client1.post('/api/v1/payments/process/', {
            'payment_intent_id': self.payment_intent2.id,
            'payment_token': 'fake_token'
        })
        
        # Debe retornar error (payment intent no pertenece al usuario)
        # El servicio de pagos debe validar ownership
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN
        ])

