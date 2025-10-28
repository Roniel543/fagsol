"""
Casos de Uso - FagSol Escuela Virtual

Los casos de uso contienen la lógica de aplicación específica
"""

from abc import ABC, abstractmethod
from typing import Optional, List
from ...domain import User, Course, Module, Enrollment, Payment
from ..dtos import (
    CreateUserDTO, UserDTO, UpdateUserDTO,
    CreateCourseDTO, CourseDTO,
    CreateModuleDTO, ModuleDTO,
    CreateEnrollmentDTO, EnrollmentDTO,
    CreatePaymentDTO, PaymentDTO,
    PaginatedResponseDTO
)


class CreateUserUseCase(ABC):
    """
    Caso de uso para crear un usuario
    """
    
    @abstractmethod
    def execute(self, user_data: CreateUserDTO) -> UserDTO:
        """
        Ejecuta la creación de un usuario
        
        Args:
            user_data: Datos del usuario a crear
            
        Returns:
            UserDTO: Usuario creado
            
        Raises:
            ValueError: Si los datos son inválidos
            Exception: Si ocurre un error en la creación
        """
        pass


class GetUserUseCase(ABC):
    """
    Caso de uso para obtener un usuario
    """
    
    @abstractmethod
    def execute(self, user_id: int) -> Optional[UserDTO]:
        """
        Ejecuta la búsqueda de un usuario
        
        Args:
            user_id: ID del usuario a buscar
            
        Returns:
            Optional[UserDTO]: Usuario encontrado o None
        """
        pass


class UpdateUserUseCase(ABC):
    """
    Caso de uso para actualizar un usuario
    """
    
    @abstractmethod
    def execute(self, user_data: UpdateUserDTO) -> Optional[UserDTO]:
        """
        Ejecuta la actualización de un usuario
        
        Args:
            user_data: Datos del usuario a actualizar
            
        Returns:
            Optional[UserDTO]: Usuario actualizado o None
        """
        pass


class CreateCourseUseCase(ABC):
    """
    Caso de uso para crear un curso
    """
    
    @abstractmethod
    def execute(self, course_data: CreateCourseDTO) -> CourseDTO:
        """
        Ejecuta la creación de un curso
        
        Args:
            course_data: Datos del curso a crear
            
        Returns:
            CourseDTO: Curso creado
        """
        pass


class GetCourseUseCase(ABC):
    """
    Caso de uso para obtener un curso
    """
    
    @abstractmethod
    def execute(self, course_id: int) -> Optional[CourseDTO]:
        """
        Ejecuta la búsqueda de un curso
        
        Args:
            course_id: ID del curso a buscar
            
        Returns:
            Optional[CourseDTO]: Curso encontrado o None
        """
        pass


class CreateModuleUseCase(ABC):
    """
    Caso de uso para crear un módulo
    """
    
    @abstractmethod
    def execute(self, module_data: CreateModuleDTO) -> ModuleDTO:
        """
        Ejecuta la creación de un módulo
        
        Args:
            module_data: Datos del módulo a crear
            
        Returns:
            ModuleDTO: Módulo creado
        """
        pass


class EnrollUserUseCase(ABC):
    """
    Caso de uso para inscribir un usuario en un módulo
    """
    
    @abstractmethod
    def execute(self, enrollment_data: CreateEnrollmentDTO) -> EnrollmentDTO:
        """
        Ejecuta la inscripción de un usuario en un módulo
        
        Args:
            enrollment_data: Datos de la inscripción
            
        Returns:
            EnrollmentDTO: Inscripción creada
        """
        pass


class ProcessPaymentUseCase(ABC):
    """
    Caso de uso para procesar un pago
    """
    
    @abstractmethod
    def execute(self, payment_data: CreatePaymentDTO) -> PaymentDTO:
        """
        Ejecuta el procesamiento de un pago
        
        Args:
            payment_data: Datos del pago
            
        Returns:
            PaymentDTO: Pago procesado
        """
        pass
