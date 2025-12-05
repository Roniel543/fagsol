"""
Migración de datos: Convertir precios PEN existentes a USD
FagSol Escuela Virtual - Fase 1 Multi-Moneda
"""

from django.db import migrations
from decimal import Decimal

# Tasa de cambio USD -> PEN por defecto (3.75 soles por dólar)
# Esta tasa se puede ajustar según la tasa actual del momento
DEFAULT_USD_TO_PEN_RATE = Decimal('3.75')


def convert_pen_to_usd(apps, schema_editor):
    """
    Convierte precios PEN existentes a USD
    Si price_usd es None, calcula desde price usando la tasa de cambio
    """
    Course = apps.get_model('courses', 'Course')
    
    courses = Course.objects.filter(price_usd__isnull=True)
    converted_count = 0
    
    for course in courses:
        if course.price and course.price > 0:
            # Convertir PEN a USD: price / tasa
            course.price_usd = course.price / DEFAULT_USD_TO_PEN_RATE
            course.price_usd = course.price_usd.quantize(Decimal('0.01'))
            course.save(update_fields=['price_usd'])
            converted_count += 1
    
    print(f"✅ Convertidos {converted_count} cursos de PEN a USD")


def reverse_convert(apps, schema_editor):
    """
    Reversa la conversión: calcula price desde price_usd
    (Solo para rollback, normalmente no se usa)
    """
    Course = apps.get_model('courses', 'Course')
    
    courses = Course.objects.filter(price_usd__isnull=False)
    
    for course in courses:
        if course.price_usd and course.price_usd > 0:
            # Convertir USD a PEN: price_usd * tasa
            course.price = course.price_usd * DEFAULT_USD_TO_PEN_RATE
            course.price = course.price.quantize(Decimal('0.01'))
            course.save(update_fields=['price'])


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_course_price_usd_alter_course_price'),
    ]

    operations = [
        migrations.RunPython(convert_pen_to_usd, reverse_convert),
    ]

