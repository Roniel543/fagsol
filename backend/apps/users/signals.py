"""
Signals para gestión automática de roles y grupos - FagSol Escuela Virtual

Este módulo maneja la asignación automática de usuarios a grupos de Django
cuando se crea o actualiza un UserProfile.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from apps.core.models import UserProfile
from apps.users.permissions import (
    GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_GUEST,
    ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT, ROLE_GUEST
)


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
        try:
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            # Si el grupo no existe, crearlo
            group = Group.objects.create(name=group_name)
            user.groups.add(group)


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

