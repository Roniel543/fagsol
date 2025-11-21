from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from apps.courses.models import Course, Module, Lesson


class LessonVideoURLConversionTestCase(TestCase):
    """Tests para conversión automática de URLs de video en Lesson"""
    
    def setUp(self):
        """Crear datos de prueba"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.course = Course.objects.create(
            id='c-test-001',
            title='Curso de Prueba',
            slug='curso-de-prueba',
            description='Descripción del curso',
            price=99.99,
            status='published',
            is_active=True
        )
        
        self.module = Module.objects.create(
            course=self.course,
            title='Módulo de Prueba',
            order=1,
            is_active=True
        )
    
    def test_lesson_auto_converts_vimeo_normal_url(self):
        """Test: Lesson convierte automáticamente URL normal de Vimeo"""
        lesson = Lesson(
            module=self.module,
            title='Lección de Prueba',
            lesson_type='video',
            content_url='https://vimeo.com/123456789',
            order=1,
            is_active=True
        )
        
        lesson.clean()
        
        self.assertEqual(
            lesson.content_url,
            'https://player.vimeo.com/video/123456789'
        )
    
    def test_lesson_save_calls_clean_automatically(self):
        """Test: save() llama clean() automáticamente"""
        lesson = Lesson(
            module=self.module,
            title='Lección de Prueba',
            lesson_type='video',
            content_url='https://vimeo.com/123456789',
            order=1,
            is_active=True
        )
        
        lesson.save()
        lesson.refresh_from_db()
        
        self.assertEqual(
            lesson.content_url,
            'https://player.vimeo.com/video/123456789'
        )
