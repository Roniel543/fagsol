"""
Servicio de Aprobación de Cursos - FagSol Escuela Virtual
Sistema de aprobación de cursos

Este servicio maneja la lógica de negocio para aprobar/rechazar cursos.
"""

import logging
from typing import Tuple, Optional, Dict, Any
from django.contrib.auth.models import User
from django.utils import timezone
from apps.courses.models import Course
from apps.users.permissions import is_admin, is_instructor, can_edit_course

logger = logging.getLogger('apps')


class CourseApprovalService:
    """
    Servicio para gestionar la aprobación de cursos
    """
    
    def request_review(
        self,
        instructor_user: User,
        course_id: str
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Solicita revisión de un curso (instructor)
        
        Args:
            instructor_user: Usuario instructor que solicita la revisión
            course_id: ID del curso a revisar
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # 1. Validar que el usuario es instructor
            if not is_instructor(instructor_user):
                return False, None, "Solo los instructores pueden solicitar revisión de cursos"
            
            # 2. Obtener el curso
            try:
                course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return False, None, "Curso no encontrado"
            
            # 3. Validar que el instructor puede editar este curso
            if not can_edit_course(instructor_user, course):
                return False, None, "No tienes permiso para editar este curso"
            
            # 4. Validar que el curso puede solicitar revisión
            if not course.can_request_review():
                return False, None, f"El curso no puede solicitar revisión. Estado actual: {course.status}"
            
            # 5. Cambiar estado a pending_review
            course.status = 'pending_review'
            course.review_comments = None  # Limpiar comentarios previos
            course.save()
            
            # 6. Log de auditoría
            logger.info(
                f"Instructor {instructor_user.id} ({instructor_user.email}) solicitó revisión "
                f"del curso {course_id} ({course.title})"
            )
            
            # 7. Retornar datos
            return True, {
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'status': course.status,
                    'requested_at': timezone.now().isoformat()
                }
            }, ""
            
        except Exception as e:
            logger.error(f"Error solicitando revisión del curso {course_id}: {str(e)}")
            return False, None, f"Error interno al solicitar revisión: {str(e)}"
    
    def approve_course(
        self,
        admin_user: User,
        course_id: str,
        notes: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Aprueba un curso pendiente de revisión
        
        Args:
            admin_user: Usuario administrador que realiza la aprobación
            course_id: ID del curso a aprobar
            notes: Notas opcionales sobre la aprobación
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # 1. Validar que el usuario que aprueba es admin
            if not is_admin(admin_user):
                return False, None, "Solo los administradores pueden aprobar cursos"
            
            # 2. Obtener el curso
            try:
                course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return False, None, "Curso no encontrado"
            
            # 3. Validar estado actual
            if course.status == 'published':
                return False, None, "El curso ya está publicado"
            
            if course.status not in ['pending_review', 'needs_revision']:
                return False, None, f"El curso no está en estado pendiente de revisión. Estado actual: {course.status}"
            
            # 4. Sanitizar notas si se proporcionan
            review_comments = None
            if notes:
                review_comments = notes.strip()[:2000]  # Limitar longitud
            
            # 5. Aprobar curso
            course.status = 'published'
            course.reviewed_by = admin_user
            course.reviewed_at = timezone.now()
            course.review_comments = review_comments
            course.save()
            
            # 6. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) aprobó curso "
                f"{course_id} ({course.title})"
            )
            
            # 7. Retornar datos
            return True, {
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'status': course.status,
                    'reviewed_by': {
                        'id': admin_user.id,
                        'email': admin_user.email
                    },
                    'reviewed_at': course.reviewed_at.isoformat(),
                    'review_comments': course.review_comments
                }
            }, ""
            
        except Exception as e:
            logger.error(f"Error aprobando curso {course_id}: {str(e)}")
            return False, None, f"Error interno al aprobar curso: {str(e)}"
    
    def reject_course(
        self,
        admin_user: User,
        course_id: str,
        rejection_reason: str
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Rechaza un curso pendiente de revisión (requiere cambios)
        
        Args:
            admin_user: Usuario administrador que realiza el rechazo
            course_id: ID del curso a rechazar
            rejection_reason: Razón del rechazo (requerida)
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # 1. Validar que el usuario que rechaza es admin
            if not is_admin(admin_user):
                return False, None, "Solo los administradores pueden rechazar cursos"
            
            # 2. Validar razón de rechazo
            if not rejection_reason or not rejection_reason.strip():
                return False, None, "La razón de rechazo es requerida"
            
            # Sanitizar razón de rechazo (prevenir XSS)
            rejection_reason = rejection_reason.strip()[:2000]  # Limitar longitud
            
            # 3. Obtener el curso
            try:
                course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return False, None, "Curso no encontrado"
            
            # 4. Validar estado actual
            if course.status == 'needs_revision':
                return False, None, "El curso ya está marcado como requiere cambios"
            
            if course.status not in ['pending_review', 'published']:
                return False, None, f"El curso no está en estado pendiente de revisión. Estado actual: {course.status}"
            
            # 5. Rechazar curso (marcar como needs_revision)
            course.status = 'needs_revision'
            course.reviewed_by = admin_user
            course.reviewed_at = timezone.now()
            course.review_comments = rejection_reason
            course.save()
            
            # 6. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) rechazó curso "
                f"{course_id} ({course.title}). Razón: {rejection_reason[:100]}"
            )
            
            # 7. Retornar datos
            return True, {
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'status': course.status,
                    'reviewed_by': {
                        'id': admin_user.id,
                        'email': admin_user.email
                    },
                    'reviewed_at': course.reviewed_at.isoformat(),
                    'review_comments': course.review_comments
                }
            }, ""
            
        except Exception as e:
            logger.error(f"Error rechazando curso {course_id}: {str(e)}")
            return False, None, f"Error interno al rechazar curso: {str(e)}"
    
    def get_pending_courses(self) -> Tuple[bool, list, str]:
        """
        Obtiene la lista de cursos pendientes de revisión
        
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # Obtener cursos pendientes
            pending_courses = Course.objects.filter(
                status='pending_review',
                is_active=True
            ).select_related('created_by', 'reviewed_by').order_by('-created_at')
            
            courses_data = []
            for course in pending_courses:
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'slug': course.slug,
                    'description': course.description[:200] + '...' if len(course.description) > 200 else course.description,
                    'short_description': course.short_description,
                    'price': float(course.price),
                    'currency': course.currency,
                    'status': course.status,
                    'category': course.category,
                    'level': course.level,
                    'created_at': course.created_at.isoformat(),
                    'created_by': {
                        'id': course.created_by.id if course.created_by else None,
                        'email': course.created_by.email if course.created_by else None,
                        'username': course.created_by.username if course.created_by else None
                    } if course.created_by else None,
                    'instructor': course.instructor if course.instructor else {}
                }
                
                courses_data.append(course_data)
            
            return True, courses_data, ""
            
        except Exception as e:
            logger.error(f"Error obteniendo cursos pendientes: {str(e)}")
            return False, [], f"Error interno al obtener cursos pendientes: {str(e)}"
    
    def get_all_courses(self, status_filter: Optional[str] = None) -> Tuple[bool, list, str]:
        """
        Obtiene todos los cursos con filtro opcional por estado
        
        Args:
            status_filter: Filtro opcional ('pending_review', 'needs_revision', 'published', 'draft', 'archived')
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # Validar status_filter para prevenir inyección SQL
            ALLOWED_STATUSES = ['pending_review', 'needs_revision', 'published', 'draft', 'archived']
            if status_filter and status_filter not in ALLOWED_STATUSES:
                return False, [], f"Estado de filtro inválido. Valores permitidos: {', '.join(ALLOWED_STATUSES)}"
            
            # Query base
            # Si el filtro es 'archived', mostrar solo cursos archivados (pueden estar inactivos)
            # Para otros estados (incluyendo None/todos), excluir cursos archivados
            if status_filter == 'archived':
                queryset = Course.objects.filter(
                    status='archived'
                ).select_related('created_by', 'reviewed_by')
            else:
                # Para 'todos' y otros estados, excluir explícitamente los cursos archivados
                queryset = Course.objects.filter(
                    is_active=True
                ).exclude(status='archived').select_related('created_by', 'reviewed_by')
            
            # Aplicar filtro si existe y no es 'archived' (ya aplicado arriba)
            if status_filter and status_filter != 'archived':
                queryset = queryset.filter(status=status_filter)
            
            queryset = queryset.order_by('-created_at')
            
            courses_data = []
            for course in queryset:
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'slug': course.slug,
                    'description': course.description[:200] + '...' if len(course.description) > 200 else course.description,
                    'short_description': course.short_description,
                    'price': float(course.price),
                    'currency': course.currency,
                    'status': course.status,
                    'is_active': course.is_active,
                    'category': course.category,
                    'level': course.level,
                    'thumbnail_url': course.thumbnail_url,
                    'created_at': course.created_at.isoformat(),
                    'created_by': {
                        'id': course.created_by.id if course.created_by else None,
                        'email': course.created_by.email if course.created_by else None,
                        'username': course.created_by.username if course.created_by else None
                    } if course.created_by else None,
                    'instructor': course.instructor if course.instructor else {}
                }
                
                # Agregar información de revisión si existe
                if course.reviewed_by:
                    course_data['reviewed_by'] = {
                        'id': course.reviewed_by.id,
                        'email': course.reviewed_by.email
                    }
                    if course.reviewed_at:
                        course_data['reviewed_at'] = course.reviewed_at.isoformat()
                    if course.review_comments:
                        course_data['review_comments'] = course.review_comments
                
                courses_data.append(course_data)
            
            return True, courses_data, ""
            
        except Exception as e:
            logger.error(f"Error obteniendo cursos: {str(e)}")
            return False, [], f"Error interno al obtener cursos: {str(e)}"
    
    def get_course_status_counts(self) -> Tuple[bool, Dict[str, int], str]:
        """
        Obtiene contadores de cursos por estado
        
        Returns:
            Tuple[success, counts_dict, error_message]
        """
        try:
            from apps.courses.models import Course
            
            # Contadores: todos los estados cuentan solo cursos activos, excluyendo archivados
            # Para archived, incluimos todos los cursos con status='archived' (pueden estar inactivos)
            counts = {
                'all': Course.objects.filter(is_active=True).exclude(status='archived').count(),  # Solo activos, sin archivados
                'published': Course.objects.filter(status='published', is_active=True).count(),
                'draft': Course.objects.filter(status='draft', is_active=True).count(),
                'pending_review': Course.objects.filter(status='pending_review', is_active=True).count(),
                'needs_revision': Course.objects.filter(status='needs_revision', is_active=True).count(),
                'archived': Course.objects.filter(status='archived').count(),  # Todos los archivados (pueden estar inactivos)
            }
            
            return True, counts, ""
            
        except Exception as e:
            logger.error(f"Error obteniendo contadores de cursos: {str(e)}")
            return False, {}, f"Error interno al obtener contadores: {str(e)}"

