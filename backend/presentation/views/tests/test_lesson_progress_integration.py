"""
Tests de Integración - Progreso de Lecciones
Verifica el flujo completo de progreso de lecciones
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import Course, Module, Lesson
from apps.users.models import Enrollment, LessonProgress
from apps.core.models import UserProfile
from apps.payments.models import PaymentIntent, Payment
import json


class LessonProgressIntegrationTestCase(TestCase):
    """Tests de integración para progreso de lecciones"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        # Crear usuarios
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.admin_user, role='admin')
        
        self.student_user = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student_user, role='student')
        
        # Crear curso con módulos y lecciones
        self.course = Course.objects.create(
            id='c-test-001',
            title='Curso de Prueba',
            slug='curso-de-prueba',
            description='Descripción del curso',
            price=100.00,
            status='published',
            is_active=True
        )
        
        self.module1 = Module.objects.create(
            id='m-test-001',
            course=self.course,
            title='Módulo 1',
            order=1,
            is_active=True
        )
        
        self.lesson1 = Lesson.objects.create(
            id='l-test-001',
            module=self.module1,
            title='Lección 1',
            lesson_type='video',
            order=1,
            is_active=True,
            duration_minutes=10
        )
        
        self.lesson2 = Lesson.objects.create(
            id='l-test-002',
            module=self.module1,
            title='Lección 2',
            lesson_type='text',
            order=2,
            is_active=True
        )
        
        # Crear enrollment para el estudiante
        self.enrollment = Enrollment.objects.create(
            user=self.student_user,
            course=self.course,
            status='active',
            completed=False,
            completion_percentage=0.00
        )
        
        # Cliente API
        self.client = APIClient()
    
    def test_mark_lesson_completed_success(self):
        """Test: Marcar lección como completada exitosamente"""
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Marcar lección como completada
        response = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['data']['is_completed'])
        
        # Verificar que se creó el LessonProgress
        progress = LessonProgress.objects.get(
            user=self.student_user,
            lesson=self.lesson1,
            enrollment=self.enrollment
        )
        self.assertTrue(progress.is_completed)
        self.assertIsNotNone(progress.completed_at)
        
        # Verificar que el enrollment se actualizó
        self.enrollment.refresh_from_db()
        self.assertGreater(float(self.enrollment.completion_percentage), 0)
    
    def test_mark_lesson_completed_updates_enrollment_percentage(self):
        """Test: Al marcar lección como completada, se actualiza el porcentaje del enrollment"""
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Marcar primera lección como completada
        response1 = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        self.enrollment.refresh_from_db()
        # Debería ser 50% (1 de 2 lecciones)
        self.assertEqual(float(self.enrollment.completion_percentage), 50.0)
        
        # Marcar segunda lección como completada
        response2 = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson2.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        self.enrollment.refresh_from_db()
        # Debería ser 100% (2 de 2 lecciones)
        self.assertEqual(float(self.enrollment.completion_percentage), 100.0)
        self.assertTrue(self.enrollment.completed)
        self.assertEqual(self.enrollment.status, 'completed')
    
    def test_mark_lesson_incomplete_success(self):
        """Test: Marcar lección como incompleta exitosamente"""
        # Crear progreso completado
        progress = LessonProgress.objects.create(
            user=self.student_user,
            lesson=self.lesson1,
            enrollment=self.enrollment,
            is_completed=True
        )
        
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Marcar como incompleta
        response = self.client.post(
            '/api/v1/progress/lessons/incomplete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertFalse(response.data['data']['is_completed'])
        
        # Verificar que se actualizó
        progress.refresh_from_db()
        self.assertFalse(progress.is_completed)
        self.assertIsNone(progress.completed_at)
    
    def test_mark_lesson_completed_unauthorized(self):
        """Test: No se puede marcar lección como completada sin autenticación"""
        response = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_mark_lesson_completed_wrong_enrollment(self):
        """Test: No se puede marcar lección de otro usuario"""
        # Crear otro estudiante y enrollment
        other_student = User.objects.create_user(
            username='other_student',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role='student')
        
        other_enrollment = Enrollment.objects.create(
            user=other_student,
            course=self.course,
            status='active'
        )
        
        # Autenticar como primer estudiante
        self.client.force_authenticate(user=self.student_user)
        
        # Intentar marcar lección con enrollment de otro usuario
        response = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': other_enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_course_progress_success(self):
        """Test: Obtener progreso completo del curso"""
        # Crear algunos progresos
        LessonProgress.objects.create(
            user=self.student_user,
            lesson=self.lesson1,
            enrollment=self.enrollment,
            is_completed=True
        )
        
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Obtener progreso
        response = self.client.get(
            f'/api/v1/progress/course/?enrollment_id={self.enrollment.id}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertEqual(data['total_lessons'], 2)
        self.assertEqual(data['completed_lessons'], 1)
        self.assertEqual(data['completion_percentage'], 50.0)
        self.assertIn(self.lesson1.id, data['lessons_progress'])
        self.assertTrue(data['lessons_progress'][self.lesson1.id]['is_completed'])
        self.assertFalse(data['lessons_progress'][self.lesson2.id]['is_completed'])
    
    def test_get_lesson_progress_success(self):
        """Test: Obtener progreso de una lección específica"""
        # Crear progreso
        progress = LessonProgress.objects.create(
            user=self.student_user,
            lesson=self.lesson1,
            enrollment=self.enrollment,
            is_completed=True
        )
        
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Obtener progreso
        response = self.client.get(
            f'/api/v1/progress/lesson/?lesson_id={self.lesson1.id}&enrollment_id={self.enrollment.id}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['data']['is_completed'])
        self.assertEqual(response.data['data']['lesson_progress_id'], progress.id)
    
    def test_get_lesson_progress_not_found(self):
        """Test: Obtener progreso de lección sin progreso (retorna null)"""
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Obtener progreso (no existe)
        response = self.client.get(
            f'/api/v1/progress/lesson/?lesson_id={self.lesson1.id}&enrollment_id={self.enrollment.id}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertFalse(response.data['data']['is_completed'])
        self.assertEqual(response.data['data']['progress_percentage'], 0.0)
    
    def test_mark_lesson_completed_idor_protection(self):
        """Test: Protección IDOR - No se puede marcar lección de otro curso"""
        # Crear otro curso y lección
        other_course = Course.objects.create(
            id='c-test-002',
            title='Otro Curso',
            slug='otro-curso',
            description='Otro curso',
            price=200.00,
            status='published',
            is_active=True
        )
        
        other_module = Module.objects.create(
            id='m-test-002',
            course=other_course,
            title='Módulo Otro',
            order=1,
            is_active=True
        )
        
        other_lesson = Lesson.objects.create(
            id='l-test-003',
            module=other_module,
            title='Lección Otro',
            order=1,
            is_active=True
        )
        
        # Autenticar
        self.client.force_authenticate(user=self.student_user)
        
        # Intentar marcar lección de otro curso con enrollment de este curso
        response = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': other_lesson.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_admin_can_update_any_progress(self):
        """Test: Admin puede actualizar progreso de cualquier usuario"""
        # Crear progreso del estudiante
        progress = LessonProgress.objects.create(
            user=self.student_user,
            lesson=self.lesson1,
            enrollment=self.enrollment,
            is_completed=False
        )
        
        # Autenticar como admin
        self.client.force_authenticate(user=self.admin_user)
        
        # Admin marca como completada
        response = self.client.post(
            '/api/v1/progress/lessons/complete/',
            {
                'lesson_id': self.lesson1.id,
                'enrollment_id': self.enrollment.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress.refresh_from_db()
        self.assertTrue(progress.is_completed)

