"""
Caso de uso: Eliminar (archivar) curso - FagSol Escuela Virtual
"""

import logging
from apps.courses.models import Course
from apps.users.permissions import can_delete_course
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class DeleteCourseUseCase:
    """
    Caso de uso: Eliminar (archivar) curso (soft delete)
    
    Responsabilidades:
    - Validar permisos
    - Archivar curso (soft delete)
    """
    
    def execute(
        self,
        user,
        course_id: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de eliminar curso
        
        Args:
            user: Usuario que elimina el curso
            course_id: ID del curso
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Obtener curso
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Curso no encontrado"
                )
            
            # 2. Validar permisos
            can_delete, message = can_delete_course(user, course)
            
            if not can_delete:
                return UseCaseResult(
                    success=False,
                    error_message=message
                )
            
            # 3. Log de advertencia si hay estudiantes
            if message and "Advertencia" in message:
                logger.warning(f"Eliminación de curso con estudiantes: {course.id} por usuario {user.id}. {message}")
            
            # 4. Soft delete (archivar)
            Course.objects.filter(id=course_id).update(
                status='archived',
                is_active=False
            )
            
            course.refresh_from_db()
            
            logger.info(f"Curso archivado: {course.id} por usuario {user.id}")
            
            return UseCaseResult(
                success=True,
                data={
                    'message': message if message else 'Curso archivado exitosamente'
                },
                extra={'course': course}
            )
            
        except Exception as e:
            logger.error(f"Error al eliminar curso: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al eliminar curso: {str(e)}"
            )

