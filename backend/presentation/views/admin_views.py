"""
Vistas de administración - Gestión de permisos y usuarios
FagSol Escuela Virtual

Endpoints para que los administradores gestionen:
- Permisos de usuarios
- Asignación de roles
- Grupos de Django
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.db import models
from apps.core.models import UserProfile
from apps.users.permissions import IsAdmin, has_perm, get_user_role, ROLE_ADMIN
from infrastructure.services.instructor_approval_service import InstructorApprovalService
from infrastructure.services.course_approval_service import CourseApprovalService
from infrastructure.services.instructor_application_service import InstructorApplicationService
from apps.core.models import InstructorApplication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los grupos de Django con sus permisos asignados. Solo accesible para administradores.',
    responses={
        200: openapi.Response(
            description='Lista de grupos',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'name': 'Administradores',
                            'permissions': [
                                {
                                    'id': 1,
                                    'codename': 'add_course',
                                    'name': 'Puede crear cursos',
                                    'content_type': 'courses'
                                }
                            ],
                            'permissions_count': 25
                        }
                    ]
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Grupos y Permisos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_groups(request):
    """
    Lista todos los grupos de Django con sus permisos asignados.
    GET /api/v1/admin/groups/
    """
    try:
        groups = Group.objects.all().prefetch_related('permissions')
        
        groups_data = []
        for group in groups:
            groups_data.append({
                'id': group.id,
                'name': group.name,
                'permissions': [
                    {
                        'id': perm.id,
                        'codename': perm.codename,
                        'name': perm.name,
                        'content_type': perm.content_type.app_label
                    }
                    for perm in group.permissions.all()
                ],
                'permissions_count': group.permissions.count()
            })
        
        return Response({
            'success': True,
            'data': groups_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing groups: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar grupos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los permisos disponibles en el sistema. Solo accesible para administradores.',
    responses={
        200: openapi.Response(
            description='Lista de permisos',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'name': 'Puede crear cursos',
                            'codename': 'add_course',
                            'content_type': 'courses'
                        }
                    ]
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Grupos y Permisos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_permissions(request):
    """
    Lista todos los permisos disponibles en el sistema.
    GET /api/v1/admin/permissions/
    """
    try:
        permissions = Permission.objects.all().select_related('content_type')
        
        permissions_data = []
        for perm in permissions:
            permissions_data.append({
                'id': perm.id,
                'codename': perm.codename,
                'name': perm.name,
                'content_type': {
                    'app_label': perm.content_type.app_label,
                    'model': perm.content_type.model
                },
                'full_codename': f"{perm.content_type.app_label}.{perm.codename}"
            })
        
        return Response({
            'success': True,
            'data': permissions_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing permissions: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar permisos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene los permisos de un usuario específico',
    manual_parameters=[
        openapi.Parameter('user_id', openapi.IN_PATH, description='ID del usuario', type=openapi.TYPE_INTEGER),
    ],
    responses={
        200: openapi.Response(description='Permisos del usuario'),
        403: openapi.Response(description='No autorizado'),
        404: openapi.Response(description='Usuario no encontrado'),
    },
    tags=['Administración']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_user_permissions(request, user_id):
    """
    Obtiene todos los permisos de un usuario (directos, de grupos y de rol).
    GET /api/v1/admin/users/{user_id}/permissions/
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Permisos directos
        direct_permissions = user.user_permissions.all()
        
        # Permisos de grupos
        group_permissions = Permission.objects.filter(group__user=user).distinct()
        
        # Rol del usuario
        user_role = get_user_role(user)
        
        # Todos los permisos únicos
        all_permissions = (direct_permissions | group_permissions).distinct()
        
        permissions_data = {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user_role
            },
            'direct_permissions': [
                {
                    'id': perm.id,
                    'codename': perm.codename,
                    'name': perm.name,
                    'full_codename': f"{perm.content_type.app_label}.{perm.codename}"
                }
                for perm in direct_permissions
            ],
            'group_permissions': [
                {
                    'id': perm.id,
                    'codename': perm.codename,
                    'name': perm.name,
                    'full_codename': f"{perm.content_type.app_label}.{perm.codename}"
                }
                for perm in group_permissions
            ],
            'all_permissions': [
                {
                    'id': perm.id,
                    'codename': perm.codename,
                    'name': perm.name,
                    'full_codename': f"{perm.content_type.app_label}.{perm.codename}"
                }
                for perm in all_permissions
            ],
            'groups': [
                {
                    'id': group.id,
                    'name': group.name
                }
                for group in user.groups.all()
            ]
        }
        
        return Response({
            'success': True,
            'data': permissions_data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error getting user permissions: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al obtener permisos del usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Asigna un permiso directo a un usuario',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['permission_id'],
        properties={
            'permission_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID del permiso'),
        }
    ),
    responses={
        200: openapi.Response(description='Permiso asignado'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No autorizado'),
        404: openapi.Response(description='Usuario o permiso no encontrado'),
    },
    tags=['Administración']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def assign_permission_to_user(request, user_id):
    """
    Asigna un permiso directo a un usuario.
    POST /api/v1/admin/users/{user_id}/permissions/
    Body: { "permission_id": 1 }
    """
    try:
        user = User.objects.get(id=user_id)
        permission_id = request.data.get('permission_id')
        
        if not permission_id:
            return Response({
                'success': False,
                'message': 'permission_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        permission = Permission.objects.get(id=permission_id)
        user.user_permissions.add(permission)
        
        logger.info(f'Admin {request.user.id} asignó permiso {permission.codename} a usuario {user.id}')
        
        return Response({
            'success': True,
            'message': f'Permiso {permission.name} asignado correctamente'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Permission.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Permiso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error assigning permission: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al asignar permiso'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina un permiso directo de un usuario',
    manual_parameters=[
        openapi.Parameter('permission_id', openapi.IN_PATH, description='ID del permiso', type=openapi.TYPE_INTEGER),
    ],
    responses={
        200: openapi.Response(description='Permiso eliminado'),
        403: openapi.Response(description='No autorizado'),
        404: openapi.Response(description='Usuario o permiso no encontrado'),
    },
    tags=['Administración']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def remove_permission_from_user(request, user_id, permission_id):
    """
    Elimina un permiso directo de un usuario.
    DELETE /api/v1/admin/users/{user_id}/permissions/{permission_id}/
    """
    try:
        user = User.objects.get(id=user_id)
        permission = Permission.objects.get(id=permission_id)
        
        user.user_permissions.remove(permission)
        
        logger.info(f'Admin {request.user.id} eliminó permiso {permission.codename} de usuario {user.id}')
        
        return Response({
            'success': True,
            'message': f'Permiso {permission.name} eliminado correctamente'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Permission.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Permiso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error removing permission: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar permiso'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Asigna un usuario a un grupo',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['group_id'],
        properties={
            'group_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID del grupo'),
        }
    ),
    responses={
        200: openapi.Response(description='Usuario asignado al grupo'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No autorizado'),
        404: openapi.Response(description='Usuario o grupo no encontrado'),
    },
    tags=['Administración']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def assign_user_to_group(request, user_id):
    """
    Asigna un usuario a un grupo de Django.
    POST /api/v1/admin/users/{user_id}/groups/
    Body: { "group_id": 1 }
    """
    try:
        user = User.objects.get(id=user_id)
        group_id = request.data.get('group_id')
        
        if not group_id:
            return Response({
                'success': False,
                'message': 'group_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        group = Group.objects.get(id=group_id)
        user.groups.add(group)
        
        logger.info(f'Admin {request.user.id} asignó usuario {user.id} al grupo {group.name}')
        
        return Response({
            'success': True,
            'message': f'Usuario asignado al grupo {group.name} correctamente'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Group.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Grupo no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error assigning user to group: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al asignar usuario al grupo'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina un usuario de un grupo',
    manual_parameters=[
        openapi.Parameter('group_id', openapi.IN_PATH, description='ID del grupo', type=openapi.TYPE_INTEGER),
    ],
    responses={
        200: openapi.Response(description='Usuario eliminado del grupo'),
        403: openapi.Response(description='No autorizado'),
        404: openapi.Response(description='Usuario o grupo no encontrado'),
    },
    tags=['Administración']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def remove_user_from_group(request, user_id, group_id):
    """
    Elimina un usuario de un grupo de Django.
    DELETE /api/v1/admin/users/{user_id}/groups/{group_id}/
    """
    try:
        user = User.objects.get(id=user_id)
        group = Group.objects.get(id=group_id)
        
        user.groups.remove(group)
        
        logger.info(f'Admin {request.user.id} eliminó usuario {user.id} del grupo {group.name}')
        
        return Response({
            'success': True,
            'message': f'Usuario eliminado del grupo {group.name} correctamente'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Group.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Grupo no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error removing user from group: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar usuario del grupo'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ENDPOINTS DE APROBACIÓN DE INSTRUCTORES 

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los instructores pendientes de aprobación. Solo accesible para administradores.',
    responses={
        200: openapi.Response(
            description='Lista de instructores pendientes',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'email': 'instructor@example.com',
                            'first_name': 'Juan',
                            'last_name': 'Pérez',
                            'role': 'instructor',
                            'instructor_status': 'pending_approval',
                            'created_at': '2025-01-12T10:00:00Z'
                        }
                    ],
                    'count': 1
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Instructores']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_pending_instructors(request):
    """
    Lista todos los instructores pendientes de aprobación.
    GET /api/v1/admin/instructors/pending/
    """
    try:
        service = InstructorApprovalService()
        success, data, error_message = service.get_pending_instructors()
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing pending instructors: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar instructores pendientes'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los instructores con filtro opcional por estado. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filtro por estado (pending_approval, approved, rejected)',
            type=openapi.TYPE_STRING,
            enum=['pending_approval', 'approved', 'rejected'],
            required=False
        ),
    ],
    responses={
        200: openapi.Response(description='Lista de instructores'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Instructores']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_all_instructors(request):
    """
    Lista todos los instructores con filtro opcional por estado.
    GET /api/v1/admin/instructors/?status=approved
    """
    try:
        status_filter = request.query_params.get('status', None)
        
        service = InstructorApprovalService()
        success, data, error_message = service.get_all_instructors(status_filter=status_filter)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing instructors: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar instructores'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Aprueba un instructor pendiente. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('instructor_id', openapi.IN_PATH, description='ID del instructor', type=openapi.TYPE_INTEGER),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'notes': openapi.Schema(type=openapi.TYPE_STRING, description='Notas opcionales sobre la aprobación'),
        }
    ),
    responses={
        200: openapi.Response(description='Instructor aprobado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
        404: openapi.Response(description='Instructor no encontrado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Instructores']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_instructor(request, instructor_id):
    """
    Aprueba un instructor pendiente.
    POST /api/v1/admin/instructors/{instructor_id}/approve/
    Body (opcional): { "notes": "Notas sobre la aprobación" }
    """
    try:
        notes = request.data.get('notes', None)
        
        service = InstructorApprovalService()
        success, data, error_message = service.approve_instructor(
            admin_user=request.user,
            instructor_user_id=instructor_id,
            notes=notes
        )
        
        if not success:
            # Determinar código de estado apropiado
            if 'no encontrado' in error_message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            elif 'ya está' in error_message.lower():
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'data': data,
            'message': 'Instructor aprobado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error approving instructor {instructor_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al aprobar instructor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Rechaza un instructor pendiente. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('instructor_id', openapi.IN_PATH, description='ID del instructor', type=openapi.TYPE_INTEGER),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['rejection_reason'],
        properties={
            'rejection_reason': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Razón del rechazo (requerida, máximo 1000 caracteres)'
            ),
        }
    ),
    responses={
        200: openapi.Response(description='Instructor rechazado exitosamente'),
        400: openapi.Response(description='Datos inválidos o razón de rechazo faltante'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
        404: openapi.Response(description='Instructor no encontrado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Instructores']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_instructor(request, instructor_id):
    """
    Rechaza un instructor pendiente.
    POST /api/v1/admin/instructors/{instructor_id}/reject/
    Body: { "rejection_reason": "Razón del rechazo" }
    """
    try:
        rejection_reason = request.data.get('rejection_reason', None)
        
        if not rejection_reason or not rejection_reason.strip():
            return Response({
                'success': False,
                'message': 'La razón de rechazo es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        service = InstructorApprovalService()
        success, data, error_message = service.reject_instructor(
            admin_user=request.user,
            instructor_user_id=instructor_id,
            rejection_reason=rejection_reason
        )
        
        if not success:
            # Determinar código de estado apropiado
            if 'no encontrado' in error_message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            elif 'ya está' in error_message.lower():
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'data': data,
            'message': 'Instructor rechazado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error rejecting instructor {instructor_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al rechazar instructor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ENDPOINTS DE APROBACIÓN DE CURSOS (FASE 2)

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los cursos pendientes de revisión. Solo accesible para administradores.',
    responses={
        200: openapi.Response(
            description='Lista de cursos pendientes',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 'c-001',
                            'title': 'Curso de Ejemplo',
                            'status': 'pending_review',
                            'created_at': '2025-01-12T10:00:00Z'
                        }
                    ],
                    'count': 1
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Cursos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_pending_courses(request):
    """
    Lista todos los cursos pendientes de revisión.
    GET /api/v1/admin/courses/pending/
    """
    try:
        service = CourseApprovalService()
        success, data, error_message = service.get_pending_courses()
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing pending courses: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar cursos pendientes'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los cursos con filtro opcional por estado. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filtro por estado (pending_review, needs_revision, published, draft, archived)',
            type=openapi.TYPE_STRING,
            enum=['pending_review', 'needs_revision', 'published', 'draft', 'archived'],
            required=False
        ),
    ],
    responses={
        200: openapi.Response(description='Lista de cursos'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Cursos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_all_courses_admin(request):
    """
    Lista todos los cursos con filtro opcional por estado.
    GET /api/v1/admin/courses/?status=pending_review
    """
    try:
        # Obtener y sanitizar el filtro de estado
        status_filter = request.query_params.get('status', None)
        if status_filter:
            status_filter = status_filter.strip().lower()  # Normalizar
        
        service = CourseApprovalService()
        success, data, error_message = service.get_all_courses(status_filter=status_filter)
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing courses: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar cursos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene contadores de cursos por estado. Solo accesible para administradores.',
    responses={
        200: openapi.Response(
            description='Contadores de cursos por estado',
            examples={
                'application/json': {
                    'success': True,
                    'data': {
                        'all': 50,
                        'published': 35,
                        'draft': 10,
                        'pending_review': 3,
                        'needs_revision': 2,
                        'archived': 5
                    }
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Cursos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_course_status_counts(request):
    """
    Obtiene contadores de cursos por estado.
    GET /api/v1/admin/courses/status-counts/
    """
    try:
        service = CourseApprovalService()
        success, counts, error_message = service.get_course_status_counts()
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'data': counts
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error getting course status counts: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al obtener contadores de cursos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Aprueba un curso pendiente de revisión. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('course_id', openapi.IN_PATH, description='ID del curso', type=openapi.TYPE_STRING),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'notes': openapi.Schema(type=openapi.TYPE_STRING, description='Notas opcionales sobre la aprobación'),
        }
    ),
    responses={
        200: openapi.Response(description='Curso aprobado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
        404: openapi.Response(description='Curso no encontrado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Cursos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_course(request, course_id):
    """
    Aprueba un curso pendiente de revisión.
    POST /api/v1/admin/courses/{course_id}/approve/
    Body (opcional): { "notes": "Notas sobre la aprobación" }
    """
    try:
        notes = request.data.get('notes', None)
        
        service = CourseApprovalService()
        success, data, error_message = service.approve_course(
            admin_user=request.user,
            course_id=course_id,
            notes=notes
        )
        
        if not success:
            # Determinar código de estado apropiado
            if 'no encontrado' in error_message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            elif 'ya está' in error_message.lower() or 'no está en estado' in error_message.lower():
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'data': data,
            'message': 'Curso aprobado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error approving course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al aprobar curso'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Rechaza un curso pendiente de revisión (requiere cambios). Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('course_id', openapi.IN_PATH, description='ID del curso', type=openapi.TYPE_STRING),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['rejection_reason'],
        properties={
            'rejection_reason': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Razón del rechazo (requerida, máximo 2000 caracteres)'
            ),
        }
    ),
    responses={
        200: openapi.Response(description='Curso rechazado exitosamente'),
        400: openapi.Response(description='Datos inválidos o razón de rechazo faltante'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
        404: openapi.Response(description='Curso no encontrado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Cursos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_course(request, course_id):
    """
    Rechaza un curso pendiente de revisión (requiere cambios).
    POST /api/v1/admin/courses/{course_id}/reject/
    Body: { "rejection_reason": "Razón del rechazo" }
    """
    try:
        rejection_reason = request.data.get('rejection_reason', None)
        
        if not rejection_reason or not rejection_reason.strip():
            return Response({
                'success': False,
                'message': 'La razón de rechazo es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        service = CourseApprovalService()
        success, data, error_message = service.reject_course(
            admin_user=request.user,
            course_id=course_id,
            rejection_reason=rejection_reason
        )
        
        if not success:
            # Determinar código de estado apropiado
            if 'no encontrado' in error_message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            elif 'ya está' in error_message.lower() or 'no está en estado' in error_message.lower():
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'data': data,
            'message': 'Curso rechazado exitosamente. El instructor debe realizar cambios.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error rejecting course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al rechazar curso'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@swagger_auto_schema(
    method='get',
    operation_description='Lista todas las solicitudes de instructor. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('status', openapi.IN_QUERY, description='Filtrar por estado (pending, approved, rejected)', type=openapi.TYPE_STRING),
    ],
    responses={
        200: openapi.Response(
            description='Lista de solicitudes',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'user': {
                                'id': 1,
                                'email': 'user@example.com',
                                'first_name': 'Juan',
                                'last_name': 'Pérez'
                            },
                            'specialization': 'Metalurgia',
                            'experience_years': 5,
                            'status': 'pending',
                            'created_at': '2025-01-12T10:00:00Z'
                        }
                    ]
                }
            }
        ),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Solicitudes de Instructor']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_instructor_applications(request):
    """
    Lista todas las solicitudes de instructor
    GET /api/v1/admin/instructor-applications/
    
    Query params:
    - status: Filtrar por estado (pending, approved, rejected)
    """
    try:
        status_filter = request.query_params.get('status', None)
        
        # Obtener solicitudes
        applications = InstructorApplication.objects.select_related('user', 'reviewed_by').all()
        
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        # Serializar datos
        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'user': {
                    'id': app.user.id,
                    'email': app.user.email,
                    'first_name': app.user.first_name,
                    'last_name': app.user.last_name,
                },
                'professional_title': app.professional_title,
                'experience_years': app.experience_years,
                'specialization': app.specialization,
                'bio': app.bio,
                'portfolio_url': app.portfolio_url,
                'motivation': app.motivation,
                'status': app.status,
                'status_display': app.get_status_display(),
                'reviewed_by': {
                    'id': app.reviewed_by.id,
                    'email': app.reviewed_by.email
                } if app.reviewed_by else None,
                'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None,
                'rejection_reason': app.rejection_reason,
                'created_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing instructor applications: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar solicitudes'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Aprueba una solicitud de instructor. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('id', openapi.IN_PATH, description='ID de la solicitud', type=openapi.TYPE_INTEGER),
    ],
    responses={
        200: openapi.Response(description='Solicitud aprobada exitosamente'),
        400: openapi.Response(description='La solicitud ya fue procesada'),
        404: openapi.Response(description='Solicitud no encontrada'),
        403: openapi.Response(description='No autorizado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Solicitudes de Instructor']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_instructor_application(request, id):
    """
    Aprueba una solicitud de instructor
    POST /api/v1/admin/instructor-applications/{id}/approve/
    """
    try:
        service = InstructorApplicationService()
        success, application, error_message = service.approve_application(
            application_id=id,
            admin_user=request.user
        )
        
        if not success:
            status_code = status.HTTP_404_NOT_FOUND if 'no existe' in error_message.lower() else status.HTTP_400_BAD_REQUEST
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'message': 'Solicitud aprobada exitosamente. El usuario ahora es instructor.',
            'data': {
                'id': application.id,
                'user_id': application.user.id,
                'status': application.status
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error approving instructor application {id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al aprobar solicitud'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Rechaza una solicitud de instructor. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter('id', openapi.IN_PATH, description='ID de la solicitud', type=openapi.TYPE_INTEGER),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'rejection_reason': openapi.Schema(type=openapi.TYPE_STRING, description='Razón del rechazo (opcional)'),
        }
    ),
    responses={
        200: openapi.Response(description='Solicitud rechazada exitosamente'),
        400: openapi.Response(description='La solicitud ya fue procesada'),
        404: openapi.Response(description='Solicitud no encontrada'),
        403: openapi.Response(description='No autorizado'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Solicitudes de Instructor']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_instructor_application(request, id):
    """
    Rechaza una solicitud de instructor
    POST /api/v1/admin/instructor-applications/{id}/reject/
    
    Body (opcional):
    {
        "rejection_reason": "Razón del rechazo"
    }
    """
    try:
        rejection_reason = request.data.get('rejection_reason', '')
        
        service = InstructorApplicationService()
        success, application, error_message = service.reject_application(
            application_id=id,
            admin_user=request.user,
            rejection_reason=rejection_reason
        )
        
        if not success:
            status_code = status.HTTP_404_NOT_FOUND if 'no existe' in error_message.lower() else status.HTTP_400_BAD_REQUEST
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'message': 'Solicitud rechazada exitosamente',
            'data': {
                'id': application.id,
                'status': application.status
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error rejecting instructor application {id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error interno al rechazar solicitud'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GESTIÓN DE USUARIOS (CRUD) ==========

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los usuarios con filtros opcionales. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter(
            'role',
            openapi.IN_QUERY,
            description='Filtro por rol (student, teacher, admin)',
            type=openapi.TYPE_STRING,
            enum=['student', 'teacher', 'admin'],
            required=False
        ),
        openapi.Parameter(
            'is_active',
            openapi.IN_QUERY,
            description='Filtro por estado activo (true/false)',
            type=openapi.TYPE_BOOLEAN,
            required=False
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description='Búsqueda por nombre, email',
            type=openapi.TYPE_STRING,
            required=False
        ),
    ],
    responses={
        200: openapi.Response(
            description='Lista de usuarios',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 1,
                            'email': 'user@example.com',
                            'first_name': 'Juan',
                            'last_name': 'Pérez',
                            'role': 'student',
                            'is_active': True,
                            'created_at': '2025-01-12T10:00:00Z'
                        }
                    ],
                    'count': 1
                }
            }
        ),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_users(request):
    """
    Lista todos los usuarios con filtros opcionales.
    GET /api/v1/admin/users/?role=student&is_active=true&search=juan
    """
    try:
        from django.contrib.auth.models import User
        from apps.users.permissions import get_user_role
        
        # Filtros
        queryset = User.objects.select_related('profile').all()
        
        # Filtro por rol (desde UserProfile)
        role = request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(profile__role=role)
        
        # Filtro por estado activo
        is_active = request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        # Búsqueda por nombre o email
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Ordenar por fecha de creación (más recientes primero)
        queryset = queryset.order_by('-date_joined')
        
        # Serializar usuarios
        users_data = []
        for user in queryset:
            # Obtener rol desde el perfil
            user_role = get_user_role(user)
            
            # Obtener is_email_verified desde el perfil si existe
            is_email_verified = False
            try:
                if user.profile:
                    is_email_verified = getattr(user.profile, 'is_email_verified', False)
            except:
                pass
            
            users_data.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'role': user_role,
                'is_active': user.is_active,
                'is_email_verified': is_email_verified,
                'created_at': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            })
        
        return Response({
            'success': True,
            'data': users_data,
            'count': len(users_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing users: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': f'Error al listar usuarios: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el detalle de un usuario específico. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Detalle del usuario'),
        404: openapi.Response(description='Usuario no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_user_detail(request, user_id):
    """
    Obtiene el detalle de un usuario específico.
    GET /api/v1/admin/users/{user_id}/
    """
    try:
        from django.contrib.auth.models import User
        from apps.users.permissions import get_user_role
        
        try:
            user = User.objects.select_related('profile').get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener rol desde el perfil
        user_role = get_user_role(user)
        
        # Obtener datos del perfil si existe
        phone = None
        is_email_verified = False
        try:
            if user.profile:
                phone = getattr(user.profile, 'phone', None)
                is_email_verified = getattr(user.profile, 'is_email_verified', False)
        except:
            pass
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'role': user_role,
            'is_active': user.is_active,
            'is_email_verified': is_email_verified,
            'phone': phone or '',
            'created_at': user.date_joined.isoformat() if user.date_joined else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }
        
        return Response({
            'success': True,
            'data': user_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error getting user detail {user_id}: {str(e)}', exc_info=True)
        return Response({
            'success': False,
            'message': f'Error al obtener usuario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Crea un nuevo usuario. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email', 'password', 'first_name', 'last_name', 'role'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
            'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            'first_name': openapi.Schema(type=openapi.TYPE_STRING),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING),
            'role': openapi.Schema(type=openapi.TYPE_STRING, enum=['student', 'teacher', 'admin']),
            'phone': openapi.Schema(type=openapi.TYPE_STRING),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        201: openapi.Response(description='Usuario creado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_user(request):
    """
    Crea un nuevo usuario.
    POST /api/v1/admin/users/
    """
    try:
        from django.contrib.auth.models import User
        from apps.core.models import UserProfile
        from apps.users.permissions import assign_user_to_group, get_user_role
        
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        role = request.data.get('role', 'student')
        phone = request.data.get('phone', '').strip() or None
        is_active = request.data.get('is_active', True)
        
        # Validaciones
        if not email or not password or not first_name or not last_name:
            return Response({
                'success': False,
                'message': 'Email, contraseña, nombre y apellido son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if role not in ['student', 'teacher', 'admin']:
            return Response({
                'success': False,
                'message': 'Rol inválido. Debe ser: student, teacher o admin'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar si el email ya existe
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'message': 'El email ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear usuario
        username = email  # Usar email como username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active
        )
        
        # Crear perfil de usuario
        profile = UserProfile.objects.create(
            user=user,
            role=role,
            phone=phone
        )
        
        # Asignar al grupo correspondiente
        assign_user_to_group(user, role)
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'role': get_user_role(user),
            'is_active': user.is_active,
            'phone': profile.phone or '',
            'created_at': user.date_joined.isoformat() if user.date_joined else None,
        }
        
        return Response({
            'success': True,
            'message': 'Usuario creado exitosamente',
            'data': user_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f'Error creating user: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al crear usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='put',
    operation_description='Actualiza un usuario existente. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
            'first_name': openapi.Schema(type=openapi.TYPE_STRING),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING),
            'role': openapi.Schema(type=openapi.TYPE_STRING, enum=['student', 'teacher', 'admin']),
            'phone': openapi.Schema(type=openapi.TYPE_STRING),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
        }
    ),
    responses={
        200: openapi.Response(description='Usuario actualizado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        404: openapi.Response(description='Usuario no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_user(request, user_id):
    """
    Actualiza un usuario existente.
    PUT /api/v1/admin/users/{user_id}/update/
    """
    try:
        from django.contrib.auth.models import User
        from apps.core.models import UserProfile
        from apps.users.permissions import assign_user_to_group
        
        try:
            user = User.objects.select_related('profile').get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Actualizar campos si están presentes
        if 'email' in request.data:
            email = request.data.get('email', '').lower().strip()
            if email and email != user.email:
                # Verificar si el nuevo email ya existe
                if User.objects.filter(email=email).exclude(id=user_id).exists():
                    return Response({
                        'success': False,
                        'message': 'El email ya está registrado'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user.email = email
                user.username = email  # Actualizar username también
        
        if 'first_name' in request.data:
            user.first_name = request.data.get('first_name', '').strip()
        
        if 'last_name' in request.data:
            user.last_name = request.data.get('last_name', '').strip()
        
        if 'is_active' in request.data:
            user.is_active = request.data.get('is_active', True)
        
        if 'password' in request.data and request.data.get('password'):
            # Actualizar contraseña
            user.set_password(request.data.get('password'))
        
        user.save()
        
        # Actualizar o crear UserProfile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Obtener el rol anterior para detectar cambios
        previous_role = profile.role
        
        # Actualizar rol en el perfil
        if 'role' in request.data:
            role = request.data.get('role', '')
            if role not in ['student', 'teacher', 'admin']:
                return Response({
                    'success': False,
                    'message': 'Rol inválido. Debe ser: student, teacher o admin'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            profile.role = role
            
            # Si un admin está cambiando el rol a instructor, aprobar automáticamente
            if role == 'teacher' and previous_role != 'teacher':
                # Verificar que el que hace el cambio es admin
                from apps.users.permissions import is_admin
                if is_admin(request.user):
                    profile.instructor_status = 'approved'
                    profile.instructor_approved_by = request.user
                    from django.utils import timezone
                    profile.instructor_approved_at = timezone.now()
                    logger.info(f'Admin {request.user.email} cambió rol a instructor y aprobó automáticamente a {user.email}')
            
            # Si se cambia de instructor a otro rol, limpiar estado de instructor
            if previous_role == 'teacher' and role != 'teacher':
                profile.instructor_status = None
                profile.instructor_approved_by = None
                profile.instructor_approved_at = None
                profile.instructor_rejection_reason = None
            
            # Asignar al grupo correspondiente
            assign_user_to_group(user, role)
        
        # Actualizar teléfono en el perfil
        if 'phone' in request.data:
            phone = request.data.get('phone', '').strip() or None
            profile.phone = phone
        
        profile.save()
        
        # Obtener datos actualizados del perfil
        profile.refresh_from_db()
        from apps.users.permissions import get_user_role
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'role': get_user_role(user),
            'is_active': user.is_active,
            'phone': profile.phone or '',
        }
        
        return Response({
            'success': True,
            'message': 'Usuario actualizado exitosamente',
            'data': user_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error updating user {user_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al actualizar usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina (desactiva) un usuario. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Usuario eliminado exitosamente'),
        404: openapi.Response(description='Usuario no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user(request, user_id):
    """
    Elimina (desactiva) un usuario (soft delete).
    DELETE /api/v1/admin/users/{user_id}/
    """
    try:
        from django.contrib.auth.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Soft delete: desactivar usuario
        user.is_active = False
        user.save()
        
        return Response({
            'success': True,
            'message': 'Usuario eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error deleting user {user_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Activa un usuario. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Usuario activado exitosamente'),
        404: openapi.Response(description='Usuario no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def activate_user(request, user_id):
    """
    Activa un usuario.
    POST /api/v1/admin/users/{user_id}/activate/
    """
    try:
        from django.contrib.auth.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user.is_active = True
        user.save()
        
        return Response({
            'success': True,
            'message': 'Usuario activado exitosamente',
            'data': {
                'id': user.id,
                'is_active': user.is_active
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error activating user {user_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al activar usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Desactiva un usuario. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Usuario desactivado exitosamente'),
        404: openapi.Response(description='Usuario no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Usuarios']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def deactivate_user(request, user_id):
    """
    Desactiva un usuario.
    POST /api/v1/admin/users/{user_id}/deactivate/
    """
    try:
        from django.contrib.auth.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user.is_active = False
        user.save()
        
        return Response({
            'success': True,
            'message': 'Usuario desactivado exitosamente',
            'data': {
                'id': user.id,
                'is_active': user.is_active
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error deactivating user {user_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al desactivar usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GESTIÓN DE MÓDULOS ==========

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los módulos de un curso. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Lista de módulos'),
        404: openapi.Response(description='Curso no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Módulos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_course_modules(request, course_id):
    """
    Lista todos los módulos de un curso.
    GET /api/v1/admin/courses/{course_id}/modules/
    """
    try:
        from apps.courses.models import Course, Module
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        modules = Module.objects.filter(course=course).order_by('order')
        
        modules_data = []
        for module in modules:
            modules_data.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'price': float(module.price),
                'is_purchasable': module.is_purchasable,
                'order': module.order,
                'is_active': module.is_active,
                'lessons_count': module.lessons.count(),
                'created_at': module.created_at.isoformat() if module.created_at else None,
                'updated_at': module.updated_at.isoformat() if module.updated_at else None,
            })
        
        return Response({
            'success': True,
            'data': modules_data,
            'count': len(modules_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing modules for course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar módulos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Crea un nuevo módulo para un curso. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['title', 'order'],
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'price': openapi.Schema(type=openapi.TYPE_NUMBER),
            'is_purchasable': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        201: openapi.Response(description='Módulo creado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        404: openapi.Response(description='Curso no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Módulos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_module(request, course_id):
    """
    Crea un nuevo módulo para un curso.
    POST /api/v1/admin/courses/{course_id}/modules/
    """
    try:
        from apps.courses.models import Course, Module
        from decimal import Decimal
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        price = Decimal(str(request.data.get('price', 0)))
        is_purchasable = request.data.get('is_purchasable', False)
        order = request.data.get('order', 0)
        is_active = request.data.get('is_active', True)
        
        if not title:
            return Response({
                'success': False,
                'message': 'El título es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        module = Module.objects.create(
            course=course,
            title=title,
            description=description,
            price=price,
            is_purchasable=is_purchasable,
            order=order,
            is_active=is_active
        )
        
        module_data = {
            'id': module.id,
            'title': module.title,
            'description': module.description,
            'price': float(module.price),
            'is_purchasable': module.is_purchasable,
            'order': module.order,
            'is_active': module.is_active,
            'lessons_count': 0,
            'created_at': module.created_at.isoformat() if module.created_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Módulo creado exitosamente',
            'data': module_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f'Error creating module for course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al crear módulo'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='put',
    operation_description='Actualiza un módulo existente. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'price': openapi.Schema(type=openapi.TYPE_NUMBER),
            'is_purchasable': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        200: openapi.Response(description='Módulo actualizado exitosamente'),
        404: openapi.Response(description='Módulo no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Módulos']
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_module(request, module_id):
    """
    Actualiza un módulo existente.
    PUT /api/v1/admin/modules/{module_id}/
    """
    try:
        from apps.courses.models import Module
        from decimal import Decimal
        
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Módulo no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'title' in request.data:
            module.title = request.data.get('title', '').strip()
        
        if 'description' in request.data:
            module.description = request.data.get('description', '').strip()
        
        if 'price' in request.data:
            module.price = Decimal(str(request.data.get('price', 0)))
        
        if 'is_purchasable' in request.data:
            module.is_purchasable = request.data.get('is_purchasable', False)
        
        if 'order' in request.data:
            module.order = request.data.get('order', 0)
        
        if 'is_active' in request.data:
            module.is_active = request.data.get('is_active', True)
        
        module.save()
        
        module_data = {
            'id': module.id,
            'title': module.title,
            'description': module.description,
            'price': float(module.price),
            'is_purchasable': module.is_purchasable,
            'order': module.order,
            'is_active': module.is_active,
            'lessons_count': module.lessons.count(),
            'updated_at': module.updated_at.isoformat() if module.updated_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Módulo actualizado exitosamente',
            'data': module_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error updating module {module_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al actualizar módulo'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina un módulo. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Módulo eliminado exitosamente'),
        404: openapi.Response(description='Módulo no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Módulos']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_module(request, module_id):
    """
    Elimina un módulo.
    DELETE /api/v1/admin/modules/{module_id}/
    """
    try:
        from apps.courses.models import Module
        
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Módulo no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        module.delete()
        
        return Response({
            'success': True,
            'message': 'Módulo eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error deleting module {module_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar módulo'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GESTIÓN DE LECCIONES ==========

@swagger_auto_schema(
    method='get',
    operation_description='Lista todas las lecciones de un módulo. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Lista de lecciones'),
        404: openapi.Response(description='Módulo no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Lecciones']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_module_lessons(request, module_id):
    """
    Lista todas las lecciones de un módulo.
    GET /api/v1/admin/modules/{module_id}/lessons/
    """
    try:
        from apps.courses.models import Module, Lesson
        
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Módulo no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        lessons = Lesson.objects.filter(module=module).order_by('order')
        
        lessons_data = []
        for lesson in lessons:
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'description': lesson.description,
                'lesson_type': lesson.lesson_type,
                'content_url': lesson.content_url,
                'content_text': lesson.content_text,
                'duration_minutes': lesson.duration_minutes,
                'order': lesson.order,
                'is_active': lesson.is_active,
                'created_at': lesson.created_at.isoformat() if lesson.created_at else None,
                'updated_at': lesson.updated_at.isoformat() if lesson.updated_at else None,
            })
        
        return Response({
            'success': True,
            'data': lessons_data,
            'count': len(lessons_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing lessons for module {module_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar lecciones'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Crea una nueva lección para un módulo. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['title', 'lesson_type', 'order'],
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'lesson_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['video', 'document', 'quiz', 'text']),
            'content_url': openapi.Schema(type=openapi.TYPE_STRING),
            'content_text': openapi.Schema(type=openapi.TYPE_STRING),
            'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        201: openapi.Response(description='Lección creada exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        404: openapi.Response(description='Módulo no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Lecciones']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_lesson(request, module_id):
    """
    Crea una nueva lección para un módulo.
    POST /api/v1/admin/modules/{module_id}/lessons/
    """
    try:
        from apps.courses.models import Module, Lesson
        
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Módulo no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        lesson_type = request.data.get('lesson_type', 'video')
        content_url = request.data.get('content_url', '').strip() or None
        content_text = request.data.get('content_text', '').strip()
        duration_minutes = request.data.get('duration_minutes', 0)
        order = request.data.get('order', 0)
        is_active = request.data.get('is_active', True)
        
        if not title:
            return Response({
                'success': False,
                'message': 'El título es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if lesson_type not in ['video', 'document', 'quiz', 'text']:
            return Response({
                'success': False,
                'message': 'Tipo de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convertir URL de Vimeo automáticamente si es tipo video
        if lesson_type == 'video' and content_url:
            try:
                from infrastructure.services.video_url_service import video_url_service
                success, converted_url, error_message = video_url_service.validate_and_convert(
                    content_url,
                    lesson_type='video',
                    add_params=True
                )
                if success and converted_url:
                    content_url = converted_url
                elif not success:
                    return Response({
                        'success': False,
                        'message': error_message or 'URL de video inválida'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f'Error converting video URL: {str(e)}')
                # Continuar con la URL original si hay error en la conversión
        
        lesson = Lesson.objects.create(
            module=module,
            title=title,
            description=description,
            lesson_type=lesson_type,
            content_url=content_url,
            content_text=content_text,
            duration_minutes=duration_minutes,
            order=order,
            is_active=is_active
        )
        
        lesson_data = {
            'id': lesson.id,
            'title': lesson.title,
            'description': lesson.description,
            'lesson_type': lesson.lesson_type,
            'content_url': lesson.content_url,
            'content_text': lesson.content_text,
            'duration_minutes': lesson.duration_minutes,
            'order': lesson.order,
            'is_active': lesson.is_active,
            'created_at': lesson.created_at.isoformat() if lesson.created_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Lección creada exitosamente',
            'data': lesson_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f'Error creating lesson for module {module_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al crear lección'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='put',
    operation_description='Actualiza una lección existente. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'lesson_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['video', 'document', 'quiz', 'text']),
            'content_url': openapi.Schema(type=openapi.TYPE_STRING),
            'content_text': openapi.Schema(type=openapi.TYPE_STRING),
            'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        200: openapi.Response(description='Lección actualizada exitosamente'),
        404: openapi.Response(description='Lección no encontrada'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Lecciones']
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_lesson(request, lesson_id):
    """
    Actualiza una lección existente.
    PUT /api/v1/admin/lessons/{lesson_id}/
    """
    try:
        from apps.courses.models import Lesson
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'title' in request.data:
            lesson.title = request.data.get('title', '').strip()
        
        if 'description' in request.data:
            lesson.description = request.data.get('description', '').strip()
        
        if 'lesson_type' in request.data:
            lesson_type = request.data.get('lesson_type', 'video')
            if lesson_type not in ['video', 'document', 'quiz', 'text']:
                return Response({
                    'success': False,
                    'message': 'Tipo de lección inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
            lesson.lesson_type = lesson_type
        
        if 'content_url' in request.data:
            content_url = request.data.get('content_url', '').strip() or None
            # Convertir URL de Vimeo automáticamente si es tipo video
            if lesson.lesson_type == 'video' and content_url:
                try:
                    from infrastructure.services.video_url_service import video_url_service
                    success, converted_url, error_message = video_url_service.validate_and_convert(
                        content_url,
                        lesson_type='video',
                        add_params=True
                    )
                    if success and converted_url:
                        content_url = converted_url
                    elif not success:
                        return Response({
                            'success': False,
                            'message': error_message or 'URL de video inválida'
                        }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    logger.error(f'Error converting video URL: {str(e)}')
                    # Continuar con la URL original si hay error en la conversión
            lesson.content_url = content_url
        
        if 'content_text' in request.data:
            lesson.content_text = request.data.get('content_text', '').strip()
        
        if 'duration_minutes' in request.data:
            lesson.duration_minutes = request.data.get('duration_minutes', 0)
        
        if 'order' in request.data:
            lesson.order = request.data.get('order', 0)
        
        if 'is_active' in request.data:
            lesson.is_active = request.data.get('is_active', True)
        
        lesson.save()
        
        lesson_data = {
            'id': lesson.id,
            'title': lesson.title,
            'description': lesson.description,
            'lesson_type': lesson.lesson_type,
            'content_url': lesson.content_url,
            'content_text': lesson.content_text,
            'duration_minutes': lesson.duration_minutes,
            'order': lesson.order,
            'is_active': lesson.is_active,
            'updated_at': lesson.updated_at.isoformat() if lesson.updated_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Lección actualizada exitosamente',
            'data': lesson_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error updating lesson {lesson_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al actualizar lección'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina una lección. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Lección eliminada exitosamente'),
        404: openapi.Response(description='Lección no encontrada'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Lecciones']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_lesson(request, lesson_id):
    """
    Elimina una lección.
    DELETE /api/v1/admin/lessons/{lesson_id}/
    """
    try:
        from apps.courses.models import Lesson
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        lesson.delete()
        
        return Response({
            'success': True,
            'message': 'Lección eliminada exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error deleting lesson {lesson_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar lección'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GESTIÓN DE MATERIALES ==========

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los materiales de un curso. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter(
            'material_type',
            openapi.IN_QUERY,
            description='Filtro por tipo (video, link)',
            type=openapi.TYPE_STRING,
            enum=['video', 'link'],
            required=False
        ),
    ],
    responses={
        200: openapi.Response(description='Lista de materiales'),
        404: openapi.Response(description='Curso no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Materiales']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_course_materials(request, course_id):
    """
    Lista todos los materiales de un curso.
    GET /api/v1/admin/courses/{course_id}/materials/?material_type=video
    """
    try:
        from apps.courses.models import Course, Material
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        queryset = Material.objects.filter(course=course)
        
        # Filtro por tipo
        material_type = request.query_params.get('material_type', None)
        if material_type:
            queryset = queryset.filter(material_type=material_type)
        
        materials = queryset.order_by('order')
        
        materials_data = []
        for material in materials:
            materials_data.append({
                'id': material.id,
                'title': material.title,
                'description': material.description,
                'material_type': material.material_type,
                'url': material.url,
                'order': material.order,
                'is_active': material.is_active,
                'module_id': material.module.id if material.module else None,
                'module_title': material.module.title if material.module else None,
                'lesson_id': material.lesson.id if material.lesson else None,
                'lesson_title': material.lesson.title if material.lesson else None,
                'created_at': material.created_at.isoformat() if material.created_at else None,
                'updated_at': material.updated_at.isoformat() if material.updated_at else None,
            })
        
        return Response({
            'success': True,
            'data': materials_data,
            'count': len(materials_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing materials for course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar materiales'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Crea un nuevo material para un curso. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['title', 'material_type', 'url', 'order'],
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'material_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['video', 'link']),
            'url': openapi.Schema(type=openapi.TYPE_STRING),
            'module_id': openapi.Schema(type=openapi.TYPE_STRING),
            'lesson_id': openapi.Schema(type=openapi.TYPE_STRING),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        201: openapi.Response(description='Material creado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        404: openapi.Response(description='Curso no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Materiales']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_material(request, course_id):
    """
    Crea un nuevo material para un curso.
    POST /api/v1/admin/courses/{course_id}/materials/
    """
    try:
        from apps.courses.models import Course, Material, Module, Lesson
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        material_type = request.data.get('material_type', 'video')
        url = request.data.get('url', '').strip()
        module_id = request.data.get('module_id', None)
        lesson_id = request.data.get('lesson_id', None)
        order = request.data.get('order', 0)
        is_active = request.data.get('is_active', True)
        
        if not title:
            return Response({
                'success': False,
                'message': 'El título es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not url:
            return Response({
                'success': False,
                'message': 'La URL es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if material_type not in ['video', 'link']:
            return Response({
                'success': False,
                'message': 'Tipo de material inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        module = None
        if module_id:
            try:
                module = Module.objects.get(id=module_id, course=course)
            except Module.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Módulo no encontrado'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        lesson = None
        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id)
                if module and lesson.module != module:
                    return Response({
                        'success': False,
                        'message': 'La lección no pertenece al módulo especificado'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Lesson.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Lección no encontrada'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        material = Material.objects.create(
            course=course,
            module=module,
            lesson=lesson,
            title=title,
            description=description,
            material_type=material_type,
            url=url,
            order=order,
            is_active=is_active
        )
        
        material_data = {
            'id': material.id,
            'title': material.title,
            'description': material.description,
            'material_type': material.material_type,
            'url': material.url,
            'order': material.order,
            'is_active': material.is_active,
            'module_id': material.module.id if material.module else None,
            'lesson_id': material.lesson.id if material.lesson else None,
            'created_at': material.created_at.isoformat() if material.created_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Material creado exitosamente',
            'data': material_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f'Error creating material for course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al crear material'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='put',
    operation_description='Actualiza un material existente. Solo accesible para administradores.',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING),
            'description': openapi.Schema(type=openapi.TYPE_STRING),
            'material_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['video', 'link']),
            'url': openapi.Schema(type=openapi.TYPE_STRING),
            'module_id': openapi.Schema(type=openapi.TYPE_STRING),
            'lesson_id': openapi.Schema(type=openapi.TYPE_STRING),
            'order': openapi.Schema(type=openapi.TYPE_INTEGER),
            'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
    ),
    responses={
        200: openapi.Response(description='Material actualizado exitosamente'),
        404: openapi.Response(description='Material no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Materiales']
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_material(request, material_id):
    """
    Actualiza un material existente.
    PUT /api/v1/admin/materials/{material_id}/
    """
    try:
        from apps.courses.models import Material, Module, Lesson
        
        try:
            material = Material.objects.get(id=material_id)
        except Material.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Material no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'title' in request.data:
            material.title = request.data.get('title', '').strip()
        
        if 'description' in request.data:
            material.description = request.data.get('description', '').strip()
        
        if 'material_type' in request.data:
            material_type = request.data.get('material_type', 'video')
            if material_type not in ['video', 'link']:
                return Response({
                    'success': False,
                    'message': 'Tipo de material inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
            material.material_type = material_type
        
        if 'url' in request.data:
            material.url = request.data.get('url', '').strip()
        
        if 'module_id' in request.data:
            module_id = request.data.get('module_id', None)
            if module_id:
                try:
                    module = Module.objects.get(id=module_id, course=material.course)
                    material.module = module
                except Module.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Módulo no encontrado'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                material.module = None
        
        if 'lesson_id' in request.data:
            lesson_id = request.data.get('lesson_id', None)
            if lesson_id:
                try:
                    lesson = Lesson.objects.get(id=lesson_id)
                    if material.module and lesson.module != material.module:
                        return Response({
                            'success': False,
                            'message': 'La lección no pertenece al módulo especificado'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    material.lesson = lesson
                except Lesson.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Lección no encontrada'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                material.lesson = None
        
        if 'order' in request.data:
            material.order = request.data.get('order', 0)
        
        if 'is_active' in request.data:
            material.is_active = request.data.get('is_active', True)
        
        material.save()
        
        material_data = {
            'id': material.id,
            'title': material.title,
            'description': material.description,
            'material_type': material.material_type,
            'url': material.url,
            'order': material.order,
            'is_active': material.is_active,
            'module_id': material.module.id if material.module else None,
            'lesson_id': material.lesson.id if material.lesson else None,
            'updated_at': material.updated_at.isoformat() if material.updated_at else None,
        }
        
        return Response({
            'success': True,
            'message': 'Material actualizado exitosamente',
            'data': material_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error updating material {material_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al actualizar material'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina un material. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Material eliminado exitosamente'),
        404: openapi.Response(description='Material no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Materiales']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_material(request, material_id):
    """
    Elimina un material.
    DELETE /api/v1/admin/materials/{material_id}/
    """
    try:
        from apps.courses.models import Material
        
        try:
            material = Material.objects.get(id=material_id)
        except Material.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Material no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        material.delete()
        
        return Response({
            'success': True,
            'message': 'Material eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error deleting material {material_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al eliminar material'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GESTIÓN DE ALUMNOS INSCRITOS ==========

@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los alumnos inscritos en un curso con su progreso. Solo accesible para administradores.',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filtro por estado (active, completed, expired, cancelled)',
            type=openapi.TYPE_STRING,
            enum=['active', 'completed', 'expired', 'cancelled'],
            required=False
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description='Búsqueda por nombre o email',
            type=openapi.TYPE_STRING,
            required=False
        ),
    ],
    responses={
        200: openapi.Response(description='Lista de alumnos inscritos'),
        404: openapi.Response(description='Curso no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Alumnos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_course_students(request, course_id):
    """
    Lista todos los alumnos inscritos en un curso.
    GET /api/v1/admin/courses/{course_id}/students/?status=active&search=nombre
    """
    try:
        from apps.courses.models import Course
        from apps.users.models import Enrollment
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        queryset = Enrollment.objects.filter(course=course).select_related('user')
        
        # Filtro por estado
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Búsqueda por nombre o email
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                models.Q(user__first_name__icontains=search_query) |
                models.Q(user__last_name__icontains=search_query) |
                models.Q(user__email__icontains=search_query)
            )
        
        enrollments = queryset.order_by('-enrolled_at')
        
        students_data = []
        for enrollment in enrollments:
            students_data.append({
                'enrollment_id': enrollment.id,
                'user_id': enrollment.user.id,
                'user_email': enrollment.user.email,
                'user_first_name': enrollment.user.first_name,
                'user_last_name': enrollment.user.last_name,
                'status': enrollment.status,
                'completed': enrollment.completed,
                'completion_percentage': float(enrollment.completion_percentage),
                'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                'completed_at': enrollment.completed_at.isoformat() if enrollment.completed_at else None,
                'expires_at': enrollment.expires_at.isoformat() if enrollment.expires_at else None,
            })
        
        return Response({
            'success': True,
            'data': students_data,
            'count': len(students_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error listing students for course {course_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al listar alumnos'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el detalle de progreso de un alumno en un curso. Solo accesible para administradores.',
    responses={
        200: openapi.Response(description='Detalle de progreso del alumno'),
        404: openapi.Response(description='Enrollment no encontrado'),
        401: openapi.Response(description='No autenticado'),
        403: openapi.Response(description='No autorizado - Solo administradores'),
    },
    security=[{'Bearer': []}],
    tags=['Admin - Alumnos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_student_progress(request, course_id, enrollment_id):
    """
    Obtiene el detalle de progreso de un alumno en un curso.
    GET /api/v1/admin/courses/{course_id}/students/{enrollment_id}/progress/
    """
    try:
        from apps.courses.models import Course, Module, Lesson
        from apps.users.models import Enrollment, LessonProgress
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, course=course)
        except Enrollment.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Inscripción no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener módulos del curso
        modules = Module.objects.filter(course=course).order_by('order')
        
        # Obtener progreso de lecciones
        lesson_progresses = LessonProgress.objects.filter(
            enrollment=enrollment
        ).select_related('lesson')
        
        progress_dict = {lp.lesson.id: lp for lp in lesson_progresses}
        
        modules_data = []
        total_lessons = 0
        completed_lessons = 0
        
        for module in modules:
            lessons = Lesson.objects.filter(module=module, is_active=True).order_by('order')
            lessons_data = []
            
            for lesson in lessons:
                total_lessons += 1
                lesson_progress = progress_dict.get(lesson.id)
                is_completed = lesson_progress.is_completed if lesson_progress else False
                progress_percentage = float(lesson_progress.progress_percentage) if lesson_progress else 0.0
                
                if is_completed:
                    completed_lessons += 1
                
                lessons_data.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'lesson_type': lesson.lesson_type,
                    'order': lesson.order,
                    'is_completed': is_completed,
                    'progress_percentage': progress_percentage,
                    'completed_at': lesson_progress.completed_at.isoformat() if lesson_progress and lesson_progress.completed_at else None,
                })
            
            modules_data.append({
                'id': module.id,
                'title': module.title,
                'order': module.order,
                'lessons': lessons_data,
                'lessons_count': len(lessons),
                'completed_lessons': sum(1 for l in lessons_data if l['is_completed']),
            })
        
        overall_progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        return Response({
            'success': True,
            'data': {
                'enrollment': {
                    'id': enrollment.id,
                    'status': enrollment.status,
                    'completed': enrollment.completed,
                    'completion_percentage': float(enrollment.completion_percentage),
                    'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                    'completed_at': enrollment.completed_at.isoformat() if enrollment.completed_at else None,
                },
                'student': {
                    'id': enrollment.user.id,
                    'email': enrollment.user.email,
                    'first_name': enrollment.user.first_name,
                    'last_name': enrollment.user.last_name,
                },
                'course': {
                    'id': course.id,
                    'title': course.title,
                },
                'modules': modules_data,
                'overall_progress': {
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_lessons,
                    'percentage': round(overall_progress, 2),
                }
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Error getting student progress for enrollment {enrollment_id}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Error al obtener progreso del alumno'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

