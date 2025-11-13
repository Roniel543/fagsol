"""
Tests para el sistema de permisos de Django - FagSol Escuela Virtual
"""

from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.core.models import UserProfile
from apps.courses.models import Course
from apps.users.permissions import (
    has_perm, has_any_perm, require_perm,
    ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT, ROLE_GUEST
)


class DjangoPermissionsTestCase(TestCase):
    """Tests para funciones de permisos de Django"""
    
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
        
        # Crear grupos y permisos (simular setup_permissions)
        self.admin_group, _ = Group.objects.get_or_create(name='Administradores')
        self.instructor_group, _ = Group.objects.get_or_create(name='Instructores')
        self.student_group, _ = Group.objects.get_or_create(name='Estudiantes')
        
        # Asignar usuarios a grupos
        self.admin_user.groups.add(self.admin_group)
        self.instructor_user.groups.add(self.instructor_group)
        self.student_user.groups.add(self.student_group)
        
        # Crear permisos personalizados
        course_ct = ContentType.objects.get_for_model(Course)
        
        self.add_course_perm, _ = Permission.objects.get_or_create(
            codename='add_course',
            content_type=course_ct,
            defaults={'name': 'Puede crear cursos'}
        )
        
        self.change_course_perm, _ = Permission.objects.get_or_create(
            codename='change_course',
            content_type=course_ct,
            defaults={'name': 'Puede editar cursos'}
        )
        
        self.view_course_perm, _ = Permission.objects.get_or_create(
            codename='view_course',
            content_type=course_ct,
            defaults={'name': 'Puede ver cursos'}
        )
        
        # Asignar permisos a grupos
        self.admin_group.permissions.add(
            self.add_course_perm,
            self.change_course_perm,
            self.view_course_perm
        )
        
        self.instructor_group.permissions.add(
            self.add_course_perm,
            self.change_course_perm,
            self.view_course_perm
        )
        
        self.student_group.permissions.add(self.view_course_perm)
    
    def test_has_perm_admin_all_permissions(self):
        """Test: Admin tiene todos los permisos"""
        self.assertTrue(has_perm(self.admin_user, 'courses.add_course'))
        self.assertTrue(has_perm(self.admin_user, 'courses.change_course'))
        self.assertTrue(has_perm(self.admin_user, 'courses.view_course'))
        self.assertTrue(has_perm(self.admin_user, 'courses.delete_course'))
        # Admin tiene todos los permisos incluso si no están asignados
        self.assertTrue(has_perm(self.admin_user, 'courses.publish_course'))
    
    def test_has_perm_instructor_course_permissions(self):
        """Test: Instructor tiene permisos de cursos"""
        self.assertTrue(has_perm(self.instructor_user, 'courses.add_course'))
        self.assertTrue(has_perm(self.instructor_user, 'courses.change_course'))
        self.assertTrue(has_perm(self.instructor_user, 'courses.view_course'))
        # Instructor NO tiene permiso de eliminar (solo admin)
        self.assertFalse(has_perm(self.instructor_user, 'courses.delete_course'))
    
    def test_has_perm_student_view_only(self):
        """Test: Estudiante solo tiene permiso de ver"""
        self.assertTrue(has_perm(self.student_user, 'courses.view_course'))
        self.assertFalse(has_perm(self.student_user, 'courses.add_course'))
        self.assertFalse(has_perm(self.student_user, 'courses.change_course'))
        self.assertFalse(has_perm(self.student_user, 'courses.delete_course'))
    
    def test_has_perm_guest_no_permissions(self):
        """Test: Invitado no tiene permisos"""
        guest_user = None
        self.assertFalse(has_perm(guest_user, 'courses.view_course'))
        self.assertFalse(has_perm(guest_user, 'courses.add_course'))
    
    def test_has_perm_unauthenticated(self):
        """Test: Usuario no autenticado (None) no tiene permisos"""
        # Usuario None (no autenticado)
        self.assertFalse(has_perm(None, 'courses.view_course'))
        self.assertFalse(has_perm(None, 'courses.add_course'))
    
    def test_has_perm_user_without_profile(self):
        """Test: Usuario autenticado sin perfil es tratado como guest y puede ver cursos"""
        user_without_profile = User.objects.create_user(
            username='noprofile@test.com',
            email='noprofile@test.com',
            password='testpass123'
        )
        # No tiene perfil, por lo que get_user_role() retorna ROLE_GUEST
        # Los guests pueden ver cursos publicados
        self.assertTrue(has_perm(user_without_profile, 'courses.view_course'))
        # Pero no pueden crear cursos
        self.assertFalse(has_perm(user_without_profile, 'courses.add_course'))
    
    def test_has_perm_direct_permission(self):
        """Test: Usuario con permiso directo"""
        # Crear usuario sin grupo
        user = User.objects.create_user(
            username='direct@test.com',
            email='direct@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=user, role=ROLE_STUDENT)
        
        # Asignar permiso directo
        user.user_permissions.add(self.add_course_perm)
        
        # Debe tener el permiso
        self.assertTrue(has_perm(user, 'courses.add_course'))
    
    def test_has_any_perm(self):
        """Test: has_any_perm verifica si tiene alguno de los permisos"""
        # Instructor tiene add_course pero no delete_course
        self.assertTrue(has_any_perm(
            self.instructor_user,
            ['courses.add_course', 'courses.delete_course']
        ))
        
        # Estudiante no tiene ninguno de estos
        self.assertFalse(has_any_perm(
            self.student_user,
            ['courses.add_course', 'courses.delete_course']
        ))
        
        # Estudiante tiene view_course
        self.assertTrue(has_any_perm(
            self.student_user,
            ['courses.view_course', 'courses.add_course']
        ))
    
    def test_has_perm_module_permissions(self):
        """Test: Permisos de módulos"""
        from apps.courses.models import Module
        module_ct = ContentType.objects.get_for_model(Module)
        
        add_module_perm, _ = Permission.objects.get_or_create(
            codename='add_module',
            content_type=module_ct,
            defaults={'name': 'Puede crear módulos'}
        )
        
        self.instructor_group.permissions.add(add_module_perm)
        
        # Instructor debe tener permiso de crear módulos
        self.assertTrue(has_perm(self.instructor_user, 'courses.add_module'))
        
        # Estudiante no debe tenerlo
        self.assertFalse(has_perm(self.student_user, 'courses.add_module'))
    
    def test_has_perm_enrollment_permissions(self):
        """Test: Permisos de enrollments"""
        from apps.users.models import Enrollment
        enrollment_ct = ContentType.objects.get_for_model(Enrollment)
        
        view_enrollment_perm, _ = Permission.objects.get_or_create(
            codename='view_enrollment',
            content_type=enrollment_ct,
            defaults={'name': 'Puede ver inscripciones'}
        )
        
        view_own_enrollment_perm, _ = Permission.objects.get_or_create(
            codename='view_own_enrollment',
            content_type=enrollment_ct,
            defaults={'name': 'Puede ver sus propias inscripciones'}
        )
        
        self.instructor_group.permissions.add(view_enrollment_perm)
        self.student_group.permissions.add(view_own_enrollment_perm)
        
        # Instructor puede ver todos los enrollments
        self.assertTrue(has_perm(self.instructor_user, 'users.view_enrollment'))
        
        # Estudiante solo puede ver sus propios enrollments
        self.assertTrue(has_perm(self.student_user, 'users.view_own_enrollment'))
        self.assertFalse(has_perm(self.student_user, 'users.view_enrollment'))
    
    def test_has_perm_payment_permissions(self):
        """Test: Permisos de pagos"""
        from apps.payments.models import Payment
        payment_ct = ContentType.objects.get_for_model(Payment)
        
        process_payment_perm, _ = Permission.objects.get_or_create(
            codename='process_payment',
            content_type=payment_ct,
            defaults={'name': 'Puede procesar pagos'}
        )
        
        self.student_group.permissions.add(process_payment_perm)
        
        # Estudiante puede procesar pagos
        self.assertTrue(has_perm(self.student_user, 'payments.process_payment'))
        
        # Instructor no puede procesar pagos
        self.assertFalse(has_perm(self.instructor_user, 'payments.process_payment'))

