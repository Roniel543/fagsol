"""
Interfaces de repositorios del dominio - FagSol Escuela Virtual
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities import User, Course, Module, Enrollment, Payment


class UserRepository(ABC):
    """
    Interfaz para el repositorio de usuarios
    """
    
    @abstractmethod
    def save(self, user: User) -> User:
        """Guarda un usuario"""
        pass

    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]:
        """Busca un usuario por ID"""
        pass

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]:
        """Busca un usuario por email"""
        pass

    @abstractmethod
    def find_all(self, limit: int = 100, offset: int = 0) -> List[User]:
        """Obtiene todos los usuarios con paginación"""
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        """Elimina un usuario"""
        pass


class CourseRepository(ABC):
    """
    Interfaz para el repositorio de cursos
    """
    
    @abstractmethod
    def save(self, course: Course) -> Course:
        """Guarda un curso"""
        pass

    @abstractmethod
    def find_by_id(self, course_id: int) -> Optional[Course]:
        """Busca un curso por ID"""
        pass

    @abstractmethod
    def find_by_slug(self, slug: str) -> Optional[Course]:
        """Busca un curso por slug"""
        pass

    @abstractmethod
    def find_all(self, limit: int = 100, offset: int = 0) -> List[Course]:
        """Obtiene todos los cursos con paginación"""
        pass

    @abstractmethod
    def find_by_instructor(self, instructor_id: int) -> List[Course]:
        """Busca cursos por instructor"""
        pass

    @abstractmethod
    def delete(self, course_id: int) -> bool:
        """Elimina un curso"""
        pass


class ModuleRepository(ABC):
    """
    Interfaz para el repositorio de módulos
    """
    
    @abstractmethod
    def save(self, module: Module) -> Module:
        """Guarda un módulo"""
        pass

    @abstractmethod
    def find_by_id(self, module_id: int) -> Optional[Module]:
        """Busca un módulo por ID"""
        pass

    @abstractmethod
    def find_by_course(self, course_id: int) -> List[Module]:
        """Busca módulos por curso"""
        pass

    @abstractmethod
    def delete(self, module_id: int) -> bool:
        """Elimina un módulo"""
        pass


class EnrollmentRepository(ABC):
    """
    Interfaz para el repositorio de inscripciones
    """
    
    @abstractmethod
    def save(self, enrollment: Enrollment) -> Enrollment:
        """Guarda una inscripción"""
        pass

    @abstractmethod
    def find_by_id(self, enrollment_id: int) -> Optional[Enrollment]:
        """Busca una inscripción por ID"""
        pass

    @abstractmethod
    def find_by_user(self, user_id: int) -> List[Enrollment]:
        """Busca inscripciones por usuario"""
        pass

    @abstractmethod
    def find_by_module(self, module_id: int) -> List[Enrollment]:
        """Busca inscripciones por módulo"""
        pass

    @abstractmethod
    def find_by_user_and_module(self, user_id: int, module_id: int) -> Optional[Enrollment]:
        """Busca inscripción específica de usuario y módulo"""
        pass


class PaymentRepository(ABC):
    """
    Interfaz para el repositorio de pagos
    """
    
    @abstractmethod
    def save(self, payment: Payment) -> Payment:
        """Guarda un pago"""
        pass

    @abstractmethod
    def find_by_id(self, payment_id: int) -> Optional[Payment]:
        """Busca un pago por ID"""
        pass

    @abstractmethod
    def find_by_user(self, user_id: int) -> List[Payment]:
        """Busca pagos por usuario"""
        pass

    @abstractmethod
    def find_by_mercadopago_id(self, mercadopago_id: str) -> Optional[Payment]:
        """Busca pago por ID de MercadoPago"""
        pass
