"""
Endpoints de Cursos - FagSol Escuela Virtual
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.courses.models import Course, Module, Lesson
from apps.users.models import Enrollment
from apps.users.permissions import (
    can_view_course, can_access_course_content
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los cursos disponibles según los permisos del usuario',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filtro por estado (published, draft)',
            type=openapi.TYPE_STRING,
            enum=['published', 'draft']
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description='Búsqueda por título',
            type=openapi.TYPE_STRING
        ),
    ],
    responses={
        200: openapi.Response(
            description='Lista de cursos',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 'course-1',
                            'title': 'Curso de Ejemplo',
                            'slug': 'curso-de-ejemplo',
                            'price': 100.00,
                            'currency': 'PEN',
                            'status': 'published'
                        }
                    ],
                    'count': 1
                }
            }
        ),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def list_courses(request):
    """
    Lista todos los cursos publicados
    GET /api/v1/courses/
    
    Query params:
    - status: filtro por estado (published, draft)
    - search: búsqueda por título
    
    Permisos:
    - Público: Solo muestra cursos publicados
    - Autenticado: Muestra cursos publicados + cursos en los que está inscrito
    """
    try:
        # Filtros
        status_filter = request.query_params.get('status', 'published')
        search = request.query_params.get('search', '')
        
        # Query base
        queryset = Course.objects.filter(is_active=True)
        
        # Filtrar por estado
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Búsqueda
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        # Filtrar según permisos del usuario
        filtered_courses = []
        for course in queryset:
            if can_view_course(request.user, course):
                filtered_courses.append(course)
        
        # Serializar
        courses = []
        for course in filtered_courses:
            courses.append({
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'short_description': course.short_description or course.description[:200] + '...' if len(course.description) > 200 else course.description,
                'price': float(course.price),
                'currency': course.currency,
                'thumbnail_url': course.thumbnail_url,
                'status': course.status,
                'created_at': course.created_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'data': courses,
            'count': len(courses)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en list_courses: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_course(request, course_id):
    """
    Obtiene los detalles de un curso
    GET /api/v1/courses/{course_id}/
    """
    try:
        # Obtener curso
        course = get_object_or_404(Course, id=course_id, is_active=True)
        
        # Obtener módulos
        modules = []
        for module in course.modules.filter(is_active=True).order_by('order'):
            lessons = []
            for lesson in module.lessons.filter(is_active=True).order_by('order'):
                lessons.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order
                })
            
            modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'price': float(module.price) if module.is_purchasable else None,
                'is_purchasable': module.is_purchasable,
                'lessons': lessons,
                'order': module.order
            })
        
        # Verificar si el usuario está inscrito (si está autenticado)
        is_enrolled = False
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(
                user=request.user,
                course=course,
                status='active'
            ).exists()
        
        return Response({
            'success': True,
            'data': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'short_description': course.short_description,
                'price': float(course.price),
                'currency': course.currency,
                'thumbnail_url': course.thumbnail_url,
                'banner_url': course.banner_url,
                'status': course.status,
                'modules': modules,
                'is_enrolled': is_enrolled,
                'created_at': course.created_at.isoformat(),
            }
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Curso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_course: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el contenido completo de un curso. Requiere estar inscrito o tener rol admin/instructor',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Contenido del curso'),
        403: openapi.Response(description='No tienes acceso a este curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_content(request, course_id):
    """
    Obtiene el contenido completo de un curso (solo si el usuario tiene acceso)
    GET /api/v1/courses/{course_id}/content/
    
    Requiere autenticación y acceso al curso (enrollment activo o rol admin/instructor)
    """
    try:
        # Obtener curso
        course = get_object_or_404(Course, id=course_id, is_active=True)
        
        # Verificar permisos usando policy
        if not can_access_course_content(request.user, course):
            return Response({
                'success': False,
                'message': 'No tienes acceso a este curso. Debes estar inscrito.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener enrollment (si existe)
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status='active'
        ).first()
        
        # Obtener contenido completo
        modules = []
        for module in course.modules.filter(is_active=True).order_by('order'):
            lessons = []
            for lesson in module.lessons.filter(is_active=True).order_by('order'):
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'description': lesson.description,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order
                }
                
                # Incluir URL de contenido solo si está disponible
                if lesson.content_url:
                    lesson_data['content_url'] = lesson.content_url
                if lesson.content_text:
                    lesson_data['content_text'] = lesson.content_text
                
                lessons.append(lesson_data)
            
            modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'lessons': lessons,
                'order': module.order
            })
        
        return Response({
            'success': True,
            'data': {
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'description': course.description,
                },
                'enrollment': {
                    'id': enrollment.id,
                    'status': enrollment.status,
                    'completed': enrollment.completed,
                    'completion_percentage': float(enrollment.completion_percentage),
                    'enrolled_at': enrollment.enrolled_at.isoformat()
                },
                'modules': modules
            }
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Curso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_course_content: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

