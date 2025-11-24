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
        parser.add_argument(
            '--clear-all',
            action='store_true',
            help='Limpiar TODOS los AccessAttempt de la base de datos (útil cuando hay bloqueos persistentes)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f'\n=== DESBLOQUEANDO USUARIOS ===\n'))

        try:
            from django.conf import settings
            
            # Si se solicita limpiar todo, hacerlo primero
            if options.get('clear_all'):
                total = AccessAttempt.objects.count()
                if total > 0:
                    # Desbloquear por todas las IPs y usernames antes de eliminar
                    all_attempts = AccessAttempt.objects.all()
                    ips_to_reset = set()
                    usernames_to_reset = set()
                    
                    for attempt in all_attempts:
                        if attempt.ip_address:
                            ips_to_reset.add(attempt.ip_address)
                        if attempt.username:
                            usernames_to_reset.add(attempt.username)
                    
                    for ip in ips_to_reset:
                        reset(ip=ip)
                    for username in usernames_to_reset:
                        reset(username=username)
                    
                    AccessAttempt.objects.all().delete()
                    self.stdout.write(self.style.SUCCESS(f'✓ Eliminados {total} AccessAttempt de la base de datos'))
                else:
                    self.stdout.write(self.style.SUCCESS('✓ No hay AccessAttempt para eliminar'))
                return
            
            # Obtener todos los intentos que han alcanzado el límite de fallos
            # Un usuario está bloqueado si failures_since_start >= AXES_FAILURE_LIMIT
            failure_limit = getattr(settings, 'AXES_FAILURE_LIMIT', 10)
            locked_attempts = AccessAttempt.objects.filter(
                failures_since_start__gte=failure_limit
            )
            
            # También buscar todos los AccessAttempt (no solo los que superan el límite)
            # porque a veces AXES bloquea antes de llegar al límite
            all_attempts = AccessAttempt.objects.all()
            
            if not locked_attempts.exists() and not all_attempts.exists():
                self.stdout.write(self.style.SUCCESS('✓ No hay usuarios bloqueados'))
                return
            
            # Si hay intentos pero no superan el límite, mostrar información
            if not locked_attempts.exists() and all_attempts.exists():
                self.stdout.write(self.style.WARNING(f'⚠ Encontrados {all_attempts.count()} AccessAttempt (no superan el límite de {failure_limit})'))
                self.stdout.write('Desbloqueando de todas formas para asegurar...')
                attempts = all_attempts
            else:
                attempts = locked_attempts
                self.stdout.write(f'Encontrados {attempts.count()} bloqueos (con {failure_limit}+ intentos fallidos):\n')

            # Desbloquear por IP si se especifica
            ip_to_unlock = options.get('by_ip')
            if ip_to_unlock:
                attempts = attempts.filter(ip_address=ip_to_unlock)
                self.stdout.write(f'Desbloqueando bloqueos de IP: {ip_to_unlock}')
            else:
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

