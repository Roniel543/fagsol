"""
URLs de Contacto - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.contact_views import send_contact_message

urlpatterns = [
    path('', send_contact_message, name='contact_send'),
]

