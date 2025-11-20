"""
Endpoints de Pagos - FagSol Escuela Virtual
"""

import logging
import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from infrastructure.services.payment_service import PaymentService
from apps.payments.models import PaymentIntent, Payment
from apps.users.permissions import (
    IsStudent,
    can_process_payment, get_user_role, ROLE_ADMIN, ROLE_INSTRUCTOR
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='post',
    operation_description='Crea un payment intent (intención de pago) para los cursos especificados. Solo estudiantes pueden crear payment intents.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['course_ids'],
        properties={
            'course_ids': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_STRING),
                description='Lista de IDs de cursos a comprar',
                example=['course-1', 'course-2']
            ),
        }
    ),
    responses={
        201: openapi.Response(
            description='Payment intent creado exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'id': 'pi_abc123',
                        'total': 300.00,
                        'currency': 'PEN',
                        'items': [
                            {'course_id': 'course-1', 'course_title': 'Curso 1', 'price': 100.00},
                            {'course_id': 'course-2', 'course_title': 'Curso 2', 'price': 200.00}
                        ],
                        'status': 'pending'
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='Solo estudiantes pueden crear payment intents'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Pagos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Crea un payment intent (intención de pago)
    POST /api/v1/payments/intent/
    
    Body:
    {
        "course_ids": ["c-001", "c-002"]
    }
    
    Permisos:
    - Solo estudiantes pueden crear payment intents
    - Admin e instructores no pueden procesar pagos
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "pi_...",
            "total": 149.00,
            "currency": "PEN",
            "items": [...],
            "status": "pending"
        }
    }
    """
    try:
        # Verificar que el usuario sea estudiante
        if not can_process_payment(request.user):
            return Response({
                'success': False,
                'message': 'Solo los estudiantes pueden crear payment intents'
            }, status=status.HTTP_403_FORBIDDEN)
        # 1. Validar datos de entrada
        course_ids = request.data.get('course_ids', [])
        
        if not course_ids or not isinstance(course_ids, list):
            return Response({
                'success': False,
                'message': 'course_ids es requerido y debe ser una lista'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(course_ids) == 0:
            return Response({
                'success': False,
                'message': 'Debe incluir al menos un curso'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Crear payment intent
        payment_service = PaymentService()
        success, payment_intent, error_message = payment_service.create_payment_intent(
            user=request.user,
            course_ids=course_ids,
            metadata={'ip': request.META.get('REMOTE_ADDR')}
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Obtener detalles de cursos para la respuesta
        from apps.courses.models import Course
        courses = Course.objects.filter(id__in=course_ids)
        items = []
        for course in courses:
            items.append({
                'course_id': course.id,
                'course_title': course.title,
                'price': float(course.price)
            })
        
        # 4. Retornar respuesta
        return Response({
            'success': True,
            'data': {
                'id': payment_intent.id,
                'total': float(payment_intent.total),
                'currency': payment_intent.currency,
                'items': items,
                'status': payment_intent.status,
                'expires_at': payment_intent.expires_at.isoformat() if payment_intent.expires_at else None
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error en create_payment_intent: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Tokeniza una tarjeta usando Mercado Pago. Solo estudiantes pueden tokenizar tarjetas. IMPORTANTE: Este endpoint debe usarse desde el backend, nunca desde el frontend directamente.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['card_number', 'cardholder_name', 'expiration_month', 'expiration_year', 'security_code'],
        properties={
            'card_number': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Número de tarjeta (sin espacios)',
                example='5031755734530604'
            ),
            'cardholder_name': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Nombre del titular de la tarjeta',
                example='JUAN PEREZ'
            ),
            'expiration_month': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Mes de expiración (MM)',
                example='12'
            ),
            'expiration_year': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Año de expiración (YY)',
                example='25'
            ),
            'security_code': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='CVV de la tarjeta',
                example='123'
            ),
            'identification_type': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Tipo de identificación (DNI, etc.)',
                example='DNI'
            ),
            'identification_number': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Número de identificación',
                example='12345678'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Tarjeta tokenizada exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'token': 'token_mercadopago_123'
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos o error en la tokenización'),
        403: openapi.Response(description='Solo estudiantes pueden tokenizar tarjetas'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Pagos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tokenize_card(request):
    """
    Tokeniza una tarjeta usando Mercado Pago
    POST /api/v1/payments/tokenize/
    
    Body:
    {
        "card_number": "5031755734530604",
        "cardholder_name": "JUAN PEREZ",
        "expiration_month": "12",
        "expiration_year": "25",
        "security_code": "123",
        "identification_type": "DNI",
        "identification_number": "12345678"
    }
    
    Permisos:
    - Solo estudiantes pueden tokenizar tarjetas
    
    Returns:
    {
        "success": true,
        "data": {
            "token": "token_mercadopago_123"
        }
    }
    """
    try:
        # Verificar que el usuario sea estudiante
        if not can_process_payment(request.user):
            return Response({
                'success': False,
                'message': 'Solo los estudiantes pueden tokenizar tarjetas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 1. Validar datos de entrada
        card_number = request.data.get('card_number', '').strip()
        cardholder_name = request.data.get('cardholder_name', '').strip()
        expiration_month = request.data.get('expiration_month', '').strip()
        expiration_year = request.data.get('expiration_year', '').strip()
        security_code = request.data.get('security_code', '').strip()
        identification_type = request.data.get('identification_type', 'DNI').strip()
        identification_number = request.data.get('identification_number', '12345678').strip()
        
        # Validaciones básicas
        if not card_number:
            return Response({
                'success': False,
                'message': 'card_number es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not cardholder_name:
            return Response({
                'success': False,
                'message': 'cardholder_name es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not expiration_month or not expiration_year:
            return Response({
                'success': False,
                'message': 'expiration_month y expiration_year son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not security_code:
            return Response({
                'success': False,
                'message': 'security_code es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Tokenizar tarjeta usando el servicio
        payment_service = PaymentService()
        success, token, error_message = payment_service.tokenize_card(
            card_number=card_number,
            cardholder_name=cardholder_name,
            expiration_month=expiration_month,
            expiration_year=expiration_year,
            security_code=security_code,
            identification_type=identification_type,
            identification_number=identification_number
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Retornar token (NO retornar datos de tarjeta)
        return Response({
            'success': True,
            'data': {
                'token': token
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en tokenize_card: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Procesa un pago con Mercado Pago usando tokenización. Solo estudiantes pueden procesar pagos.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['payment_intent_id', 'payment_token', 'expiration_month', 'expiration_year'],
        properties={
            'payment_intent_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID del payment intent a procesar',
                example='pi_abc123'
            ),
            'payment_token': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Token de Mercado Pago (tokenizado, NO datos de tarjeta)',
                example='token_mercadopago_123'
            ),
            'expiration_month': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Mes de expiración de la tarjeta (MM)',
                example='12'
            ),
            'expiration_year': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Año de expiración de la tarjeta (YY o YYYY)',
                example='25'
            ),
            'idempotency_key': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Clave de idempotencia para evitar cobros duplicados (opcional)',
                example='idemp_key_123'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Pago procesado exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'payment_id': 'pay_abc123',
                        'status': 'approved',
                        'enrollment_ids': ['enr_1', 'enr_2'],
                        'amount': 300.00,
                        'currency': 'PEN'
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos o error en el procesamiento'),
        403: openapi.Response(description='Solo estudiantes pueden procesar pagos'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Pagos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """
    Procesa un pago con Mercado Pago
    POST /api/v1/payments/process/
    
    Body:
    {
        "payment_intent_id": "pi_...",
        "payment_token": "token_de_mercadopago",
        "expiration_month": "12",
        "expiration_year": "25",
        "idempotency_key": "optional_key"  # Opcional
    }
    
    Permisos:
    - Solo estudiantes pueden procesar pagos
    - El payment intent debe pertenecer al usuario
    
    Returns:
    {
        "success": true,
        "data": {
            "payment_id": "pay_...",
            "status": "approved",
            "enrollment_ids": ["enr_1", "enr_2"]
        }
    }
    """
    try:
        # Verificar que el usuario sea estudiante
        if not can_process_payment(request.user):
            return Response({
                'success': False,
                'message': 'Solo los estudiantes pueden procesar pagos'
            }, status=status.HTTP_403_FORBIDDEN)
        # 1. Validar datos de entrada
        payment_intent_id = request.data.get('payment_intent_id')
        payment_token = request.data.get('payment_token')
        expiration_month = request.data.get('expiration_month')
        expiration_year = request.data.get('expiration_year')
        
        if not payment_intent_id or not payment_token:
            return Response({
                'success': False,
                'message': 'payment_intent_id y payment_token son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not expiration_month or not expiration_year:
            return Response({
                'success': False,
                'message': 'expiration_month y expiration_year son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Generar idempotency key si no se proporciona
        idempotency_key = request.data.get('idempotency_key')
        if not idempotency_key:
            idempotency_key = f"{payment_intent_id}_{uuid.uuid4().hex[:16]}"
        
        # 3. Procesar pago
        payment_service = PaymentService()
        success, payment, error_message = payment_service.process_payment(
            user=request.user,
            payment_intent_id=payment_intent_id,
            payment_token=payment_token,
            expiration_month=expiration_month,
            expiration_year=expiration_year,
            idempotency_key=idempotency_key
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Obtener enrollments creados
        from apps.users.models import Enrollment
        enrollments = Enrollment.objects.filter(payment=payment)
        enrollment_ids = [enr.id for enr in enrollments]
        
        # 5. Retornar respuesta
        return Response({
            'success': True,
            'data': {
                'payment_id': payment.id,
                'status': payment.status,
                'enrollment_ids': enrollment_ids,
                'amount': float(payment.amount),
                'currency': payment.currency
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en process_payment: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_intent(request, payment_intent_id):
    """
    Obtiene el estado de un payment intent
    GET /api/v1/payments/intent/{payment_intent_id}/
    """
    try:
        # 1. Obtener payment intent
        try:
            payment_intent = PaymentIntent.objects.get(id=payment_intent_id, user=request.user)
        except PaymentIntent.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Payment intent no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Obtener detalles de cursos
        from apps.courses.models import Course
        courses = Course.objects.filter(id__in=payment_intent.course_ids)
        items = []
        for course in courses:
            items.append({
                'course_id': course.id,
                'course_title': course.title,
                'price': float(course.price)
            })
        
        # 3. Retornar respuesta
        return Response({
            'success': True,
            'data': {
                'id': payment_intent.id,
                'total': float(payment_intent.total),
                'currency': payment_intent.currency,
                'items': items,
                'status': payment_intent.status,
                'expires_at': payment_intent.expires_at.isoformat() if payment_intent.expires_at else None,
                'created_at': payment_intent.created_at.isoformat()
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_payment_intent: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([])  # Sin autenticación (webhook de Mercado Pago)
def payment_webhook(request):
    """
    Webhook de Mercado Pago
    POST /api/v1/payments/webhook/
    
    Recibe notificaciones de Mercado Pago sobre cambios en pagos
    """
    try:
        # 1. Verificar firma del webhook
        x_signature = request.META.get('HTTP_X_SIGNATURE', '')
        x_request_id = request.META.get('HTTP_X_REQUEST_ID', '')
        data_id = request.data.get('data', {}).get('id', '')
        
        payment_service = PaymentService()
        if not payment_service.verify_webhook_signature(x_signature, x_request_id, data_id):
            logger.warning(f"Firma de webhook inválida: {x_request_id}")
            return Response({
                'success': False,
                'message': 'Firma inválida'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 2. Procesar webhook
        success, error_message = payment_service.process_webhook(request.data)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Retornar respuesta
        return Response({
            'success': True,
            'message': 'Webhook procesado correctamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en payment_webhook: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

