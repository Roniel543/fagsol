"""
Caso de uso: Obtener estadísticas de estudiante - FagSol Escuela Virtual
"""

import logging
from django.db.models import Avg
from apps.users.models import Enrollment, Certificate
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class GetStudentStatsUseCase:
    """
    Caso de uso: Obtener estadísticas de estudiante
    
    Responsabilidades:
    - Calcular estadísticas de enrollments del estudiante
    - Calcular progreso promedio
    - Obtener certificados
    - Obtener cursos recientes y completados
    """
    
    def execute(self, user) -> UseCaseResult:
        """
        Ejecuta el caso de uso de obtener estadísticas de estudiante
        
        Args:
            user: Usuario autenticado
            
        Returns:
            UseCaseResult con las estadísticas
        """
        try:
            # Enrollments del estudiante
            student_enrollments = Enrollment.objects.filter(user=user).select_related('course')
            total_enrollments = student_enrollments.count()
            active_enrollments = student_enrollments.filter(status='active').count()
            completed_enrollments = student_enrollments.filter(status='completed').count()
            
            # Progreso promedio
            if total_enrollments > 0:
                avg_progress = student_enrollments.aggregate(
                    avg=Avg('completion_percentage')
                )['avg'] or 0.00
            else:
                avg_progress = 0.00
            
            # Certificados obtenidos
            certificates_count = Certificate.objects.filter(user=user).count()
            
            # Cursos en progreso
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
            
            return UseCaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de estudiante para usuario {user.id}: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al obtener estadísticas: {str(e)}"
            )

