"""
Servicio de Optimización y Procesamiento de Imágenes
FagSol Escuela Virtual
"""

import logging
from io import BytesIO
from typing import Tuple, Optional
from PIL import Image
from django.conf import settings

logger = logging.getLogger('apps')


class ImageOptimizer:
    """
    Servicio para optimizar y procesar imágenes de cursos
    """
    
    # Dimensiones máximas por tipo
    THUMBNAIL_MAX_SIZE = (400, 300)
    BANNER_MAX_SIZE = (1920, 600)
    
    # Dimensiones mínimas
    THUMBNAIL_MIN_SIZE = (200, 150)
    BANNER_MIN_SIZE = (800, 300)
    
    # Tamaño máximo de archivo (5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    # Formatos permitidos
    ALLOWED_FORMATS = ['JPEG', 'PNG', 'WEBP']
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
    ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    
    # Calidad de compresión
    JPEG_QUALITY = 85
    WEBP_QUALITY = 85
    
    @classmethod
    def validate_image(cls, image_file) -> Tuple[bool, Optional[str]]:
        """
        Valida que el archivo sea una imagen válida
        
        Args:
            image_file: Archivo de imagen
            
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
        """
        try:
            # Validar tamaño
            if image_file.size > cls.MAX_FILE_SIZE:
                return False, f'El archivo es demasiado grande. Máximo {cls.MAX_FILE_SIZE / (1024*1024):.1f}MB'
            
            # Validar tipo MIME
            if hasattr(image_file, 'content_type'):
                if image_file.content_type not in cls.ALLOWED_MIME_TYPES:
                    return False, f'Formato no permitido. Solo se aceptan: {", ".join(cls.ALLOWED_EXTENSIONS)}'
            
            # Validar extensión
            if hasattr(image_file, 'name'):
                file_name = image_file.name.lower()
                if not any(file_name.endswith(ext) for ext in cls.ALLOWED_EXTENSIONS):
                    return False, f'Extensión no permitida. Solo se aceptan: {", ".join(cls.ALLOWED_EXTENSIONS)}'
            
            # Intentar abrir la imagen
            try:
                img = Image.open(image_file)
                img.verify()  # Verificar que sea una imagen válida
            except Exception as e:
                return False, f'El archivo no es una imagen válida: {str(e)}'
            
            return True, None
            
        except Exception as e:
            logger.error(f'Error validando imagen: {str(e)}')
            return False, f'Error al validar la imagen: {str(e)}'
    
    @classmethod
    def validate_dimensions(cls, image_file, image_type: str) -> Tuple[bool, Optional[str]]:
        """
        Valida que las dimensiones cumplan con los requisitos mínimos
        
        Args:
            image_file: Archivo de imagen
            image_file: Tipo de imagen ('thumbnail' o 'banner')
            
        Returns:
            Tuple[bool, Optional[str]]: (cumple_requisitos, mensaje_error)
        """
        try:
            img = Image.open(image_file)
            width, height = img.size
            
            if image_type == 'thumbnail':
                min_width, min_height = cls.THUMBNAIL_MIN_SIZE
                if width < min_width or height < min_height:
                    return False, f'Dimensiones mínimas para miniatura: {min_width}x{min_height}px. Actual: {width}x{height}px'
            elif image_type == 'banner':
                min_width, min_height = cls.BANNER_MIN_SIZE
                if width < min_width or height < min_height:
                    return False, f'Dimensiones mínimas para banner: {min_width}x{min_height}px. Actual: {width}x{height}px'
            else:
                return False, 'Tipo de imagen inválido. Debe ser "thumbnail" o "banner"'
            
            return True, None
            
        except Exception as e:
            logger.error(f'Error validando dimensiones: {str(e)}')
            return False, f'Error al validar dimensiones: {str(e)}'
    
    @classmethod
    def optimize_image(cls, image_file, image_type: str) -> Tuple[bytes, dict]:
        """
        Optimiza una imagen según su tipo
        
        Args:
            image_file: Archivo de imagen
            image_type: Tipo de imagen ('thumbnail' o 'banner')
            
        Returns:
            Tuple[bytes, dict]: (imagen_optimizada, metadata)
        """
        try:
            # Abrir imagen
            image_file.seek(0)  # Resetear posición del archivo
            img = Image.open(image_file)
            
            # Convertir a RGB si es necesario (para JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Crear fondo blanco para imágenes con transparencia
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Obtener dimensiones objetivo
            if image_type == 'thumbnail':
                max_size = cls.THUMBNAIL_MAX_SIZE
            elif image_type == 'banner':
                max_size = cls.BANNER_MAX_SIZE
            else:
                raise ValueError(f'Tipo de imagen inválido: {image_type}')
            
            # Redimensionar manteniendo aspect ratio
            original_size = img.size
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            final_size = img.size
            
            # Guardar en buffer
            output = BytesIO()
            
            # Determinar formato de salida
            # Intentar WebP primero (mejor compresión), fallback a JPEG
            try:
                img.save(output, format='JPEG', quality=cls.JPEG_QUALITY, optimize=True)
                format_used = 'JPEG'
            except Exception:
                img.save(output, format='PNG', optimize=True)
                format_used = 'PNG'
            
            output.seek(0)
            image_bytes = output.getvalue()
            
            # Metadata
            original_file_size = image_file.size if hasattr(image_file, 'size') else 0
            compression_ratio = 0
            if original_file_size > 0:
                compression_ratio = round((1 - len(image_bytes) / original_file_size) * 100, 2)
            
            metadata = {
                'original_width': original_size[0],
                'original_height': original_size[1],
                'final_width': final_size[0],
                'final_height': final_size[1],
                'original_size': original_file_size,
                'optimized_size': len(image_bytes),
                'format': format_used,
                'compression_ratio': compression_ratio
            }
            
            logger.info(f'Imagen optimizada: {metadata}')
            
            return image_bytes, metadata
            
        except Exception as e:
            logger.error(f'Error optimizando imagen: {str(e)}')
            raise Exception(f'Error al optimizar la imagen: {str(e)}')
    
    @classmethod
    def get_file_extension(cls, image_type: str, format_used: str = 'JPEG') -> str:
        """
        Obtiene la extensión de archivo según el tipo y formato
        
        Args:
            image_type: Tipo de imagen ('thumbnail' o 'banner')
            format_used: Formato usado ('JPEG', 'PNG', 'WEBP')
            
        Returns:
            str: Extensión de archivo
        """
        format_extensions = {
            'JPEG': '.jpg',
            'PNG': '.png',
            'WEBP': '.webp'
        }
        
        extension = format_extensions.get(format_used, '.jpg')
        return extension

