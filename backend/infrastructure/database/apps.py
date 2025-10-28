"""
Configuración de la app de base de datos - FagSol Escuela Virtual
"""

from django.apps import AppConfig


class DatabaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'infrastructure.database'
    verbose_name = 'Base de Datos - Arquitectura Limpia'
