"""
URLs de Instructor - FagSol Escuela Virtual
"""
from django.urls import path
from presentation.views.course_views import list_instructor_courses

urlpatterns = [
    path('courses/', list_instructor_courses, name='instructor_list_courses'),
]

