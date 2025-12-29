"""
Caso de uso: Obtener estadísticas del dashboard según rol - FagSol Escuela Virtual
"""

import logging
from apps.users.permissions import get_user_role
from application.use_cases.dashboard import (
    GetAdminStatsUseCase,
    GetInstructorStatsUseCase,
    GetStudentStatsUseCase
)
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetDashboardStatsUseCase:
    """
    Caso de uso: Obtener estadísticas del dashboard según rol
    
    Responsabilidades:
    - Determinar rol del usuario
    - Delegar al caso de uso apropiado
    - Retornar estadísticas según rol
    """
    
    def execute(self, user) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener estadísticas del dashboard
        
        Args:
            user: Usuario autenticado
            
        Returns:
            UseCaseResult con las estadísticas según el rol
        """
        try:
            role = get_user_role(user)
            
            if role == 'admin':
                use_case = GetAdminStatsUseCase()
                return use_case.execute(user)
            elif role == 'instructor':
                use_case = GetInstructorStatsUseCase()
                return use_case.execute(user)
            elif role == 'student':
                use_case = GetStudentStatsUseCase()
                return use_case.execute(user)
            else:
                # Para guests o roles no definidos
                return UseCaseResult(
                    success=True,
                    data={
                        'role': role,
                        'message': 'No hay estadísticas disponibles para tu rol',
                    }
                )
                
        except Exception as e:
            logger.error(f"Error al obtener estadísticas del dashboard: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener estadísticas: {str(e)}"
            )

