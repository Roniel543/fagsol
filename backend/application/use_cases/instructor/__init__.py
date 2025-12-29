"""
Casos de uso de instructores - FagSol Escuela Virtual

Casos de uso relacionados con solicitudes y aprobación de instructores:
- Crear solicitud de instructor
- Obtener solicitud de instructor
- Aprobar instructor
- Rechazar instructor
"""

from .create_application_use_case import CreateApplicationUseCase
from .get_application_use_case import GetApplicationUseCase
from .approve_instructor_use_case import ApproveInstructorUseCase
from .reject_instructor_use_case import RejectInstructorUseCase
from .approve_application_use_case import ApproveApplicationUseCase
from .reject_application_use_case import RejectApplicationUseCase

__all__ = [
    'CreateApplicationUseCase',
    'GetApplicationUseCase',
    'ApproveInstructorUseCase',
    'RejectInstructorUseCase',
    'ApproveApplicationUseCase',
    'RejectApplicationUseCase',
]

