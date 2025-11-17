"""
Tests Unitarios para InstructorApprovalService - FagSol Escuela Virtual
FASE 1: Sistema de aprobación de instructores
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_INSTRUCTOR, ROLE_ADMIN, ROLE_STUDENT
from infrastructure.services.instructor_approval_service import InstructorApprovalService


class InstructorApprovalServiceTestCase(TestCase):
    """Tests unitarios para InstructorApprovalService"""
    
    def setUp(self):
        """Configuración inicial"""
        self.service = InstructorApprovalService()
        
        # Crear admin
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        UserProfile.objects.create(user=self.admin_user, role=ROLE_ADMIN)
        
        # Crear instructor pendiente
        self.pending_instructor = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123',
            first_name='Instructor',
            last_name='Pending'
        )
        UserProfile.objects.create(
            user=self.pending_instructor,
            role=ROLE_INSTRUCTOR,
            instructor_status='pending_approval'
        )
        
        # Crear instructor aprobado
        self.approved_instructor = User.objects.create_user(
            username='approved@test.com',
            email='approved@test.com',
            password='testpass123',
            first_name='Instructor',
            last_name='Approved'
        )
        UserProfile.objects.create(
            user=self.approved_instructor,
            role=ROLE_INSTRUCTOR,
            instructor_status='approved',
            instructor_approved_by=self.admin_user,
            instructor_approved_at=timezone.now()
        )
        
        # Crear estudiante (no instructor)
        self.student_user = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student_user, role=ROLE_STUDENT)
    
    def test_approve_instructor_success(self):
        """Test: Aprobar instructor pendiente exitosamente"""
        success, data, error = self.service.approve_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id
        )
        
        self.assertTrue(success)
        self.assertIsNotNone(data)
        self.assertEqual(error, "")
        self.assertEqual(data['instructor']['instructor_status'], 'approved')
        self.assertEqual(data['instructor']['approved_by']['id'], self.admin_user.id)
        
        # Verificar en BD
        profile = UserProfile.objects.get(user=self.pending_instructor)
        self.assertEqual(profile.instructor_status, 'approved')
        self.assertEqual(profile.instructor_approved_by, self.admin_user)
        self.assertIsNotNone(profile.instructor_approved_at)
        self.assertIsNone(profile.instructor_rejection_reason)
    
    def test_approve_instructor_not_admin(self):
        """Test: No admin no puede aprobar"""
        success, data, error = self.service.approve_instructor(
            admin_user=self.student_user,
            instructor_user_id=self.pending_instructor.id
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('Solo los administradores', error)
    
    def test_approve_instructor_not_found(self):
        """Test: Error si instructor no existe"""
        success, data, error = self.service.approve_instructor(
            admin_user=self.admin_user,
            instructor_user_id=99999
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('no encontrado', error)
    
    def test_approve_instructor_already_approved(self):
        """Test: Error si instructor ya está aprobado"""
        success, data, error = self.service.approve_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.approved_instructor.id
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('ya está aprobado', error)
    
    def test_approve_instructor_not_instructor_role(self):
        """Test: Error si usuario no es instructor"""
        success, data, error = self.service.approve_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.student_user.id
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('no es un instructor', error)
    
    def test_reject_instructor_success(self):
        """Test: Rechazar instructor pendiente exitosamente"""
        rejection_reason = "No cumple con los requisitos mínimos"
        
        success, data, error = self.service.reject_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason=rejection_reason
        )
        
        self.assertTrue(success)
        self.assertIsNotNone(data)
        self.assertEqual(error, "")
        self.assertEqual(data['instructor']['instructor_status'], 'rejected')
        self.assertEqual(data['instructor']['rejection_reason'], rejection_reason)
        
        # Verificar en BD
        profile = UserProfile.objects.get(user=self.pending_instructor)
        self.assertEqual(profile.instructor_status, 'rejected')
        self.assertEqual(profile.instructor_rejection_reason, rejection_reason)
        self.assertIsNone(profile.instructor_approved_by)
        self.assertIsNone(profile.instructor_approved_at)
    
    def test_reject_instructor_missing_reason(self):
        """Test: Error si falta razón de rechazo"""
        success, data, error = self.service.reject_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason=""
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('requerida', error)
    
    def test_reject_instructor_not_admin(self):
        """Test: No admin no puede rechazar"""
        success, data, error = self.service.reject_instructor(
            admin_user=self.student_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason="Razón"
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('Solo los administradores', error)
    
    def test_reject_instructor_already_rejected(self):
        """Test: Error si instructor ya está rechazado"""
        # Rechazar primero
        self.service.reject_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason="Primera razón"
        )
        
        # Intentar rechazar de nuevo
        success, data, error = self.service.reject_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason="Segunda razón"
        )
        
        self.assertFalse(success)
        self.assertIsNone(data)
        self.assertIn('ya está rechazado', error)
    
    def test_get_pending_instructors(self):
        """Test: Obtener lista de instructores pendientes"""
        success, data, error = self.service.get_pending_instructors()
        
        self.assertTrue(success)
        self.assertIsInstance(data, list)
        self.assertEqual(error, "")
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], self.pending_instructor.id)
        self.assertEqual(data[0]['instructor_status'], 'pending_approval')
    
    def test_get_all_instructors_no_filter(self):
        """Test: Obtener todos los instructores sin filtro"""
        success, data, error = self.service.get_all_instructors()
        
        self.assertTrue(success)
        self.assertIsInstance(data, list)
        self.assertEqual(error, "")
        self.assertEqual(len(data), 2)  # pending + approved
    
    def test_get_all_instructors_with_filter(self):
        """Test: Obtener instructores con filtro por estado"""
        success, data, error = self.service.get_all_instructors(status_filter='approved')
        
        self.assertTrue(success)
        self.assertIsInstance(data, list)
        self.assertEqual(error, "")
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], self.approved_instructor.id)
        self.assertEqual(data[0]['instructor_status'], 'approved')
    
    def test_approve_rejected_instructor(self):
        """Test: Re-aprobar un instructor rechazado"""
        # Primero rechazar
        self.service.reject_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id,
            rejection_reason="Razón de rechazo"
        )
        
        # Luego aprobar
        success, data, error = self.service.approve_instructor(
            admin_user=self.admin_user,
            instructor_user_id=self.pending_instructor.id
        )
        
        self.assertTrue(success)
        self.assertIsNotNone(data)
        profile = UserProfile.objects.get(user=self.pending_instructor)
        self.assertEqual(profile.instructor_status, 'approved')
        self.assertIsNone(profile.instructor_rejection_reason)  # Debe limpiarse

