"""
Servicio para conversión y validación de URLs de video
FASE 1: Conversión automática de URLs de Vimeo
"""

import re
import logging
from typing import Optional, Tuple
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger('apps')


class VideoURLService:
    """
    Servicio para convertir y validar URLs de video
    Soporta Vimeo y preparado para YouTube 
    """
    
    # Patrones de URLs de Vimeo
    VIMEO_NORMAL_PATTERNS = [
        r'https?://(?:www\.)?vimeo\.com/(\d+)',  # https://vimeo.com/123456789
        r'https?://vimeo\.com/(\d+)',  # https://vimeo.com/123456789 (sin www)
    ]
    
    VIMEO_EMBED_PATTERN = r'https?://player\.vimeo\.com/video/(\d+)'  # Formato embed
    
    # Patrones de URLs de YouTube (preparado para FASE 3)
    YOUTUBE_NORMAL_PATTERNS = [
        r'https?://(?:www\.)?youtube\.com/watch\?v=([\w-]+)',
        r'https?://youtu\.be/([\w-]+)',
    ]
    
    YOUTUBE_EMBED_PATTERN = r'https?://(?:www\.)?youtube\.com/embed/([\w-]+)'
    
    # Dominios permitidos para videos (prevención SSRF)
    ALLOWED_DOMAINS = [
        'vimeo.com',
        'player.vimeo.com',
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
    ]
    
    def convert_vimeo_url(self, url: str, add_params: bool = True) -> Optional[str]:
        """
        Convierte URL de Vimeo normal a formato embed
        
        Args:
            url: URL de Vimeo (ej: https://vimeo.com/123456789)
            add_params: Si True, agrega parámetros por defecto al embed (autoplay=0, loop=0, etc.)
            
        Returns:
            URL de embed (ej: https://player.vimeo.com/video/123456789?autoplay=0&loop=0) o None si no es Vimeo
        """
        if not url or not isinstance(url, str):
            return None
        
        url = url.strip()
        video_id = None
        
        # Si ya es formato embed, extraer video_id
        embed_match = re.match(self.VIMEO_EMBED_PATTERN, url, re.IGNORECASE)
        if embed_match:
            video_id = embed_match.group(1)
            # Si ya tiene parámetros, mantenerlos; si no, agregar los por defecto
            if add_params and '?' not in url:
                embed_url = f'https://player.vimeo.com/video/{video_id}?autoplay=0&loop=0&muted=0'
            else:
                embed_url = f'https://player.vimeo.com/video/{video_id}'
            return embed_url
        
        # Intentar convertir URL normal a embed
        for pattern in self.VIMEO_NORMAL_PATTERNS:
            match = re.match(pattern, url, re.IGNORECASE)
            if match:
                video_id = match.group(1)
                if add_params:
                    embed_url = f'https://player.vimeo.com/video/{video_id}?autoplay=0&loop=0&muted=0'
                else:
                    embed_url = f'https://player.vimeo.com/video/{video_id}'
                logger.info(f"URL de Vimeo convertida: {url} -> {embed_url}")
                return embed_url
        
        return None
    
    def convert_youtube_url(self, url: str) -> Optional[str]:
        """
        Convierte URL de YouTube normal a formato embed (FASE 3)
        
        Args:
            url: URL de YouTube (ej: https://youtube.com/watch?v=abc123)
            
        Returns:
            URL de embed (ej: https://www.youtube.com/embed/abc123) o None si no es YouTube
        """
        if not url or not isinstance(url, str):
            return None
        
        url = url.strip()
        
        # Si ya es formato embed, retornar tal cual
        embed_match = re.match(self.YOUTUBE_EMBED_PATTERN, url, re.IGNORECASE)
        if embed_match:
            video_id = embed_match.group(1)
            return f'https://www.youtube.com/embed/{video_id}'
        
        # Intentar convertir URL normal a embed
        for pattern in self.YOUTUBE_NORMAL_PATTERNS:
            match = re.match(pattern, url, re.IGNORECASE)
            if match:
                video_id = match.group(1)
                embed_url = f'https://www.youtube.com/embed/{video_id}'
                logger.info(f"URL de YouTube convertida: {url} -> {embed_url}")
                return embed_url
        
        return None
    
    def convert_video_url(self, url: str, lesson_type: str = 'video', add_params: bool = True) -> Optional[str]:
        """
        Convierte URL de video a formato embed según la plataforma
        
        Args:
            url: URL del video
            lesson_type: Tipo de lección (debe ser 'video' para convertir)
            add_params: Si True, agrega parámetros por defecto (autoplay=0, loop=0, etc.)
            
        Returns:
            URL de embed convertida o None si no se puede convertir
        """
        if lesson_type != 'video' or not url:
            return None
        
        # Intentar Vimeo primero
        vimeo_url = self.convert_vimeo_url(url, add_params=add_params)
        if vimeo_url:
            return vimeo_url
        
        # Intentar YouTube (preparado pero no activo aún)
        # youtube_url = self.convert_youtube_url(url)
        # if youtube_url:
        #     return youtube_url
        
        return None
    
    def is_valid_video_embed_url(self, url: str) -> bool:
        """
        Valida que la URL sea una URL de embed válida y segura
        
        Args:
            url: URL a validar
            
        Returns:
            True si es válida y segura, False en caso contrario
        """
        if not url or not isinstance(url, str):
            return False
        
        url = url.strip()
        
        # Validar formato básico de URL
        try:
            parsed = urlparse(url)
            if not parsed.scheme or parsed.scheme not in ['http', 'https']:
                return False
            if not parsed.netloc:
                return False
        except Exception:
            return False
        
        # Validar que sea dominio permitido (prevención SSRF)
        domain = parsed.netloc.lower()
        is_allowed = any(allowed in domain for allowed in self.ALLOWED_DOMAINS)
        if not is_allowed:
            logger.warning(f"URL de video con dominio no permitido: {domain}")
            return False
        
        # Validar que sea formato embed válido
        is_vimeo_embed = bool(re.match(self.VIMEO_EMBED_PATTERN, url, re.IGNORECASE))
        is_youtube_embed = bool(re.match(self.YOUTUBE_EMBED_PATTERN, url, re.IGNORECASE))
        
        if not (is_vimeo_embed or is_youtube_embed):
            logger.warning(f"URL de video no es formato embed válido: {url}")
            return False
        
        # Prevenir SSRF: no permitir URLs locales/privadas
        dangerous_patterns = [
            '127.0.0.1',
            'localhost',
            '0.0.0.0',
            '192.168.',
            '10.',
            '172.16.',
        ]
        
        url_lower = url.lower()
        for pattern in dangerous_patterns:
            if pattern in url_lower and 'localhost' not in url_lower:
                logger.warning(f"URL de video con patrón peligroso detectado: {pattern}")
                return False
        
        return True
    
    def validate_and_convert(self, url: str, lesson_type: str = 'video', add_params: bool = True) -> Tuple[bool, Optional[str], str]:
        """
        Valida y convierte URL de video en un solo paso
        
        Args:
            url: URL del video
            lesson_type: Tipo de lección
            add_params: Si True, agrega parámetros por defecto (autoplay=0, loop=0, etc.)
            
        Returns:
            Tuple[success, converted_url, error_message]
        """
        if lesson_type != 'video':
            return True, url, ""  # No validar si no es video
        
        if not url:
            return True, None, ""  # URL vacía es válida (opcional)
        
        # Intentar convertir
        converted_url = self.convert_video_url(url, lesson_type, add_params=add_params)
        
        # Si se convirtió, usar la URL convertida
        final_url = converted_url if converted_url else url
        
        # Validar URL final (sin parámetros para validación)
        # Extraer URL base sin parámetros para validar
        url_base = final_url.split('?')[0] if '?' in final_url else final_url
        if not self.is_valid_video_embed_url(url_base):
            return False, None, (
                "URL de video inválida. Debe ser URL de embed válida "
                "(ej: https://player.vimeo.com/video/123456789). "
                "Las URLs normales de Vimeo se convierten automáticamente."
            )
        
        return True, final_url, ""


# Instancia singleton del servicio
video_url_service = VideoURLService()

