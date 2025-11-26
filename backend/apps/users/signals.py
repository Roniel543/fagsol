"""
Signals para gestión automática de roles y grupos - FagSol Escuela Virtual

Este módulo maneja la asignación automática de usuarios a grupos de Django
cuando se crea o actualiza un UserProfile.
"""

import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from apps.core.models import UserProfile
from apps.users.permissions import (
    GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_GUEST,
    ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT, ROLE_GUEST
)

logger = logging.getLogger('apps')


@receiver(post_save, sender=UserProfile)
def assign_user_to_group_on_profile_save(sender, instance, created, **kwargs):
    """
    Signal: Asigna el usuario a un grupo de Django cuando se crea o actualiza su perfil.
    """
    user = instance.user
    role = instance.role
    
    # Asegurar que los grupos existan
    ensure_groups_exist()
    
    # Remover usuario de todos los grupos de roles primero
    role_groups = [GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_GUEST]
    for group_name in role_groups:
        try:
            group = Group.objects.get(name=group_name)
            user.groups.remove(group)
        except Group.DoesNotExist:
            pass
    
    # Asignar al grupo correspondiente según el rol
    role_to_group = {
        ROLE_ADMIN: GROUP_ADMIN,
        ROLE_INSTRUCTOR: GROUP_INSTRUCTOR,
        ROLE_STUDENT: GROUP_STUDENT,
        ROLE_GUEST: GROUP_GUEST,
    }
    
    group_name = role_to_group.get(role)
    if group_name:
        # Usar get_or_create para mayor robustez (evita DoesNotExist)
        group, created = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        
        # Logging para debugging
        if created:
            logger.warning(
                f'Grupo {group_name} no existía, creado automáticamente. '
                f'Usuario {user.id} ({user.email}) asignado al grupo.'
            )
        else:
            logger.info(
                f'Usuario {user.id} ({user.email}) asignado al grupo {group_name} (rol: {role})'
            )


def ensure_groups_exist():
    """
    Asegura que los grupos de roles existan en la base de datos.
    """
    groups_data = [
        (GROUP_ADMIN, 'Grupo para administradores del sistema'),
        (GROUP_INSTRUCTOR, 'Grupo para instructores de cursos'),
        (GROUP_STUDENT, 'Grupo para estudiantes'),
        (GROUP_GUEST, 'Grupo para usuarios invitados'),
    ]
    
    for group_name, description in groups_data:
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            # Opcional: agregar descripción si se necesita
            pass

