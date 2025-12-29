"""
Casos de uso de lecciones - FagSol Escuela Virtual

Casos de uso relacionados con progreso de lecciones:
- Marcar lección como completada
- Marcar lección como incompleta
- Obtener progreso de lección
- Obtener progreso completo de curso
"""

from .mark_lesson_completed_use_case import MarkLessonCompletedUseCase
from .mark_lesson_incomplete_use_case import MarkLessonIncompleteUseCase
from .get_lesson_progress_use_case import GetLessonProgressUseCase
from .get_course_progress_use_case import GetCourseProgressUseCase

__all__ = [
    'MarkLessonCompletedUseCase',
    'MarkLessonIncompleteUseCase',
    'GetLessonProgressUseCase',
    'GetCourseProgressUseCase',
]

