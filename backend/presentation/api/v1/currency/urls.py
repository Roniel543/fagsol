"""
URLs de Moneda y Detección de País - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.currency_views import (
    detect_country,
    convert_currency
)

urlpatterns = [
    path('detect/', detect_country, name='currency_detect'),
    path('convert/', convert_currency, name='currency_convert'),
]

