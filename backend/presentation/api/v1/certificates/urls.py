"""
URLs de Certificados - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.certificate_views import (
    download_certificate,
    verify_certificate
)

urlpatterns = [
    path('<str:course_id>/download/', download_certificate, name='download_certificate'),
    path('verify/<str:verification_code>/', verify_certificate, name='verify_certificate'),
]

