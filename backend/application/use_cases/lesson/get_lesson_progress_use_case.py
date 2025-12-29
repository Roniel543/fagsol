"""
Caso de uso: Obtener progreso de lección - FagSol Escuela Virtual
"""

import logging
from apps.users.models import Enrollment, LessonProgress
from apps.courses.models import Lesson
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetLessonProgressUseCase:
    """
    Caso de uso: Obtener progreso de lección específica
    
    Responsabilidades:
    - Validar enrollment y lección
    - Obtener progreso de la lección
    """
    
    def execute(
        self,
        user,
        lesson_id: str,
        enrollment_id: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener progreso de lección
        
        Args:
            user: Usuario autenticado
            lesson_id: ID de la lección
            enrollment_id: ID del enrollment
            
        Returns:
            UseCaseResult con el progreso de la lección
        """
        try:
            # 1. Validar enrollment
            try:
                enrollment = Enrollment.objects.get(id=enrollment_id, user=user, status='active')
            except Enrollment.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Enrollment no encontrado o no tienes acceso"
                )
            
            # 2. Validar lección
            try:
                lesson = Lesson.objects.get(
                    id=lesson_id,
                    module__course=enrollment.course,
                    is_active=True
                )
            except Lesson.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Lección no encontrada o no pertenece a este curso"
                )
            
            # 3. Obtener progreso (puede no existir)
            lesson_progress = LessonProgress.objects.filter(
                user=user,
                lesson=lesson,
                enrollment=enrollment
            ).first()
            
            # Si no hay progreso, retornar datos por defecto
            if not lesson_progress:
                return UseCaseResult(
                    success=True,
                    data={
                        'lesson_id': lesson_id,
                        'is_completed': False,
                        'progress_percentage': 0.0,
                        'completed_at': None,
                        'last_accessed_at': None,
                    }
                )
            
            return UseCaseResult(
                success=True,
                data={
                    'lesson_progress_id': lesson_progress.id,
                    'lesson_id': lesson_id,
                    'is_completed': lesson_progress.is_completed,
                    'progress_percentage': float(lesson_progress.progress_percentage),
                    'completed_at': lesson_progress.completed_at.isoformat() if lesson_progress.completed_at else None,
                    'last_accessed_at': lesson_progress.last_accessed_at.isoformat() if lesson_progress.last_accessed_at else None,
                    'time_watched_seconds': lesson_progress.time_watched_seconds,
                },
                extra={'lesson_progress': lesson_progress}
            )
            
        except Exception as e:
            logger.error(f"Error al obtener progreso de lección: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener progreso de lección: {str(e)}"
            )

