"""
Endpoints de Dashboard - FagSol Escuela Virtual
Proporciona estadísticas del dashboard según el rol del usuario
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from infrastructure.services.dashboard_service import DashboardService
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene estadísticas del dashboard según el rol del usuario autenticado. Las estadísticas varían según si el usuario es admin, instructor o estudiante.',
    responses={
        200: openapi.Response(
            description='Estadísticas del dashboard',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'role': 'admin',
                        'courses': {
                            'total': 50,
                            'published': 35,
                            'draft': 10,
                            'archived': 5
                        },
                        'users': {
                            'total': 200,
                            'students': 180,
                            'instructors': 15,
                            'admins': 5
                        },
                        'enrollments': {
                            'total': 500,
                            'active': 400,
                            'completed': 100
                        },
                        'payments': {
                            'total': 300,
                            'total_revenue': 15000.00,
                            'revenue_last_month': 5000.00
                        }
                    }
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """
    Obtiene estadísticas del dashboard según el rol del usuario
    GET /api/v1/dashboard/stats/
    
    Requiere autenticación. Las estadísticas varían según el rol:
    - Admin: Estadísticas generales del sistema
    - Instructor: Estadísticas de sus cursos
    - Student: Estadísticas de sus enrollments
    """
    try:
        dashboard_service = DashboardService()
        success, stats, error_message = dashboard_service.get_dashboard_stats(request.user)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'data': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_dashboard_stats: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene estadísticas de administrador. Solo accesible para usuarios con rol admin.',
    responses={
        200: openapi.Response(description='Estadísticas de administrador'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
        401: openapi.Response(description='No autenticado')
    },
    security=[{'Bearer': []}],
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_stats(request):
    """
    Obtiene estadísticas de administrador
    GET /api/v1/dashboard/admin/stats/
    
    Solo accesible para administradores
    """
    try:
        dashboard_service = DashboardService()
        success, stats, error_message = dashboard_service.get_admin_stats(request.user)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'data': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_admin_stats: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene estadísticas de instructor. Solo accesible para usuarios con rol instructor.',
    responses={
        200: openapi.Response(description='Estadísticas de instructor'),
        403: openapi.Response(description='No autorizado - Solo instructores'),
        401: openapi.Response(description='No autenticado')
    },
    security=[{'Bearer': []}],
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instructor_stats(request):
    """
    Obtiene estadísticas de instructor
    GET /api/v1/dashboard/instructor/stats/
    
    Solo accesible para instructores
    """
    try:
        dashboard_service = DashboardService()
        success, stats, error_message = dashboard_service.get_instructor_stats(request.user)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'data': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_instructor_stats: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene estadísticas de estudiante para el usuario autenticado.',
    responses={
        200: openapi.Response(description='Estadísticas de estudiante'),
        401: openapi.Response(description='No autenticado')
    },
    security=[{'Bearer': []}],
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_stats(request):
    """
    Obtiene estadísticas de estudiante
    GET /api/v1/dashboard/student/stats/
    
    Accesible para todos los usuarios autenticados
    """
    try:
        dashboard_service = DashboardService()
        success, stats, error_message = dashboard_service.get_student_stats(request.user)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'data': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en get_student_stats: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

