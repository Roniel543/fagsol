"""
Configuración de la app de aplicación - FagSol Escuela Virtual
"""

from django.apps import AppConfig


class ApplicationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'application'
    verbose_name = 'Aplicación - Arquitectura Limpia'
