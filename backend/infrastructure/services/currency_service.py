"""
Servicio de Conversión de Monedas y Detección de País
FagSol Escuela Virtual
"""

import logging
import requests
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, Tuple
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger('apps')


class CurrencyService:
    """
    Servicio para conversión de monedas y detección de país por IP
    """
    
    # Mapeo de códigos de país ISO a monedas
    COUNTRY_CURRENCY_MAP = {
        'PE': 'PEN',  # Perú - Soles
        'CO': 'COP',  # Colombia - Pesos colombianos
        'CL': 'CLP',  # Chile - Pesos chilenos
        'EC': 'USD',  # Ecuador - Dólares
        'BO': 'BOB',  # Bolivia - Bolivianos
        'AR': 'ARS',  # Argentina - Pesos argentinos
        'MX': 'MXN',  # México - Pesos mexicanos
        'BR': 'BRL',  # Brasil - Reales
        'UY': 'UYU',  # Uruguay - Pesos uruguayos
        'PY': 'PYG',  # Paraguay - Guaraníes
        'VE': 'VES',  # Venezuela - Bolívares
        'CR': 'CRC',  # Costa Rica - Colones
        'PA': 'PAB',  # Panamá - Balboas
        'GT': 'GTQ',  # Guatemala - Quetzales
        'HN': 'HNL',  # Honduras - Lempiras
        'NI': 'NIO',  # Nicaragua - Córdobas
        'SV': 'USD',  # El Salvador - Dólares
        'DO': 'DOP',  # República Dominicana - Pesos
        'CU': 'CUP',  # Cuba - Pesos cubanos
    }
    
    def __init__(self):
        self.exchange_rate_api_key = getattr(settings, 'EXCHANGE_RATE_API_KEY', '')
        self.exchange_rate_api_url = getattr(settings, 'EXCHANGE_RATE_API_URL', 'https://api.exchangerate-api.com/v4/latest/USD')
        self.geoip_service_url = getattr(settings, 'GEOIP_SERVICE_URL', 'https://ipapi.co')
        self.geoip_api_key = getattr(settings, 'GEOIP_SERVICE_API_KEY', '')
        self.default_usd_to_pen_rate = Decimal(str(getattr(settings, 'DEFAULT_USD_TO_PEN_RATE', '3.75')))
    
    def get_client_ip(self, request) -> str:
        """
        Obtiene la IP real del cliente desde el request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        return ip
    
    def detect_country_from_ip(self, ip_address: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Detecta el país desde la IP usando servicio externo
        
        Args:
            ip_address: Dirección IP del cliente
            
        Returns:
            Tuple[country_code, currency] o (None, None) si falla
        """
        # Ignorar IPs locales para desarrollo
        if ip_address in ['127.0.0.1', 'localhost', '::1']:
            logger.info("IP local detectada, usando país por defecto: PE")
            return 'PE', 'PEN'
        
        cache_key = f'geoip_{ip_address}'
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result.get('country_code'), cached_result.get('currency')
        
        try:
            # Usar ipapi.co (gratis hasta 1,000 requests/día)
            url = f"{self.geoip_service_url}/{ip_address}/json/"
            headers = {}
            if self.geoip_api_key:
                headers['Authorization'] = f'Bearer {self.geoip_api_key}'
            
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            country_code = data.get('country_code', 'PE')
            currency = self.COUNTRY_CURRENCY_MAP.get(country_code, 'USD')
            
            # Cachear resultado por 24 horas
            cache.set(cache_key, {
                'country_code': country_code,
                'currency': currency
            }, 86400)  # 24 horas
            
            logger.info(f"País detectado: {country_code} ({currency}) para IP {ip_address}")
            return country_code, currency
            
        except requests.RequestException as e:
            logger.warning(f"Error al detectar país desde IP {ip_address}: {str(e)}")
            # Fallback: usar Perú por defecto
            return 'PE', 'PEN'
        except Exception as e:
            logger.error(f"Error inesperado al detectar país: {str(e)}")
            return 'PE', 'PEN'
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """
        Obtiene tasa de cambio entre monedas
        
        Args:
            from_currency: Moneda origen (ej: 'USD')
            to_currency: Moneda destino (ej: 'PEN')
            
        Returns:
            Tasa de cambio como Decimal
        """
        if from_currency == to_currency:
            return Decimal('1.00')
        
        cache_key = f'exchange_rate_{from_currency}_{to_currency}'
        cached_rate = cache.get(cache_key)
        if cached_rate:
            return Decimal(str(cached_rate))
        
        try:
            # Usar ExchangeRate API (gratis hasta 1,500 requests/mes)
            url = self.exchange_rate_api_url
            if self.exchange_rate_api_key:
                url = f"{url}?access_key={self.exchange_rate_api_key}"
            
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            rates = data.get('rates', {})
            
            # Si la moneda origen es USD, usar tasa directa
            if from_currency == 'USD':
                rate = Decimal(str(rates.get(to_currency, 1.0)))
            else:
                # Convertir desde moneda origen a USD, luego a destino
                from_to_usd = Decimal(str(rates.get(from_currency, 1.0)))
                usd_to_dest = Decimal(str(rates.get(to_currency, 1.0)))
                rate = usd_to_dest / from_to_usd
            
            # Cachear por 1 hora
            cache.set(cache_key, float(rate), 3600)
            
            logger.info(f"Tasa de cambio obtenida: {from_currency} -> {to_currency} = {rate}")
            return rate
            
        except requests.RequestException as e:
            logger.warning(f"Error al obtener tasa de cambio: {str(e)}")
            # Fallback: usar tasa por defecto para USD -> PEN
            if from_currency == 'USD' and to_currency == 'PEN':
                return self.default_usd_to_pen_rate
            # Para otras conversiones, usar tasa aproximada
            return Decimal('1.00')
        except Exception as e:
            logger.error(f"Error inesperado al obtener tasa de cambio: {str(e)}")
            if from_currency == 'USD' and to_currency == 'PEN':
                return self.default_usd_to_pen_rate
            return Decimal('1.00')
    
    def convert_price(self, amount_usd: Decimal, target_currency: str) -> Decimal:
        """
        Convierte precio de USD a moneda objetivo
        
        Args:
            amount_usd: Monto en USD
            target_currency: Moneda objetivo (ej: 'PEN', 'COP', etc.)
            
        Returns:
            Monto convertido como Decimal (redondeado a 2 decimales)
        """
        if target_currency == 'USD':
            return amount_usd.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        rate = self.get_exchange_rate('USD', target_currency)
        converted = amount_usd * rate
        return converted.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def get_currency_symbol(self, currency: str) -> str:
        """
        Obtiene el símbolo de moneda
        
        Args:
            currency: Código de moneda (ej: 'USD', 'PEN', 'COP')
            
        Returns:
            Símbolo de moneda
        """
        symbols = {
            'USD': '$',
            'PEN': 'S/',
            'COP': '$',
            'CLP': '$',
            'BOB': 'Bs.',
            'ARS': '$',
            'MXN': '$',
            'BRL': 'R$',
            'UYU': '$',
            'PYG': '₲',
            'VES': 'Bs.',
            'CRC': '₡',
            'PAB': 'B/.',
            'GTQ': 'Q',
            'HNL': 'L',
            'NIO': 'C$',
            'DOP': '$',
            'CUP': '$',
        }
        return symbols.get(currency, '$')
    
    def get_currency_info(self, currency: str) -> Dict[str, str]:
        """
        Obtiene información completa de una moneda
        
        Args:
            currency: Código de moneda
            
        Returns:
            Dict con símbolo y nombre de la moneda
        """
        names = {
            'USD': 'Dólares',
            'PEN': 'Soles',
            'COP': 'Pesos colombianos',
            'CLP': 'Pesos chilenos',
            'BOB': 'Bolivianos',
            'ARS': 'Pesos argentinos',
            'MXN': 'Pesos mexicanos',
            'BRL': 'Reales',
        }
        
        return {
            'code': currency,
            'symbol': self.get_currency_symbol(currency),
            'name': names.get(currency, currency),
        }

