"""
URLs de Dashboard - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.dashboard_views import (
    get_dashboard_stats,
    get_admin_stats,
    get_instructor_stats,
    get_student_stats
)

urlpatterns = [
    # Estadísticas generales (según rol)
    path('stats/', get_dashboard_stats, name='dashboard_stats'),
    
    # Estadísticas específicas por rol
    path('admin/stats/', get_admin_stats, name='dashboard_admin_stats'),
    path('instructor/stats/', get_instructor_stats, name='dashboard_instructor_stats'),
    path('student/stats/', get_student_stats, name='dashboard_student_stats'),
]

