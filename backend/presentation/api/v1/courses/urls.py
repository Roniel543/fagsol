"""
URLs de Cursos - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.course_views import (
    list_courses,
    get_course,
    get_course_by_slug,
    get_course_content
)

urlpatterns = [
    path('', list_courses, name='list_courses'),
    path('slug/<str:slug>/', get_course_by_slug, name='get_course_by_slug'),
    path('<str:course_id>/', get_course, name='get_course'),
    path('<str:course_id>/content/', get_course_content, name='get_course_content'),
]

