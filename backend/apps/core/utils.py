"""
Utility functions for the FagSol application
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional
from django.utils.text import slugify as django_slugify


def generate_code(prefix: str = '', length: int = 8) -> str:
    """
    Genera un código alfanumérico único
    
    Args:
        prefix: Prefijo para el código
        length: Longitud de la parte aleatoria
    
    Returns:
        Código generado (ej: 'FS-2025-A1B2C3D4')
    """
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=length))
    year = datetime.now().year
    
    if prefix:
        return f"{prefix}-{year}-{random_part}"
    return f"{year}-{random_part}"


def generate_verification_token(length: int = 32) -> str:
    """
    Genera un token de verificación seguro
    
    Args:
        length: Longitud del token
    
    Returns:
        Token generado
    """
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))


def slugify(text: str) -> str:
    """
    Convierte texto a slug URL-friendly
    
    Args:
        text: Texto a convertir
    
    Returns:
        Slug generado
    """
    return django_slugify(text)


def calculate_discount(original_price: float, discount_percentage: float) -> float:
    """
    Calcula el precio con descuento
    
    Args:
        original_price: Precio original
        discount_percentage: Porcentaje de descuento (0-100)
    
    Returns:
        Precio con descuento aplicado
    """
    if discount_percentage < 0 or discount_percentage > 100:
        raise ValueError("El porcentaje de descuento debe estar entre 0 y 100")
    
    discount_amount = (original_price * discount_percentage) / 100
    return original_price - discount_amount


def format_currency(amount: float, currency: str = 'PEN') -> str:
    """
    Formatea un monto como moneda
    
    Args:
        amount: Monto a formatear
        currency: Código de moneda
    
    Returns:
        Monto formateado (ej: 'S/ 120.00')
    """
    currency_symbols = {
        'PEN': 'S/',
        'USD': '$',
        'EUR': '€'
    }
    
    symbol = currency_symbols.get(currency, currency)
    return f"{symbol} {amount:,.2f}"


def calculate_percentage(part: float, total: float) -> float:
    """
    Calcula el porcentaje que representa una parte del total
    
    Args:
        part: Parte del total
        total: Total
    
    Returns:
        Porcentaje (0-100)
    """
    if total == 0:
        return 0
    return (part / total) * 100


def get_expiration_date(days: int = 365) -> datetime:
    """
    Calcula una fecha de expiración
    
    Args:
        days: Días desde ahora hasta la expiración
    
    Returns:
        Fecha de expiración
    """
    return datetime.now() + timedelta(days=days)


def truncate_text(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Trunca un texto a una longitud máxima
    
    Args:
        text: Texto a truncar
        max_length: Longitud máxima
        suffix: Sufijo para el texto truncado
    
    Returns:
        Texto truncado
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

