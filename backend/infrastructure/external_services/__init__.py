"""
Implementaciones específicas de servicios externos - FagSol Escuela Virtual
"""

import requests
from decimal import Decimal
from typing import Dict, Any
from django.conf import settings
from django.utils import timezone
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
        """
        try:
            from django.conf import settings
            
            # Formatear monto con símbolo de moneda
            currency_symbols = {
                'PEN': 'S/',
                'USD': '$',
                'EUR': '€',
            }
            currency_symbol = currency_symbols.get(currency, currency)
            formatted_amount = f"{currency_symbol} {amount:.2f}"
            
            # Construir lista de cursos
            if len(course_names) == 1:
                courses_text = f'el curso "{course_names[0]}"'
            else:
                courses_list = '\n'.join([f'  • {name}' for name in course_names])
                courses_text = f'los siguientes cursos:\n{courses_list}'
            
            subject = "¡Pago confirmado - FagSol Escuela Virtual!"
            
            # Cuerpo del email en texto plano
            body_text = f"""
Hola {user_name},

¡Tu pago ha sido procesado exitosamente!

Detalles del pago:
  • ID de pago: {payment_id}
  • Monto: {formatted_amount}
  • Cursos: {courses_text}

Ya puedes acceder a {courses_text if len(course_names) == 1 else 'tus cursos'} desde tu panel de usuario.

¡Gracias por confiar en FagSol Escuela Virtual!

Saludos,
Equipo FagSol
            """
            
            # Cuerpo del email en HTML
            body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #1a1a1a;
            color: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }}
        .payment-details {{
            background-color: #fff;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
        }}
        .payment-details h3 {{
            margin-top: 0;
            color: #4CAF50;
        }}
        .payment-details p {{
            margin: 5px 0;
        }}
        .courses-list {{
            background-color: #fff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .courses-list ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .button {{
            display: inline-block;
            background-color: #FF6B35;
            color: #fff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Pago Confirmado!</h1>
    </div>
    <div class="content">
        <p>Hola <strong>{user_name}</strong>,</p>
        
        <p>¡Tu pago ha sido procesado exitosamente!</p>
        
        <div class="payment-details">
            <h3>Detalles del pago</h3>
            <p><strong>ID de pago:</strong> {payment_id}</p>
            <p><strong>Monto:</strong> {formatted_amount}</p>
        </div>
        
        <div class="courses-list">
            <h3>Cursos adquiridos:</h3>
            {'<p>' + course_names[0] + '</p>' if len(course_names) == 1 else '<ul>' + ''.join([f'<li>{name}</li>' for name in course_names]) + '</ul>'}
        </div>
        
        <p>Ya puedes acceder a {'tu curso' if len(course_names) == 1 else 'tus cursos'} desde tu panel de usuario.</p>
        
        <div style="text-align: center;">
            <a href="{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                Ir a mi Dashboard
            </a>
        </div>
        
        <p>¡Gracias por confiar en FagSol Escuela Virtual!</p>
    </div>
    <div class="footer">
        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        <p>© {timezone.now().year} FagSol Escuela Virtual. Todos los derechos reservados.</p>
    </div>
</body>
</html>
            """
            
            # Enviar email con HTML
            return self.send_email(user_email, subject, body_html, is_html=True)
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps')
            logger.error(f"Error al enviar email de confirmación de pago: {str(e)}")
            # Intentar enviar versión de texto plano como fallback
            return self.send_email(user_email, subject, body_text, is_html=False)

    def send_password_reset_email(
        self,
        user_email: str,
        user_name: str,
        reset_url: str
    ) -> bool:
        """
        Envía email de restablecimiento de contraseña
        """
        try:
            from django.conf import settings
            
            subject = "Restablecer tu contraseña - FagSol Escuela Virtual"
            
            # Cuerpo del email en texto plano
            body_text = f"""
Hola {user_name},

Has solicitado restablecer tu contraseña en FagSol Escuela Virtual.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
{reset_url}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios.

Saludos,
Equipo FagSol Escuela Virtual
            """
            
            # Cuerpo del email en HTML
            body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #fff;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }}
        .content {{
            padding: 30px;
        }}
        .content p {{
            margin: 15px 0;
            color: #555;
        }}
        .button-container {{
            text-align: center;
            margin: 30px 0;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            color: #ffffff;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(255, 107, 53, 0.3);
            transition: transform 0.2s;
        }}
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(255, 107, 53, 0.4);
        }}
        .warning-box {{
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .warning-box p {{
            margin: 5px 0;
            color: #856404;
            font-size: 14px;
        }}
        .info-box {{
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .info-box p {{
            margin: 5px 0;
            color: #0c5460;
            font-size: 14px;
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
        }}
        .footer p {{
            margin: 5px 0;
        }}
        .link-fallback {{
            word-break: break-all;
            color: #666;
            font-size: 12px;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{user_name}</strong>,</p>
            
            <p>Has solicitado restablecer tu contraseña en <strong>FagSol Escuela Virtual</strong>.</p>
            
            <div class="button-container">
                <a href="{reset_url}" class="button">
                    Restablecer Contraseña
                </a>
            </div>
            
            <div class="info-box">
                <p><strong>Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por seguridad.</p>
            </div>
            
            <div class="warning-box">
                <p><strong>Seguridad:</strong> Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios.</p>
            </div>
            
            <p class="link-fallback">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="{reset_url}" style="color: #FF6B35;">{reset_url}</a>
            </p>
        </div>
        <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© {timezone.now().year} FagSol Escuela Virtual. Todos los derechos reservados.</p>
            <p style="margin-top: 10px;">
                <a href="{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}" style="color: #FF6B35; text-decoration: none;">
                    FagSol Escuela Virtual
                </a>
            </p>
        </div>
    </div>
</body>
</html>
            """
            
            # Enviar email con HTML
            return self.send_email(user_email, subject, body_html, is_html=True)
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps')
            logger.error(f"Error al enviar email de reset de contraseña: {str(e)}")
            # Intentar enviar versión de texto plano como fallback
            return self.send_email(user_email, subject, body_text, is_html=False)


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
            
            # Retornar URL relativa (se convertirá a absoluta en el endpoint)
            # Asegurar que MEDIA_URL tenga el / inicial
            media_url = settings.MEDIA_URL
            if not media_url.startswith('/'):
                media_url = '/' + media_url
            if not media_url.endswith('/'):
                media_url = media_url + '/'
            return f"{media_url}{file_path}"
            
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


# Importar AzureBlobStorageService si está disponible
try:
    from .azure_storage import AzureBlobStorageService
    __all__ = [
        'MercadoPagoPaymentGateway',
        'DjangoEmailService',
        'DjangoNotificationService',
        'LocalFileStorageService',
        'AzureBlobStorageService',
    ]
except ImportError:
    __all__ = [
        'MercadoPagoPaymentGateway',
        'DjangoEmailService',
        'DjangoNotificationService',
        'LocalFileStorageService',
    ]
