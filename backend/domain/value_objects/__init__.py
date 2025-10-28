"""
Value Objects del dominio - FagSol Escuela Virtual
"""

from dataclasses import dataclass
from typing import Optional
import re


@dataclass(frozen=True)
class Email:
    """
    Value Object para email con validación
    """
    value: str

    def __post_init__(self):
        if not self._is_valid_email(self.value):
            raise ValueError(f"Email inválido: {self.value}")

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Valida el formato del email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None


@dataclass(frozen=True)
class PhoneNumber:
    """
    Value Object para número de teléfono
    """
    value: str

    def __post_init__(self):
        if not self._is_valid_phone(self.value):
            raise ValueError(f"Número de teléfono inválido: {self.value}")

    @staticmethod
    def _is_valid_phone(phone: str) -> bool:
        """Valida el formato del teléfono peruano"""
        # Formato peruano: +51 9XX XXX XXX o 9XX XXX XXX
        pattern = r'^(\+51\s?)?9\d{2}\s?\d{3}\s?\d{3}$'
        return re.match(pattern, phone) is not None


@dataclass(frozen=True)
class Money:
    """
    Value Object para manejo de dinero
    """
    amount: float
    currency: str = "PEN"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("El monto no puede ser negativo")
        if self.currency not in ["PEN", "USD"]:
            raise ValueError("Moneda no soportada")

    def add(self, other: 'Money') -> 'Money':
        """Suma dos cantidades de dinero"""
        if self.currency != other.currency:
            raise ValueError("No se pueden sumar monedas diferentes")
        return Money(self.amount + other.amount, self.currency)

    def subtract(self, other: 'Money') -> 'Money':
        """Resta dos cantidades de dinero"""
        if self.currency != other.currency:
            raise ValueError("No se pueden restar monedas diferentes")
        return Money(self.amount - other.amount, self.currency)

    def multiply(self, factor: float) -> 'Money':
        """Multiplica el dinero por un factor"""
        return Money(self.amount * factor, self.currency)


@dataclass(frozen=True)
class Slug:
    """
    Value Object para slugs de URLs
    """
    value: str

    def __post_init__(self):
        if not self._is_valid_slug(self.value):
            raise ValueError(f"Slug inválido: {self.value}")

    @staticmethod
    def _is_valid_slug(slug: str) -> bool:
        """Valida el formato del slug"""
        # Solo letras minúsculas, números y guiones
        pattern = r'^[a-z0-9-]+$'
        return re.match(pattern, slug) is not None and len(slug) > 0


@dataclass(frozen=True)
class Percentage:
    """
    Value Object para porcentajes
    """
    value: float

    def __post_init__(self):
        if not 0 <= self.value <= 100:
            raise ValueError("El porcentaje debe estar entre 0 y 100")

    def apply_to(self, amount: float) -> float:
        """Aplica el porcentaje a una cantidad"""
        return amount * (self.value / 100)
