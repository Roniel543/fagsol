"""
Caso de uso: Aprobar curso - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from django.utils import timezone
from apps.courses.models import Course
from apps.users.permissions import is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class ApproveCourseUseCase:
    """
    Caso de uso: Aprobar curso pendiente de revisión
    
    Responsabilidades:
    - Validar que el usuario es admin
    - Validar estado del curso
    - Aprobar curso (cambiar a published)
    """
    
    def execute(
        self,
        admin_user,
        course_id: str,
        notes: Optional[str] = None
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de aprobar curso
        
        Args:
            admin_user: Usuario administrador
            course_id: ID del curso
            notes: Notas opcionales sobre la aprobación
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar que el usuario es admin
            if not is_admin(admin_user):
                return UseCaseResult(
                    success=False,
                    error_message="Solo los administradores pueden aprobar cursos"
                )
            
            # 2. Obtener el curso
            try:
                course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Curso no encontrado"
                )
            
            # 3. Validar estado actual
            if course.status == 'published':
                return UseCaseResult(
                    success=False,
                    error_message="El curso ya está publicado"
                )
            
            if course.status not in ['pending_review', 'needs_revision']:
                return UseCaseResult(
                    success=False,
                    error_message=f"El curso no está en estado pendiente de revisión. Estado actual: {course.status}"
                )
            
            # 4. Sanitizar notas
            review_comments = None
            if notes:
                review_comments = notes.strip()[:2000]
            
            # 5. Aprobar curso
            course.status = 'published'
            course.reviewed_by = admin_user
            course.reviewed_at = timezone.now()
            course.review_comments = review_comments
            course.save()
            
            # 6. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) aprobó curso "
                f"{course_id} ({course.title})"
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
            logger.error(f"Error aprobando curso {course_id}: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error interno al aprobar curso: {str(e)}"
            )

