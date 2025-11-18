"""
URLs de Progreso de Lecciones - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.progress_views import (
    mark_lesson_completed,
    mark_lesson_incomplete,
    get_course_progress,
    get_lesson_progress,
)

urlpatterns = [
    # Marcar lección como completada
    path('lessons/complete/', mark_lesson_completed, name='mark_lesson_completed'),
    
    # Marcar lección como incompleta
    path('lessons/incomplete/', mark_lesson_incomplete, name='mark_lesson_incomplete'),
    
    # Obtener progreso de una lección específica
    path('lesson/', get_lesson_progress, name='get_lesson_progress'),
    
    # Obtener progreso completo de un curso
    path('course/', get_course_progress, name='get_course_progress'),
]

