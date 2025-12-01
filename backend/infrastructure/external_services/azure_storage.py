"""
Servicio de Almacenamiento Azure Blob Storage
FagSol Escuela Virtual
"""

import logging
import uuid
from datetime import datetime
from typing import Optional
from django.conf import settings
from infrastructure.adapters import FileStorageService

logger = logging.getLogger('apps')

try:
    from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
    from azure.core.exceptions import AzureError
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logger.warning('azure-storage-blob no está instalado. Azure Blob Storage no estará disponible.')


class AzureBlobStorageService(FileStorageService):
    """
    Implementación del servicio de almacenamiento usando Azure Blob Storage
    """
    
    def __init__(self):
        """Inicializa el servicio de Azure Blob Storage"""
        if not AZURE_AVAILABLE:
            raise ImportError('azure-storage-blob no está instalado. Instala con: pip install azure-storage-blob')
        
        self.account_name = getattr(settings, 'AZURE_STORAGE_ACCOUNT_NAME', None)
        self.account_key = getattr(settings, 'AZURE_STORAGE_ACCOUNT_KEY', None)
        self.container_name = getattr(settings, 'AZURE_STORAGE_CONTAINER_NAME', 'fagsol-media')
        
        if not self.account_name or not self.account_key:
            raise ValueError('Azure Storage credentials no configuradas. Configura AZURE_STORAGE_ACCOUNT_NAME y AZURE_STORAGE_ACCOUNT_KEY')
        
        # Crear cliente de servicio
        connection_string = (
            f'DefaultEndpointsProtocol=https;'
            f'AccountName={self.account_name};'
            f'AccountKey={self.account_key};'
            f'EndpointSuffix=core.windows.net'
        )
        
        try:
            self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
            
            # Crear container si no existe
            if not self.container_client.exists():
                self.container_client.create_container()
                logger.info(f'Container {self.container_name} creado en Azure Blob Storage')
                
        except AzureError as e:
            logger.error(f'Error conectando a Azure Blob Storage: {str(e)}')
            raise Exception(f'Error conectando a Azure Blob Storage: {str(e)}')
    
    def upload_file(self, file_path: str, file_content: bytes, content_type: str) -> str:
        """
        Sube un archivo a Azure Blob Storage
        
        Args:
            file_path: Ruta del archivo dentro del container
            file_content: Contenido del archivo en bytes
            content_type: Tipo de contenido (MIME type)
            
        Returns:
            str: URL pública del archivo
        """
        try:
            blob_client = self.container_client.get_blob_client(file_path)
            
            # Subir archivo
            blob_client.upload_blob(
                file_content,
                overwrite=False,  # No sobrescribir archivos existentes
                content_settings={
                    'content_type': content_type,
                    'cache_control': 'public, max-age=31536000'  # Cache por 1 año
                }
            )
            
            # Obtener URL pública
            url = blob_client.url
            
            logger.info(f'Archivo subido a Azure: {url}')
            return url
            
        except AzureError as e:
            logger.error(f'Error subiendo archivo a Azure: {str(e)}')
            raise Exception(f'Error al subir archivo a Azure Blob Storage: {str(e)}')
    
    def delete_file(self, file_url: str) -> bool:
        """
        Elimina un archivo de Azure Blob Storage
        
        Args:
            file_url: URL del archivo a eliminar
            
        Returns:
            bool: True si el archivo fue eliminado correctamente
        """
        try:
            # Extraer nombre del blob de la URL
            # URL formato: https://{account}.blob.core.windows.net/{container}/{blob_path}
            blob_path = file_url.split(f'{self.container_name}/')[-1].split('?')[0]
            
            blob_client = self.container_client.get_blob_client(blob_path)
            
            if blob_client.exists():
                blob_client.delete_blob()
                logger.info(f'Archivo eliminado de Azure: {blob_path}')
                return True
            
            return False
            
        except AzureError as e:
            logger.error(f'Error eliminando archivo de Azure: {str(e)}')
            return False
        except Exception as e:
            logger.error(f'Error procesando eliminación de archivo: {str(e)}')
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """
        Obtiene la URL de un archivo en Azure Blob Storage
        
        Args:
            file_path: Ruta del archivo dentro del container
            
        Returns:
            str: URL pública del archivo
        """
        try:
            blob_client = self.container_client.get_blob_client(file_path)
            return blob_client.url
        except AzureError as e:
            logger.error(f'Error obteniendo URL de archivo: {str(e)}')
            raise Exception(f'Error al obtener URL del archivo: {str(e)}')
    
    @staticmethod
    def generate_file_path(image_type: str, file_extension: str) -> str:
        """
        Genera una ruta única para el archivo
        
        Args:
            image_type: Tipo de imagen ('thumbnail' o 'banner')
            file_extension: Extensión del archivo (ej: '.jpg')
            
        Returns:
            str: Ruta del archivo
        """
        now = datetime.now()
        year = now.year
        month = now.month
        
        # Generar nombre único
        unique_id = uuid.uuid4().hex[:12]
        file_name = f'{image_type}_{unique_id}{file_extension}'
        
        # Ruta: courses/images/{type}/{year}/{month}/{filename}
        file_path = f'courses/images/{image_type}/{year}/{month:02d}/{file_name}'
        
        return file_path

