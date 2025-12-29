"""
Caso de uso: Obtener solicitud de instructor del usuario - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from apps.core.models import InstructorApplication
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')

# Días que deben pasar antes de poder volver a aplicar después de un rechazo
REAPPLY_COOLDOWN_DAYS = 30


class GetApplicationUseCase:
    """
    Caso de uso: Obtener solicitud de instructor del usuario
    
    Responsabilidades:
    - Obtener la solicitud más reciente del usuario
    - Verificar si puede volver a aplicar (si fue rechazada)
    """
    
    def execute(self, user) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener solicitud de instructor
        
        Args:
            user: Usuario autenticado
            
        Returns:
            UseCaseResult con la solicitud y datos adicionales
        """
        try:
            # Obtener la solicitud más reciente
            application = InstructorApplication.objects.filter(
                user=user
            ).order_by('-created_at').first()
            
            if not application:
                return UseCaseResult(
                    success=False,
                    error_message="No tienes una solicitud de instructor"
                )
            
            # Verificar si puede volver a aplicar (si fue rechazada)
            can_reapply = None
            days_remaining = None
            
            if application.status == 'rejected':
                from django.utils import timezone
                if application.reviewed_at:
                    days_since_rejection = (timezone.now() - application.reviewed_at).days
                    if days_since_rejection >= REAPPLY_COOLDOWN_DAYS:
                        can_reapply = True
                    else:
                        can_reapply = False
                        days_remaining = REAPPLY_COOLDOWN_DAYS - days_since_rejection
                else:
                    can_reapply = True
            
            # Preparar datos de respuesta
            data = {
                'id': application.id,
                'professional_title': application.professional_title,
                'experience_years': application.experience_years,
                'specialization': application.specialization,
                'bio': application.bio,
                'portfolio_url': application.portfolio_url,
                'motivation': application.motivation,
                'cv_file_url': None,  # Se establecerá en la view si existe
                'status': application.status,
                'status_display': application.get_status_display(),
                'reviewed_by': None,
                'reviewed_at': None,
                'rejection_reason': application.rejection_reason,
                'created_at': application.created_at.isoformat(),
                'updated_at': application.updated_at.isoformat(),
            }
            
            if application.reviewed_by:
                data['reviewed_by'] = {
                    'id': application.reviewed_by.id,
                    'email': application.reviewed_by.email,
                }
            
            if application.reviewed_at:
                data['reviewed_at'] = application.reviewed_at.isoformat()
            
            if application.status == 'rejected':
                data['can_reapply'] = can_reapply
                data['days_remaining'] = days_remaining
            
            return UseCaseResult(
                success=True,
                data=data,
                extra={'application': application}
            )
            
        except Exception as e:
            logger.error(f'Error al obtener solicitud de usuario {user.email}: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f'Error al obtener solicitud: {str(e)}'
            )

