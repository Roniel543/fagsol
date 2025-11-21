"""
Comando de Django para esperar a que la base de datos esté disponible
Útil para Docker Compose
"""

import time
import sys
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = 'Espera a que la base de datos esté disponible'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-attempts',
            type=int,
            default=30,
            help='Número máximo de intentos (default: 30)',
        )
        parser.add_argument(
            '--delay',
            type=int,
            default=2,
            help='Segundos de espera entre intentos (default: 2)',
        )

    def handle(self, *args, **options):
        max_attempts = options['max_attempts']
        delay = options['delay']
        attempt = 0

        self.stdout.write(self.style.WARNING('Esperando a que la base de datos esté disponible...'))

        while attempt < max_attempts:
            try:
                connection.ensure_connection()
                connection.close()
                self.stdout.write(self.style.SUCCESS('✓ Base de datos disponible'))
                return
            except OperationalError:
                attempt += 1
                self.stdout.write(
                    self.style.WARNING(f'Intento {attempt}/{max_attempts}...')
                )
                time.sleep(delay)

        self.stdout.write(
            self.style.ERROR(f'✗ No se pudo conectar a la base de datos después de {max_attempts} intentos')
        )
        sys.exit(1)

