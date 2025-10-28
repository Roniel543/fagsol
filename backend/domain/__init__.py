"""
Capa de Dominio - FagSol Escuela Virtual

Esta capa contiene:
- Entidades: Objetos de negocio principales
- Value Objects: Objetos inmutables con validación
- Repositorios: Interfaces para acceso a datos
- Servicios: Lógica de negocio compleja
"""

from .entities import User, Course, Module, Enrollment, Payment, UserRole, CourseLevel, PaymentStatus
from .value_objects import Email, PhoneNumber, Money, Slug, Percentage
from .repositories import (
    UserRepository, CourseRepository, ModuleRepository, 
    EnrollmentRepository, PaymentRepository
)
from .services import (
    UserDomainService, CourseDomainService, 
    PaymentDomainService, EnrollmentDomainService
)

__all__ = [
    # Entidades
    'User', 'Course', 'Module', 'Enrollment', 'Payment',
    'UserRole', 'CourseLevel', 'PaymentStatus',
    
    # Value Objects
    'Email', 'PhoneNumber', 'Money', 'Slug', 'Percentage',
    
    # Repositorios
    'UserRepository', 'CourseRepository', 'ModuleRepository',
    'EnrollmentRepository', 'PaymentRepository',
    
    # Servicios
    'UserDomainService', 'CourseDomainService',
    'PaymentDomainService', 'EnrollmentDomainService',
]
