"""
Tests de integración para endpoints de aprobación de cursos
FASE 2: Sistema de aprobación de cursos
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import Course
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT
from decimal import Decimal


class CourseApprovalIntegrationTestCase(TestCase):
    """Tests de integración para endpoints de aprobación de cursos"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        
        # Crear admin
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123'
        )
        admin_profile = UserProfile.objects.create(
            user=self.admin_user,
            role=ROLE_ADMIN,
            instructor_status='approved'
        )
        
        # Crear instructor aprobado
        self.instructor_user = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123'
        )
        instructor_profile = UserProfile.objects.create(
            user=self.instructor_user,
            role=ROLE_INSTRUCTOR,
            instructor_status='approved'
        )
        
        # Crear estudiante
        self.student_user = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123'
        )
        student_profile = UserProfile.objects.create(
            user=self.student_user,
            role=ROLE_STUDENT
        )
        
        # Crear curso en draft
        self.draft_course = Course.objects.create(
            id='c-001',
            title='Curso Draft',
            slug='curso-draft',
            description='Descripción del curso',
            price=Decimal('100.00'),
            status='draft',
            created_by=self.instructor_user
        )
        
        # Crear curso pendiente de revisión
        self.pending_course = Course.objects.create(
            id='c-002',
            title='Curso Pendiente',
            slug='curso-pendiente',
            description='Descripción del curso',
            price=Decimal('100.00'),
            status='pending_review',
            created_by=self.instructor_user
        )
        
        # Crear curso que requiere cambios
        self.needs_revision_course = Course.objects.create(
            id='c-003',
            title='Curso Necesita Cambios',
            slug='curso-necesita-cambios',
            description='Descripción del curso',
            price=Decimal('100.00'),
            status='needs_revision',
            created_by=self.instructor_user
        )
    
    def _get_auth_token(self, user):
        """Obtiene token JWT para un usuario"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    # ========== TESTS DE SOLICITAR REVISIÓN (INSTRUCTOR) ==========
    
    def test_request_review_success(self):
        """Test: Instructor puede solicitar revisión de curso"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.draft_course.id}/request-review/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['course']['status'], 'pending_review')
        
        # Verificar que el curso cambió de estado
        self.draft_course.refresh_from_db()
        self.assertEqual(self.draft_course.status, 'pending_review')
    
    def test_request_review_unauthorized(self):
        """Test: No instructor no puede solicitar revisión"""
        token = self._get_auth_token(self.student_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.draft_course.id}/request-review/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_request_review_unauthenticated(self):
        """Test: Usuario no autenticado no puede solicitar revisión"""
        url = f'/api/v1/courses/{self.draft_course.id}/request-review/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_request_review_course_not_found(self):
        """Test: Error si curso no existe"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/courses/c-999/request-review/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_request_review_course_already_pending(self):
        """Test: Error si curso ya está pendiente"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.pending_course.id}/request-review/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    # ========== TESTS DE LISTAR CURSOS PENDIENTES (ADMIN) ==========
    
    def test_list_pending_courses_success(self):
        """Test: Admin puede listar cursos pendientes"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/pending/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['id'], 'c-002')
    
    def test_list_pending_courses_unauthorized(self):
        """Test: No admin no puede listar cursos pendientes"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/pending/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_pending_courses_unauthenticated(self):
        """Test: Usuario no autenticado no puede listar"""
        url = '/api/v1/admin/courses/pending/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ========== TESTS DE LISTAR TODOS LOS CURSOS (ADMIN) ==========
    
    def test_list_all_courses_success(self):
        """Test: Admin puede listar todos los cursos"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['count'], 3)
    
    def test_list_all_courses_with_filter(self):
        """Test: Admin puede filtrar cursos por estado"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/?status=pending_review'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['status'], 'pending_review')
    
    # ========== TESTS DE APROBAR CURSO (ADMIN) ==========
    
    def test_approve_course_success(self):
        """Test: Admin puede aprobar curso pendiente"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/admin/courses/{self.pending_course.id}/approve/'
        response = self.client.post(url, {'notes': 'Curso aprobado correctamente'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['course']['status'], 'published')
        
        # Verificar que el curso cambió de estado
        self.pending_course.refresh_from_db()
        self.assertEqual(self.pending_course.status, 'published')
        self.assertEqual(self.pending_course.reviewed_by, self.admin_user)
    
    def test_approve_course_unauthorized(self):
        """Test: No admin no puede aprobar"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/admin/courses/{self.pending_course.id}/approve/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_approve_course_not_found(self):
        """Test: Error si curso no existe"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/c-999/approve/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_approve_course_with_notes(self):
        """Test: Aprobar curso con notas opcionales"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/admin/courses/{self.pending_course.id}/approve/'
        response = self.client.post(url, {'notes': 'Excelente contenido'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pending_course.refresh_from_db()
        self.assertIsNotNone(self.pending_course.review_comments)
    
    # ========== TESTS DE RECHAZAR CURSO (ADMIN) ==========
    
    def test_reject_course_success(self):
        """Test: Admin puede rechazar curso pendiente"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        rejection_reason = 'El contenido no cumple con los estándares de calidad'
        url = f'/api/v1/admin/courses/{self.pending_course.id}/reject/'
        response = self.client.post(url, {'rejection_reason': rejection_reason})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['course']['status'], 'needs_revision')
        
        # Verificar que el curso cambió de estado
        self.pending_course.refresh_from_db()
        self.assertEqual(self.pending_course.status, 'needs_revision')
        self.assertEqual(self.pending_course.review_comments, rejection_reason)
    
    def test_reject_course_missing_reason(self):
        """Test: Error si falta razón de rechazo"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/admin/courses/{self.pending_course.id}/reject/'
        response = self.client.post(url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('requerida', response.data['message'].lower())
    
    def test_reject_course_unauthorized(self):
        """Test: No admin no puede rechazar"""
        token = self._get_auth_token(self.instructor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/admin/courses/{self.pending_course.id}/reject/'
        response = self.client.post(url, {'rejection_reason': 'Razón'})
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_reject_course_not_found(self):
        """Test: Error si curso no existe"""
        token = self._get_auth_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/admin/courses/c-999/reject/'
        response = self.client.post(url, {'rejection_reason': 'Razón'})
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

