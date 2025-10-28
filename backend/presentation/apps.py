"""
Configuración de la app de presentación - FagSol Escuela Virtual
"""

from django.apps import AppConfig


class PresentationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'presentation'
    verbose_name = 'Presentación - Arquitectura Limpia'
