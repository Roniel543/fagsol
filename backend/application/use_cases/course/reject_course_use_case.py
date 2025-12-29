"""
Caso de uso: Rechazar curso - FagSol Escuela Virtual
"""

import logging
from django.utils import timezone
from apps.courses.models import Course
from apps.users.permissions import is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class RejectCourseUseCase:
    """
    Caso de uso: Rechazar curso pendiente de revisión
    
    Responsabilidades:
    - Validar que el usuario es admin
    - Validar razón de rechazo
    - Rechazar curso (marcar como needs_revision)
    """
    
    def execute(
        self,
        admin_user,
        course_id: str,
        rejection_reason: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de rechazar curso
        
        Args:
            admin_user: Usuario administrador
            course_id: ID del curso
            rejection_reason: Razón del rechazo (requerida)
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar que el usuario es admin
            if not is_admin(admin_user):
                return UseCaseResult(
                    success=False,
                    error_message="Solo los administradores pueden rechazar cursos"
                )
            
            # 2. Validar razón de rechazo
            if not rejection_reason or not rejection_reason.strip():
                return UseCaseResult(
                    success=False,
                    error_message="La razón de rechazo es requerida"
                )
            
            # Sanitizar razón de rechazo
            rejection_reason = rejection_reason.strip()[:2000]
            
            # 3. Obtener el curso
            try:
                course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Curso no encontrado"
                )
            
            # 4. Validar estado actual
            if course.status == 'needs_revision':
                return UseCaseResult(
                    success=False,
                    error_message="El curso ya está marcado como requiere cambios"
                )
            
            if course.status not in ['pending_review', 'published']:
                return UseCaseResult(
                    success=False,
                    error_message=f"El curso no está en estado pendiente de revisión. Estado actual: {course.status}"
                )
            
            # 5. Rechazar curso
            course.status = 'needs_revision'
            course.reviewed_by = admin_user
            course.reviewed_at = timezone.now()
            course.review_comments = rejection_reason
            course.save()
            
            # 6. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) rechazó curso "
                f"{course_id} ({course.title}). Razón: {rejection_reason[:100]}"
            )
            
            return UseCaseResult(
                success=True,
                data={
                    'course': {
                        'id': course.id,
                        'title': course.title,
                        'status': course.status,
                        'reviewed_by': {
                            'id': admin_user.id,
                            'email': admin_user.email
                        },
                        'reviewed_at': course.reviewed_at.isoformat(),
                        'review_comments': course.review_comments
                    }
                },
                extra={'course': course}
            )
            
        except Exception as e:
            logger.error(f"Error rechazando curso {course_id}: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error interno al rechazar curso: {str(e)}"
            )

