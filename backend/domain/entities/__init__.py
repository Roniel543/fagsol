"""
Entidades del dominio - FagSol Escuela Virtual
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum


class UserRole(Enum):
    """Roles de usuario en el sistema"""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class CourseLevel(Enum):
    """Niveles de dificultad de los cursos"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class PaymentStatus(Enum):
    """Estados de pago"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"


@dataclass
class User:
    """
    Entidad Usuario - Representa un usuario del sistema
    """
    id: Optional[int]
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_email_verified: bool = False
    last_login: Optional[datetime] = None

    @property
    def full_name(self) -> str:
        """Retorna el nombre completo del usuario"""
        return f"{self.first_name} {self.last_name}"

    def is_student(self) -> bool:
        """Verifica si el usuario es estudiante"""
        return self.role == UserRole.STUDENT

    def is_teacher(self) -> bool:
        """Verifica si el usuario es docente"""
        return self.role == UserRole.TEACHER

    def is_admin(self) -> bool:
        """Verifica si el usuario es administrador"""
        return self.role == UserRole.ADMIN


@dataclass
class Course:
    """
    Entidad Curso - Representa un curso en el sistema
    """
    id: Optional[int]
    title: str
    slug: str
    description: str
    instructor_id: int
    level: CourseLevel
    duration_hours: int
    full_price: float
    discount_percentage: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    short_description: Optional[str] = None
    image: Optional[str] = None
    requirements: Optional[str] = None
    what_you_learn: Optional[str] = None
    target_audience: Optional[str] = None
    total_students: int = 0
    modules_count: int = 0

    @property
    def final_price(self) -> float:
        """Calcula el precio final con descuento"""
        if self.discount_percentage > 0:
            return self.full_price * (1 - self.discount_percentage / 100)
        return self.full_price

    def has_discount(self) -> bool:
        """Verifica si el curso tiene descuento"""
        return self.discount_percentage > 0


@dataclass
class Module:
    """
    Entidad Módulo - Representa un módulo dentro de un curso
    """
    id: Optional[int]
    course_id: int
    title: str
    slug: str
    description: str
    order: int
    price: float
    duration_hours: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    lessons_count: int = 0


@dataclass
class Enrollment:
    """
    Entidad Inscripción - Representa la inscripción de un usuario a un módulo
    """
    id: Optional[int]
    user_id: int
    module_id: int
    payment_id: Optional[int]
    status: str
    progress_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    def is_completed(self) -> bool:
        """Verifica si la inscripción está completada"""
        return self.status == "completed"

    def is_active(self) -> bool:
        """Verifica si la inscripción está activa"""
        return self.status == "active"


@dataclass
class Payment:
    """
    Entidad Pago - Representa un pago en el sistema
    """
    id: Optional[int]
    user_id: int
    payment_type: str
    amount: float
    currency: str
    status: PaymentStatus
    metadata: dict
    created_at: datetime
    updated_at: datetime
    mercadopago_preference_id: Optional[str] = None
    mercadopago_payment_id: Optional[str] = None

    def is_approved(self) -> bool:
        """Verifica si el pago está aprobado"""
        return self.status == PaymentStatus.APPROVED

    def is_pending(self) -> bool:
        """Verifica si el pago está pendiente"""
        return self.status == PaymentStatus.PENDING
