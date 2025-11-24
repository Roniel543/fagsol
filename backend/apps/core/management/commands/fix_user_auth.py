"""
Comando de Django para corregir problemas de autenticación de usuarios
Uso: python manage.py fix_user_auth pedrito@gmail.com
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction, models
from axes.utils import reset

User = get_user_model()


class Command(BaseCommand):
    help = 'Corrige problemas de autenticación de un usuario (username NULL, bloqueos AXES, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            'email',
            type=str,
            help='Email del usuario a corregir'
        )
        parser.add_argument(
            '--reset-password',
            type=str,
            default=None,
            help='Nueva contraseña para el usuario (opcional)'
        )

    def handle(self, *args, **options):
        email = options['email'].lower().strip()
        new_password = options.get('reset_password')

        self.stdout.write(self.style.SUCCESS(f'\n=== CORRIGIENDO USUARIO: {email} ===\n'))

        try:
            # 1. Buscar usuario
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise CommandError(f'Usuario con email "{email}" no encontrado')

            self.stdout.write(f'✓ Usuario encontrado:')
            self.stdout.write(f'  - ID: {user.id}')
            self.stdout.write(f'  - Username actual: {user.username or "(NULL)"}')
            self.stdout.write(f'  - Email: {user.email}')
            self.stdout.write(f'  - Activo: {user.is_active}')
            self.stdout.write(f'  - Nombre: {user.first_name} {user.last_name}')

            # 2. Corregir username si es NULL o diferente al email
            with transaction.atomic():
                username_changed = False
                if not user.username:
                    self.stdout.write(self.style.WARNING(f'\n⚠ Username es NULL, corrigiendo...'))
                    username_changed = True
                elif user.username != email:
                    self.stdout.write(self.style.WARNING(f'\n⚠ Username no coincide con email, corrigiendo...'))
                    username_changed = True

                if username_changed:
                    # Usar SQL directo para evitar problemas con validaciones de Django
                    from django.db import connection
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "UPDATE auth_user SET username = %s WHERE id = %s",
                            [email, user.id]
                        )
                    user.refresh_from_db()
                    self.stdout.write(self.style.SUCCESS(f'✓ Username corregido a: {user.username}'))

            # 3. Resetear bloqueos de AXES (por username Y por email, y también por IP si es necesario)
            username_for_axes = user.username or email
            try:
                from axes.models import AccessAttempt
                
                # Resetear por username
                reset(username=username_for_axes)
                
                # Resetear por email también (por si acaso)
                if email != username_for_axes:
                    reset(username=email)
                
                # Resetear por IP si hay bloqueos de IP
                # Buscar intentos con muchos fallos (bloqueados)
                from django.conf import settings
                failure_limit = getattr(settings, 'AXES_FAILURE_LIMIT', 10)
                attempts = AccessAttempt.objects.filter(
                    failures_since_start__gte=failure_limit
                ).filter(
                    models.Q(username=username_for_axes) | models.Q(username=email)
                )
                
                ips_to_reset = set()
                for attempt in attempts:
                    if attempt.ip_address:
                        ips_to_reset.add(attempt.ip_address)
                
                for ip in ips_to_reset:
                    reset(ip=ip)
                    self.stdout.write(self.style.SUCCESS(f'✓ Bloqueos de IP {ip} también reseteados'))
                
                self.stdout.write(self.style.SUCCESS('✓ Bloqueos de AXES reseteados'))
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Error al resetear AXES: {str(e)}')
                self.stdout.write(self.style.WARNING(f'⚠ No se pudieron resetear bloqueos de AXES: {str(e)}'))

            # 4. Cambiar contraseña si se solicita
            if new_password:
                user.set_password(new_password)
                user.save()
                self.stdout.write(self.style.SUCCESS('✓ Contraseña actualizada'))

            # 5. Verificar que todo esté correcto
            user.refresh_from_db()
            self.stdout.write(self.style.SUCCESS(f'\n=== VERIFICACIÓN FINAL ==='))
            self.stdout.write(f'  - Username: {user.username}')
            self.stdout.write(f'  - Email: {user.email}')
            self.stdout.write(f'  - Activo: {user.is_active}')
            self.stdout.write(self.style.SUCCESS(f'\n✓ Usuario corregido exitosamente!'))

        except Exception as e:
            raise CommandError(f'Error al corregir usuario: {str(e)}')
    
