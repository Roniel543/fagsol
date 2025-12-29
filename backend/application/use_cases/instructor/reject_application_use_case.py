"""
Caso de uso: Rechazar solicitud de instructor - FagSol Escuela Virtual
"""

import logging
from django.utils import timezone
from apps.core.models import InstructorApplication
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class RejectApplicationUseCase:
    """
    Caso de uso: Rechazar solicitud de instructor
    
    Responsabilidades:
    - Validar que la solicitud existe
    - Validar que esté pendiente
    - Actualizar solicitud con rechazo
    """
    
    def execute(
        self,
        application_id: int,
        admin_user,
        rejection_reason: str = ''
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de rechazar solicitud de instructor
        
        Args:
            application_id: ID de la solicitud
            admin_user: Usuario administrador
            rejection_reason: Razón del rechazo
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Obtener la solicitud
            try:
                application = InstructorApplication.objects.get(id=application_id)
            except InstructorApplication.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="La solicitud no existe"
                )
            
            # 2. Validar que esté pendiente
            if application.status != 'pending':
                return UseCaseResult(
                    success=False,
                    error_message=f"La solicitud ya fue {application.get_status_display().lower()}"
                )
            
            # 3. Actualizar solicitud
            application.status = 'rejected'
            application.reviewed_by = admin_user
            application.reviewed_at = timezone.now()
            application.rejection_reason = rejection_reason.strip() if rejection_reason else 'Solicitud rechazada por el administrador'
            application.save()
            
            logger.info(f'Solicitud de instructor {application_id} rechazada por {admin_user.email}')
            
            return UseCaseResult(
                success=True,
                data={
                    'id': application.id,
                    'status': application.status,
                    'reviewed_by': {
                        'id': admin_user.id,
                        'email': admin_user.email,
                    },
                    'reviewed_at': application.reviewed_at.isoformat(),
                    'rejection_reason': application.rejection_reason,
                },
                extra={'application': application}
            )
            
        except Exception as e:
            logger.error(f'Error al rechazar solicitud {application_id}: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f'Error al rechazar solicitud: {str(e)}'
            )

