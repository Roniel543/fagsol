"""
URLs de autenticación - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.auth_views import login, register, auth_health

urlpatterns = [
    # Auth endpoints
    path('login/', login, name='auth_login'),
    path('register/', register, name='auth_register'),
    path('health/', auth_health, name='auth_health'),
]
