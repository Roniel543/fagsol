"""
Endpoints de Moneda y Detección de País
FagSol Escuela Virtual - Fase 1 Multi-Moneda
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django_ratelimit.decorators import ratelimit
from decimal import Decimal
from infrastructure.services.currency_service import CurrencyService

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Detecta el país del usuario desde su IP y retorna información de moneda local.',
    manual_parameters=[
        openapi.Parameter(
            'ip',
            openapi.IN_QUERY,
            description='IP del cliente (opcional, si no se proporciona se detecta automáticamente)',
            type=openapi.TYPE_STRING,
            required=False
        ),
    ],
    responses={
        200: openapi.Response(
            description='País detectado exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'country_code': 'CO',
                        'currency': 'COP',
                        'currency_symbol': '$',
                        'currency_name': 'Pesos colombianos'
                    }
                }
            }
        ),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Moneda']
)
@api_view(['GET'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='100/h', method='GET', block=True)
def detect_country(request):
    """
    Detecta el país del usuario desde su IP
    GET /api/v1/currency/detect/
    """
    try:
        currency_service = CurrencyService()
        
        # Obtener IP del query param o del request
        ip_address = request.query_params.get('ip')
        if not ip_address:
            ip_address = currency_service.get_client_ip(request)
        
        # Detectar país y moneda
        country_code, currency = currency_service.detect_country_from_ip(ip_address)
        
        if not country_code or not currency:
            return Response({
                'success': False,
                'message': 'No se pudo detectar el país'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Obtener información de la moneda
        currency_info = currency_service.get_currency_info(currency)
        
        return Response({
            'success': True,
            'data': {
                'country_code': country_code,
                'currency': currency,
                'currency_symbol': currency_info['symbol'],
                'currency_name': currency_info['name'],
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al detectar país: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error al detectar país'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Convierte un precio de USD a una moneda objetivo.',
    manual_parameters=[
        openapi.Parameter(
            'amount',
            openapi.IN_QUERY,
            description='Monto en USD a convertir',
            type=openapi.TYPE_NUMBER,
            required=True
        ),
        openapi.Parameter(
            'to_currency',
            openapi.IN_QUERY,
            description='Moneda objetivo (PEN, COP, CLP, BOB, ARS, MXN, BRL, etc.)',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(
            description='Conversión exitosa',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'from_currency': 'USD',
                        'to_currency': 'COP',
                        'amount_usd': 20.00,
                        'amount_converted': 80000.00,
                        'rate': 4000.00,
                        'currency_symbol': '$'
                    }
                }
            }
        ),
        400: openapi.Response(description='Parámetros inválidos'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Moneda']
)
@api_view(['GET'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='200/h', method='GET', block=True)
def convert_currency(request):
    """
    Convierte un precio de USD a una moneda objetivo
    GET /api/v1/currency/convert/?amount=20&to_currency=COP
    """
    try:
        amount_str = request.query_params.get('amount')
        to_currency = request.query_params.get('to_currency', '').upper()
        
        if not amount_str or not to_currency:
            return Response({
                'success': False,
                'message': 'Parámetros requeridos: amount y to_currency'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount_usd = Decimal(str(amount_str))
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'message': 'amount debe ser un número válido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if amount_usd < 0:
            return Response({
                'success': False,
                'message': 'amount debe ser mayor o igual a 0'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar código de moneda
        currency_service = CurrencyService()
        valid_currencies = list(currency_service.COUNTRY_CURRENCY_MAP.values()) + ['USD']
        
        if to_currency not in valid_currencies:
            return Response({
                'success': False,
                'message': f'Moneda no soportada: {to_currency}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convertir precio
        if to_currency == 'USD':
            amount_converted = amount_usd
            rate = Decimal('1.00')
        else:
            rate = currency_service.get_exchange_rate('USD', to_currency)
            amount_converted = currency_service.convert_price(amount_usd, to_currency)
        
        currency_info = currency_service.get_currency_info(to_currency)
        
        return Response({
            'success': True,
            'data': {
                'from_currency': 'USD',
                'to_currency': to_currency,
                'amount_usd': float(amount_usd),
                'amount_converted': float(amount_converted),
                'rate': float(rate),
                'currency_symbol': currency_info['symbol'],
                'currency_name': currency_info['name'],
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al convertir moneda: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error al convertir moneda'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

