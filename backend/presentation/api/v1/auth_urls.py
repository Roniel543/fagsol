"""
URLs de autenticación - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.auth_views import (
    login, register, auth_health, logout, get_current_user, apply_to_be_instructor
)

urlpatterns = [
    # Auth endpoints
    path('login/', login, name='auth_login'),
    path('register/', register, name='auth_register'),
    path('logout/', logout, name='auth_logout'),
    path('me/', get_current_user, name='auth_me'),
    path('health/', auth_health, name='auth_health'),
    # Instructor application
    path('apply-instructor/', apply_to_be_instructor, name='auth_apply_instructor'),
]
