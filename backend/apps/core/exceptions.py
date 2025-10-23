"""
Custom exception handlers for the FagSol API
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler que proporciona respuestas consistentes
    """
    # Llamar al handler por defecto de DRF
    response = exception_handler(exc, context)

    if response is not None:
        # Personalizar la estructura de la respuesta de error
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data},
                'status_code': response.status_code
            }
        }
        response.data = custom_response_data

    return response


class BusinessLogicError(Exception):
    """
    Excepción personalizada para errores de lógica de negocio
    """
    def __init__(self, message, code=None):
        self.message = message
        self.code = code or 'business_logic_error'
        super().__init__(self.message)


class PaymentError(Exception):
    """
    Excepción para errores relacionados con pagos
    """
    def __init__(self, message, code=None):
        self.message = message
        self.code = code or 'payment_error'
        super().__init__(self.message)


class EnrollmentError(Exception):
    """
    Excepción para errores de inscripción
    """
    def __init__(self, message, code=None):
        self.message = message
        self.code = code or 'enrollment_error'
        super().__init__(self.message)

