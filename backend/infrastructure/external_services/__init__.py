"""
Implementaciones específicas de servicios externos - FagSol Escuela Virtual
"""

import requests
from decimal import Decimal
from typing import Dict, Any
from django.conf import settings
from ..adapters import PaymentGateway, EmailService, NotificationService, FileStorageService


class MercadoPagoPaymentGateway(PaymentGateway):
    """
    Implementación del gateway de pago usando MercadoPago
    """
    
    def __init__(self):
        self.access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '')
        self.base_url = 'https://api.mercadopago.com'
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

    def create_payment_preference(self, amount: Decimal, currency: str, description: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea una preferencia de pago en MercadoPago
        """
        try:
            url = f"{self.base_url}/checkout/preferences"
            
            preference_data = {
                "items": [
                    {
                        "title": description,
                        "quantity": 1,
                        "unit_price": float(amount),
                        "currency_id": currency
                    }
                ],
                "metadata": metadata,
                "auto_return": "approved",
                "back_urls": {
                    "success": f"{settings.FRONTEND_URL}/payment/success",
                    "failure": f"{settings.FRONTEND_URL}/payment/failure",
                    "pending": f"{settings.FRONTEND_URL}/payment/pending"
                }
            }
            
            response = requests.post(url, json=preference_data, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            raise Exception(f"Error al crear preferencia de pago: {str(e)}")

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Obtiene el estado de un pago en MercadoPago
        """
        try:
            url = f"{self.base_url}/v1/payments/{payment_id}"
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            raise Exception(f"Error al obtener estado del pago: {str(e)}")

    def process_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """
        Procesa un webhook de MercadoPago
        """
        try:
            # Validar la firma del webhook si está configurada
            webhook_secret = getattr(settings, 'MERCADOPAGO_WEBHOOK_SECRET', '')
            if webhook_secret:
                # Aquí se implementaría la validación de la firma
                pass
            
            # Procesar el webhook
            payment_id = webhook_data.get('data', {}).get('id')
            if payment_id:
                payment_status = self.get_payment_status(payment_id)
                # Aquí se actualizaría el estado del pago en la base de datos
                return True
            
            return False
            
        except Exception as e:
            print(f"Error al procesar webhook: {str(e)}")
            return False


class DjangoEmailService(EmailService):
    """
    Implementación del servicio de email usando Django
    """
    
    def send_email(self, to: str, subject: str, body: str, is_html: bool = False) -> bool:
        """
        Envía un email usando Django
        """
        try:
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            
            if is_html:
                send_mail(
                    subject=subject,
                    message='',  # Django maneja el HTML automáticamente
                    html_message=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to],
                    fail_silently=False
                )
            else:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to],
                    fail_silently=False
                )
            
            return True
            
        except Exception as e:
            print(f"Error al enviar email: {str(e)}")
            return False

    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """
        Envía email de bienvenida
        """
        subject = "¡Bienvenido a FagSol Escuela Virtual!"
        body = f"""
        Hola {user_name},
        
        ¡Bienvenido a FagSol Escuela Virtual!
        
        Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a todos nuestros cursos
        especializados en automatización industrial.
        
        ¡Esperamos que disfrutes aprendiendo con nosotros!
        
        Saludos,
        Equipo FagSol
        """
        
        return self.send_email(user_email, subject, body)

    def send_course_enrollment_email(self, user_email: str, user_name: str, course_name: str) -> bool:
        """
        Envía email de confirmación de inscripción
        """
        subject = f"Confirmación de inscripción - {course_name}"
        body = f"""
        Hola {user_name},
        
        Tu inscripción al curso "{course_name}" ha sido confirmada exitosamente.
        
        Ya puedes acceder al contenido del curso desde tu panel de usuario.
        
        ¡Que tengas un excelente aprendizaje!
        
        Saludos,
        Equipo FagSol
        """
        
        return self.send_email(user_email, subject, body)


class DjangoNotificationService(NotificationService):
    """
    Implementación del servicio de notificaciones usando Django
    """
    
    def send_notification(self, user_id: int, title: str, message: str, notification_type: str) -> bool:
        """
        Envía una notificación (implementación básica)
        """
        try:
            # Aquí se implementaría el sistema de notificaciones
            # Por ahora solo registramos en logs
            print(f"Notificación para usuario {user_id}: {title} - {message}")
            return True
            
        except Exception as e:
            print(f"Error al enviar notificación: {str(e)}")
            return False

    def send_course_completion_notification(self, user_id: int, course_name: str) -> bool:
        """
        Envía notificación de finalización de curso
        """
        title = "¡Curso Completado!"
        message = f"Felicitaciones, has completado el curso '{course_name}' exitosamente."
        
        return self.send_notification(user_id, title, message, "course_completion")


class LocalFileStorageService(FileStorageService):
    """
    Implementación del servicio de almacenamiento usando el sistema de archivos local
    """
    
    def upload_file(self, file_path: str, file_content: bytes, content_type: str) -> str:
        """
        Sube un archivo al almacenamiento local
        """
        try:
            import os
            from django.conf import settings
            
            # Crear directorio si no existe
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Escribir archivo
            with open(full_path, 'wb') as f:
                f.write(file_content)
            
            # Retornar URL
            return f"{settings.MEDIA_URL}{file_path}"
            
        except Exception as e:
            raise Exception(f"Error al subir archivo: {str(e)}")

    def delete_file(self, file_url: str) -> bool:
        """
        Elimina un archivo del almacenamiento local
        """
        try:
            import os
            from django.conf import settings
            
            # Convertir URL a ruta de archivo
            if file_url.startswith(settings.MEDIA_URL):
                file_path = file_url.replace(settings.MEDIA_URL, '')
                full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                
                if os.path.exists(full_path):
                    os.remove(full_path)
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error al eliminar archivo: {str(e)}")
            return False

    def get_file_url(self, file_path: str) -> str:
        """
        Obtiene la URL de un archivo
        """
        from django.conf import settings
        return f"{settings.MEDIA_URL}{file_path}"
