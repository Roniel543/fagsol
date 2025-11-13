"""
Endpoints de Enrollments - FagSol Escuela Virtual
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.models import Enrollment
from apps.courses.models import Course
from apps.users.permissions import (
    IsAdminOrInstructor, CanViewEnrollment,
    can_view_enrollment, has_perm
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Lista los enrollments (inscripciones) del usuario autenticado. Los administradores e instructores pueden ver todos los enrollments, mientras que los estudiantes solo ven los suyos.',
    responses={
        200: openapi.Response(
            description='Lista de enrollments',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'course': {
                                'id': 'course-1',
                                'title': 'Curso de Ejemplo',
                                'slug': 'curso-de-ejemplo',
                                'thumbnail_url': 'https://example.com/image.jpg'
                            },
                            'status': 'active',
                            'completed': False,
                            'completion_percentage': 0.0,
                            'enrolled_at': '2025-01-12T10:00:00Z',
                            'completed_at': None
                        }
                    ],
                    'count': 1
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Inscripciones']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_enrollments(request):
    """
    Lista los enrollments del usuario autenticado
    GET /api/v1/enrollments/
    
    Permisos:
    - Estudiantes: Solo sus propios enrollments (users.view_own_enrollment)
    - Admin/Instructores: Todos los enrollments (users.view_enrollment)
    """
    try:
        # Verificar permisos usando Django permissions
        if has_perm(request.user, 'users.view_enrollment'):
            # Admin e instructores pueden ver todos los enrollments
            enrollments = Enrollment.objects.all().order_by('-enrolled_at')
        elif has_perm(request.user, 'users.view_own_enrollment'):
            # Estudiantes solo sus propios enrollments
            enrollments = Enrollment.objects.filter(user=request.user).order_by('-enrolled_at')
        else:
            return Response({
                'success': False,
                'message': 'No tienes permiso para ver enrollments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = []
        for enrollment in enrollments:
            data.append({
                'id': enrollment.id,
                'course': {
                    'id': enrollment.course.id,
                    'title': enrollment.course.title,
                    'slug': enrollment.course.slug,
                    'thumbnail_url': enrollment.course.thumbnail_url,
                },
                'status': enrollment.status,
                'completed': enrollment.completed,
                'completion_percentage': float(enrollment.completion_percentage),
                'enrolled_at': enrollment.enrolled_at.isoformat(),
                'completed_at': enrollment.completed_at.isoformat() if enrollment.completed_at else None,
            })
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en list_enrollments: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene los detalles de un enrollment específico. Los estudiantes solo pueden ver sus propios enrollments, mientras que administradores e instructores pueden ver cualquier enrollment.',
    manual_parameters=[
        openapi.Parameter(
            'enrollment_id',
            openapi.IN_PATH,
            description='ID del enrollment',
            type=openapi.TYPE_INTEGER,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(
            description='Detalles del enrollment',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'id': 1,
                        'course': {
                            'id': 'course-1',
                            'title': 'Curso de Ejemplo',
                            'slug': 'curso-de-ejemplo',
                            'description': 'Descripción del curso',
                            'thumbnail_url': 'https://example.com/image.jpg'
                        },
                        'status': 'active',
                        'completed': False,
                        'completion_percentage': 0.0,
                        'enrolled_at': '2025-01-12T10:00:00Z',
                        'completed_at': None,
                        'expires_at': None
                    }
                }
            }
        ),
        403: openapi.Response(description='No tienes permiso para ver este enrollment'),
        404: openapi.Response(description='Enrollment no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Inscripciones']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_enrollment(request, enrollment_id):
    """
    Obtiene los detalles de un enrollment
    GET /api/v1/enrollments/{enrollment_id}/
    
    Permisos:
    - Estudiantes: Solo sus propios enrollments (users.view_own_enrollment)
    - Admin/Instructores: Cualquier enrollment (users.view_enrollment)
    """
    try:
        enrollment = Enrollment.objects.get(id=enrollment_id)
        
        # Verificar permisos usando policy
        if not can_view_enrollment(request.user, enrollment):
            return Response({
                'success': False,
                'message': 'No tienes permiso para ver este enrollment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'data': {
                'id': enrollment.id,
                'course': {
                    'id': enrollment.course.id,
                    'title': enrollment.course.title,
                    'slug': enrollment.course.slug,
                    'description': enrollment.course.description,
                    'thumbnail_url': enrollment.course.thumbnail_url,
                },
                'status': enrollment.status,
                'completed': enrollment.completed,
                'completion_percentage': float(enrollment.completion_percentage),
                'enrolled_at': enrollment.enrolled_at.isoformat(),
                'completed_at': enrollment.completed_at.isoformat() if enrollment.completed_at else None,
                'expires_at': enrollment.expires_at.isoformat() if enrollment.expires_at else None,
            }
        }, status=status.HTTP_200_OK)
        
    except Enrollment.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Enrollment no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_enrollment: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

