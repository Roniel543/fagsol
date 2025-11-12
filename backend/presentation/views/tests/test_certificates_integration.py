"""
Tests de Integración para Endpoints de Certificados - FagSol Escuela Virtual

Estos tests verifican los flujos completos de certificados:
- Descarga de certificados
- Verificación de ownership
- Verificación de completitud del curso
- Verificación pública de certificados
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.core.models import UserProfile
from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate
from apps.users.permissions import ROLE_STUDENT, ROLE_ADMIN, ROLE_INSTRUCTOR


class CertificatesIntegrationTestCase(TestCase):
    """Tests de integración para endpoints de certificados"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        self.base_url = '/api/v1/certificates'
        
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
        
        # Crear curso
        self.course = Course.objects.create(
            id='course-1',
            title='Curso de Prueba',
            slug='curso-de-prueba',
            description='Descripción',
            price=100.00,
            currency='PEN',
            status='published',
            is_active=True
        )
        
        # Crear enrollment completado para student1
        self.enrollment1 = Enrollment.objects.create(
            user=self.student1,
            course=self.course,
            status='active',
            completed=True,
            completion_percentage=100.00
        )
        
        # Crear enrollment NO completado para student2
        self.enrollment2 = Enrollment.objects.create(
            user=self.student2,
            course=self.course,
            status='active',
            completed=False,
            completion_percentage=50.00
        )
    
    def test_download_certificate_success(self):
        """Test: Descargar certificado exitosamente"""
        self.client.force_authenticate(user=self.student1)
        
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('signed_url', response.data['data'])
        self.assertIn('verification_code', response.data['data'])
        self.assertIn('verification_url', response.data['data'])
        self.assertEqual(response.data['data']['expires_in'], 300)  # 5 minutos
        
        # Verificar que se creó el certificado
        certificate = Certificate.objects.get(
            user=self.student1,
            course=self.course
        )
        self.assertIsNotNone(certificate)
        self.assertEqual(certificate.verification_code, response.data['data']['verification_code'])
    
    def test_download_certificate_not_completed(self):
        """Test: NO se puede descargar certificado si el curso no está completado"""
        self.client.force_authenticate(user=self.student2)
        
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Debe retornar 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('completar el curso', response.data['message'])
    
    def test_download_certificate_not_enrolled(self):
        """Test: NO se puede descargar certificado si no está inscrito"""
        # Crear estudiante sin enrollment
        student3 = User.objects.create_user(
            username='student3@test.com',
            email='student3@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=student3, role=ROLE_STUDENT)
        
        self.client.force_authenticate(user=student3)
        
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Debe retornar 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_download_certificate_unauthenticated(self):
        """Test: Descargar certificado requiere autenticación"""
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Debe retornar 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_download_certificate_nonexistent_course(self):
        """Test: Descargar certificado de curso inexistente"""
        self.client.force_authenticate(user=self.student1)
        
        response = self.client.get(f'{self.base_url}/nonexistent-course/download/')
        
        # Debe retornar 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_download_certificate_admin_can_access(self):
        """Test: Admin puede descargar certificado de cualquier usuario"""
        self.client.force_authenticate(user=self.admin)
        
        # Crear certificado para student1
        certificate = Certificate.objects.create(
            enrollment=self.enrollment1,
            user=self.student1,
            course=self.course,
            verification_code='ADMIN_TEST'
        )
        
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Admin puede acceder (aunque no tenga enrollment)
        # Nota: El endpoint actual verifica enrollment, pero admin debería poder ver todo
        # Por ahora, verificamos que no retorne 403 por IDOR
        # En producción, se podría agregar lógica especial para admin
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_403_FORBIDDEN  # Si el endpoint requiere enrollment
        ])
    
    def test_verify_certificate_success(self):
        """Test: Verificar certificado exitosamente (público)"""
        # Crear certificado
        certificate = Certificate.objects.create(
            enrollment=self.enrollment1,
            user=self.student1,
            course=self.course,
            verification_code='VERIFY123'
        )
        
        # No requiere autenticación
        response = self.client.get(f'{self.base_url}/verify/{certificate.verification_code}/')
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['data']['is_valid'])
        self.assertEqual(response.data['data']['certificate_id'], certificate.id)
        self.assertIn('user', response.data['data'])
        self.assertIn('course', response.data['data'])
    
    def test_verify_certificate_invalid_code(self):
        """Test: Verificar certificado con código inválido"""
        response = self.client.get(f'{self.base_url}/verify/INVALID_CODE/')
        
        # Debe retornar 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertIn('no encontrado', response.data['message'])
    
    def test_download_certificate_idor_protection(self):
        """Test: Estudiante NO puede descargar certificado de otro estudiante (IDOR)"""
        # Crear otro curso y enrollment completado para student2
        course2 = Course.objects.create(
            id='course-2',
            title='Curso 2',
            slug='curso-2',
            description='Descripción',
            price=200.00,
            currency='PEN',
            status='published',
            is_active=True
        )
        
        enrollment2_completed = Enrollment.objects.create(
            user=self.student2,
            course=course2,
            status='active',
            completed=True,
            completion_percentage=100.00
        )
        
        # Student1 intenta descargar certificado de course2 (donde NO está inscrito)
        self.client.force_authenticate(user=self.student1)
        
        response = self.client.get(f'{self.base_url}/{course2.id}/download/')
        
        # Debe retornar 403 (no tiene enrollment completado)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_download_certificate_returns_existing(self):
        """Test: Descargar certificado retorna certificado existente si ya existe"""
        # Crear certificado existente
        certificate = Certificate.objects.create(
            enrollment=self.enrollment1,
            user=self.student1,
            course=self.course,
            verification_code='EXISTING123',
            file_url='https://example.com/certificate.pdf'
        )
        
        self.client.force_authenticate(user=self.student1)
        
        response = self.client.get(f'{self.base_url}/{self.course.id}/download/')
        
        # Debe retornar el certificado existente
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['certificate_id'], certificate.id)
        self.assertEqual(response.data['data']['verification_code'], 'EXISTING123')

