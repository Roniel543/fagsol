"""
Servicio de Contacto - FagSol Escuela Virtual
Maneja el envío de mensajes de contacto desde el formulario público
"""

import logging
from typing import Tuple, Optional, Dict
from django.conf import settings
from django.utils.html import escape
from django.utils import timezone
from email.header import Header
from infrastructure.external_services import DjangoEmailService
from apps.core.models import ContactMessage

logger = logging.getLogger('apps')


class ContactService:
    """
    Servicio que maneja el envío de mensajes de contacto
    """
    
    def __init__(self):
        self.email_service = DjangoEmailService()
    
    def send_contact_message(
        self,
        name: str,
        email: str,
        phone: str,
        message: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Envía un mensaje de contacto
        
        Args:
            name: Nombre del remitente
            email: Email del remitente
            phone: Teléfono del remitente
            message: Mensaje del remitente
        
        Returns:
            Tuple[success, error_message]
        """
        try:
            # Email para el equipo de FagSol
            admin_email = getattr(settings, 'CONTACT_EMAIL', settings.DEFAULT_FROM_EMAIL)
            
            # ESCAPAR Y SANITIZAR todos los datos del usuario para prevenir XSS
            name_safe = escape(name)
            email_safe = escape(email)
            phone_safe = escape(phone)
            message_safe = escape(message)
            
            # Sanitizar subject para prevenir Email Header Injection
            # Remover caracteres de control (CR, LF, etc.) que podrían inyectar headers
            subject_raw = f"Nuevo mensaje de contacto de {name_safe}"
            # Remover caracteres de control y limitar longitud
            subject_clean = ''.join(char for char in subject_raw if ord(char) >= 32 or char in '\t')
            subject_clean = subject_clean[:200]  # Limitar longitud del subject
            # Usar Header() para sanitización adicional
            subject = str(Header(subject_clean, 'utf-8'))
            
            # Cuerpo del email (texto plano) - usar datos originales para texto plano
            body_text = f"""
Nuevo mensaje de contacto recibido desde el sitio web de FagSol.

Información del contacto:
- Nombre: {name}
- Email: {email}
- Teléfono: {phone}

Mensaje:
{message}

---
Este mensaje fue enviado desde el formulario de contacto de FagSol Escuela Virtual.
"""
            
            # Cuerpo del email (HTML) - usar datos ESCAPADOS para prevenir XSS
            # Convertir saltos de línea a <br> de forma segura
            message_html = message_safe.replace('\n', '<br>').replace('\r', '')
            
            body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #FF6B35; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9f9f9; padding: 20px; }}
        .info {{ background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF6B35; }}
        .message {{ background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #333; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Nuevo Mensaje de Contacto</h2>
        </div>
        <div class="content">
            <p>Se ha recibido un nuevo mensaje de contacto desde el sitio web de FagSol.</p>
            
            <div class="info">
                <h3>Información del Contacto</h3>
                <p><strong>Nombre:</strong> {name_safe}</p>
                <p><strong>Email:</strong> <a href="mailto:{email_safe}">{email_safe}</a></p>
                <p><strong>Teléfono:</strong> {phone_safe}</p>
            </div>
            
            <div class="message">
                <h3>Mensaje</h3>
                <p>{message_html}</p>
            </div>
        </div>
        <div class="footer">
            <p>Este mensaje fue enviado desde el formulario de contacto de FagSol Escuela Virtual.</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Enviar email al equipo
            success = self.email_service.send_email(
                to=admin_email,
                subject=subject,
                body=body_html,
                is_html=True
            )
            
            if not success:
                logger.error(f"Error al enviar email de contacto para {email}")
                return False, "Error al enviar el mensaje. Por favor, inténtalo más tarde."
            
            # Enviar email de confirmación al usuario
            # Usar datos escapados para prevenir XSS
            confirmation_subject = "Hemos recibido tu mensaje - FagSol"
            confirmation_body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #FF6B35; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9f9f9; padding: 20px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Gracias por contactarnos!</h2>
        </div>
        <div class="content">
            <p>Hola {name_safe},</p>
            <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</p>
            <p>Nuestro equipo revisará tu solicitud y te responderá a la brevedad posible.</p>
            <p>Si tienes alguna pregunta urgente, puedes contactarnos directamente:</p>
            <ul>
                <li>Email: dev.fagsol.sac@gmail.com</li>
                <li>Teléfono: +51 954 885 777</li>
                <li>WhatsApp: <a href="https://wa.me/51954885777">+51 954 885 777</a></li>
            </ul>
        </div>
        <div class="footer">
            <p>Saludos,<br>Equipo FagSol Escuela Virtual</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Enviar confirmación (no crítico si falla)
            try:
                self.email_service.send_email(
                    to=email,
                    subject=confirmation_subject,
                    body=confirmation_body_html,
                    is_html=True
                )
            except Exception as e:
                logger.warning(f"Error al enviar email de confirmación a {email}: {str(e)}")
                # No fallar el proceso si la confirmación falla
            
            # Guardar mensaje en la base de datos para que el admin pueda revisarlo
            try:
                ContactMessage.objects.create(
                    name=name,
                    email=email,
                    phone=phone,
                    message=message,
                    status='new'
                )
                logger.info(f"Mensaje de contacto guardado en BD de {name} ({email})")
            except Exception as e:
                logger.error(f"Error al guardar mensaje de contacto en BD: {str(e)}")
                # No fallar el proceso si falla el guardado en BD, el email ya se envió
            
            logger.info(f"Mensaje de contacto enviado exitosamente de {name} ({email})")
            return True, None
            
        except Exception as e:
            logger.error(f"Error al procesar mensaje de contacto: {str(e)}", exc_info=True)
            return False, "Error al procesar tu mensaje. Por favor, inténtalo más tarde."

