"""
Tests para el sistema de permisos y roles - FagSol Escuela Virtual
"""

from django.test import TestCase
from django.contrib.auth.models import User
from apps.core.models import UserProfile
from apps.users.permissions import (
    get_user_role, has_role, has_any_role,
    is_admin, is_instructor, is_student, is_guest,
    can_view_course, can_edit_course, can_access_course_content,
    can_view_enrollment, can_view_certificate, can_process_payment,
    can_create_course,
    ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT, ROLE_GUEST
)
from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate


class PermissionsTestCase(TestCase):
    """Tests para funciones de permisos y roles"""
    
    def setUp(self):
        """Configuración inicial"""
        # Crear usuarios con diferentes roles
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.admin_user, role=ROLE_ADMIN)
        
        self.instructor_user = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.instructor_user, role=ROLE_INSTRUCTOR)
        
        self.student_user = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student_user, role=ROLE_STUDENT)
        
        self.guest_user = None  # Usuario no autenticado
        
        # Crear curso de prueba
        self.course = Course.objects.create(
            id='test-course-1',
            title='Curso de Prueba',
            slug='curso-de-prueba',
            description='Descripción del curso',
            price=100.00,
            currency='PEN',
            status='published',
            is_active=True
        )
    
    def test_get_user_role(self):
        """Test: Obtener rol del usuario"""
        self.assertEqual(get_user_role(self.admin_user), ROLE_ADMIN)
        self.assertEqual(get_user_role(self.instructor_user), ROLE_INSTRUCTOR)
        self.assertEqual(get_user_role(self.student_user), ROLE_STUDENT)
        self.assertEqual(get_user_role(self.guest_user), ROLE_GUEST)
        self.assertEqual(get_user_role(None), ROLE_GUEST)
    
    def test_has_role(self):
        """Test: Verificar si usuario tiene un rol específico"""
        self.assertTrue(has_role(self.admin_user, ROLE_ADMIN))
        self.assertFalse(has_role(self.admin_user, ROLE_STUDENT))
        self.assertTrue(has_role(self.student_user, ROLE_STUDENT))
        self.assertFalse(has_role(self.guest_user, ROLE_STUDENT))
    
    def test_has_any_role(self):
        """Test: Verificar si usuario tiene alguno de los roles"""
        self.assertTrue(has_any_role(self.admin_user, [ROLE_ADMIN, ROLE_INSTRUCTOR]))
        self.assertTrue(has_any_role(self.instructor_user, [ROLE_ADMIN, ROLE_INSTRUCTOR]))
        self.assertFalse(has_any_role(self.student_user, [ROLE_ADMIN, ROLE_INSTRUCTOR]))
    
    def test_is_admin(self):
        """Test: Verificar si es admin"""
        self.assertTrue(is_admin(self.admin_user))
        self.assertFalse(is_admin(self.student_user))
        self.assertFalse(is_admin(self.guest_user))
    
    def test_is_instructor(self):
        """Test: Verificar si es instructor"""
        self.assertTrue(is_instructor(self.instructor_user))
        self.assertFalse(is_instructor(self.student_user))
        self.assertFalse(is_instructor(self.guest_user))
    
    def test_is_student(self):
        """Test: Verificar si es estudiante"""
        self.assertTrue(is_student(self.student_user))
        self.assertFalse(is_student(self.admin_user))
        self.assertFalse(is_student(self.guest_user))
    
    def test_is_guest(self):
        """Test: Verificar si es invitado"""
        self.assertTrue(is_guest(self.guest_user))
        self.assertTrue(is_guest(None))
        self.assertFalse(is_guest(self.student_user))
    
    def test_can_view_course_public(self):
        """Test: Invitados pueden ver cursos publicados"""
        self.assertTrue(can_view_course(self.guest_user, self.course))
    
    def test_can_view_course_admin(self):
        """Test: Admin puede ver todos los cursos"""
        # Cambiar curso a draft
        self.course.status = 'draft'
        self.course.save()
        self.assertTrue(can_view_course(self.admin_user, self.course))
    
    def test_can_view_course_instructor(self):
        """Test: Instructor puede ver todos los cursos"""
        self.course.status = 'draft'
        self.course.save()
        self.assertTrue(can_view_course(self.instructor_user, self.course))
    
    def test_can_view_course_student_enrolled(self):
        """Test: Estudiante puede ver cursos en los que está inscrito"""
        # Crear enrollment
        Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active'
        )
        # Cambiar curso a draft
        self.course.status = 'draft'
        self.course.save()
        self.assertTrue(can_view_course(self.student_user, self.course))
    
    def test_can_view_course_student_not_enrolled(self):
        """Test: Estudiante NO puede ver cursos draft en los que NO está inscrito"""
        self.course.status = 'draft'
        self.course.save()
        self.assertFalse(can_view_course(self.student_user, self.course))
    
    def test_can_edit_course_admin(self):
        """Test: Admin puede editar cualquier curso"""
        self.assertTrue(can_edit_course(self.admin_user, self.course))
    
    def test_can_edit_course_instructor(self):
        """Test: Instructor puede editar cursos"""
        self.assertTrue(can_edit_course(self.instructor_user, self.course))
    
    def test_can_edit_course_student(self):
        """Test: Estudiante NO puede editar cursos"""
        self.assertFalse(can_edit_course(self.student_user, self.course))
    
    def test_can_access_course_content_admin(self):
        """Test: Admin puede acceder a contenido de cualquier curso"""
        self.assertTrue(can_access_course_content(self.admin_user, self.course))
    
    def test_can_access_course_content_instructor(self):
        """Test: Instructor puede acceder a contenido de cualquier curso"""
        self.assertTrue(can_access_course_content(self.instructor_user, self.course))
    
    def test_can_access_course_content_student_enrolled(self):
        """Test: Estudiante puede acceder si está inscrito"""
        Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active'
        )
        self.assertTrue(can_access_course_content(self.student_user, self.course))
    
    def test_can_access_course_content_student_not_enrolled(self):
        """Test: Estudiante NO puede acceder si NO está inscrito"""
        self.assertFalse(can_access_course_content(self.student_user, self.course))
    
    def test_can_view_enrollment_own(self):
        """Test: Estudiante puede ver su propio enrollment"""
        enrollment = Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active'
        )
        self.assertTrue(can_view_enrollment(self.student_user, enrollment))
    
    def test_can_view_enrollment_other(self):
        """Test: Estudiante NO puede ver enrollment de otro"""
        other_student = User.objects.create_user(
            username='other@test.com',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role=ROLE_STUDENT)
        
        enrollment = Enrollment.objects.create(
            user=other_student,
            course=self.course,
            status='active'
        )
        self.assertFalse(can_view_enrollment(self.student_user, enrollment))
    
    def test_can_view_enrollment_admin(self):
        """Test: Admin puede ver cualquier enrollment"""
        enrollment = Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active'
        )
        self.assertTrue(can_view_enrollment(self.admin_user, enrollment))
    
    def test_can_view_certificate_own(self):
        """Test: Estudiante puede ver su propio certificado"""
        enrollment = Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active',
            completed=True
        )
        certificate = Certificate.objects.create(
            enrollment=enrollment,
            user=self.student_user,
            course=self.course,
            verification_code='TEST123'
        )
        self.assertTrue(can_view_certificate(self.student_user, certificate))
    
    def test_can_view_certificate_other(self):
        """Test: Estudiante NO puede ver certificado de otro"""
        other_student = User.objects.create_user(
            username='other@test.com',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role=ROLE_STUDENT)
        
        enrollment = Enrollment.objects.create(
            user=other_student,
            course=self.course,
            status='active',
            completed=True
        )
        certificate = Certificate.objects.create(
            enrollment=enrollment,
            user=other_student,
            course=self.course,
            verification_code='TEST456'
        )
        self.assertFalse(can_view_certificate(self.student_user, certificate))
    
    def test_can_process_payment_student(self):
        """Test: Solo estudiantes pueden procesar pagos"""
        self.assertTrue(can_process_payment(self.student_user))
        self.assertFalse(can_process_payment(self.admin_user))
        self.assertFalse(can_process_payment(self.instructor_user))
        self.assertFalse(can_process_payment(self.guest_user))
    
    def test_can_create_course_admin(self):
        """Test: Admin puede crear cursos"""
        self.assertTrue(can_create_course(self.admin_user))
    
    def test_can_create_course_instructor_approved(self):
        """Test: Instructor aprobado puede crear cursos"""
        # Aprobar instructor
        self.instructor_user.profile.instructor_status = 'approved'
        self.instructor_user.profile.save()
        
        self.assertTrue(can_create_course(self.instructor_user))
    
    def test_can_create_course_instructor_pending(self):
        """Test: Instructor pendiente NO puede crear cursos"""
        # Asegurar que está pendiente
        self.instructor_user.profile.instructor_status = 'pending_approval'
        self.instructor_user.profile.save()
        
        self.assertFalse(can_create_course(self.instructor_user))
    
    def test_can_create_course_instructor_rejected(self):
        """Test: Instructor rechazado NO puede crear cursos"""
        # Rechazar instructor
        self.instructor_user.profile.instructor_status = 'rejected'
        self.instructor_user.profile.save()
        
        self.assertFalse(can_create_course(self.instructor_user))
    
    def test_can_create_course_student(self):
        """Test: Estudiante NO puede crear cursos"""
        self.assertFalse(can_create_course(self.student_user))
    
    def test_can_create_course_guest(self):
        """Test: Invitado NO puede crear cursos"""
        self.assertFalse(can_create_course(self.guest_user))

