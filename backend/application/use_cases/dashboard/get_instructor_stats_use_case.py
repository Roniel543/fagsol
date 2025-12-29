"""
Caso de uso: Obtener estadísticas de instructor - FagSol Escuela Virtual
"""

import logging
from django.db.models import Count, Avg
from apps.courses.models import Course
from apps.users.models import Enrollment, Certificate
from apps.users.permissions import is_instructor
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetInstructorStatsUseCase:
    """
    Caso de uso: Obtener estadísticas de instructor
    
    Responsabilidades:
    - Validar permisos (solo instructor)
    - Calcular estadísticas de cursos del instructor
    - Calcular estadísticas de enrollments
    - Calcular calificación promedio
    - Obtener cursos más populares
    """
    
    def execute(self, user) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener estadísticas de instructor
        
        Args:
            user: Usuario autenticado (debe ser instructor)
            
        Returns:
            UseCaseResult con las estadísticas
        """
        try:
            # Validar permisos
            if not is_instructor(user):
                return UseCaseResult(
                    success=False,
                    error_message="No tienes permiso para ver estadísticas de instructor"
                )
            
            # Cursos del instructor
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
            
            # Estudiantes únicos
            unique_students = instructor_enrollments.values('user').distinct().count()
            
            # Cursos más populares del instructor
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
            
            # Calificación promedio
            avg_rating = instructor_courses.aggregate(
                avg=Avg('rating')
            )['avg'] or 0.00
            
            # Certificados emitidos
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
            
            return UseCaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de instructor: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener estadísticas: {str(e)}"
            )

