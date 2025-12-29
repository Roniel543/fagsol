"""
Caso de uso: Aprobar instructor - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from django.contrib.auth.models import User
from django.utils import timezone
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_INSTRUCTOR, is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class ApproveInstructorUseCase:
    """
    Caso de uso: Aprobar instructor pendiente
    
    Responsabilidades:
    - Validar que el usuario es admin
    - Validar que el usuario es instructor
    - Validar estado actual
    - Aprobar instructor
    """
    
    def execute(
        self,
        admin_user: User,
        instructor_user_id: int,
        notes: Optional[str] = None
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de aprobar instructor
        
        Args:
            admin_user: Usuario administrador
            instructor_user_id: ID del usuario instructor
            notes: Notas opcionales sobre la aprobación
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar que el usuario es admin
            if not is_admin(admin_user):
                return UseCaseResult(
                    success=False,
                    error_message="Solo los administradores pueden aprobar instructores"
                )
            
            # 2. Obtener el instructor
            try:
                instructor_user = User.objects.get(id=instructor_user_id)
            except User.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Usuario instructor no encontrado"
                )
            
            # 3. Verificar que tiene perfil
            try:
                profile = instructor_user.profile
            except UserProfile.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="El usuario no tiene perfil asociado"
                )
            
            # 4. Validar que es instructor
            if profile.role != ROLE_INSTRUCTOR:
                return UseCaseResult(
                    success=False,
                    error_message="El usuario no es un instructor"
                )
            
            # 5. Validar estado actual
            if profile.instructor_status == 'approved':
                return UseCaseResult(
                    success=False,
                    error_message="El instructor ya está aprobado"
                )
            
            if profile.instructor_status == 'rejected':
                logger.info(f"Re-aprobando instructor {instructor_user_id} que fue rechazado previamente")
            
            # 6. Aprobar instructor
            profile.instructor_status = 'approved'
            profile.instructor_approved_by = admin_user
            profile.instructor_approved_at = timezone.now()
            profile.instructor_rejection_reason = None
            profile.save()
            
            # 7. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) aprobó instructor "
                f"{instructor_user_id} ({instructor_user.email})"
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
                        'approved_by': {
                            'id': admin_user.id,
                            'email': admin_user.email
                        },
                        'approved_at': profile.instructor_approved_at.isoformat()
                    }
                },
                extra={'profile': profile, 'instructor_user': instructor_user}
            )
            
        except Exception as e:
            logger.error(f"Error aprobando instructor {instructor_user_id}: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error interno al aprobar instructor: {str(e)}"
            )

