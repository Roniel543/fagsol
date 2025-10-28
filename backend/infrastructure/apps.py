"""
Configuración de la app de infraestructura - FagSol Escuela Virtual
"""

from django.apps import AppConfig


class InfrastructureConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'infrastructure'
    verbose_name = 'Infraestructura - Arquitectura Limpia'
