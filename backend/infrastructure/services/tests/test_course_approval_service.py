"""
Tests unitarios para CourseApprovalService
FASE 2: Sistema de aprobación de cursos
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from apps.courses.models import Course
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT
from infrastructure.services.course_approval_service import CourseApprovalService
from decimal import Decimal


class CourseApprovalServiceTestCase(TestCase):
    """Tests para CourseApprovalService"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
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
        
        # Crear instructor pendiente
        self.pending_instructor = User.objects.create_user(
            username='pending@test.com',
            email='pending@test.com',
            password='testpass123'
        )
        pending_profile = UserProfile.objects.create(
            user=self.pending_instructor,
            role=ROLE_INSTRUCTOR,
            instructor_status='pending_approval'
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
        
        # Crear curso publicado
        self.published_course = Course.objects.create(
            id='c-004',
            title='Curso Publicado',
            slug='curso-publicado',
            description='Descripción del curso',
            price=Decimal('100.00'),
            status='published',
            created_by=self.instructor_user
        )
        
        self.service = CourseApprovalService()
    
    def test_request_review_success(self):
        """Test: Instructor puede solicitar revisión de curso en draft"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.instructor_user,
            course_id='c-001'
        )
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(data['course']['status'], 'pending_review')
        
        # Verificar que el curso cambió de estado
        self.draft_course.refresh_from_db()
        self.assertEqual(self.draft_course.status, 'pending_review')
    
    def test_request_review_from_needs_revision(self):
        """Test: Instructor puede solicitar revisión de curso que necesita cambios"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.instructor_user,
            course_id='c-003'
        )
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(data['course']['status'], 'pending_review')
        
        # Verificar que el curso cambió de estado
        self.needs_revision_course.refresh_from_db()
        self.assertEqual(self.needs_revision_course.status, 'pending_review')
    
    def test_request_review_not_instructor(self):
        """Test: No instructor no puede solicitar revisión"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.student_user,
            course_id='c-001'
        )
        
        self.assertFalse(success)
        self.assertIn('instructor', error_message.lower())
    
    def test_request_review_course_not_found(self):
        """Test: Error si curso no existe"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.instructor_user,
            course_id='c-999'
        )
        
        self.assertFalse(success)
        self.assertIn('no encontrado', error_message.lower())
    
    def test_request_review_course_already_pending(self):
        """Test: Error si curso ya está pendiente"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.instructor_user,
            course_id='c-002'
        )
        
        self.assertFalse(success)
        self.assertIn('no puede solicitar', error_message.lower())
    
    def test_request_review_course_published(self):
        """Test: Error si curso ya está publicado"""
        success, data, error_message = self.service.request_review(
            instructor_user=self.instructor_user,
            course_id='c-004'
        )
        
        self.assertFalse(success)
        self.assertIn('no puede solicitar', error_message.lower())
    
    def test_approve_course_success(self):
        """Test: Admin puede aprobar curso pendiente"""
        success, data, error_message = self.service.approve_course(
            admin_user=self.admin_user,
            course_id='c-002',
            notes='Curso aprobado correctamente'
        )
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(data['course']['status'], 'published')
        self.assertIsNotNone(data['course']['reviewed_by'])
        self.assertIsNotNone(data['course']['reviewed_at'])
        
        # Verificar que el curso cambió de estado
        self.pending_course.refresh_from_db()
        self.assertEqual(self.pending_course.status, 'published')
        self.assertEqual(self.pending_course.reviewed_by, self.admin_user)
        self.assertIsNotNone(self.pending_course.reviewed_at)
    
    def test_approve_course_not_admin(self):
        """Test: No admin no puede aprobar"""
        success, data, error_message = self.service.approve_course(
            admin_user=self.instructor_user,
            course_id='c-002'
        )
        
        self.assertFalse(success)
        self.assertIn('administrador', error_message.lower())
    
    def test_approve_course_not_found(self):
        """Test: Error si curso no existe"""
        success, data, error_message = self.service.approve_course(
            admin_user=self.admin_user,
            course_id='c-999'
        )
        
        self.assertFalse(success)
        self.assertIn('no encontrado', error_message.lower())
    
    def test_approve_course_already_published(self):
        """Test: Error si curso ya está publicado"""
        success, data, error_message = self.service.approve_course(
            admin_user=self.admin_user,
            course_id='c-004'
        )
        
        self.assertFalse(success)
        self.assertIn('ya está publicado', error_message.lower())
    
    def test_approve_course_not_pending(self):
        """Test: Error si curso no está en estado pendiente"""
        success, data, error_message = self.service.approve_course(
            admin_user=self.admin_user,
            course_id='c-001'  # draft
        )
        
        self.assertFalse(success)
        self.assertIn('no está en estado', error_message.lower())
    
    def test_approve_course_from_needs_revision(self):
        """Test: Admin puede aprobar curso que necesita cambios (después de correcciones)"""
        # Primero cambiar a pending_review
        self.needs_revision_course.status = 'pending_review'
        self.needs_revision_course.save()
        
        success, data, error_message = self.service.approve_course(
            admin_user=self.admin_user,
            course_id='c-003'
        )
        
        self.assertTrue(success)
        self.assertEqual(data['course']['status'], 'published')
    
    def test_reject_course_success(self):
        """Test: Admin puede rechazar curso pendiente"""
        rejection_reason = 'El contenido no cumple con los estándares de calidad'
        
        success, data, error_message = self.service.reject_course(
            admin_user=self.admin_user,
            course_id='c-002',
            rejection_reason=rejection_reason
        )
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(data['course']['status'], 'needs_revision')
        self.assertIsNotNone(data['course']['review_comments'])
        
        # Verificar que el curso cambió de estado
        self.pending_course.refresh_from_db()
        self.assertEqual(self.pending_course.status, 'needs_revision')
        self.assertEqual(self.pending_course.review_comments, rejection_reason)
        self.assertEqual(self.pending_course.reviewed_by, self.admin_user)
    
    def test_reject_course_not_admin(self):
        """Test: No admin no puede rechazar"""
        success, data, error_message = self.service.reject_course(
            admin_user=self.instructor_user,
            course_id='c-002',
            rejection_reason='Razón de rechazo'
        )
        
        self.assertFalse(success)
        self.assertIn('administrador', error_message.lower())
    
    def test_reject_course_missing_reason(self):
        """Test: Error si falta razón de rechazo"""
        success, data, error_message = self.service.reject_course(
            admin_user=self.admin_user,
            course_id='c-002',
            rejection_reason=''
        )
        
        self.assertFalse(success)
        self.assertIn('requerida', error_message.lower())
    
    def test_reject_course_not_found(self):
        """Test: Error si curso no existe"""
        success, data, error_message = self.service.reject_course(
            admin_user=self.admin_user,
            course_id='c-999',
            rejection_reason='Razón'
        )
        
        self.assertFalse(success)
        self.assertIn('no encontrado', error_message.lower())
    
    def test_reject_course_already_needs_revision(self):
        """Test: Error si curso ya necesita cambios"""
        success, data, error_message = self.service.reject_course(
            admin_user=self.admin_user,
            course_id='c-003',
            rejection_reason='Razón'
        )
        
        self.assertFalse(success)
        self.assertIn('ya está marcado', error_message.lower())
    
    def test_get_pending_courses(self):
        """Test: Obtener lista de cursos pendientes"""
        success, data, error_message = self.service.get_pending_courses()
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(len(data), 1)  # Solo c-002 está pendiente
        self.assertEqual(data[0]['id'], 'c-002')
        self.assertEqual(data[0]['status'], 'pending_review')
    
    def test_get_all_courses_no_filter(self):
        """Test: Obtener todos los cursos sin filtro"""
        success, data, error_message = self.service.get_all_courses()
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(len(data), 4)  # Todos los cursos activos
    
    def test_get_all_courses_with_filter(self):
        """Test: Obtener cursos con filtro por estado"""
        success, data, error_message = self.service.get_all_courses(status_filter='pending_review')
        
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['status'], 'pending_review')
        
        # Filtrar por published
        success, data, error_message = self.service.get_all_courses(status_filter='published')
        self.assertTrue(success)
        self.assertEqual(error_message, '')
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['status'], 'published')

