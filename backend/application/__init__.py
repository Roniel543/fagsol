"""
Capa de Aplicación - FagSol Escuela Virtual

Esta capa contiene:
- DTOs: Objetos de transferencia de datos
- Interfaces: Contratos de servicios de aplicación
- Casos de Uso: Lógica de aplicación específica
- Servicios: Implementaciones de servicios de aplicación
"""

from .dtos import (
    UserDTO, CreateUserDTO, UpdateUserDTO,
    CourseDTO, CreateCourseDTO,
    ModuleDTO, CreateModuleDTO,
    EnrollmentDTO, CreateEnrollmentDTO,
    PaymentDTO, CreatePaymentDTO,
    PaginatedResponseDTO,
    UserRoleDTO, CourseLevelDTO, PaymentStatusDTO
)

from .interfaces import (
    UserApplicationService,
    CourseApplicationService,
    ModuleApplicationService,
    EnrollmentApplicationService,
    PaymentApplicationService
)

from .use_cases import (
    CreateUserUseCase, GetUserUseCase, UpdateUserUseCase,
    CreateCourseUseCase, GetCourseUseCase,
    CreateModuleUseCase,
    EnrollUserUseCase,
    ProcessPaymentUseCase
)

__all__ = [
    # DTOs
    'UserDTO', 'CreateUserDTO', 'UpdateUserDTO',
    'CourseDTO', 'CreateCourseDTO',
    'ModuleDTO', 'CreateModuleDTO',
    'EnrollmentDTO', 'CreateEnrollmentDTO',
    'PaymentDTO', 'CreatePaymentDTO',
    'PaginatedResponseDTO',
    'UserRoleDTO', 'CourseLevelDTO', 'PaymentStatusDTO',
    
    # Interfaces
    'UserApplicationService',
    'CourseApplicationService',
    'ModuleApplicationService',
    'EnrollmentApplicationService',
    'PaymentApplicationService',
    
    # Casos de Uso
    'CreateUserUseCase', 'GetUserUseCase', 'UpdateUserUseCase',
    'CreateCourseUseCase', 'GetCourseUseCase',
    'CreateModuleUseCase',
    'EnrollUserUseCase',
    'ProcessPaymentUseCase',
]
