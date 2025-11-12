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
    can_view_enrollment
)

logger = logging.getLogger('apps')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_enrollments(request):
    """
    Lista los enrollments del usuario autenticado
    GET /api/v1/enrollments/
    
    Permisos:
    - Estudiantes: Solo sus propios enrollments
    - Admin/Instructores: Todos los enrollments
    """
    try:
        from apps.users.permissions import get_user_role, ROLE_ADMIN, ROLE_INSTRUCTOR
        
        user_role = get_user_role(request.user)
        
        # Admin e instructores pueden ver todos los enrollments
        if user_role in [ROLE_ADMIN, ROLE_INSTRUCTOR]:
            enrollments = Enrollment.objects.all().order_by('-enrolled_at')
        else:
            # Estudiantes solo sus propios enrollments
            enrollments = Enrollment.objects.filter(user=request.user).order_by('-enrolled_at')
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_enrollment(request, enrollment_id):
    """
    Obtiene los detalles de un enrollment
    GET /api/v1/enrollments/{enrollment_id}/
    
    Permisos:
    - Estudiantes: Solo sus propios enrollments
    - Admin/Instructores: Cualquier enrollment
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

