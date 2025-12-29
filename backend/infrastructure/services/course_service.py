"""
Servicio de Cursos - FagSol Escuela Virtual
Maneja la lógica de negocio para CRUD de cursos

⚠️ DEPRECATED: Este servicio ha sido migrado a casos de uso.
Usar application.use_cases.course en su lugar:
- CreateCourseUseCase - Reemplaza CourseService.create_course()
- UpdateCourseUseCase - Reemplaza CourseService.update_course()
- DeleteCourseUseCase - Reemplaza CourseService.delete_course()

Este archivo se mantiene temporalmente para compatibilidad.
Se eliminará en una versión futura.
"""

import logging
import re
from typing import Dict, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings
from apps.courses.models import Course, Module, Lesson
from apps.users.permissions import can_edit_course, is_admin

logger = logging.getLogger('apps')


class CourseService:
    """
    Servicio de cursos que maneja la lógica de negocio
    """
    
    def __init__(self):
        # Obtener tasa de cambio USD -> PEN desde settings
        self.default_usd_to_pen_rate = Decimal(str(getattr(settings, 'DEFAULT_USD_TO_PEN_RATE', '3.75')))
    
    def _calculate_price_usd_from_pen(self, price_pen: Decimal) -> Decimal:
        """
        Calcula price_usd desde price (PEN) usando la tasa REAL de la API
        
        Intenta obtener la tasa real de la API. Si falla, usa la tasa por defecto.
        El price_usd calculado se guarda y NO se recalcula automáticamente (fijo).
        
        Args:
            price_pen: Precio en PEN
            
        Returns:
            Precio en USD redondeado a 2 decimales
        """
        if price_pen <= 0:
            return Decimal('0.00')
        
        # Intentar obtener tasa real de la API
        try:
            from infrastructure.services.currency_service import CurrencyService
            currency_service = CurrencyService()
            
            # Obtener tasa USD -> PEN (necesitamos la inversa: PEN -> USD)
            # La API devuelve tasa USD -> PEN, necesitamos 1 / tasa para convertir PEN -> USD
            usd_to_pen_rate = currency_service.get_exchange_rate('USD', 'PEN')
            
            # Convertir PEN a USD: dividir por la tasa
            price_usd = price_pen / usd_to_pen_rate
            logger.info(
                f"Calculado price_usd usando tasa REAL de API: "
                f"{price_pen} PEN -> {price_usd} USD (tasa: {usd_to_pen_rate})"
            )
            
        except Exception as e:
            # Si falla la API, usar tasa por defecto como fallback
            logger.warning(
                f"Error al obtener tasa real de API, usando tasa por defecto: {str(e)}"
            )
            price_usd = price_pen / self.default_usd_to_pen_rate
            logger.info(
                f"Calculado price_usd usando tasa por defecto: "
                f"{price_pen} PEN -> {price_usd} USD (tasa: {self.default_usd_to_pen_rate})"
            )
        
        return price_usd.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def create_course(
        self,
        user,
        title: str,
        description: str,
        price: Decimal,
        **kwargs
    ) -> Tuple[bool, Optional[Course], str]:
        """
        Crea un nuevo curso
        
        Args:
            user: Usuario que crea el curso (debe ser admin o instructor)
            title: Título del curso
            description: Descripción del curso
            price: Precio del curso
            **kwargs: Campos adicionales (slug, status, category, etc.)
        
        Returns:
            Tuple[success, course, error_message]
        """
        try:
            # 1. Validar permisos 
            from apps.users.permissions import can_create_course
            if not can_create_course(user):
                return False, None, "No tienes permiso para crear cursos. Los instructores deben estar aprobados por un administrador."
            
            # 2. Validar campos requeridos
            if not title or not title.strip():
                return False, None, "El título es requerido"
            
            if not description or not description.strip():
                return False, None, "La descripción es requerida"
            
            if price < 0:
                return False, None, "El precio no puede ser negativo"
            
            # 3. Sanitizar y validar título
            title = title.strip()
            if len(title) > 200:
                return False, None, "El título no puede exceder 200 caracteres"
            
            # 4. Generar slug único
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # 5. Generar ID único
            course_id = self._generate_course_id()
            
            # 6. Validar y sanitizar campos opcionales
            # Instructores solo pueden crear cursos en draft
            # Solo admin puede establecer otros estados directamente
            status = kwargs.get('status', 'draft')
            # Si es instructor, forzar draft (no puede publicar directamente)
            if not is_admin(user):
                status = 'draft'
            elif status not in ['draft', 'pending_review', 'needs_revision', 'published', 'archived']:
                status = 'draft'
            
            category = kwargs.get('category', 'General').strip()[:100]
            level = kwargs.get('level', 'beginner')
            if level not in ['beginner', 'intermediate', 'advanced']:
                level = 'beginner'
            
            # 7. Validar URLs si se proporcionan
            thumbnail_url = kwargs.get('thumbnail_url', '')
            if thumbnail_url and not self._is_valid_url(thumbnail_url):
                return False, None, "URL de miniatura inválida"
            
            banner_url = kwargs.get('banner_url', '')
            if banner_url and not self._is_valid_url(banner_url):
                return False, None, "URL de banner inválida"
            
            # 8. Validar instructor (JSON)
            instructor = kwargs.get('instructor', {})
            if instructor and not isinstance(instructor, dict):
                return False, None, "Instructor debe ser un objeto JSON"
            
            # 9. Validar tags
            tags = kwargs.get('tags', [])
            if tags and not isinstance(tags, list):
                return False, None, "Tags debe ser una lista"
            
            # 10. Determinar provider automáticamente si no se proporciona
            # Si el usuario es instructor, el provider debe ser 'instructor'
            # Si es admin, puede ser 'fagsol' o el que se especifique
            provider = kwargs.get('provider')
            if not provider:
                # Determinar provider basado en el rol del usuario
                from apps.users.permissions import get_user_role, ROLE_INSTRUCTOR
                user_role = get_user_role(user)
                if user_role == ROLE_INSTRUCTOR:
                    provider = 'instructor'
                else:
                    provider = 'fagsol'
            
            # 11. Calcular price_usd si no se proporciona (Opción C: Híbrido Mejorado)
            # Si el admin ingresa precio en PEN, calcular price_usd automáticamente UNA VEZ
            # El price_usd calculado se guarda y NO se recalcula (fijo)
            price_usd = kwargs.get('price_usd')
            currency = kwargs.get('currency', 'PEN')
            
            if price_usd is None and currency == 'PEN' and price > 0:
                # Calcular price_usd desde price (PEN) usando tasa real de la API
                # Este cálculo se hace UNA VEZ y el valor queda FIJO
                price_usd = self._calculate_price_usd_from_pen(price)
                # El log ya está en _calculate_price_usd_from_pen
            elif price_usd is None:
                # Si no hay precio o no es PEN, price_usd queda None
                price_usd = None
            
            # 12. Crear curso
            course = Course.objects.create(
                id=course_id,
                title=title,
                slug=slug,
                description=description.strip(),
                short_description=kwargs.get('short_description', description[:500].strip()),
                price=price,
                price_usd=price_usd,
                currency=currency,
                status=status,
                is_active=kwargs.get('is_active', True),
                thumbnail_url=thumbnail_url if thumbnail_url else None,
                banner_url=banner_url if banner_url else None,
                category=category,
                level=level,
                provider=provider,
                discount_price=kwargs.get('discount_price'),
                hours=kwargs.get('hours', 0),
                rating=kwargs.get('rating', Decimal('0.00')),
                ratings_count=kwargs.get('ratings_count', 0),
                instructor=instructor,
                tags=tags,
                order=kwargs.get('order', 0),
                created_by=user
            )
            
            logger.info(f"Curso creado: {course.id} por usuario {user.id}")
            return True, course, ""
            
        except ValidationError as e:
            logger.error(f"Error de validación al crear curso: {str(e)}")
            return False, None, f"Error de validación: {str(e)}"
        except Exception as e:
            logger.error(f"Error al crear curso: {str(e)}")
            return False, None, f"Error al crear curso: {str(e)}"
    
    def update_course(
        self,
        user,
        course_id: str,
        **kwargs
    ) -> Tuple[bool, Optional[Course], str]:
        """
        Actualiza un curso existente
        
        Args:
            user: Usuario que actualiza el curso
            course_id: ID del curso
            **kwargs: Campos a actualizar
        
        Returns:
            Tuple[success, course, error_message]
        """
        try:
            # 1. Obtener curso
            # Los administradores pueden actualizar cualquier curso (incluso archivados)
            # Los instructores solo pueden actualizar cursos activos
            try:
                if is_admin(user):
                    # Admin puede actualizar cualquier curso
                    course = Course.objects.get(id=course_id)
                else:
                    # Instructor solo puede actualizar cursos activos
                    course = Course.objects.get(id=course_id, is_active=True)
            except Course.DoesNotExist:
                return False, None, "Curso no encontrado"
            
            # 2. Validar permisos
            # Validar permisos usando Django permissions
            from apps.users.permissions import has_perm
            if not has_perm(user, 'courses.change_course'):
                return False, None, "No tienes permiso para editar este curso"
            
            # Validar estado del curso para instructores
            # Los instructores NO pueden editar cursos en pending_review o published
            if not is_admin(user) and course.status in ['pending_review', 'published']:
                if course.status == 'pending_review':
                    return False, None, "No puedes editar este curso mientras está en revisión. Espera a que se complete la revisión o se soliciten cambios."
                elif course.status == 'published':
                    return False, None, "No puedes editar este curso mientras está publicado. Si necesitas hacer cambios, contacta a un administrador."
            
            # También verificar ownership (instructores solo pueden editar sus cursos)
            if not can_edit_course(user, course):
                # can_edit_course ya valida el estado, pero damos un mensaje más genérico aquí
                if not is_admin(user) and course.status in ['pending_review', 'published']:
                    if course.status == 'pending_review':
                        return False, None, "No puedes editar este curso mientras está en revisión. Espera a que se complete la revisión o se soliciten cambios."
                    elif course.status == 'published':
                        return False, None, "No puedes editar este curso mientras está publicado. Si necesitas hacer cambios, contacta a un administrador."
                return False, None, "No tienes permiso para editar este curso"
            
            # 3. Validar y actualizar campos
            if 'title' in kwargs:
                title = kwargs['title'].strip()
                if not title:
                    return False, None, "El título no puede estar vacío"
                if len(title) > 200:
                    return False, None, "El título no puede exceder 200 caracteres"
                course.title = title
                # Regenerar slug si cambió el título
                if course.title != title:
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
                    return False, None, "La descripción no puede estar vacía"
                course.description = description
            
            if 'price' in kwargs:
                price = kwargs['price']
                if price < 0:
                    return False, None, "El precio no puede ser negativo"
                
                price_changed = course.price != price
                
                course.price = price
                
                # Si se actualiza el precio en PEN y no se proporciona price_usd,
                # recalcular price_usd automáticamente usando tasa real de la API
                # Esto asegura que price_usd se actualice solo cuando cambia el precio
                if price_changed and 'price_usd' not in kwargs and course.currency == 'PEN' and price > 0:
                    course.price_usd = self._calculate_price_usd_from_pen(price)
                    # El log ya está en _calculate_price_usd_from_pen
                # Si el precio no cambió, mantener price_usd existente (fijo)
            
            # Si se proporciona price_usd explícitamente, usarlo (permite override manual)
            if 'price_usd' in kwargs:
                price_usd = kwargs['price_usd']
                if price_usd is not None and price_usd < 0:
                    return False, None, "El precio en USD no puede ser negativo"
                course.price_usd = price_usd
                logger.info(f"price_usd actualizado manualmente: {price_usd} USD")
            
            if 'status' in kwargs:
                status = kwargs['status']
                # Validar nuevos estados
                valid_statuses = ['draft', 'pending_review', 'needs_revision', 'published', 'archived']
                if status not in valid_statuses:
                    return False, None, "Estado inválido"
                
                # Si el instructor intenta cambiar a published, pero el curso ya está published,
                # permitir mantener el estado (no es un cambio real)
                if status == 'published' and course.status == 'published' and not is_admin(user):
                    # El curso ya está publicado, no es un cambio, permitir continuar
                    pass
                # Instructores no pueden cambiar a published directamente (solo si es un cambio real)
                elif status == 'published' and course.status != 'published' and not is_admin(user):
                    return False, None, "Los instructores no pueden publicar cursos directamente. Deben solicitar revisión."
                else:
                    # Permitir el cambio de estado
                    # Si el curso estaba archivado y se cambia a otro estado, reactivarlo automáticamente
                    if course.status == 'archived' and status != 'archived':
                        course.is_active = True
                    
                    # Si se cambia a needs_revision y se proporcionan comentarios, guardarlos
                    if status == 'needs_revision' and 'review_comments' in kwargs:
                        review_comments = kwargs['review_comments']
                        if review_comments and review_comments.strip():
                            # Solo admins pueden agregar comentarios de revisión
                            if is_admin(user):
                                from django.utils import timezone
                                course.review_comments = review_comments.strip()[:2000]  # Limitar a 2000 caracteres
                                course.reviewed_by = user
                                course.reviewed_at = timezone.now()
                    
                    course.status = status
            
            # Manejar comentarios de revisión independientemente del cambio de estado
            # Esto permite actualizar comentarios incluso si el curso ya está en needs_revision
            if 'review_comments' in kwargs:
                review_comments = kwargs['review_comments']
                # Solo permitir si el curso está o estará en needs_revision
                final_status = kwargs.get('status', course.status)
                
                if final_status == 'needs_revision' and is_admin(user):
                    if review_comments and review_comments.strip():
                        from django.utils import timezone
                        course.review_comments = review_comments.strip()[:2000]
                        course.reviewed_by = user
                        course.reviewed_at = timezone.now()
                    elif review_comments == '' or review_comments is None:
                        # Si se envía vacío, limpiar comentarios (solo admin)
                        course.review_comments = None
                        course.reviewed_by = None
                        course.reviewed_at = None
            
            if 'thumbnail_url' in kwargs:
                thumbnail_url = kwargs['thumbnail_url']
                if thumbnail_url and not self._is_valid_url(thumbnail_url):
                    return False, None, "URL de miniatura inválida"
                course.thumbnail_url = thumbnail_url if thumbnail_url else None
            
            if 'banner_url' in kwargs:
                banner_url = kwargs['banner_url']
                if banner_url and not self._is_valid_url(banner_url):
                    return False, None, "URL de banner inválida"
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
                    return False, None, "El precio con descuento no puede ser negativo"
                course.discount_price = discount_price
            
            if 'hours' in kwargs:
                hours = kwargs['hours']
                if hours < 0:
                    return False, None, "Las horas no pueden ser negativas"
                course.hours = hours
            
            if 'instructor' in kwargs:
                instructor = kwargs['instructor']
                if not isinstance(instructor, dict):
                    return False, None, "Instructor debe ser un objeto JSON"
                course.instructor = instructor
            
            if 'tags' in kwargs:
                tags = kwargs['tags']
                if not isinstance(tags, list):
                    return False, None, "Tags debe ser una lista"
                course.tags = tags
            
            if 'short_description' in kwargs:
                course.short_description = kwargs['short_description'].strip()[:500]
            
            # 4. Guardar cambios
            course.save()
            
            logger.info(f"Curso actualizado: {course.id} por usuario {user.id}")
            return True, course, ""
            
        except ValidationError as e:
            logger.error(f"Error de validación al actualizar curso: {str(e)}")
            return False, None, f"Error de validación: {str(e)}"
        except Exception as e:
            logger.error(f"Error al actualizar curso: {str(e)}")
            return False, None, f"Error al actualizar curso: {str(e)}"
    
    def delete_course(
        self,
        user,
        course_id: str
    ) -> Tuple[bool, str]:
        """
        Elimina (archiva) un curso (soft delete)
        
        Args:
            user: Usuario que elimina el curso (admin o instructor con permisos)
            course_id: ID del curso
        
        Returns:
            Tuple[success, error_message]
        """
        try:
            # 1. Obtener curso
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return False, "Curso no encontrado"
            
            # 2. Validar permisos usando la policy can_delete_course
            from apps.users.permissions import can_delete_course
            can_delete, message = can_delete_course(user, course)
            
            if not can_delete:
                return False, message
            
            # 3. Si hay mensaje de advertencia (para admins con estudiantes), incluirlo en el log
            if message and "Advertencia" in message:
                logger.warning(f"Eliminación de curso con estudiantes: {course.id} por usuario {user.id}. {message}")
            
            # 4. Soft delete (cambiar status a archived y desactivar)
            # Usar update() para asegurar que se guarde correctamente
            Course.objects.filter(id=course_id).update(
                status='archived',
                is_active=False
            )
            
            # Refrescar el objeto desde la BD para confirmar
            course.refresh_from_db()
            
            logger.info(f"Curso archivado: {course.id} por usuario {user.id}. Status: {course.status}, is_active: {course.is_active}")
            return True, message if message else ""
            
        except Exception as e:
            logger.error(f"Error al eliminar curso: {str(e)}")
            return False, f"Error al eliminar curso: {str(e)}"
    
    def _generate_course_id(self) -> str:
        """
        Genera un ID único para un curso
        Formato: c-001, c-002, etc.
        """
        # Obtener el último ID numérico
        last_course = Course.objects.filter(id__startswith='c-').order_by('-id').first()
        
        if last_course:
            # Extraer número del último ID
            match = re.search(r'c-(\d+)', last_course.id)
            if match:
                last_num = int(match.group(1))
                new_num = last_num + 1
            else:
                new_num = 1
        else:
            new_num = 1
        
        return f"c-{new_num:03d}"
    
    def _is_valid_url(self, url: str) -> bool:
        """
        Valida si una URL es válida y segura
        Previene SSRF
        """
        if not url or not isinstance(url, str):
            return False
        
        # Validar formato básico de URL
        url_pattern = re.compile(
            r'^https?://'  # http:// o https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # dominio
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # puerto opcional
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(url):
            return False
        
        # Prevenir SSRF: no permitir URLs locales/privadas
        dangerous_patterns = [
            '127.0.0.1',
            'localhost',
            '0.0.0.0',
            '192.168.',
            '10.',
            '172.16.',
        ]
        
        url_lower = url.lower()
        for pattern in dangerous_patterns:
            if pattern in url_lower and 'localhost' not in url_lower:
                # Permitir localhost solo en desarrollo
                from django.conf import settings
                if settings.DEBUG:
                    continue
                return False
        
        return True

