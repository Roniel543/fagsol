"""
Views de Progreso de Lecciones - FagSol Escuela Virtual
Endpoints para manejar el progreso de lecciones
"""

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404
from apps.courses.models import Lesson
from apps.users.models import Enrollment
from apps.users.permissions import can_update_lesson_progress
from infrastructure.services.lesson_progress_service import LessonProgressService

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='post',
    operation_description='Marca una lección como completada. Actualiza automáticamente el progreso del enrollment.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['lesson_id', 'enrollment_id'],
        properties={
            'lesson_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID de la lección a marcar como completada',
                example='l-001'
            ),
            'enrollment_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID del enrollment (para validar acceso)',
                example='enr_abc123'
            ),
        }
    ),
    responses={
        200: openapi.Response(
            description='Lección marcada como completada exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'lesson_progress_id': 'lp_abc123',
                        'is_completed': True,
                        'completed_at': '2024-01-15T10:30:00Z',
                        'enrollment_completion_percentage': 45.50
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos o error en el procesamiento'),
        403: openapi.Response(description='No tienes permiso para actualizar este progreso'),
        404: openapi.Response(description='Lección o enrollment no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Progreso']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_completed(request):
    """
    Marca una lección como completada
    POST /api/v1/progress/lessons/complete/
    
    Body:
    {
        "lesson_id": "l-001",
        "enrollment_id": "enr_abc123"
    }
    
    Requiere autenticación y acceso al curso (enrollment activo)
    """
    try:
        lesson_id = request.data.get('lesson_id')
        enrollment_id = request.data.get('enrollment_id')
        
        if not lesson_id or not enrollment_id:
            return Response({
                'success': False,
                'message': 'lesson_id y enrollment_id son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que el enrollment existe y pertenece al usuario
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, user=request.user, status='active')
        
        # Validar que la lección existe y pertenece al curso
        lesson = get_object_or_404(
            Lesson,
            id=lesson_id,
            module__course=enrollment.course,
            is_active=True
        )
        
        # Verificar permisos
        if not can_update_lesson_progress(request.user, lesson, enrollment):
            return Response({
                'success': False,
                'message': 'No tienes permiso para actualizar este progreso'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Procesar con el servicio
        progress_service = LessonProgressService()
        success, lesson_progress, error_message = progress_service.mark_lesson_completed(
            user=request.user,
            lesson_id=lesson_id,
            enrollment_id=enrollment_id
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener enrollment actualizado
        enrollment.refresh_from_db()
        
        return Response({
            'success': True,
            'data': {
                'lesson_progress_id': lesson_progress.id,
                'is_completed': lesson_progress.is_completed,
                'completed_at': lesson_progress.completed_at.isoformat() if lesson_progress.completed_at else None,
                'enrollment_completion_percentage': float(enrollment.completion_percentage),
                'enrollment_completed': enrollment.completed,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en mark_lesson_completed: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Marca una lección como incompleta. Actualiza automáticamente el progreso del enrollment.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['lesson_id', 'enrollment_id'],
        properties={
            'lesson_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID de la lección a marcar como incompleta',
                example='l-001'
            ),
            'enrollment_id': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='ID del enrollment',
                example='enr_abc123'
            ),
        }
    ),
    responses={
        200: openapi.Response(description='Lección marcada como incompleta exitosamente'),
        400: openapi.Response(description='Datos inválidos o error en el procesamiento'),
        403: openapi.Response(description='No tienes permiso para actualizar este progreso'),
        404: openapi.Response(description='Lección o enrollment no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Progreso']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_incomplete(request):
    """
    Marca una lección como incompleta
    POST /api/v1/progress/lessons/incomplete/
    
    Body:
    {
        "lesson_id": "l-001",
        "enrollment_id": "enr_abc123"
    }
    """
    try:
        lesson_id = request.data.get('lesson_id')
        enrollment_id = request.data.get('enrollment_id')
        
        if not lesson_id or not enrollment_id:
            return Response({
                'success': False,
                'message': 'lesson_id y enrollment_id son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar enrollment
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, user=request.user, status='active')
        
        # Validar lección
        lesson = get_object_or_404(
            Lesson,
            id=lesson_id,
            module__course=enrollment.course,
            is_active=True
        )
        
        # Verificar permisos
        if not can_update_lesson_progress(request.user, lesson, enrollment):
            return Response({
                'success': False,
                'message': 'No tienes permiso para actualizar este progreso'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Procesar con el servicio
        progress_service = LessonProgressService()
        success, lesson_progress, error_message = progress_service.mark_lesson_incomplete(
            user=request.user,
            lesson_id=lesson_id,
            enrollment_id=enrollment_id
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener enrollment actualizado
        enrollment.refresh_from_db()
        
        return Response({
            'success': True,
            'data': {
                'lesson_progress_id': lesson_progress.id,
                'is_completed': lesson_progress.is_completed,
                'enrollment_completion_percentage': float(enrollment.completion_percentage),
                'enrollment_completed': enrollment.completed,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en mark_lesson_incomplete: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el progreso completo de un curso (todas las lecciones)',
    manual_parameters=[
        openapi.Parameter(
            'enrollment_id',
            openapi.IN_QUERY,
            description='ID del enrollment',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(
            description='Progreso del curso obtenido exitosamente',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'enrollment': {
                            'id': 'enr_abc123',
                            'completion_percentage': 45.50,
                            'completed': False,
                            'status': 'active'
                        },
                        'lessons_progress': {
                            'l-001': {
                                'lesson_id': 'l-001',
                                'lesson_title': 'Introducción',
                                'is_completed': True,
                                'progress_percentage': 100.0,
                                'completed_at': '2024-01-15T10:30:00Z'
                            }
                        },
                        'total_lessons': 10,
                        'completed_lessons': 5,
                        'completion_percentage': 50.0
                    }
                }
            }
        ),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No tienes acceso a este enrollment'),
        404: openapi.Response(description='Enrollment no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Progreso']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_progress(request):
    """
    Obtiene el progreso completo de un curso
    GET /api/v1/progress/course/?enrollment_id=enr_abc123
    
    Requiere autenticación y acceso al enrollment
    """
    try:
        enrollment_id = request.query_params.get('enrollment_id')
        
        if not enrollment_id:
            return Response({
                'success': False,
                'message': 'enrollment_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar enrollment
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, user=request.user, status='active')
        
        # Obtener progreso con el servicio
        progress_service = LessonProgressService()
        success, progress_data, error_message = progress_service.get_course_progress(
            user=request.user,
            enrollment_id=enrollment_id
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': progress_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_course_progress: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el progreso de una lección específica',
    manual_parameters=[
        openapi.Parameter(
            'lesson_id',
            openapi.IN_QUERY,
            description='ID de la lección',
            type=openapi.TYPE_STRING,
            required=True
        ),
        openapi.Parameter(
            'enrollment_id',
            openapi.IN_QUERY,
            description='ID del enrollment',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Progreso de la lección obtenido exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No tienes acceso'),
        404: openapi.Response(description='Lección o enrollment no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Progreso']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_progress(request):
    """
    Obtiene el progreso de una lección específica
    GET /api/v1/progress/lesson/?lesson_id=l-001&enrollment_id=enr_abc123
    """
    try:
        lesson_id = request.query_params.get('lesson_id')
        enrollment_id = request.query_params.get('enrollment_id')
        
        if not lesson_id or not enrollment_id:
            return Response({
                'success': False,
                'message': 'lesson_id y enrollment_id son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar enrollment
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, user=request.user, status='active')
        
        # Validar lección
        lesson = get_object_or_404(
            Lesson,
            id=lesson_id,
            module__course=enrollment.course,
            is_active=True
        )
        
        # Obtener progreso con el servicio
        progress_service = LessonProgressService()
        success, lesson_progress, error_message = progress_service.get_lesson_progress(
            user=request.user,
            lesson_id=lesson_id,
            enrollment_id=enrollment_id
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Si no hay progreso, retornar null
        if not lesson_progress:
            return Response({
                'success': True,
                'data': {
                    'lesson_id': lesson_id,
                    'is_completed': False,
                    'progress_percentage': 0.0,
                    'completed_at': None,
                    'last_accessed_at': None,
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': True,
            'data': {
                'lesson_progress_id': lesson_progress.id,
                'lesson_id': lesson_id,
                'is_completed': lesson_progress.is_completed,
                'progress_percentage': float(lesson_progress.progress_percentage),
                'completed_at': lesson_progress.completed_at.isoformat() if lesson_progress.completed_at else None,
                'last_accessed_at': lesson_progress.last_accessed_at.isoformat(),
                'time_watched_seconds': lesson_progress.time_watched_seconds,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_lesson_progress: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

