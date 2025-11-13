"""
URLs de administración - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.admin_views import (
    list_groups,
    list_permissions,
    get_user_permissions,
    assign_permission_to_user,
    remove_permission_from_user,
    assign_user_to_group,
    remove_user_from_group,
)

urlpatterns = [
    # Grupos
    path('groups/', list_groups, name='admin_list_groups'),
    
    # Permisos
    path('permissions/', list_permissions, name='admin_list_permissions'),
    
    # Permisos de usuarios
    path('users/<int:user_id>/permissions/', get_user_permissions, name='admin_get_user_permissions'),
    path('users/<int:user_id>/permissions/assign/', assign_permission_to_user, name='admin_assign_permission'),
    path('users/<int:user_id>/permissions/<int:permission_id>/', remove_permission_from_user, name='admin_remove_permission'),
    
    # Grupos de usuarios
    path('users/<int:user_id>/groups/assign/', assign_user_to_group, name='admin_assign_user_to_group'),
    path('users/<int:user_id>/groups/<int:group_id>/', remove_user_from_group, name='admin_remove_user_from_group'),
]

