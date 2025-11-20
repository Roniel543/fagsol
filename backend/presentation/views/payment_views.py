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
from presentation.serializers.payment_serializers import PaymentHistorySerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.pagination import PageNumberPagination

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
    operation_description='[DEPRECATED] Tokeniza una tarjeta usando Mercado Pago. Este endpoint está DEPRECADO. Usar CardPayment Brick en el frontend en su lugar. Solo estudiantes pueden tokenizar tarjetas.',
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
    [DEPRECATED] Tokeniza una tarjeta usando Mercado Pago
    
    ⚠️ DEPRECADO: Este endpoint está deprecado. 
    El frontend ahora usa Mercado Pago CardPayment Brick para tokenización client-side.
    Este endpoint se mantiene solo para compatibilidad con sistemas legacy.
    
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
        success, token, payment_method_id, error_message = payment_service.tokenize_card(
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
        
        # 3. Retornar token y payment_method_id (necesario para procesar el pago)
        return Response({
            'success': True,
            'data': {
                'token': token,
                'payment_method_id': payment_method_id  # Ej: "visa", "master", etc.
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
    operation_description='Procesa un pago con Mercado Pago usando CardPayment Brick. Solo estudiantes pueden procesar pagos. IMPORTANTE: Solo acepta token, payment_method_id, installments, amount. NO acepta datos de tarjeta.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['token', 'payment_method_id', 'installments', 'amount', 'payment_intent_id'],
        properties={
            'token': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Token de Mercado Pago obtenido de CardPayment Brick',
                example='token_mercadopago_123'
            ),
            'payment_method_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Payment method ID (ej: visa, master, amex)',
                example='visa'
            ),
            'installments': openapi.Schema(
                type=openapi.TYPE_INTEGER,
                description='Número de cuotas',
                example=1
            ),
            'amount': openapi.Schema(
                type=openapi.TYPE_NUMBER,
                description='Monto del pago (será validado contra payment_intent.total desde DB)',
                example=150.0
            ),
            'payment_intent_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID del payment intent a procesar',
                example='pi_abc123'
            ),
            'idempotency_key': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Clave de idempotencia para evitar cobros duplicados (opcional, se genera si no se proporciona)',
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
    Procesa un pago con Mercado Pago usando CardPayment Brick
    POST /api/v1/payments/process/
    
    Body:
    {
        "token": "token_de_mercadopago",
        "payment_method_id": "visa",
        "installments": 1,
        "amount": 150.0,
        "payment_intent_id": "pi_...",
        "idempotency_key": "optional_key"  # Opcional
    }
    
    IMPORTANTE: Solo acepta token, payment_method_id, installments, amount.
    NO acepta datos de tarjeta (card_number, expiration_month, expiration_year, security_code).
    
    Permisos:
    - Solo estudiantes pueden procesar pagos
    - El payment intent debe pertenecer al usuario
    - El amount será validado contra payment_intent.total desde DB
    
    Returns:
    {
        "success": true,
        "data": {
            "payment_id": "pay_...",
            "status": "approved",
            "enrollment_ids": ["enr_1", "enr_2"],
            "amount": 150.0,
            "currency": "PEN"
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
        
        # 1. Validar datos con serializer
        from presentation.serializers.payment_serializers import ProcessPaymentSerializer
        serializer = ProcessPaymentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Datos inválidos',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # 2. Obtener idempotency key del header o del body
        idempotency_key = request.META.get('HTTP_X_IDEMPOTENCY_KEY') or validated_data.get('idempotency_key')
        if not idempotency_key:
            idempotency_key = f"{validated_data['payment_intent_id']}_{uuid.uuid4().hex[:16]}"
        
        # 3. Procesar pago
        payment_service = PaymentService()
        success, payment, error_message = payment_service.process_payment(
            user=request.user,
            payment_intent_id=validated_data['payment_intent_id'],
            payment_token=validated_data['token'],
            payment_method_id=validated_data['payment_method_id'],
            installments=validated_data['installments'],
            amount=validated_data['amount'],
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


class PaymentHistoryPagination(PageNumberPagination):
    """Paginación para historial de pagos"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el historial de pagos del usuario autenticado. Solo el usuario puede ver sus propios pagos, excepto los administradores que pueden ver todos.',
    manual_parameters=[
        openapi.Parameter('page', openapi.IN_QUERY, description="Número de página", type=openapi.TYPE_INTEGER),
        openapi.Parameter('page_size', openapi.IN_QUERY, description="Tamaño de página (máx 100)", type=openapi.TYPE_INTEGER),
        openapi.Parameter('status', openapi.IN_QUERY, description="Filtrar por estado (approved, rejected, pending, refunded, cancelled)", type=openapi.TYPE_STRING),
    ],
    responses={
        200: openapi.Response(
            description='Historial de pagos obtenido exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'count': 10,
                        'next': 'http://example.com/api/v1/payments/history/?page=2',
                        'previous': None,
                        'results': [
                            {
                                'id': 'pay_abc123',
                                'payment_intent_id': 'pi_abc123',
                                'amount': 150.00,
                                'currency': 'PEN',
                                'status': 'approved',
                                'installments': 1,
                                'course_names': ['Curso 1', 'Curso 2'],
                                'course_ids': ['c-001', 'c-002'],
                                'created_at': '2024-01-01T12:00:00Z'
                            }
                        ]
                    }
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='Sin permisos'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Pagos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """
    Obtiene el historial de pagos del usuario autenticado
    GET /api/v1/payments/history/
    
    Query Parameters:
    - page: Número de página (default: 1)
    - page_size: Tamaño de página (default: 10, max: 100)
    - status: Filtrar por estado (opcional)
    
    Permisos:
    - Usuarios pueden ver solo sus propios pagos
    - Administradores pueden ver todos los pagos (si se implementa)
    
    Returns:
    {
        "success": true,
        "data": {
            "count": 10,
            "next": "...",
            "previous": null,
            "results": [...]
        }
    }
    """
    try:
        user = request.user
        user_role = get_user_role(user)
        
        # Obtener parámetros de paginación y filtros
        status_filter = request.query_params.get('status', None)
        
        # Construir query
        if user_role == ROLE_ADMIN:
            # Admin puede ver todos los pagos (opcional, según requerimientos)
            payments_query = Payment.objects.all()
        else:
            # Usuarios solo ven sus propios pagos (IDOR protection)
            payments_query = Payment.objects.filter(user=user)
        
        # Aplicar filtro de estado si se proporciona
        if status_filter:
            payments_query = payments_query.filter(status=status_filter)
        
        # Ordenar por fecha de creación (más recientes primero)
        payments_query = payments_query.order_by('-created_at')
        
        # Paginación manual (siguiendo el patrón del proyecto)
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 10)), 100)
        
        total_count = payments_query.count()
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_payments = payments_query[start:end]
        
        # Serializar
        serializer = PaymentHistorySerializer(paginated_payments, many=True)
        
        # Construir URLs de paginación
        base_url = request.build_absolute_uri().split('?')[0]
        next_url = None
        previous_url = None
        
        if end < total_count:
            next_url = f"{base_url}?page={page + 1}&page_size={page_size}"
            if status_filter:
                next_url += f"&status={status_filter}"
        
        if page > 1:
            previous_url = f"{base_url}?page={page - 1}&page_size={page_size}"
            if status_filter:
                previous_url += f"&status={status_filter}"
        
        # Retornar respuesta
        return Response({
            'success': True,
            'data': {
                'count': total_count,
                'next': next_url,
                'previous': previous_url,
                'page': page,
                'page_size': page_size,
                'results': serializer.data
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en payment_history: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            'success': False,
            'message': 'Error al obtener el historial de pagos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

