"""
Servicios de dominio - FagSol Escuela Virtual
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities import User, Course, Module, Enrollment, Payment
from ..value_objects import Email, Money, Percentage


class UserDomainService(ABC):
    """
    Servicio de dominio para usuarios
    """
    
    @abstractmethod
    def validate_user_registration(self, email: Email, password: str) -> bool:
        """Valida los datos de registro de usuario"""
        pass

    @abstractmethod
    def can_user_enroll_in_module(self, user: User, module: Module) -> bool:
        """Verifica si un usuario puede inscribirse en un módulo"""
        pass

    @abstractmethod
    def calculate_user_progress(self, user: User, module: Module) -> float:
        """Calcula el progreso de un usuario en un módulo"""
        pass


class CourseDomainService(ABC):
    """
    Servicio de dominio para cursos
    """
    
    @abstractmethod
    def validate_course_creation(self, course: Course) -> bool:
        """Valida los datos de creación de curso"""
        pass

    @abstractmethod
    def calculate_course_price(self, course: Course) -> Money:
        """Calcula el precio final del curso con descuentos"""
        pass

    @abstractmethod
    def can_course_be_published(self, course: Course) -> bool:
        """Verifica si un curso puede ser publicado"""
        pass


class PaymentDomainService(ABC):
    """
    Servicio de dominio para pagos
    """
    
    @abstractmethod
    def validate_payment_amount(self, amount: Money, module: Module) -> bool:
        """Valida que el monto del pago sea correcto"""
        pass

    @abstractmethod
    def calculate_discount(self, course: Course, user: User) -> Percentage:
        """Calcula el descuento aplicable para un usuario"""
        pass

    @abstractmethod
    def process_payment(self, payment: Payment) -> bool:
        """Procesa un pago"""
        pass


class EnrollmentDomainService(ABC):
    """
    Servicio de dominio para inscripciones
    """
    
    @abstractmethod
    def validate_enrollment(self, user: User, module: Module) -> bool:
        """Valida si una inscripción es válida"""
        pass

    @abstractmethod
    def calculate_enrollment_duration(self, module: Module) -> int:
        """Calcula la duración de acceso a un módulo"""
        pass

    @abstractmethod
    def is_enrollment_expired(self, enrollment: Enrollment) -> bool:
        """Verifica si una inscripción ha expirado"""
        pass
