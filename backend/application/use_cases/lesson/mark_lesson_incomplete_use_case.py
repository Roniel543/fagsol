"""
Caso de uso: Marcar lección como incompleta - FagSol Escuela Virtual
"""

import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.users.models import Enrollment, LessonProgress
from apps.courses.models import Lesson
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class MarkLessonIncompleteUseCase:
    """
    Caso de uso: Marcar lección como incompleta
    
    Responsabilidades:
    - Validar enrollment y lección
    - Actualizar LessonProgress
    - Actualizar porcentaje de completitud del enrollment
    """
    
    def execute(
        self,
        user,
        lesson_id: str,
        enrollment_id: str
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de marcar lección como incompleta
        
        Args:
            user: Usuario autenticado
            lesson_id: ID de la lección
            enrollment_id: ID del enrollment
            
        Returns:
            UseCaseResult con el resultado de la operación
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
            
            # 3. Obtener LessonProgress
            try:
                lesson_progress = LessonProgress.objects.get(
                    user=user,
                    lesson=lesson,
                    enrollment=enrollment
                )
            except LessonProgress.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="No existe progreso para esta lección"
                )
            
            # 4. Marcar como incompleta
            with transaction.atomic():
                lesson_progress.mark_as_incomplete()
                
                # 5. Actualizar porcentaje de completitud del enrollment
                self._update_enrollment_progress(enrollment)
                
                logger.info(f"Lección {lesson_id} marcada como incompleta por usuario {user.id}")
                
                return UseCaseResult(
                    success=True,
                    data={
                        'lesson_progress_id': lesson_progress.id,
                        'is_completed': lesson_progress.is_completed,
                    },
                    extra={'lesson_progress': lesson_progress, 'enrollment': enrollment}
                )
                
        except Exception as e:
            logger.error(f"Error al marcar lección como incompleta: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al marcar lección como incompleta: {str(e)}"
            )
    
    def _update_enrollment_progress(self, enrollment: Enrollment):
        """
        Actualiza el porcentaje de completitud del enrollment basado en las lecciones completadas
        
        Args:
            enrollment: Instancia de Enrollment
        """
        try:
            course = enrollment.course
            
            # Obtener todas las lecciones activas del curso
            total_lessons = Lesson.objects.filter(
                module__course=course,
                is_active=True
            ).count()
            
            if total_lessons == 0:
                # Si no hay lecciones, el curso está 100% completo (vacío)
                enrollment.completion_percentage = Decimal('100.00')
                enrollment.completed = True
                enrollment.completed_at = timezone.now()
                enrollment.status = 'completed'
                enrollment.save()
                return
            
            # Contar lecciones completadas
            completed_lessons = LessonProgress.objects.filter(
                user=enrollment.user,
                enrollment=enrollment,
                is_completed=True
            ).count()
            
            # Calcular porcentaje
            completion_percentage = Decimal(str(round(completed_lessons / total_lessons * 100, 2)))
            
            # Actualizar enrollment
            enrollment.completion_percentage = completion_percentage
            
            # Si todas las lecciones están completadas, marcar curso como completado
            if completed_lessons == total_lessons:
                enrollment.completed = True
                enrollment.completed_at = timezone.now()
                enrollment.status = 'completed'
            else:
                enrollment.completed = False
                enrollment.completed_at = None
                if enrollment.status == 'completed':
                    enrollment.status = 'active'
            
            enrollment.save()
            
            logger.info(f"Enrollment {enrollment.id} actualizado: {completion_percentage}% completado")
            
        except Exception as e:
            logger.error(f"Error al actualizar progreso del enrollment: {str(e)}", exc_info=True)
            raise

