"""
Comando para probar el desbloqueo y login de un usuario
Uso: python manage.py test_unlock_login deadmau5rezz@gmail.com --password 123
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from axes.models import AccessAttempt
from axes.utils import reset
from infrastructure.services.auth_service import AuthService
from django.test import RequestFactory

User = get_user_model()


class Command(BaseCommand):
    help = 'Prueba el desbloqueo y login de un usuario'

    def add_arguments(self, parser):
        parser.add_argument(
            'email',
            type=str,
            help='Email del usuario a probar'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='123',
            help='Contraseña para probar el login (default: 123)'
        )

    def handle(self, *args, **options):
        email = options['email'].lower().strip()
        password = options['password']
        
        self.stdout.write(self.style.SUCCESS(f'\n{'='*60}'))
        self.stdout.write(self.style.SUCCESS(f'PRUEBA DE DESBLOQUEO Y LOGIN'))
        self.stdout.write(self.style.SUCCESS(f'{'='*60}'))
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Password: {"*" * len(password)}')
        self.stdout.write(f'{'='*60}\n')
        
        # 1. Verificar estado inicial
        self.stdout.write('1. VERIFICANDO ESTADO INICIAL...')
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f'✓ Usuario encontrado:'))
            self.stdout.write(f'  - ID: {user.id}')
            self.stdout.write(f'  - Username: {user.username}')
            self.stdout.write(f'  - Email: {user.email}')
            self.stdout.write(f'  - Activo: {user.is_active}')
        except User.DoesNotExist:
            raise CommandError(f'Usuario NO encontrado: {email}')
        
        # 2. Verificar bloqueos de AXES
        self.stdout.write(f'\n2. VERIFICANDO BLOQUEOS DE AXES...')
        attempts = AccessAttempt.objects.filter(
            username__in=[user.username, email]
        )
        
        if attempts.exists():
            self.stdout.write(self.style.WARNING(f'⚠ Bloqueos encontrados:'))
            for attempt in attempts:
                self.stdout.write(f'  - Username: {attempt.username}')
                self.stdout.write(f'  - Fallos: {attempt.failures_since_start}')
                self.stdout.write(f'  - IP: {attempt.ip_address}')
                self.stdout.write(f'  - Último intento: {attempt.attempt_time}')
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ No hay bloqueos de AXES'))
        
        # 3. Desbloquear usuario
        self.stdout.write(f'\n3. DESBLOQUEANDO USUARIO...')
        try:
            # Resetear por username
            reset(username=user.username)
            self.stdout.write(self.style.SUCCESS(f'✓ Reset por username: {user.username}'))
            
            # Resetear por email también
            if email != user.username:
                reset(username=email)
                self.stdout.write(self.style.SUCCESS(f'✓ Reset por email: {email}'))
            
            # Eliminar AccessAttempt
            deleted_count = attempts.delete()[0]
            if deleted_count > 0:
                self.stdout.write(self.style.SUCCESS(f'✓ Eliminados {deleted_count} AccessAttempt'))
            
            # Verificar que se eliminaron
            remaining = AccessAttempt.objects.filter(
                username__in=[user.username, email]
            ).count()
            
            if remaining == 0:
                self.stdout.write(self.style.SUCCESS(f'✓ Usuario desbloqueado correctamente'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠ Aún quedan {remaining} AccessAttempt'))
                
        except Exception as e:
            raise CommandError(f'Error al desbloquear: {str(e)}')
        
        # 4. Probar login con AuthService
        self.stdout.write(f'\n4. PROBANDO LOGIN CON AUTHSERVICE...')
        try:
            factory = RequestFactory()
            request = factory.post('/api/v1/auth/login/')
            
            # Simular request con IP
            request.META['REMOTE_ADDR'] = '127.0.0.1'
            
            auth_service = AuthService()
            result = auth_service.login(email, password, request=request)
            
            if result.get('success'):
                self.stdout.write(self.style.SUCCESS(f'✓ Login exitoso!'))
                self.stdout.write(f'  - Usuario: {result["user"]["email"]}')
                self.stdout.write(f'  - Nombre: {result["user"]["first_name"]} {result["user"]["last_name"]}')
                self.stdout.write(f'  - Rol: {result["user"]["role"]}')
                self.stdout.write(f'  - Token generado: {"Sí" if "tokens" in result else "No"}')
            else:
                self.stdout.write(self.style.ERROR(f'✗ Login fallido:'))
                self.stdout.write(f'  - Mensaje: {result.get("message", "Sin mensaje")}')
                self.stdout.write(f'  - Bloqueado: {result.get("is_locked", False)}')
                return
                
        except Exception as e:
            raise CommandError(f'Error al probar login: {str(e)}')
        
        # 5. Verificar que no hay nuevos bloqueos
        self.stdout.write(f'\n5. VERIFICANDO QUE NO HAY NUEVOS BLOQUEOS...')
        new_attempts = AccessAttempt.objects.filter(
            username__in=[user.username, email]
        )
        
        if new_attempts.exists():
            self.stdout.write(self.style.WARNING(f'⚠ Nuevos bloqueos encontrados después del login:'))
            for attempt in new_attempts:
                self.stdout.write(f'  - Fallos: {attempt.failures_since_start}')
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ No hay nuevos bloqueos (login exitoso resetea el contador)'))
        
        self.stdout.write(self.style.SUCCESS(f'\n{'='*60}'))
        self.stdout.write(self.style.SUCCESS(f'✅ PRUEBA EXITOSA: El desbloqueo y login funcionan correctamente'))
        self.stdout.write(self.style.SUCCESS(f'{'='*60}\n'))

