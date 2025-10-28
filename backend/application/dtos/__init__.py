"""
DTOs (Data Transfer Objects) - FagSol Escuela Virtual
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRoleDTO(Enum):
    """Roles de usuario para DTOs"""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class CourseLevelDTO(Enum):
    """Niveles de curso para DTOs"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class PaymentStatusDTO(Enum):
    """Estados de pago para DTOs"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"


@dataclass
class UserDTO:
    """DTO para Usuario"""
    id: Optional[int] = None
    email: str = ""
    first_name: str = ""
    last_name: str = ""
    role: UserRoleDTO = UserRoleDTO.STUDENT
    is_active: bool = True
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_email_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


@dataclass
class CreateUserDTO:
    """DTO para crear usuario"""
    email: str
    first_name: str
    last_name: str
    password: str
    role: UserRoleDTO = UserRoleDTO.STUDENT
    phone: Optional[str] = None


@dataclass
class UpdateUserDTO:
    """DTO para actualizar usuario"""
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None


@dataclass
class CourseDTO:
    """DTO para Curso"""
    id: Optional[int] = None
    title: str = ""
    slug: str = ""
    description: str = ""
    instructor_id: int = 0
    level: CourseLevelDTO = CourseLevelDTO.BEGINNER
    duration_hours: int = 0
    full_price: float = 0.0
    discount_percentage: float = 0.0
    is_active: bool = True
    short_description: Optional[str] = None
    image: Optional[str] = None
    requirements: Optional[str] = None
    what_you_learn: Optional[str] = None
    target_audience: Optional[str] = None
    total_students: int = 0
    modules_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class CreateCourseDTO:
    """DTO para crear curso"""
    title: str
    description: str
    instructor_id: int
    level: CourseLevelDTO
    duration_hours: int
    full_price: float
    short_description: Optional[str] = None
    requirements: Optional[str] = None
    what_you_learn: Optional[str] = None
    target_audience: Optional[str] = None


@dataclass
class ModuleDTO:
    """DTO para Módulo"""
    id: Optional[int] = None
    course_id: int = 0
    title: str = ""
    slug: str = ""
    description: str = ""
    order: int = 0
    price: float = 0.0
    duration_hours: int = 0
    is_active: bool = True
    lessons_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class CreateModuleDTO:
    """DTO para crear módulo"""
    course_id: int
    title: str
    description: str
    order: int
    price: float
    duration_hours: int


@dataclass
class EnrollmentDTO:
    """DTO para Inscripción"""
    id: Optional[int] = None
    user_id: int = 0
    module_id: int = 0
    payment_id: Optional[int] = None
    status: str = "active"
    progress_percentage: float = 0.0
    enrolled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


@dataclass
class CreateEnrollmentDTO:
    """DTO para crear inscripción"""
    user_id: int
    module_id: int
    payment_id: Optional[int] = None


@dataclass
class PaymentDTO:
    """DTO para Pago"""
    id: Optional[int] = None
    user_id: int = 0
    payment_type: str = ""
    amount: float = 0.0
    currency: str = "PEN"
    status: PaymentStatusDTO = PaymentStatusDTO.PENDING
    metadata: dict = None
    mercadopago_preference_id: Optional[str] = None
    mercadopago_payment_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class CreatePaymentDTO:
    """DTO para crear pago"""
    user_id: int
    payment_type: str
    amount: float
    currency: str = "PEN"
    metadata: dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class PaginatedResponseDTO:
    """DTO para respuestas paginadas"""
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[dict] = None

    def __post_init__(self):
        if self.results is None:
            self.results = []
