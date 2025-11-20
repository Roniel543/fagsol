"""
Adaptadores para servicios externos - FagSol Escuela Virtual

Estos adaptadores implementan las interfaces para servicios externos como MercadoPago
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from decimal import Decimal


class PaymentGateway(ABC):
    """
    Interfaz para gateways de pago
    """
    
    @abstractmethod
    def create_payment_preference(self, amount: Decimal, currency: str, description: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea una preferencia de pago
        
        Args:
            amount: Monto del pago
            currency: Moneda del pago
            description: Descripción del pago
            metadata: Metadatos adicionales
            
        Returns:
            Dict con la información de la preferencia creada
        """
        pass

    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Obtiene el estado de un pago
        
        Args:
            payment_id: ID del pago
            
        Returns:
            Dict con el estado del pago
        """
        pass

    @abstractmethod
    def process_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """
        Procesa un webhook de pago
        
        Args:
            webhook_data: Datos del webhook
            
        Returns:
            bool: True si el webhook fue procesado correctamente
        """
        pass


class EmailService(ABC):
    """
    Interfaz para servicios de email
    """
    
    @abstractmethod
    def send_email(self, to: str, subject: str, body: str, is_html: bool = False) -> bool:
        """
        Envía un email
        
        Args:
            to: Email destinatario
            subject: Asunto del email
            body: Cuerpo del email
            is_html: Si el cuerpo es HTML
            
        Returns:
            bool: True si el email fue enviado correctamente
        """
        pass

    @abstractmethod
    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """
        Envía email de bienvenida
        
        Args:
            user_email: Email del usuario
            user_name: Nombre del usuario
            
        Returns:
            bool: True si el email fue enviado correctamente
        """
        pass

    @abstractmethod
    def send_course_enrollment_email(self, user_email: str, user_name: str, course_name: str) -> bool:
        """
        Envía email de confirmación de inscripción
        
        Args:
            user_email: Email del usuario
            user_name: Nombre del usuario
            course_name: Nombre del curso
            
        Returns:
            bool: True si el email fue enviado correctamente
        """
        pass

    @abstractmethod
    def send_payment_success_email(
        self, 
        user_email: str, 
        user_name: str, 
        payment_id: str, 
        amount: float, 
        currency: str, 
        course_names: list[str]
    ) -> bool:
        """
        Envía email de confirmación de pago exitoso
        
        Args:
            user_email: Email del usuario
            user_name: Nombre del usuario
            payment_id: ID del pago
            amount: Monto pagado
            currency: Moneda del pago
            course_names: Lista de nombres de cursos comprados
            
        Returns:
            bool: True si el email fue enviado correctamente
        """
        pass


class NotificationService(ABC):
    """
    Interfaz para servicios de notificaciones
    """
    
    @abstractmethod
    def send_notification(self, user_id: int, title: str, message: str, notification_type: str) -> bool:
        """
        Envía una notificación
        
        Args:
            user_id: ID del usuario
            title: Título de la notificación
            message: Mensaje de la notificación
            notification_type: Tipo de notificación
            
        Returns:
            bool: True si la notificación fue enviada correctamente
        """
        pass

    @abstractmethod
    def send_course_completion_notification(self, user_id: int, course_name: str) -> bool:
        """
        Envía notificación de finalización de curso
        
        Args:
            user_id: ID del usuario
            course_name: Nombre del curso
            
        Returns:
            bool: True si la notificación fue enviada correctamente
        """
        pass


class FileStorageService(ABC):
    """
    Interfaz para servicios de almacenamiento de archivos
    """
    
    @abstractmethod
    def upload_file(self, file_path: str, file_content: bytes, content_type: str) -> str:
        """
        Sube un archivo
        
        Args:
            file_path: Ruta del archivo
            file_content: Contenido del archivo
            content_type: Tipo de contenido
            
        Returns:
            str: URL del archivo subido
        """
        pass

    @abstractmethod
    def delete_file(self, file_url: str) -> bool:
        """
        Elimina un archivo
        
        Args:
            file_url: URL del archivo
            
        Returns:
            bool: True si el archivo fue eliminado correctamente
        """
        pass

    @abstractmethod
    def get_file_url(self, file_path: str) -> str:
        """
        Obtiene la URL de un archivo
        
        Args:
            file_path: Ruta del archivo
            
        Returns:
            str: URL del archivo
        """
        pass
