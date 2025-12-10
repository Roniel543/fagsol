"""
Comando de Django para probar el flujo de conversión de precios
Prueba la Opción C (Híbrido Mejorado) con diferentes escenarios
"""

from django.core.management.base import BaseCommand
from decimal import Decimal
from infrastructure.services.course_service import CourseService
from infrastructure.services.currency_service import CurrencyService
from django.conf import settings


class Command(BaseCommand):
    help = 'Prueba el flujo de conversión de precios (Opción C)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--price',
            type=float,
            default=260.0,
            help='Precio en PEN a probar (default: 260.0)'
        )
        parser.add_argument(
            '--test-api',
            action='store_true',
            help='Probar con API real (puede fallar si no hay conexión)'
        )

    def handle(self, *args, **options):
        price_pen = Decimal(str(options['price']))
        test_api = options['test_api']
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('🧪 PRUEBA DE CONVERSIÓN DE PRECIOS - OPCIÓN C'))
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))
        
        # Mostrar configuración actual
        default_rate = getattr(settings, 'DEFAULT_USD_TO_PEN_RATE', 3.75)
        self.stdout.write(f'📋 Configuración:')
        self.stdout.write(f'   - Precio de prueba: S/ {price_pen}')
        self.stdout.write(f'   - DEFAULT_USD_TO_PEN_RATE: {default_rate}')
        self.stdout.write(f'   - Probar con API: {"Sí" if test_api else "No (solo fallback)"}\n')
        
        # Crear servicios
        course_service = CourseService()
        currency_service = CurrencyService()
        
        # Escenario 1: Probar con API real
        if test_api:
            self.stdout.write(self.style.WARNING('🔍 ESCENARIO 1: Intentando obtener tasa REAL de la API'))
            self.stdout.write('-' * 60)
            try:
                # Intentar obtener tasa real
                usd_to_pen_rate = currency_service.get_exchange_rate('USD', 'PEN')
                price_usd = course_service._calculate_price_usd_from_pen(price_pen)
                
                self.stdout.write(self.style.SUCCESS(f'✅ API respondió correctamente'))
                self.stdout.write(f'   - Tasa obtenida: 1 USD = {usd_to_pen_rate} PEN')
                self.stdout.write(f'   - Conversión: {price_pen} PEN ÷ {usd_to_pen_rate} = {price_usd} USD')
                self.stdout.write(f'   - Precio calculado: ${price_usd} USD\n')
                
                # Verificación inversa
                verification = price_usd * usd_to_pen_rate
                self.stdout.write(f'   🔄 Verificación: ${price_usd} USD × {usd_to_pen_rate} = S/ {verification}')
                if abs(verification - price_pen) < Decimal('0.01'):
                    self.stdout.write(self.style.SUCCESS('   ✅ Verificación correcta\n'))
                else:
                    self.stdout.write(self.style.WARNING(f'   ⚠️ Diferencia: {abs(verification - price_pen)}\n'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error al obtener tasa de API: {str(e)}'))
                self.stdout.write(f'   → El sistema usará fallback (DEFAULT_USD_TO_PEN_RATE)\n')
        
        # Escenario 2: Probar con fallback (tasa por defecto)
        self.stdout.write(self.style.WARNING('🔍 ESCENARIO 2: Usando tasa por defecto (FALLBACK)'))
        self.stdout.write('-' * 60)
        
        # Simular fallback directamente
        price_usd_fallback = price_pen / Decimal(str(default_rate))
        price_usd_fallback = price_usd_fallback.quantize(Decimal('0.01'))
        
        self.stdout.write(f'📊 Cálculo con fallback:')
        self.stdout.write(f'   - Tasa usada: 1 USD = {default_rate} PEN (DEFAULT_USD_TO_PEN_RATE)')
        self.stdout.write(f'   - Conversión: {price_pen} PEN ÷ {default_rate} = {price_usd_fallback} USD')
        self.stdout.write(f'   - Precio calculado: ${price_usd_fallback} USD\n')
        
        # Verificación inversa
        verification_fallback = price_usd_fallback * Decimal(str(default_rate))
        self.stdout.write(f'   🔄 Verificación: ${price_usd_fallback} USD × {default_rate} = S/ {verification_fallback}')
        if abs(verification_fallback - price_pen) < Decimal('0.01'):
            self.stdout.write(self.style.SUCCESS('   ✅ Verificación correcta\n'))
        else:
            self.stdout.write(self.style.WARNING(f'   ⚠️ Diferencia: {abs(verification_fallback - price_pen)}\n'))
        
        # Comparación
        if test_api:
            try:
                usd_to_pen_rate = currency_service.get_exchange_rate('USD', 'PEN')
                price_usd_api = price_pen / usd_to_pen_rate
                price_usd_api = price_usd_api.quantize(Decimal('0.01'))
                
                diferencia = abs(price_usd_api - price_usd_fallback)
                porcentaje = (diferencia / price_usd_api) * 100
                
                self.stdout.write(self.style.WARNING('📊 COMPARACIÓN: API vs Fallback'))
                self.stdout.write('-' * 60)
                self.stdout.write(f'   - Con API (tasa {usd_to_pen_rate}): ${price_usd_api} USD')
                self.stdout.write(f'   - Con Fallback (tasa {default_rate}): ${price_usd_fallback} USD')
                self.stdout.write(f'   - Diferencia: ${diferencia} ({porcentaje:.2f}%)\n')
                
                if porcentaje > 5:
                    self.stdout.write(self.style.WARNING(
                        f'   ⚠️ Diferencia significativa (>5%). Considera actualizar DEFAULT_USD_TO_PEN_RATE\n'
                    ))
                else:
                    self.stdout.write(self.style.SUCCESS(
                        f'   ✅ Diferencia aceptable (<5%)\n'
                    ))
            except:
                pass
        
        # Resumen
        self.stdout.write(self.style.SUCCESS('📋 RESUMEN DEL FLUJO (Opción C):'))
        self.stdout.write('-' * 60)
        self.stdout.write(f'1. Admin ingresa: S/ {price_pen} PEN')
        self.stdout.write(f'2. Sistema intenta obtener tasa de API')
        if test_api:
            try:
                usd_to_pen_rate = currency_service.get_exchange_rate('USD', 'PEN')
                self.stdout.write(f'   → Tasa obtenida: {usd_to_pen_rate} (de API)')
                price_usd_final = price_pen / usd_to_pen_rate
                price_usd_final = price_usd_final.quantize(Decimal('0.01'))
            except:
                self.stdout.write(f'   → API falló, usando fallback: {default_rate}')
                price_usd_final = price_usd_fallback
        else:
            self.stdout.write(f'   → API no probada, usando fallback: {default_rate}')
            price_usd_final = price_usd_fallback
        
        self.stdout.write(f'3. Sistema calcula: price_usd = {price_usd_final} USD')
        self.stdout.write(f'4. Sistema guarda:')
        self.stdout.write(f'   - price = {price_pen} PEN (fijo)')
        self.stdout.write(f'   - price_usd = {price_usd_final} USD (fijo)')
        self.stdout.write(f'5. Usuario en Perú ve: S/ {price_pen} (directo)')
        self.stdout.write(f'6. Usuario en otro país ve: precio convertido desde ${price_usd_final} USD')
        self.stdout.write(f'7. Usuario paga: S/ {price_pen} PEN (directo a Mercado Pago)\n')
        
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('✅ Prueba completada'))
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))

