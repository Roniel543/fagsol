"""
Servicio de Dashboard - FagSol Escuela Virtual
Maneja la lógica de negocio para estadísticas del dashboard según rol

⚠️ DEPRECATED: Este servicio ha sido migrado a casos de uso.
Usar application.use_cases.dashboard en su lugar:
- GetAdminStatsUseCase - Reemplaza DashboardService.get_admin_stats()
- GetInstructorStatsUseCase - Reemplaza DashboardService.get_instructor_stats()
- GetStudentStatsUseCase - Reemplaza DashboardService.get_student_stats()
- GetPublicStatsUseCase - Reemplaza DashboardService.get_public_stats()
- GetDashboardStatsUseCase - Reemplaza DashboardService.get_dashboard_stats()

Este archivo se mantiene temporalmente para compatibilidad.
Se eliminará en una versión futura.
"""

import logging
from typing import Dict, Optional, Tuple
from django.db.models import Count, Sum, Avg, Q, DecimalField, Min
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate
from apps.payments.models import Payment, PaymentIntent
from apps.core.models import UserProfile
from django.contrib.auth.models import User

logger = logging.getLogger('apps')


class DashboardService:
    """
    Servicio de dashboard que maneja estadísticas según el rol del usuario
    """
    
    def __init__(self):
        pass
    
    def get_admin_stats(self, user) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene estadísticas para administradores
        
        Args:
            user: Usuario autenticado (debe ser admin)
        
        Returns:
            Tuple[success, stats_dict, error_message]
        """
        try:
            # Validar permisos
            from apps.users.permissions import is_admin
            if not is_admin(user):
                return False, None, "No tienes permiso para ver estadísticas de administrador"
            
            # Estadísticas generales
            # Total: solo cursos activos, excluyendo archivados (consistente con admin)
            total_courses = Course.objects.filter(is_active=True).exclude(status='archived').count()
            published_courses = Course.objects.filter(status='published', is_active=True).count()
            # Borradores: solo activos, excluyendo archivados
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
            # Solo mostrar cursos publicados y activos (los borradores no deberían aparecer en "más populares")
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
            return True, stats, ""
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de admin: {str(e)}")
            return False, None, f"Error al obtener estadísticas: {str(e)}"
    
    def get_instructor_stats(self, user) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene estadísticas para instructores
        
        Args:
            user: Usuario autenticado (debe ser instructor)
        
        Returns:
            Tuple[success, stats_dict, error_message]
        """
        try:
            # Validar permisos
            from apps.users.permissions import is_instructor
            if not is_instructor(user):
                return False, None, "No tienes permiso para ver estadísticas de instructor"
            
            # Cursos del instructor
            # Cursos del instructor: solo activos, excluyendo archivados
            instructor_courses = Course.objects.filter(
                created_by=user,
                is_active=True
            ).exclude(status='archived')
            
            total_courses = instructor_courses.count()
            published_courses = instructor_courses.filter(status='published').count()
            draft_courses = instructor_courses.filter(status='draft').count()
            
            # Enrollments en cursos del instructor
            instructor_enrollments = Enrollment.objects.filter(course__created_by=user)
            total_enrollments = instructor_enrollments.count()
            active_enrollments = instructor_enrollments.filter(status='active').count()
            completed_enrollments = instructor_enrollments.filter(status='completed').count()
            
            # Estudiantes únicos en cursos del instructor
            unique_students = instructor_enrollments.values('user').distinct().count()
            
            # Cursos más populares del instructor (ya excluye archivados en instructor_courses)
            popular_courses = instructor_courses.annotate(
                enrollment_count=Count('enrollments')
            ).order_by('-enrollment_count')[:5]
            
            popular_courses_data = [
                {
                    'id': course.id,
                    'title': course.title,
                    'slug': course.slug,
                    'enrollments': course.enrollment_count,
                    'status': course.status,
                }
                for course in popular_courses
            ]
            
            # Calificación promedio de cursos del instructor
            avg_rating = instructor_courses.aggregate(
                avg=Avg('rating')
            )['avg'] or 0.00
            
            # Certificados emitidos para cursos del instructor
            certificates_count = Certificate.objects.filter(
                course__created_by=user
            ).count()
            
            stats = {
                'courses': {
                    'total': total_courses,
                    'published': published_courses,
                    'draft': draft_courses,
                },
                'enrollments': {
                    'total': total_enrollments,
                    'active': active_enrollments,
                    'completed': completed_enrollments,
                },
                'students': {
                    'unique': unique_students,
                },
                'rating': {
                    'average': float(avg_rating),
                },
                'certificates': {
                    'total': certificates_count,
                },
                'popular_courses': popular_courses_data,
            }
            
            logger.info(f"Estadísticas de instructor obtenidas para usuario {user.id}")
            return True, stats, ""
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de instructor: {str(e)}")
            return False, None, f"Error al obtener estadísticas: {str(e)}"
    
    def get_student_stats(self, user) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene estadísticas para estudiantes
        
        Args:
            user: Usuario autenticado
        
        Returns:
            Tuple[success, stats_dict, error_message]
        """
        try:
            # Enrollments del estudiante
            student_enrollments = Enrollment.objects.filter(user=user).select_related('course')
            total_enrollments = student_enrollments.count()
            active_enrollments = student_enrollments.filter(status='active').count()
            completed_enrollments = student_enrollments.filter(status='completed').count()
            
            # Progreso promedio (solo si hay enrollments)
            if total_enrollments > 0:
                avg_progress = student_enrollments.aggregate(
                    avg=Avg('completion_percentage')
                )['avg'] or 0.00
            else:
                avg_progress = 0.00
            
            # Certificados obtenidos
            certificates_count = Certificate.objects.filter(user=user).count()
            
            # Cursos en progreso (con progreso > 0 y < 100)
            in_progress = student_enrollments.filter(
                status='active',
                completion_percentage__gt=0,
                completion_percentage__lt=100
            ).count()
            
            # Cursos recientes (últimos 5)
            recent_enrollments = student_enrollments.order_by('-enrolled_at')[:5]
            recent_courses_data = []
            for enrollment in recent_enrollments:
                try:
                    recent_courses_data.append({
                        'id': enrollment.course.id if enrollment.course else '',
                        'title': enrollment.course.title if enrollment.course else 'Curso eliminado',
                        'slug': enrollment.course.slug if enrollment.course else '',
                        'thumbnail_url': enrollment.course.thumbnail_url if enrollment.course and enrollment.course.thumbnail_url else '',
                        'progress': float(enrollment.completion_percentage),
                        'status': enrollment.status,
                        'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else '',
                    })
                except Exception as e:
                    logger.warning(f"Error al procesar enrollment {enrollment.id}: {str(e)}")
                    continue
            
            # Cursos completados
            completed_courses_data = []
            completed_enrollments_list = student_enrollments.filter(status='completed')[:5]
            for enrollment in completed_enrollments_list:
                try:
                    has_cert = Certificate.objects.filter(
                        user=user,
                        course=enrollment.course
                    ).exists() if enrollment.course else False
                    
                    completed_courses_data.append({
                        'id': enrollment.course.id if enrollment.course else '',
                        'title': enrollment.course.title if enrollment.course else 'Curso eliminado',
                        'slug': enrollment.course.slug if enrollment.course else '',
                        'thumbnail_url': enrollment.course.thumbnail_url if enrollment.course and enrollment.course.thumbnail_url else '',
                        'completed_at': enrollment.completed_at.isoformat() if enrollment.completed_at else None,
                        'has_certificate': has_cert,
                    })
                except Exception as e:
                    logger.warning(f"Error al procesar enrollment completado {enrollment.id}: {str(e)}")
                    continue
            
            stats = {
                'enrollments': {
                    'total': total_enrollments,
                    'active': active_enrollments,
                    'completed': completed_enrollments,
                    'in_progress': in_progress,
                },
                'progress': {
                    'average': float(avg_progress),
                },
                'certificates': {
                    'total': certificates_count,
                },
                'recent_courses': recent_courses_data,
                'completed_courses': completed_courses_data,
            }
            
            logger.info(f"Estadísticas de estudiante obtenidas para usuario {user.id}: {total_enrollments} enrollments")
            return True, stats, ""
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de estudiante para usuario {user.id}: {str(e)}", exc_info=True)
            return False, None, f"Error al obtener estadísticas: {str(e)}"
    
    def get_public_stats(self) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene estadísticas públicas para mostrar en la página de inicio
        No requiere autenticación - solo datos básicos y seguros
        
        Returns:
            Tuple[success, stats_dict, error_message]
        """
        try:
            # Estadísticas de estudiantes (usuarios activos con rol student)
            total_students = UserProfile.objects.filter(role='student', user__is_active=True).count()
            
            # Cursos publicados
            published_courses = Course.objects.filter(status='published', is_active=True).count()
            
            # Estadísticas de instructores (para TeacherSection)
            # Instructores activos (con user activo)
            active_instructors = UserProfile.objects.filter(role='instructor', user__is_active=True).count()
            
            # Cursos creados por instructores (solo publicados y activos)
            # Incluir cursos donde created_by es un instructor O provider es 'fagsol'
            instructor_courses_queryset = Course.objects.filter(
                status='published',
                is_active=True
            ).filter(
                Q(created_by__profile__role='instructor') | Q(provider='fagsol')
            )
            
            instructor_courses_count = instructor_courses_queryset.count()
            
            # Calificación promedio de cursos de instructores (solo publicados)
            avg_rating = instructor_courses_queryset.aggregate(
                avg=Avg('rating')
            )['avg'] or 0.00
            
            # Años de experiencia (calculado desde la fecha de creación del primer curso o usuario)
            # Usar la fecha más antigua entre cursos o usuarios como referencia
            first_course_date = Course.objects.aggregate(Min('created_at'))['created_at__min']
            first_user_date = User.objects.filter(is_active=True).aggregate(Min('date_joined'))['date_joined__min']
            
            # Calcular años de experiencia desde la fecha más antigua
            years_experience = 10  # Valor por defecto
            if first_course_date or first_user_date:
                from datetime import datetime
                reference_date = first_course_date if first_course_date else first_user_date
                if reference_date:
                    years_experience = max(10, (timezone.now() - reference_date).days // 365)
            
            stats = {
                'students': total_students,
                'courses': published_courses,
                'years_experience': years_experience,
                # Estadísticas de instructores
                'instructors': {
                    'active': active_instructors,
                    'courses_created': instructor_courses_count,
                    'average_rating': float(avg_rating),
                },
            }
            
            logger.info(f"Estadísticas públicas obtenidas: {stats}")
            return True, stats, ""
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas públicas: {str(e)}")
            return False, None, f"Error al obtener estadísticas: {str(e)}"
    
    def get_dashboard_stats(self, user) -> Tuple[bool, Optional[Dict], str]:
        """
        Obtiene estadísticas del dashboard según el rol del usuario
        
        Args:
            user: Usuario autenticado
        
        Returns:
            Tuple[success, stats_dict, error_message]
        """
        try:
            from apps.users.permissions import get_user_role
            
            role = get_user_role(user)
            
            if role == 'admin':
                return self.get_admin_stats(user)
            elif role == 'instructor':
                return self.get_instructor_stats(user)
            elif role == 'student':
                return self.get_student_stats(user)
            else:
                # Para guests o roles no definidos, retornar stats básicos
                return True, {
                    'role': role,
                    'message': 'No hay estadísticas disponibles para tu rol',
                }, ""
                
        except Exception as e:
            logger.error(f"Error al obtener estadísticas del dashboard: {str(e)}")
            return False, None, f"Error al obtener estadísticas: {str(e)}"

