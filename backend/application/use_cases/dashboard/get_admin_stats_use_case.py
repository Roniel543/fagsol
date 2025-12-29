"""
Caso de uso: Obtener estadísticas de administrador - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from decimal import Decimal
from django.db.models import Count, Sum, Avg, DecimalField, Min
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate
from apps.payments.models import Payment
from apps.core.models import UserProfile
from django.contrib.auth.models import User
from apps.users.permissions import is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetAdminStatsUseCase:
    """
    Caso de uso: Obtener estadísticas de administrador
    
    Responsabilidades:
    - Validar permisos (solo admin)
    - Calcular estadísticas generales del sistema
    - Cursos (total, publicados, borradores, archivados)
    - Usuarios (total, estudiantes, instructores, admins)
    - Enrollments (total, activos, completados)
    - Pagos (total, ingresos, ingresos último mes)
    - Certificados
    - Cursos más populares
    - Ingresos por mes
    """
    
    def execute(self, user) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener estadísticas de admin
        
        Args:
            user: Usuario autenticado (debe ser admin)
            
        Returns:
            UseCaseResult con las estadísticas
        """
        try:
            # Validar permisos
            if not is_admin(user):
                return UseCaseResult(
                    success=False,
                    error_message="No tienes permiso para ver estadísticas de administrador"
                )
            
            # Estadísticas de cursos
            total_courses = Course.objects.filter(is_active=True).exclude(status='archived').count()
            published_courses = Course.objects.filter(status='published', is_active=True).count()
            draft_courses = Course.objects.filter(status='draft', is_active=True).exclude(status='archived').count()
            archived_courses = Course.objects.filter(status='archived').count()
            
            # Estadísticas de usuarios
            total_users = User.objects.filter(is_active=True).count()
            total_students = UserProfile.objects.filter(role='student').count()
            total_instructors = UserProfile.objects.filter(role='instructor').count()
            total_admins = UserProfile.objects.filter(role='admin').count()
            
            # Estadísticas de enrollments
            total_enrollments = Enrollment.objects.count()
            active_enrollments = Enrollment.objects.filter(status='active').count()
            completed_enrollments = Enrollment.objects.filter(status='completed').count()
            
            # Estadísticas de pagos (últimos 30 días)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            payments_last_month = Payment.objects.filter(
                status='approved',
                created_at__gte=thirty_days_ago
            )
            
            revenue_last_month = payments_last_month.aggregate(
                total=Sum('amount', output_field=DecimalField())
            )['total'] or Decimal('0.00')
            
            total_payments = Payment.objects.filter(status='approved').count()
            total_revenue = Payment.objects.filter(status='approved').aggregate(
                total=Sum('amount', output_field=DecimalField())
            )['total'] or Decimal('0.00')
            
            # Estadísticas de certificados
            total_certificates = Certificate.objects.count()
            
            # Cursos más populares (por enrollments)
            popular_courses = Course.objects.filter(
                status='published',
                is_active=True
            ).annotate(
                enrollment_count=Count('enrollments')
            ).order_by('-enrollment_count')[:5]
            
            popular_courses_data = [
                {
                    'id': course.id,
                    'title': course.title,
                    'enrollments': course.enrollment_count,
                    'status': course.status,
                }
                for course in popular_courses
            ]
            
            # Ingresos por mes (últimos 6 meses)
            six_months_ago = timezone.now() - timedelta(days=180)
            revenue_by_month = Payment.objects.filter(
                status='approved',
                created_at__gte=six_months_ago
            ).annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                total=Sum('amount', output_field=DecimalField())
            ).order_by('month')
            
            revenue_by_month_data = [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'total': float(item['total']),
                }
                for item in revenue_by_month
            ]
            
            stats = {
                'courses': {
                    'total': total_courses,
                    'published': published_courses,
                    'draft': draft_courses,
                    'archived': archived_courses,
                },
                'users': {
                    'total': total_users,
                    'students': total_students,
                    'instructors': total_instructors,
                    'admins': total_admins,
                },
                'enrollments': {
                    'total': total_enrollments,
                    'active': active_enrollments,
                    'completed': completed_enrollments,
                },
                'payments': {
                    'total': total_payments,
                    'total_revenue': float(total_revenue),
                    'revenue_last_month': float(revenue_last_month),
                },
                'certificates': {
                    'total': total_certificates,
                },
                'popular_courses': popular_courses_data,
                'revenue_by_month': revenue_by_month_data,
            }
            
            logger.info(f"Estadísticas de admin obtenidas para usuario {user.id}")
            
            return UseCaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de admin: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener estadísticas: {str(e)}"
            )

