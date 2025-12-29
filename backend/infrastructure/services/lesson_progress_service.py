"""
Servicio de Progreso de Lecciones - FagSol Escuela Virtual
Maneja el progreso de usuarios en lecciones y actualiza el enrollment

⚠️ DEPRECATED: Este servicio ha sido migrado a casos de uso.
Usar application.use_cases.lesson en su lugar:
- MarkLessonCompletedUseCase - Reemplaza LessonProgressService.mark_lesson_completed()
- MarkLessonIncompleteUseCase - Reemplaza LessonProgressService.mark_lesson_incomplete()
- GetLessonProgressUseCase - Reemplaza LessonProgressService.get_lesson_progress()
- GetCourseProgressUseCase - Reemplaza LessonProgressService.get_course_progress()

Este archivo se mantiene temporalmente para compatibilidad.
Se eliminará en una versión futura.
"""

import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.users.models import Enrollment, LessonProgress
from apps.courses.models import Lesson, Course

logger = logging.getLogger('apps')


class LessonProgressService:
    """
    Servicio que maneja el progreso de lecciones y actualiza el enrollment
    """
    
    def mark_lesson_completed(
        self,
        user,
        lesson_id: str,
        enrollment_id: str
    ) -> Tuple[bool, Optional[LessonProgress], str]:
        """
        Marca una lección como completada
        
        Args:
            user: Usuario autenticado
            lesson_id: ID de la lección
            enrollment_id: ID del enrollment (para validar acceso)
        
        Returns:
            Tuple[success, lesson_progress, error_message]
        """
        try:
            # 1. Validar que el enrollment existe y pertenece al usuario
            try:
                enrollment = Enrollment.objects.get(id=enrollment_id, user=user, status='active')
            except Enrollment.DoesNotExist:
                return False, None, "Enrollment no encontrado o no tienes acceso"
            
            # 2. Validar que la lección existe y pertenece al curso del enrollment
            try:
                lesson = Lesson.objects.get(
                    id=lesson_id,
                    module__course=enrollment.course,
                    is_active=True
                )
            except Lesson.DoesNotExist:
                return False, None, "Lección no encontrada o no pertenece a este curso"
            
            # 3. Obtener o crear LessonProgress
            with transaction.atomic():
                lesson_progress, created = LessonProgress.objects.get_or_create(
                    user=user,
                    lesson=lesson,
                    enrollment=enrollment,
                    defaults={
                        'is_completed': True,
                        'completed_at': timezone.now(),
                        'progress_percentage': Decimal('100.00')
                    }
                )
                
                # Si ya existe, actualizar
                if not created:
                    if not lesson_progress.is_completed:
                        lesson_progress.mark_as_completed()
                
                # 4. Actualizar porcentaje de completitud del enrollment
                self._update_enrollment_progress(enrollment)
                
                logger.info(f"Lección {lesson_id} marcada como completada por usuario {user.id}")
                return True, lesson_progress, ""
                
        except Exception as e:
            logger.error(f"Error al marcar lección como completada: {str(e)}")
            return False, None, f"Error al marcar lección como completada: {str(e)}"
    
    def mark_lesson_incomplete(
        self,
        user,
        lesson_id: str,
        enrollment_id: str
    ) -> Tuple[bool, Optional[LessonProgress], str]:
        """
        Marca una lección como incompleta
        
        Args:
            user: Usuario autenticado
            lesson_id: ID de la lección
            enrollment_id: ID del enrollment
        
        Returns:
            Tuple[success, lesson_progress, error_message]
        """
        try:
            # 1. Validar enrollment
            try:
                enrollment = Enrollment.objects.get(id=enrollment_id, user=user, status='active')
            except Enrollment.DoesNotExist:
                return False, None, "Enrollment no encontrado o no tienes acceso"
            
            # 2. Validar lección
            try:
                lesson = Lesson.objects.get(
                    id=lesson_id,
                    module__course=enrollment.course,
                    is_active=True
                )
            except Lesson.DoesNotExist:
                return False, None, "Lección no encontrada o no pertenece a este curso"
            
            # 3. Obtener LessonProgress
            try:
                lesson_progress = LessonProgress.objects.get(
                    user=user,
                    lesson=lesson,
                    enrollment=enrollment
                )
            except LessonProgress.DoesNotExist:
                return False, None, "No existe progreso para esta lección"
            
            # 4. Marcar como incompleta
            with transaction.atomic():
                lesson_progress.mark_as_incomplete()
                
                # 5. Actualizar porcentaje de completitud del enrollment
                self._update_enrollment_progress(enrollment)
                
                logger.info(f"Lección {lesson_id} marcada como incompleta por usuario {user.id}")
                return True, lesson_progress, ""
                
        except Exception as e:
            logger.error(f"Error al marcar lección como incompleta: {str(e)}")
            return False, None, f"Error al marcar lección como incompleta: {str(e)}"
    
    def get_lesson_progress(
        self,
        user,
        lesson_id: str,
        enrollment_id: str
    ) -> Tuple[bool, Optional[LessonProgress], str]:
        """
        Obtiene el progreso de una lección específica
        
        Args:
            user: Usuario autenticado
            lesson_id: ID de la lección
            enrollment_id: ID del enrollment
        
        Returns:
            Tuple[success, lesson_progress, error_message]
        """
        try:
            # Validar enrollment
            try:
                enrollment = Enrollment.objects.get(id=enrollment_id, user=user, status='active')
            except Enrollment.DoesNotExist:
                return False, None, "Enrollment no encontrado o no tienes acceso"
            
            # Validar lección
            try:
                lesson = Lesson.objects.get(
                    id=lesson_id,
                    module__course=enrollment.course,
                    is_active=True
                )
            except Lesson.DoesNotExist:
                return False, None, "Lección no encontrada o no pertenece a este curso"
            
            # Obtener progreso (puede no existir)
            lesson_progress = LessonProgress.objects.filter(
                user=user,
                lesson=lesson,
                enrollment=enrollment
            ).first()
            
            return True, lesson_progress, ""
            
        except Exception as e:
            logger.error(f"Error al obtener progreso de lección: {str(e)}")
            return False, None, f"Error al obtener progreso de lección: {str(e)}"
    
    def get_course_progress(
        self,
        user,
        enrollment_id: str
    ) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene el progreso completo de un curso (todas las lecciones)
        
        Args:
            user: Usuario autenticado
            enrollment_id: ID del enrollment
        
        Returns:
            Tuple[success, progress_dict, error_message]
            progress_dict contiene:
            - enrollment: datos del enrollment
            - lessons_progress: dict con lesson_id -> progress_data
            - total_lessons: número total de lecciones
            - completed_lessons: número de lecciones completadas
            - completion_percentage: porcentaje de completitud
        """
        try:
            # Validar enrollment
            try:
                enrollment = Enrollment.objects.get(id=enrollment_id, user=user, status='active')
            except Enrollment.DoesNotExist:
                return False, None, "Enrollment no encontrado o no tienes acceso"
            
            course = enrollment.course
            
            # Obtener todas las lecciones activas del curso
            lessons = Lesson.objects.filter(
                module__course=course,
                is_active=True
            ).select_related('module').order_by('module__order', 'order')
            
            # Obtener todos los progresos del usuario para este enrollment
            progresses = LessonProgress.objects.filter(
                user=user,
                enrollment=enrollment
            ).select_related('lesson')
            
            # Crear dict de progresos por lesson_id
            progress_dict = {p.lesson_id: p for p in progresses}
            
            # Construir respuesta
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
                    'last_accessed_at': progress.last_accessed_at.isoformat() if progress else None,
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
            
            return True, result, ""
            
        except Exception as e:
            logger.error(f"Error al obtener progreso del curso: {str(e)}")
            return False, None, f"Error al obtener progreso del curso: {str(e)}"
    
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
            logger.error(f"Error al actualizar progreso del enrollment: {str(e)}")
            raise

