"""
Capa de Aplicación - FagSol Escuela Virtual

Esta capa contiene:
- DTOs: Objetos de transferencia de datos
- Interfaces: Contratos de servicios de aplicación
- Casos de Uso: Lógica de aplicación específica
- Servicios: Implementaciones de servicios de aplicación
"""

# DTOs - Importar según necesidad
from .dtos import UseCaseResult

# Interfaces - Se importarán cuando se implementen
# from .interfaces import (
#     UserApplicationService,
#     CourseApplicationService,
#     ...
# )

# Casos de Uso - Importar desde módulos específicos
from .use_cases.auth import LoginUseCase, RegisterUseCase, PasswordResetUseCase

__all__ = [
    # DTOs
    'UseCaseResult',
    
    # Casos de Uso Auth
    'LoginUseCase',
    'RegisterUseCase',
    'PasswordResetUseCase',
]
