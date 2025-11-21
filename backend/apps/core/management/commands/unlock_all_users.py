"""
Comando para desbloquear TODOS los usuarios bloqueados por AXES
Uso: python manage.py unlock_all_users
"""

from django.core.management.base import BaseCommand
from axes.utils import reset
from axes.models import AccessAttempt
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Desbloquea TODOS los usuarios bloqueados por AXES'

    def add_arguments(self, parser):
        parser.add_argument(
            '--by-ip',
            type=str,
            default=None,
            help='Desbloquear por IP específica (opcional)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f'\n=== DESBLOQUEANDO USUARIOS ===\n'))

        try:
            from django.conf import settings
            
            # Obtener todos los intentos que han alcanzado el límite de fallos
            # Un usuario está bloqueado si failures_since_start >= AXES_FAILURE_LIMIT
            failure_limit = getattr(settings, 'AXES_FAILURE_LIMIT', 10)
            locked_attempts = AccessAttempt.objects.filter(
                failures_since_start__gte=failure_limit
            )
            
            if not locked_attempts.exists():
                self.stdout.write(self.style.SUCCESS('✓ No hay usuarios bloqueados'))
                return

            self.stdout.write(f'Encontrados {locked_attempts.count()} bloqueos (con {failure_limit}+ intentos fallidos):\n')

            # Desbloquear por IP si se especifica
            ip_to_unlock = options.get('by_ip')
            if ip_to_unlock:
                attempts = locked_attempts.filter(ip_address=ip_to_unlock)
                self.stdout.write(f'Desbloqueando bloqueos de IP: {ip_to_unlock}')
            else:
                attempts = locked_attempts
                self.stdout.write('Desbloqueando TODOS los usuarios bloqueados...')
            
            # Mostrar información de los bloqueos
            for attempt in attempts[:10]:  # Mostrar primeros 10
                self.stdout.write(f'  - Usuario: {attempt.username or "(sin username)"}, IP: {attempt.ip_address}, Fallos: {attempt.failures_since_start}')
            if attempts.count() > 10:
                self.stdout.write(f'  ... y {attempts.count() - 10} más')

            # Agrupar por username para evitar duplicados
            usernames_to_reset = set()
            ips_to_reset = set()

            for attempt in attempts:
                if attempt.username:
                    usernames_to_reset.add(attempt.username)
                if attempt.ip_address:
                    ips_to_reset.add(attempt.ip_address)

            # Resetear por username
            for username in usernames_to_reset:
                try:
                    reset(username=username)
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Desbloqueado: {username}'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'  ⚠ Error al desbloquear {username}: {str(e)}'))

            # Resetear por IP (solo si no se especificó un IP específico)
            if not ip_to_unlock:
                for ip in ips_to_reset:
                    try:
                        reset(ip=ip)
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Desbloqueado IP: {ip}'))
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  ⚠ Error al desbloquear IP {ip}: {str(e)}'))

            # Verificar usuarios específicos conocidos
            known_users = ['pedrito@gmail.com', 'alonso@gmail.com']
            self.stdout.write(f'\n=== VERIFICANDO USUARIOS CONOCIDOS ===')
            for email in known_users:
                try:
                    user = User.objects.get(email=email)
                    reset(username=user.username)
                    reset(username=email)
                    self.stdout.write(self.style.SUCCESS(f'✓ {email} desbloqueado'))
                except User.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'⚠ Usuario no encontrado: {email}'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠ Error con {email}: {str(e)}'))

            self.stdout.write(self.style.SUCCESS(f'\n✓ Proceso completado!'))
            self.stdout.write(f'\nTotal desbloqueados: {len(usernames_to_reset)} usuarios, {len(ips_to_reset)} IPs')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error: {str(e)}'))
            import traceback
            traceback.print_exc()

