"""
Comando de gestión para migrar roles existentes

Este comando actualiza los roles existentes de 'teacher' a 'instructor'
y crea los grupos de Django necesarios.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, User
from apps.core.models import UserProfile
from apps.users.permissions import (
    GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_GUEST,
    ROLE_ADMIN, ROLE_INSTRUCTOR, ROLE_STUDENT, ROLE_GUEST
)


class Command(BaseCommand):
    help = 'Migra roles existentes y crea grupos de Django'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando migración de roles...'))
        
        # 1. Crear grupos de Django
        self.stdout.write('Creando grupos de Django...')
        groups_data = [
            (GROUP_ADMIN, 'Grupo para administradores del sistema'),
            (GROUP_INSTRUCTOR, 'Grupo para instructores de cursos'),
            (GROUP_STUDENT, 'Grupo para estudiantes'),
            (GROUP_GUEST, 'Grupo para usuarios invitados'),
        ]
        
        for group_name, description in groups_data:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Grupo creado: {group_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'  - Grupo ya existe: {group_name}'))
        
        # 2. Migrar roles de 'teacher' a 'instructor'
        self.stdout.write('\nMigrando roles de usuarios...')
        profiles_updated = 0
        for profile in UserProfile.objects.all():
            old_role = profile.role
            
            # Migrar 'teacher' a 'instructor'
            if profile.role == 'teacher':
                profile.role = 'instructor'
                profile.save()
                profiles_updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ Usuario {profile.user.email}: {old_role} → instructor'
                    )
                )
        
        if profiles_updated == 0:
            self.stdout.write(self.style.WARNING('  - No se encontraron roles "teacher" para migrar'))
        
        # 3. Asignar usuarios a grupos según su rol
        self.stdout.write('\nAsignando usuarios a grupos...')
        users_assigned = 0
        
        # Mapeo de roles a grupos
        role_to_group = {
            ROLE_ADMIN: GROUP_ADMIN,
            ROLE_INSTRUCTOR: GROUP_INSTRUCTOR,
            ROLE_STUDENT: GROUP_STUDENT,
            ROLE_GUEST: GROUP_GUEST,
        }
        
        for profile in UserProfile.objects.all():
            user = profile.user
            role = profile.role
            
            # Remover usuario de todos los grupos de roles primero
            role_groups = [GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_GUEST]
            for group_name in role_groups:
                try:
                    group = Group.objects.get(name=group_name)
                    user.groups.remove(group)
                except Group.DoesNotExist:
                    pass
            
            # Asignar al grupo correspondiente
            group_name = role_to_group.get(role)
            if group_name:
                try:
                    group = Group.objects.get(name=group_name)
                    user.groups.add(group)
                    users_assigned += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ Usuario {user.email} asignado a grupo: {group_name}'
                        )
                    )
                except Group.DoesNotExist:
                    self.stdout.write(
                        self.style.ERROR(
                            f'  ✗ Grupo no encontrado: {group_name}'
                        )
                    )
        
        # 4. Asignar usuarios sin perfil al grupo de invitados
        users_without_profile = User.objects.filter(profile__isnull=True)
        if users_without_profile.exists():
            self.stdout.write('\nAsignando usuarios sin perfil al grupo de invitados...')
            guest_group = Group.objects.get(name=GROUP_GUEST)
            for user in users_without_profile:
                user.groups.add(guest_group)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ Usuario {user.email} (sin perfil) asignado a grupo: {GROUP_GUEST}'
                    )
                )
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Migración completada:'))
        self.stdout.write(f'  - Grupos creados: {len(groups_data)}')
        self.stdout.write(f'  - Perfiles actualizados: {profiles_updated}')
        self.stdout.write(f'  - Usuarios asignados a grupos: {users_assigned}')

