"""
Casos de uso de dashboard - FagSol Escuela Virtual

Casos de uso relacionados con estadísticas del dashboard:
- Estadísticas de administrador
- Estadísticas de instructor
- Estadísticas de estudiante
- Estadísticas públicas
"""

from .get_admin_stats_use_case import GetAdminStatsUseCase
from .get_instructor_stats_use_case import GetInstructorStatsUseCase
from .get_student_stats_use_case import GetStudentStatsUseCase
from .get_public_stats_use_case import GetPublicStatsUseCase
from .get_dashboard_stats_use_case import GetDashboardStatsUseCase

__all__ = [
    'GetAdminStatsUseCase',
    'GetInstructorStatsUseCase',
    'GetStudentStatsUseCase',
    'GetPublicStatsUseCase',
    'GetDashboardStatsUseCase',
]

