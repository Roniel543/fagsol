"""
URLs de Cursos - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.course_views import (
    list_courses,
    get_course,
    get_course_by_slug,
    get_course_content,
    create_course,
    update_course,
    delete_course,
    request_course_review,
    list_instructor_courses,
    upload_course_image
)

urlpatterns = [
    # Listar y crear cursos (POST debe ir antes de rutas con parámetros)
    path('', list_courses, name='list_courses'),  # GET /api/v1/courses/
    path('create/', create_course, name='create_course'),  # POST /api/v1/courses/create/ (alternativa)
    # O usar el mismo path con método POST: path('', create_course, name='create_course'),
    
    # Rutas con slug
    path('slug/<str:slug>/', get_course_by_slug, name='get_course_by_slug'),
    
    # Subida de imágenes (debe ir antes de rutas con parámetros)
    path('upload-image/', upload_course_image, name='upload_course_image'),  # POST /api/v1/courses/upload-image/
    
    # Rutas con course_id (deben ir al final para evitar conflictos)
    path('<str:course_id>/', get_course, name='get_course'),  # GET /api/v1/courses/{id}/
    path('<str:course_id>/update/', update_course, name='update_course'),  # PUT /api/v1/courses/{id}/update/
    path('<str:course_id>/delete/', delete_course, name='delete_course'),  # DELETE /api/v1/courses/{id}/delete/
    path('<str:course_id>/content/', get_course_content, name='get_course_content'),
    path('<str:course_id>/request-review/', request_course_review, name='request_course_review'),  # POST /api/v1/courses/{id}/request-review/ (FASE 2)
]

