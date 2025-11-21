"""
Tests para VideoURLService
FASE 1: Conversión automática de URLs de Vimeo
"""

from django.test import TestCase
from infrastructure.services.video_url_service import VideoURLService


class VideoURLServiceTestCase(TestCase):
    """Tests para el servicio de conversión de URLs de video"""
    
    def setUp(self):
        self.service = VideoURLService()
    
    
    def test_convert_vimeo_normal_url_to_embed(self):
        """Test: Convierte URL normal de Vimeo a formato embed"""
        url = "https://vimeo.com/123456789"
        result = self.service.convert_vimeo_url(url, add_params=True)
        # Debe incluir parámetros por defecto
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
        self.assertIn("loop=0", result)
        self.assertIn("muted=0", result)
    
    def test_convert_vimeo_url_with_www(self):
        """Test: Convierte URL de Vimeo con www"""
        url = "https://www.vimeo.com/123456789"
        result = self.service.convert_vimeo_url(url, add_params=True)
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
    
    def test_convert_vimeo_url_http(self):
        """Test: Convierte URL HTTP de Vimeo"""
        url = "http://vimeo.com/123456789"
        result = self.service.convert_vimeo_url(url, add_params=True)
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
    
    def test_convert_vimeo_embed_url_unchanged(self):
        """Test: URL de embed de Vimeo sin parámetros agrega parámetros por defecto"""
        url = "https://player.vimeo.com/video/123456789"
        result = self.service.convert_vimeo_url(url, add_params=True)
        # Debe agregar parámetros si no existen
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
    
    def test_convert_vimeo_url_with_params(self):
        """Test: URL de Vimeo con parámetros adicionales se mantiene sin duplicar"""
        url = "https://vimeo.com/123456789?autoplay=1"
        result = self.service.convert_vimeo_url(url, add_params=True)
        # Debe convertir a embed y mantener parámetros o agregar los por defecto
        self.assertIn("https://player.vimeo.com/video/123456789", result)
    
    def test_convert_non_vimeo_url_returns_none(self):
        """Test: URL que no es Vimeo retorna None"""
        url = "https://youtube.com/watch?v=abc123"
        result = self.service.convert_vimeo_url(url)
        self.assertIsNone(result)
    
    def test_convert_empty_url_returns_none(self):
        """Test: URL vacía retorna None"""
        result = self.service.convert_vimeo_url("")
        self.assertIsNone(result)
    
    def test_convert_none_url_returns_none(self):
        """Test: None retorna None"""
        result = self.service.convert_vimeo_url(None)
        self.assertIsNone(result)
    
    # ========== TESTS DE VALIDACIÓN ==========
    
    def test_is_valid_vimeo_embed_url(self):
        """Test: Valida URL de embed de Vimeo válida"""
        url = "https://player.vimeo.com/video/123456789"
        result = self.service.is_valid_video_embed_url(url)
        self.assertTrue(result)
    
    def test_is_valid_youtube_embed_url(self):
        """Test: Valida URL de embed de YouTube válida"""
        url = "https://www.youtube.com/embed/abc123"
        result = self.service.is_valid_video_embed_url(url)
        self.assertTrue(result)
    
    def test_is_invalid_non_embed_url(self):
        """Test: Rechaza URL que no es embed"""
        url = "https://vimeo.com/123456789"
        result = self.service.is_valid_video_embed_url(url)
        self.assertFalse(result)
    
    def test_is_invalid_dangerous_url(self):
        """Test: Rechaza URL con patrón peligroso (SSRF)"""
        url = "https://127.0.0.1/video/123"
        result = self.service.is_valid_video_embed_url(url)
        self.assertFalse(result)
    
    def test_is_invalid_non_allowed_domain(self):
        """Test: Rechaza URL de dominio no permitido"""
        url = "https://malicious-site.com/video/123"
        result = self.service.is_valid_video_embed_url(url)
        self.assertFalse(result)
    
    def test_is_invalid_empty_url(self):
        """Test: Rechaza URL vacía"""
        result = self.service.is_valid_video_embed_url("")
        self.assertFalse(result)
    
    def test_is_invalid_none_url(self):
        """Test: Rechaza None"""
        result = self.service.is_valid_video_embed_url(None)
        self.assertFalse(result)
    
    # ========== TESTS DE CONVERSIÓN GENERAL ==========
    
    def test_convert_video_url_vimeo(self):
        """Test: convert_video_url convierte URL de Vimeo"""
        url = "https://vimeo.com/123456789"
        result = self.service.convert_video_url(url, lesson_type='video', add_params=True)
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
    
    def test_convert_video_url_non_video_type(self):
        """Test: convert_video_url no convierte si no es tipo video"""
        url = "https://vimeo.com/123456789"
        result = self.service.convert_video_url(url, lesson_type='text')
        self.assertIsNone(result)
    
    def test_convert_video_url_already_embed(self):
        """Test: convert_video_url agrega parámetros a URL ya en formato embed"""
        url = "https://player.vimeo.com/video/123456789"
        result = self.service.convert_video_url(url, lesson_type='video', add_params=True)
        self.assertIn("https://player.vimeo.com/video/123456789", result)
        self.assertIn("autoplay=0", result)
    
    # ========== TESTS DE VALIDACIÓN Y CONVERSIÓN ==========
    
    def test_validate_and_convert_vimeo_normal(self):
        """Test: validate_and_convert convierte y valida URL normal de Vimeo"""
        url = "https://vimeo.com/123456789"
        success, converted_url, error = self.service.validate_and_convert(url, lesson_type='video', add_params=True)
        self.assertTrue(success)
        self.assertIn("https://player.vimeo.com/video/123456789", converted_url)
        self.assertIn("autoplay=0", converted_url)
        self.assertEqual(error, "")
    
    def test_validate_and_convert_vimeo_embed(self):
        """Test: validate_and_convert valida URL de embed de Vimeo"""
        url = "https://player.vimeo.com/video/123456789"
        success, converted_url, error = self.service.validate_and_convert(url, lesson_type='video', add_params=True)
        self.assertTrue(success)
        self.assertIn("https://player.vimeo.com/video/123456789", converted_url)
        self.assertIn("autoplay=0", converted_url)
        self.assertEqual(error, "")
    
    def test_validate_and_convert_invalid_url(self):
        """Test: validate_and_convert rechaza URL inválida"""
        url = "https://malicious-site.com/video/123"
        success, converted_url, error = self.service.validate_and_convert(url, lesson_type='video')
        self.assertFalse(success)
        self.assertIsNone(converted_url)
        self.assertIn("inválida", error.lower())
    
    def test_validate_and_convert_non_video_type(self):
        """Test: validate_and_convert no valida si no es tipo video"""
        url = "https://vimeo.com/123456789"
        success, converted_url, error = self.service.validate_and_convert(url, lesson_type='text')
        self.assertTrue(success)
        self.assertEqual(converted_url, url)
        self.assertEqual(error, "")
    
    def test_validate_and_convert_empty_url(self):
        """Test: validate_and_convert acepta URL vacía"""
        url = ""
        success, converted_url, error = self.service.validate_and_convert(url, lesson_type='video')
        self.assertTrue(success)
        self.assertIsNone(converted_url)
        self.assertEqual(error, "")

