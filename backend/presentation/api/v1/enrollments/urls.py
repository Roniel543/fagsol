"""
URLs de Enrollments - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.enrollment_views import (
    list_enrollments,
    get_enrollment
)

urlpatterns = [
    path('', list_enrollments, name='list_enrollments'),
    path('<str:enrollment_id>/', get_enrollment, name='get_enrollment'),
]

