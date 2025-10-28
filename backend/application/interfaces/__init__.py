"""
Interfaces de la Capa de Aplicación - FagSol Escuela Virtual
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ...domain import User, Course, Module, Enrollment, Payment
from ..dtos import (
    UserDTO, CreateUserDTO, UpdateUserDTO,
    CourseDTO, CreateCourseDTO,
    ModuleDTO, CreateModuleDTO,
    EnrollmentDTO, CreateEnrollmentDTO,
    PaymentDTO, CreatePaymentDTO,
    PaginatedResponseDTO
)


class UserApplicationService(ABC):
    """
    Interfaz del servicio de aplicación para usuarios
    """
    
    @abstractmethod
    def create_user(self, user_data: CreateUserDTO) -> UserDTO:
        """Crea un nuevo usuario"""
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: int) -> Optional[UserDTO]:
        """Obtiene un usuario por ID"""
        pass

    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[UserDTO]:
        """Obtiene un usuario por email"""
        pass

    @abstractmethod
    def update_user(self, user_data: UpdateUserDTO) -> Optional[UserDTO]:
        """Actualiza un usuario"""
        pass

    @abstractmethod
    def delete_user(self, user_id: int) -> bool:
        """Elimina un usuario"""
        pass

    @abstractmethod
    def list_users(self, limit: int = 100, offset: int = 0) -> PaginatedResponseDTO:
        """Lista usuarios con paginación"""
        pass


class CourseApplicationService(ABC):
    """
    Interfaz del servicio de aplicación para cursos
    """
    
    @abstractmethod
    def create_course(self, course_data: CreateCourseDTO) -> CourseDTO:
        """Crea un nuevo curso"""
        pass

    @abstractmethod
    def get_course_by_id(self, course_id: int) -> Optional[CourseDTO]:
        """Obtiene un curso por ID"""
        pass

    @abstractmethod
    def get_course_by_slug(self, slug: str) -> Optional[CourseDTO]:
        """Obtiene un curso por slug"""
        pass

    @abstractmethod
    def list_courses(self, limit: int = 100, offset: int = 0) -> PaginatedResponseDTO:
        """Lista cursos con paginación"""
        pass

    @abstractmethod
    def get_courses_by_instructor(self, instructor_id: int) -> List[CourseDTO]:
        """Obtiene cursos por instructor"""
        pass

    @abstractmethod
    def delete_course(self, course_id: int) -> bool:
        """Elimina un curso"""
        pass


class ModuleApplicationService(ABC):
    """
    Interfaz del servicio de aplicación para módulos
    """
    
    @abstractmethod
    def create_module(self, module_data: CreateModuleDTO) -> ModuleDTO:
        """Crea un nuevo módulo"""
        pass

    @abstractmethod
    def get_module_by_id(self, module_id: int) -> Optional[ModuleDTO]:
        """Obtiene un módulo por ID"""
        pass

    @abstractmethod
    def get_modules_by_course(self, course_id: int) -> List[ModuleDTO]:
        """Obtiene módulos por curso"""
        pass

    @abstractmethod
    def delete_module(self, module_id: int) -> bool:
        """Elimina un módulo"""
        pass


class EnrollmentApplicationService(ABC):
    """
    Interfaz del servicio de aplicación para inscripciones
    """
    
    @abstractmethod
    def create_enrollment(self, enrollment_data: CreateEnrollmentDTO) -> EnrollmentDTO:
        """Crea una nueva inscripción"""
        pass

    @abstractmethod
    def get_enrollment_by_id(self, enrollment_id: int) -> Optional[EnrollmentDTO]:
        """Obtiene una inscripción por ID"""
        pass

    @abstractmethod
    def get_enrollments_by_user(self, user_id: int) -> List[EnrollmentDTO]:
        """Obtiene inscripciones por usuario"""
        pass

    @abstractmethod
    def get_enrollments_by_module(self, module_id: int) -> List[EnrollmentDTO]:
        """Obtiene inscripciones por módulo"""
        pass

    @abstractmethod
    def update_enrollment_progress(self, enrollment_id: int, progress: float) -> Optional[EnrollmentDTO]:
        """Actualiza el progreso de una inscripción"""
        pass


class PaymentApplicationService(ABC):
    """
    Interfaz del servicio de aplicación para pagos
    """
    
    @abstractmethod
    def create_payment(self, payment_data: CreatePaymentDTO) -> PaymentDTO:
        """Crea un nuevo pago"""
        pass

    @abstractmethod
    def get_payment_by_id(self, payment_id: int) -> Optional[PaymentDTO]:
        """Obtiene un pago por ID"""
        pass

    @abstractmethod
    def get_payments_by_user(self, user_id: int) -> List[PaymentDTO]:
        """Obtiene pagos por usuario"""
        pass

    @abstractmethod
    def process_payment(self, payment_id: int) -> Optional[PaymentDTO]:
        """Procesa un pago"""
        pass

    @abstractmethod
    def update_payment_status(self, payment_id: int, status: str) -> Optional[PaymentDTO]:
        """Actualiza el estado de un pago"""
        pass
