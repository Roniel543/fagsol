"""
Servicio de Subida de Imágenes para Cursos
FagSol Escuela Virtual
"""

import logging
from typing import Tuple, Dict, Any, Optional
from django.conf import settings
from infrastructure.services.image_service import ImageOptimizer
from infrastructure.external_services import LocalFileStorageService

logger = logging.getLogger('apps')


class ImageUploadService:
    """
    Servicio orquestador para subir y optimizar imágenes de cursos
    """
    
    def __init__(self):
        """Inicializa el servicio de subida de imágenes"""
        # Determinar qué servicio de almacenamiento usar
        use_azure = getattr(settings, 'USE_AZURE_STORAGE', False)
        
        if use_azure and not settings.DEBUG:
            try:
                from infrastructure.external_services import AzureBlobStorageService
                self.storage_service = AzureBlobStorageService()
                logger.info('Usando Azure Blob Storage para imágenes')
            except (ImportError, ValueError) as e:
                logger.warning(f'No se pudo inicializar Azure Blob Storage: {str(e)}. Usando almacenamiento local.')
                self.storage_service = LocalFileStorageService()
        else:
            self.storage_service = LocalFileStorageService()
            logger.info('Usando almacenamiento local para imágenes')
    
    def upload_course_image(
        self,
        image_file,
        image_type: str
    ) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Sube y optimiza una imagen de curso
        
        Args:
            image_file: Archivo de imagen
            image_type: Tipo de imagen ('thumbnail' o 'banner')
            
        Returns:
            Tuple[bool, Optional[str], Optional[Dict]]: 
                (éxito, url_o_mensaje_error, metadata)
        """
        try:
            # 1. Validar tipo de imagen
            if image_type not in ['thumbnail', 'banner']:
                return False, 'Tipo de imagen inválido. Debe ser "thumbnail" o "banner"', None
            
            # 2. Validar archivo
            is_valid, error_message = ImageOptimizer.validate_image(image_file)
            if not is_valid:
                return False, error_message, None
            
            # 3. Validar dimensiones mínimas
            is_valid_dimensions, error_message = ImageOptimizer.validate_dimensions(image_file, image_type)
            if not is_valid_dimensions:
                return False, error_message, None
            
            # 4. Optimizar imagen
            try:
                optimized_image, metadata = ImageOptimizer.optimize_image(image_file, image_type)
            except Exception as e:
                logger.error(f'Error optimizando imagen: {str(e)}')
                return False, f'Error al optimizar la imagen: {str(e)}', None
            
            # 5. Generar ruta del archivo
            file_extension = ImageOptimizer.get_file_extension(image_type, metadata.get('format', 'JPEG'))
            
            if isinstance(self.storage_service, LocalFileStorageService):
                # Almacenamiento local
                import os
                from datetime import datetime
                import uuid
                
                now = datetime.now()
                year = now.year
                month = now.month
                
                unique_id = uuid.uuid4().hex[:12]
                file_name = f'{image_type}_{unique_id}{file_extension}'
                file_path = f'courses/images/{image_type}/{year}/{month:02d}/{file_name}'
            else:
                # Azure Blob Storage
                from infrastructure.external_services.azure_storage import AzureBlobStorageService
                file_path = AzureBlobStorageService.generate_file_path(image_type, file_extension)
            
            # 6. Determinar content type
            content_type = 'image/jpeg' if metadata.get('format') == 'JPEG' else 'image/png'
            
            # 7. Subir archivo
            try:
                url = self.storage_service.upload_file(file_path, optimized_image, content_type)
            except Exception as e:
                logger.error(f'Error subiendo archivo: {str(e)}')
                return False, f'Error al subir el archivo: {str(e)}', None
            
            # 8. Preparar respuesta con metadata
            response_metadata = {
                'url': url,
                'width': metadata['final_width'],
                'height': metadata['final_height'],
                'original_width': metadata['original_width'],
                'original_height': metadata['original_height'],
                'size': metadata['optimized_size'],
                'original_size': metadata['original_size'],
                'compression_ratio': metadata['compression_ratio'],
                'format': metadata['format']
            }
            
            logger.info(f'Imagen subida exitosamente: {url}')
            return True, url, response_metadata
            
        except Exception as e:
            logger.error(f'Error en upload_course_image: {str(e)}')
            return False, f'Error al procesar la imagen: {str(e)}', None
    
    def delete_course_image(self, image_url: str) -> bool:
        """
        Elimina una imagen de curso
        
        Args:
            image_url: URL de la imagen a eliminar
            
        Returns:
            bool: True si la imagen fue eliminada correctamente
        """
        try:
            return self.storage_service.delete_file(image_url)
        except Exception as e:
            logger.error(f'Error eliminando imagen: {str(e)}')
            return False

