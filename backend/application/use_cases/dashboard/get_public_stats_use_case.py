"""
Caso de uso: Obtener estadísticas públicas - FagSol Escuela Virtual
"""

import logging
from django.db.models import Avg, Min, Q
from django.utils import timezone
from apps.courses.models import Course
from apps.core.models import UserProfile
from django.contrib.auth.models import User
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetPublicStatsUseCase:
    """
    Caso de uso: Obtener estadísticas públicas
    
    Responsabilidades:
    - Calcular estadísticas públicas para página de inicio
    - No requiere autenticación
    - Solo datos básicos y seguros
    """
    
    def execute(self) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener estadísticas públicas
        
        Returns:
            UseCaseResult con las estadísticas públicas
        """
        try:
            # Estadísticas de estudiantes
            total_students = UserProfile.objects.filter(role='student', user__is_active=True).count()
            
            # Cursos publicados
            published_courses = Course.objects.filter(status='published', is_active=True).count()
            
            # Estadísticas de instructores
            active_instructors = UserProfile.objects.filter(role='instructor', user__is_active=True).count()
            
            # Cursos creados por instructores o FagSol
            instructor_courses_queryset = Course.objects.filter(
                status='published',
                is_active=True
            ).filter(
                Q(created_by__profile__role='instructor') | Q(provider='fagsol')
            )
            
            instructor_courses_count = instructor_courses_queryset.count()
            
            # Calificación promedio
            avg_rating = instructor_courses_queryset.aggregate(
                avg=Avg('rating')
            )['avg'] or 0.00
            
            # Años de experiencia
            first_course_date = Course.objects.aggregate(Min('created_at'))['created_at__min']
            first_user_date = User.objects.filter(is_active=True).aggregate(Min('date_joined'))['date_joined__min']
            
            years_experience = 10  # Valor por defecto
            if first_course_date or first_user_date:
                reference_date = first_course_date if first_course_date else first_user_date
                if reference_date:
                    years_experience = max(10, (timezone.now() - reference_date).days // 365)
            
            stats = {
                'students': total_students,
                'courses': published_courses,
                'years_experience': years_experience,
                'instructors': {
                    'active': active_instructors,
                    'courses_created': instructor_courses_count,
                    'average_rating': float(avg_rating),
                },
            }
            
            logger.info(f"Estadísticas públicas obtenidas: {stats}")
            
            return UseCaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas públicas: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener estadísticas: {str(e)}"
            )

