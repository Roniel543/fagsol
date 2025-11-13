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
from apps.core.models import UserProfile
from apps.users.permissions import IsAdmin, has_perm, get_user_role, ROLE_ADMIN
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

