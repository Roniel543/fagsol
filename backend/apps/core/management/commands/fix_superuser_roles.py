"""
Comando para asignar rol admin a superusuarios que no lo tienen
python manage.py fix_superuser_roles
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.core.models import UserProfile


class Command(BaseCommand):
    help = 'Asigna rol admin a todos los superusuarios que no lo tienen en su perfil'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra qué se haría sin hacer cambios reales',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Obtener todos los superusuarios
        superusers = User.objects.filter(is_superuser=True)
        
        if not superusers.exists():
            self.stdout.write(self.style.WARNING('No hay superusuarios en el sistema.'))
            return
        
        self.stdout.write(f'Encontrados {superusers.count()} superusuario(s).')
        
        updated_count = 0
        created_count = 0
        
        for user in superusers:
            try:
                profile = user.profile
                # Si ya tiene perfil pero no es admin, actualizarlo
                if profile.role != 'admin':
                    if not dry_run:
                        profile.role = 'admin'
                        profile.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Usuario {user.email} (ID: {user.id}): '
                            f'Rol actualizado de "{profile.role}" a "admin"'
                        )
                    )
                    updated_count += 1
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Usuario {user.email} (ID: {user.id}): Ya tiene rol admin'
                        )
                    )
            except UserProfile.DoesNotExist:
                # Crear perfil con rol admin
                if not dry_run:
                    UserProfile.objects.create(user=user, role='admin')
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Usuario {user.email} (ID: {user.id}): '
                        f'Perfil creado con rol "admin"'
                    )
                )
                created_count += 1
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n[DRY RUN] Se actualizarían {updated_count} perfil(es) y '
                    f'se crearían {created_count} perfil(es).'
                )
            )
            self.stdout.write('Ejecuta sin --dry-run para aplicar los cambios.')
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Completado: {updated_count} perfil(es) actualizado(s), '
                    f'{created_count} perfil(es) creado(s).'
                )
            )

