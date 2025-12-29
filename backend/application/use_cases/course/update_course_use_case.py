"""
Caso de uso: Actualizar curso - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from decimal import Decimal
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from apps.courses.models import Course
from apps.users.permissions import has_perm, can_edit_course, is_admin
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class UpdateCourseUseCase:
    """
    Caso de uso: Actualizar curso existente
    
    Responsabilidades:
    - Validar permisos
    - Validar datos
    - Actualizar curso
    - Recalcular price_usd si cambia el precio
    """
    
    def __init__(self, currency_service=None):
        """
        Inicializa el caso de uso
        
        Args:
            currency_service: Servicio de conversión de monedas (inyección de dependencias)
        """
        self.currency_service = currency_service
    
    def _calculate_price_usd_from_pen(self, price_pen: Decimal) -> Decimal:
        """Calcula price_usd desde price (PEN)"""
        if price_pen <= 0:
            return Decimal('0.00')
        
        from django.conf import settings
        default_rate = Decimal(str(getattr(settings, 'DEFAULT_USD_TO_PEN_RATE', '3.75')))
        
        if self.currency_service:
            try:
                usd_to_pen_rate = self.currency_service.get_exchange_rate('USD', 'PEN')
                return (price_pen / usd_to_pen_rate).quantize(Decimal('0.01'))
            except Exception:
                pass
        
        return (price_pen / default_rate).quantize(Decimal('0.01'))
    
    def _is_valid_url(self, url: str) -> bool:
        """Valida si una URL es válida y segura"""
        import re
        from django.conf import settings
        
        if not url or not isinstance(url, str):
            return False
        
        url_pattern = re.compile(
            r'^https?://'
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
            r'localhost|'
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
            r'(?::\d+)?'
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(url):
            return False
        
        dangerous_patterns = ['127.0.0.1', 'localhost', '0.0.0.0', '192.168.', '10.', '172.16.']
        url_lower = url.lower()
        for pattern in dangerous_patterns:
            if pattern in url_lower and 'localhost' not in url_lower:
                if not getattr(settings, 'DEBUG', False):
                    return False
        
        return True
    
    def execute(
        self,
        user,
        course_id: str,
        **kwargs
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de actualizar curso
        
        Args:
            user: Usuario que actualiza el curso
            course_id: ID del curso
            **kwargs: Campos a actualizar
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Obtener curso
            try:
                if is_admin(user):
                    course = Course.objects.get(id=course_id)
                else:
                    course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return UseCaseResult(
                    success=False,
                    error_message="Curso no encontrado"
                )
            
            # 2. Validar permisos
            if not has_perm(user, 'courses.change_course'):
                return UseCaseResult(
                    success=False,
                    error_message="No tienes permiso para editar este curso"
                )
            
            # Validar estado del curso para instructores
            if not is_admin(user) and course.status in ['pending_review', 'published']:
                if course.status == 'pending_review':
                    return UseCaseResult(
                        success=False,
                        error_message="No puedes editar este curso mientras está en revisión. Espera a que se complete la revisión o se soliciten cambios."
                    )
                elif course.status == 'published':
                    return UseCaseResult(
                        success=False,
                        error_message="No puedes editar este curso mientras está publicado. Si necesitas hacer cambios, contacta a un administrador."
                    )
            
            # Verificar ownership
            if not can_edit_course(user, course):
                if not is_admin(user) and course.status in ['pending_review', 'published']:
                    if course.status == 'pending_review':
                        return UseCaseResult(
                            success=False,
                            error_message="No puedes editar este curso mientras está en revisión. Espera a que se complete la revisión o se soliciten cambios."
                        )
                    elif course.status == 'published':
                        return UseCaseResult(
                            success=False,
                            error_message="No puedes editar este curso mientras está publicado. Si necesitas hacer cambios, contacta a un administrador."
                        )
                return UseCaseResult(
                    success=False,
                    error_message="No tienes permiso para editar este curso"
                )
            
            # 3. Validar y actualizar campos
            if 'title' in kwargs:
                title = kwargs['title'].strip()
                if not title:
                    return UseCaseResult(
                        success=False,
                        error_message="El título no puede estar vacío"
                    )
                if len(title) > 200:
                    return UseCaseResult(
                        success=False,
                        error_message="El título no puede exceder 200 caracteres"
                    )
                course.title = title
                # Regenerar slug si cambió el título
                base_slug = slugify(title)
                slug = base_slug
                counter = 1
                while Course.objects.filter(slug=slug).exclude(id=course_id).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                course.slug = slug
            
            if 'description' in kwargs:
                description = kwargs['description'].strip()
                if not description:
                    return UseCaseResult(
                        success=False,
                        error_message="La descripción no puede estar vacía"
                    )
                course.description = description
            
            if 'price' in kwargs:
                price = kwargs['price']
                if price < 0:
                    return UseCaseResult(
                        success=False,
                        error_message="El precio no puede ser negativo"
                    )
                
                price_changed = course.price != price
                course.price = price
                
                # Recalcular price_usd si cambió el precio
                if price_changed and 'price_usd' not in kwargs and course.currency == 'PEN' and price > 0:
                    course.price_usd = self._calculate_price_usd_from_pen(price)
            
            if 'price_usd' in kwargs:
                price_usd = kwargs['price_usd']
                if price_usd is not None and price_usd < 0:
                    return UseCaseResult(
                        success=False,
                        error_message="El precio en USD no puede ser negativo"
                    )
                course.price_usd = price_usd
            
            if 'status' in kwargs:
                status = kwargs['status']
                valid_statuses = ['draft', 'pending_review', 'needs_revision', 'published', 'archived']
                if status not in valid_statuses:
                    return UseCaseResult(
                        success=False,
                        error_message="Estado inválido"
                    )
                
                # Validar cambios de estado para instructores
                if status == 'published' and course.status != 'published' and not is_admin(user):
                    return UseCaseResult(
                        success=False,
                        error_message="Los instructores no pueden publicar cursos directamente. Deben solicitar revisión."
                    )
                
                # Si se cambia de archived, reactivar
                if course.status == 'archived' and status != 'archived':
                    course.is_active = True
                
                # Manejar comentarios de revisión
                if status == 'needs_revision' and 'review_comments' in kwargs:
                    review_comments = kwargs['review_comments']
                    if review_comments and review_comments.strip() and is_admin(user):
                        from django.utils import timezone
                        course.review_comments = review_comments.strip()[:2000]
                        course.reviewed_by = user
                        course.reviewed_at = timezone.now()
                
                course.status = status
            
            # Manejar comentarios de revisión independientemente
            if 'review_comments' in kwargs:
                review_comments = kwargs['review_comments']
                final_status = kwargs.get('status', course.status)
                
                if final_status == 'needs_revision' and is_admin(user):
                    if review_comments and review_comments.strip():
                        from django.utils import timezone
                        course.review_comments = review_comments.strip()[:2000]
                        course.reviewed_by = user
                        course.reviewed_at = timezone.now()
                    elif review_comments == '' or review_comments is None:
                        course.review_comments = None
                        course.reviewed_by = None
                        course.reviewed_at = None
            
            # Actualizar otros campos
            if 'thumbnail_url' in kwargs:
                thumbnail_url = kwargs['thumbnail_url']
                if thumbnail_url and not self._is_valid_url(thumbnail_url):
                    return UseCaseResult(
                        success=False,
                        error_message="URL de miniatura inválida"
                    )
                course.thumbnail_url = thumbnail_url if thumbnail_url else None
            
            if 'banner_url' in kwargs:
                banner_url = kwargs['banner_url']
                if banner_url and not self._is_valid_url(banner_url):
                    return UseCaseResult(
                        success=False,
                        error_message="URL de banner inválida"
                    )
                course.banner_url = banner_url if banner_url else None
            
            if 'category' in kwargs:
                course.category = kwargs['category'].strip()[:100]
            
            if 'level' in kwargs:
                level = kwargs['level']
                if level in ['beginner', 'intermediate', 'advanced']:
                    course.level = level
            
            if 'discount_price' in kwargs:
                discount_price = kwargs['discount_price']
                if discount_price is not None and discount_price < 0:
                    return UseCaseResult(
                        success=False,
                        error_message="El precio con descuento no puede ser negativo"
                    )
                course.discount_price = discount_price
            
            if 'hours' in kwargs:
                hours = kwargs['hours']
                if hours < 0:
                    return UseCaseResult(
                        success=False,
                        error_message="Las horas no pueden ser negativas"
                    )
                course.hours = hours
            
            if 'instructor' in kwargs:
                instructor = kwargs['instructor']
                if not isinstance(instructor, dict):
                    return UseCaseResult(
                        success=False,
                        error_message="Instructor debe ser un objeto JSON"
                    )
                course.instructor = instructor
            
            if 'tags' in kwargs:
                tags = kwargs['tags']
                if not isinstance(tags, list):
                    return UseCaseResult(
                        success=False,
                        error_message="Tags debe ser una lista"
                    )
                course.tags = tags
            
            if 'short_description' in kwargs:
                course.short_description = kwargs['short_description'].strip()[:500]
            
            # 4. Guardar cambios
            course.save()
            
            logger.info(f"Curso actualizado: {course.id} por usuario {user.id}")
            
            return UseCaseResult(
                success=True,
                data={
                    'course': {
                        'id': course.id,
                        'title': course.title,
                        'status': course.status
                    }
                },
                extra={'course': course}
            )
            
        except ValidationError as e:
            logger.error(f"Error de validación al actualizar curso: {str(e)}")
            return UseCaseResult(
                success=False,
                error_message=f"Error de validación: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error al actualizar curso: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al actualizar curso: {str(e)}"
            )

