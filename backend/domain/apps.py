"""
Configuración de la app de dominio - FagSol Escuela Virtual
"""

from django.apps import AppConfig


class DomainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domain'
    verbose_name = 'Dominio - Arquitectura Limpia'
