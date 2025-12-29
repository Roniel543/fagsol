"""
Caso de uso: Rechazar instructor - FagSol Escuela Virtual
"""

import logging
from django.contrib.auth.models import User
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_INSTRUCTOR, is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class RejectInstructorUseCase:
    """
    Caso de uso: Rechazar instructor pendiente
    
    Responsabilidades:
    - Validar que el usuario es admin
    - Validar razón de rechazo
    - Validar que el usuario es instructor
    - Rechazar instructor
    """
    
    def execute(
        self,
        admin_user: User,
        instructor_user_id: int,
        rejection_reason: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de rechazar instructor
        
        Args:
            admin_user: Usuario administrador
            instructor_user_id: ID del usuario instructor
            rejection_reason: Razón del rechazo (requerida)
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar que el usuario es admin
            if not is_admin(admin_user):
                return UseCaseResult(
                    success=False,
                    error_message="Solo los administradores pueden rechazar instructores"
                )
            
            # 2. Validar razón de rechazo
            if not rejection_reason or not rejection_reason.strip():
                return UseCaseResult(
                    success=False,
                    error_message="La razón de rechazo es requerida"
                )
            
            # Sanitizar razón de rechazo
            rejection_reason = rejection_reason.strip()[:1000]
            
            # 3. Obtener el instructor
            try:
                instructor_user = User.objects.get(id=instructor_user_id)
            except User.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Usuario instructor no encontrado"
                )
            
            # 4. Verificar que tiene perfil
            try:
                profile = instructor_user.profile
            except UserProfile.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="El usuario no tiene perfil asociado"
                )
            
            # 5. Validar que es instructor
            if profile.role != ROLE_INSTRUCTOR:
                return UseCaseResult(
                    success=False,
                    error_message="El usuario no es un instructor"
                )
            
            # 6. Validar estado actual
            if profile.instructor_status == 'rejected':
                return UseCaseResult(
                    success=False,
                    error_message="El instructor ya está rechazado"
                )
            
            # 7. Rechazar instructor
            profile.instructor_status = 'rejected'
            profile.instructor_rejection_reason = rejection_reason
            profile.instructor_approved_by = None
            profile.instructor_approved_at = None
            profile.save()
            
            # 8. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) rechazó instructor "
                f"{instructor_user_id} ({instructor_user.email}). Razón: {rejection_reason[:100]}"
            )
            
            return UseCaseResult(
                success=True,
                data={
                    'instructor': {
                        'id': instructor_user.id,
                        'email': instructor_user.email,
                        'first_name': instructor_user.first_name,
                        'last_name': instructor_user.last_name,
                        'role': profile.role,
                        'instructor_status': profile.instructor_status,
                        'rejection_reason': profile.instructor_rejection_reason
                    }
                },
                extra={'profile': profile, 'instructor_user': instructor_user}
            )
            
        except Exception as e:
            logger.error(f"Error rechazando instructor {instructor_user_id}: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error interno al rechazar instructor: {str(e)}"
            )

