"""
Caso de uso: Obtener progreso completo de curso - FagSol Escuela Virtual
"""

import logging
from apps.users.models import Enrollment, LessonProgress
from apps.courses.models import Lesson
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetCourseProgressUseCase:
    """
    Caso de uso: Obtener progreso completo de curso
    
    Responsabilidades:
    - Validar enrollment
    - Obtener todas las lecciones del curso
    - Obtener progreso de cada lección
    - Calcular estadísticas de completitud
    """
    
    def execute(
        self,
        user,
        enrollment_id: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener progreso completo de curso
        
        Args:
            user: Usuario autenticado
            enrollment_id: ID del enrollment
            
        Returns:
            UseCaseResult con el progreso completo del curso
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
            
            course = enrollment.course
            
            # 2. Obtener todas las lecciones activas del curso
            lessons = Lesson.objects.filter(
                module__course=course,
                is_active=True
            ).select_related('module').order_by('module__order', 'order')
            
            # 3. Obtener todos los progresos del usuario para este enrollment
            progresses = LessonProgress.objects.filter(
                user=user,
                enrollment=enrollment
            ).select_related('lesson')
            
            # 4. Crear dict de progresos por lesson_id
            progress_dict = {p.lesson_id: p for p in progresses}
            
            # 5. Construir respuesta
            lessons_progress = {}
            completed_count = 0
            
            for lesson in lessons:
                progress = progress_dict.get(lesson.id)
                lessons_progress[lesson.id] = {
                    'lesson_id': lesson.id,
                    'lesson_title': lesson.title,
                    'module_id': lesson.module.id,
                    'module_title': lesson.module.title,
                    'is_completed': progress.is_completed if progress else False,
                    'progress_percentage': float(progress.progress_percentage) if progress else 0.0,
                    'completed_at': progress.completed_at.isoformat() if progress and progress.completed_at else None,
                    'last_accessed_at': progress.last_accessed_at.isoformat() if progress and progress.last_accessed_at else None,
                }
                if lessons_progress[lesson.id]['is_completed']:
                    completed_count += 1
            
            total_lessons = len(lessons)
            completion_percentage = (completed_count / total_lessons * 100) if total_lessons > 0 else 0.0
            
            result = {
                'enrollment': {
                    'id': enrollment.id,
                    'completion_percentage': float(enrollment.completion_percentage),
                    'completed': enrollment.completed,
                    'status': enrollment.status,
                },
                'lessons_progress': lessons_progress,
                'total_lessons': total_lessons,
                'completed_lessons': completed_count,
                'completion_percentage': round(completion_percentage, 2),
            }
            
            return UseCaseResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.error(f"Error al obtener progreso del curso: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener progreso del curso: {str(e)}"
            )

