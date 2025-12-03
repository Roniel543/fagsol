"""
Endpoints de Contacto - FagSol Escuela Virtual
Maneja el formulario de contacto público
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django_ratelimit.decorators import ratelimit
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from infrastructure.services.contact_service import ContactService

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='post',
    operation_description='Envía un mensaje de contacto desde el formulario público. No requiere autenticación.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['name', 'email', 'phone', 'message'],
        properties={
            'name': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Nombre completo del remitente',
                minLength=3,
                maxLength=100
            ),
            'email': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_EMAIL,
                description='Email del remitente'
            ),
            'phone': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Teléfono del remitente',
                pattern='^\+?[\d\s-]{9,}$'
            ),
            'message': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Mensaje del remitente',
                minLength=10,
                maxLength=2000
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Mensaje enviado exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.'
                }
            }
        ),
        400: openapi.Response(
            description='Datos inválidos',
            examples={
                'application/json': {
                    'success': False,
                    'message': 'Datos inválidos',
                    'errors': {
                        'name': 'El nombre debe tener al menos 3 caracteres',
                        'email': 'Ingrese un email válido'
                    }
                }
            }
        ),
        429: openapi.Response(
            description='Demasiadas solicitudes. Por favor, espera antes de intentar nuevamente.'
        ),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Contacto']
)
@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/h', method='POST', block=True)  # 5 mensajes por hora por IP
@ratelimit(key='post:email', rate='3/h', method='POST', block=True)  # 3 mensajes por hora por email
def send_contact_message(request):
    """
    Envía un mensaje de contacto
    POST /api/v1/contact/
    
    No requiere autenticación. Rate limited a 5 mensajes por hora por IP.
    """
    try:
        # 1. Obtener y validar datos
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()
        message = request.data.get('message', '').strip()
        
        # 2. Validación de campos requeridos
        errors = {}
        
        if not name or len(name) < 3:
            errors['name'] = 'El nombre debe tener al menos 3 caracteres'
        elif len(name) > 100:
            errors['name'] = 'El nombre no puede exceder 100 caracteres'
        
        if not email:
            errors['email'] = 'El email es requerido'
        elif len(email) > 254:  # RFC 5321
            errors['email'] = 'El email es demasiado largo'
        else:
            # Validación robusta usando Django validator
            try:
                validate_email(email)
            except ValidationError:
                errors['email'] = 'Ingrese un email válido'
        
        if not phone:
            errors['phone'] = 'El teléfono es requerido'
        elif not phone.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            errors['phone'] = 'Ingrese un teléfono válido'
        elif len(phone.replace('+', '').replace('-', '').replace(' ', '')) < 9:
            errors['phone'] = 'El teléfono debe tener al menos 9 dígitos'
        
        if not message:
            errors['message'] = 'El mensaje es requerido'
        elif len(message) < 10:
            errors['message'] = 'El mensaje debe tener al menos 10 caracteres'
        elif len(message) > 2000:
            errors['message'] = 'El mensaje no puede exceder 2000 caracteres'
        
        # 3. Si hay errores, retornar
        if errors:
            return Response({
                'success': False,
                'message': 'Datos inválidos',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Sanitizar datos básicos (prevenir caracteres de control)
        # Nota: El escape HTML completo se hace en el servicio de email
        # Aquí solo removemos caracteres de control peligrosos
        import re
        # Remover caracteres de control (CR, LF, etc.) que podrían causar problemas
        name = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', name)
        email = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', email)
        phone = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', phone)
        message = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', message)
        
        # 5. Enviar mensaje usando el servicio
        contact_service = ContactService()
        success, error_message = contact_service.send_contact_message(
            name=name,
            email=email,
            phone=phone,
            message=message
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message or 'Error al enviar el mensaje. Por favor, inténtalo más tarde.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 6. Retornar éxito
        return Response({
            'success': True,
            'message': 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en send_contact_message: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

