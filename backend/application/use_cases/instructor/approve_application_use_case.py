"""
Caso de uso: Aprobar solicitud de instructor - FagSol Escuela Virtual
"""

import logging
from django.utils import timezone
from apps.core.models import InstructorApplication, UserProfile
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class ApproveApplicationUseCase:
    """
    Caso de uso: Aprobar solicitud de instructor
    
    Responsabilidades:
    - Validar que la solicitud existe
    - Validar que esté pendiente
    - Cambiar rol del usuario a instructor
    - Actualizar solicitud
    """
    
    def execute(
        self,
        application_id: int,
        admin_user
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de aprobar solicitud de instructor
        
        Args:
            application_id: ID de la solicitud
            admin_user: Usuario administrador
            
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
            
            # 3. Obtener o crear perfil del usuario
            try:
                profile = application.user.profile
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=application.user, role='student')
            
            # 4. Cambiar rol a instructor
            profile.role = 'instructor'
            profile.instructor_status = 'approved'
            profile.instructor_approved_by = admin_user
            profile.instructor_approved_at = timezone.now()
            profile.save()
            
            # 5. Actualizar solicitud
            application.status = 'approved'
            application.reviewed_by = admin_user
            application.reviewed_at = timezone.now()
            application.save()
            
            logger.info(f'Solicitud de instructor {application_id} aprobada por {admin_user.email}')
            
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
                },
                extra={'application': application, 'profile': profile}
            )
            
        except Exception as e:
            logger.error(f'Error al aprobar solicitud {application_id}: {str(e)}', exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f'Error al aprobar solicitud: {str(e)}'
            )

