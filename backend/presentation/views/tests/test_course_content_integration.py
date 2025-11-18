"""
Tests de Integración para Endpoint de Contenido de Curso - FagSol Escuela Virtual
PRIORIDAD 1: Visualización de Contenido

Estos tests verifican:
- Acceso al contenido del curso por estudiantes inscritos
- Acceso al contenido por admin/instructor sin enrollment
- Denegación de acceso para usuarios no inscritos
- Verificación de permisos y seguridad
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.core.models import UserProfile
from apps.courses.models import Course, Module, Lesson
from apps.users.models import Enrollment
from apps.users.permissions import ROLE_STUDENT, ROLE_ADMIN, ROLE_INSTRUCTOR


class CourseContentIntegrationTestCase(TestCase):
    """Tests de integración para endpoint de contenido de curso"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
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
        
        self.instructor = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(
            user=self.instructor,
            role=ROLE_INSTRUCTOR,
            instructor_status='approved'
        )
        
        # Crear curso con módulos y lecciones
        self.course = Course.objects.create(
            id='course-content-1',
            title='Curso con Contenido',
            slug='curso-con-contenido',
            description='Descripción del curso',
            price=100.00,
            currency='PEN',
            status='published',
            is_active=True
        )
        
        # Crear módulo 1
        self.module1 = Module.objects.create(
            id='module-1',
            course=self.course,
            title='Módulo 1: Introducción',
            description='Descripción del módulo 1',
            order=1,
            is_active=True
        )
        
        # Crear lecciones del módulo 1
        self.lesson1 = Lesson.objects.create(
            id='lesson-1',
            module=self.module1,
            title='Lección 1: Bienvenida',
            description='Descripción de la lección 1',
            lesson_type='video',
            content_url='https://example.com/video1.mp4',
            duration_minutes=10,
            order=1,
            is_active=True
        )
        
        self.lesson2 = Lesson.objects.create(
            id='lesson-2',
            module=self.module1,
            title='Lección 2: Conceptos Básicos',
            description='Descripción de la lección 2',
            lesson_type='text',
            content_text='<p>Contenido de texto de la lección 2</p>',
            duration_minutes=15,
            order=2,
            is_active=True
        )
        
        # Crear módulo 2
        self.module2 = Module.objects.create(
            id='module-2',
            course=self.course,
            title='Módulo 2: Avanzado',
            description='Descripción del módulo 2',
            order=2,
            is_active=True
        )
        
        # Crear lección del módulo 2
        self.lesson3 = Lesson.objects.create(
            id='lesson-3',
            module=self.module2,
            title='Lección 3: Temas Avanzados',
            description='Descripción de la lección 3',
            lesson_type='document',
            content_url='https://example.com/document.pdf',
            duration_minutes=20,
            order=1,
            is_active=True
        )
        
        # Crear enrollment para student1
        self.enrollment = Enrollment.objects.create(
            id='enrollment-1',
            user=self.student1,
            course=self.course,
            status='active',
            completed=False,
            completion_percentage=0.00
        )
    
    def _get_auth_token(self, user):
        """Helper para obtener token JWT"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    # ========== TESTS DE ACCESO EXITOSO ==========
    
    def test_get_course_content_student_enrolled(self):
        """Test: Estudiante inscrito puede acceder al contenido"""
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        
        # Verificar estructura de respuesta
        data = response.data['data']
        self.assertIn('course', data)
        self.assertIn('enrollment', data)
        self.assertIn('modules', data)
        
        # Verificar datos del curso
        self.assertEqual(data['course']['id'], self.course.id)
        self.assertEqual(data['course']['title'], self.course.title)
        
        # Verificar enrollment
        self.assertEqual(data['enrollment']['id'], self.enrollment.id)
        self.assertEqual(data['enrollment']['status'], 'active')
        
        # Verificar módulos
        self.assertEqual(len(data['modules']), 2)
        self.assertEqual(data['modules'][0]['id'], self.module1.id)
        self.assertEqual(data['modules'][0]['title'], self.module1.title)
        self.assertEqual(len(data['modules'][0]['lessons']), 2)
        
        # Verificar lecciones
        lesson1_data = data['modules'][0]['lessons'][0]
        self.assertEqual(lesson1_data['id'], self.lesson1.id)
        self.assertEqual(lesson1_data['title'], self.lesson1.title)
        self.assertEqual(lesson1_data['lesson_type'], 'video')
        self.assertIn('content_url', lesson1_data)
        self.assertEqual(lesson1_data['content_url'], self.lesson1.content_url)
        
        lesson2_data = data['modules'][0]['lessons'][1]
        self.assertEqual(lesson2_data['id'], self.lesson2.id)
        self.assertEqual(lesson2_data['lesson_type'], 'text')
        self.assertIn('content_text', lesson2_data)
        self.assertEqual(lesson2_data['content_text'], self.lesson2.content_text)
    
    def test_get_course_content_admin_without_enrollment(self):
        """Test: Admin puede acceder sin estar inscrito"""
        token = self._get_auth_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertIn('access_type', data)
        self.assertEqual(data['access_type'], 'admin_or_instructor')
        self.assertNotIn('enrollment', data)  # No tiene enrollment
        self.assertIn('modules', data)
        self.assertEqual(len(data['modules']), 2)
    
    def test_get_course_content_instructor_without_enrollment(self):
        """Test: Instructor puede acceder sin estar inscrito"""
        token = self._get_auth_token(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertIn('access_type', data)
        self.assertEqual(data['access_type'], 'admin_or_instructor')
    
    # ========== TESTS DE DENEGACIÓN DE ACCESO ==========
    
    def test_get_course_content_student_not_enrolled(self):
        """Test: Estudiante NO inscrito NO puede acceder"""
        token = self._get_auth_token(self.student2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])
        self.assertIn('message', response.data)
        self.assertIn('No tienes acceso', response.data['message'])
    
    def test_get_course_content_unauthenticated(self):
        """Test: Usuario no autenticado NO puede acceder"""
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ========== TESTS DE VALIDACIÓN ==========
    
    def test_get_course_content_not_found(self):
        """Test: Error 404 si curso no existe"""
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/v1/courses/course-not-exists/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertIn('message', response.data)
    
    def test_get_course_content_inactive_course(self):
        """Test: No se puede acceder a curso inactivo"""
        # Desactivar curso
        self.course.is_active = False
        self.course.save()
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    # ========== TESTS DE CONTENIDO ==========
    
    def test_get_course_content_only_active_modules(self):
        """Test: Solo se devuelven módulos activos"""
        # Desactivar módulo 2
        self.module2.is_active = False
        self.module2.save()
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data['modules']), 1)  # Solo módulo 1 activo
        self.assertEqual(data['modules'][0]['id'], self.module1.id)
    
    def test_get_course_content_only_active_lessons(self):
        """Test: Solo se devuelven lecciones activas"""
        # Desactivar lección 2
        self.lesson2.is_active = False
        self.lesson2.save()
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        module1 = data['modules'][0]
        self.assertEqual(len(module1['lessons']), 1)  # Solo lección 1 activa
        self.assertEqual(module1['lessons'][0]['id'], self.lesson1.id)
    
    def test_get_course_content_lesson_without_content(self):
        """Test: Lección sin contenido_url ni content_text se devuelve sin esos campos"""
        # Crear lección sin contenido
        lesson_no_content = Lesson.objects.create(
            id='lesson-no-content',
            module=self.module1,
            title='Lección sin Contenido',
            lesson_type='text',
            order=3,
            is_active=True
        )
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        
        # Buscar la lección sin contenido
        lesson_found = None
        for module in data['modules']:
            for lesson in module['lessons']:
                if lesson['id'] == lesson_no_content.id:
                    lesson_found = lesson
                    break
        
        self.assertIsNotNone(lesson_found)
        self.assertNotIn('content_url', lesson_found)
        self.assertNotIn('content_text', lesson_found)
    
    # ========== TESTS DE SEGURIDAD ==========
    
    def test_get_course_content_enrollment_expired(self):
        """Test: Enrollment expirado no permite acceso"""
        # Cambiar enrollment a expirado
        self.enrollment.status = 'expired'
        self.enrollment.save()
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_course_content_enrollment_cancelled(self):
        """Test: Enrollment cancelado no permite acceso"""
        # Cambiar enrollment a cancelado
        self.enrollment.status = 'cancelled'
        self.enrollment.save()
        
        token = self._get_auth_token(self.student1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = f'/api/v1/courses/{self.course.id}/content/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

