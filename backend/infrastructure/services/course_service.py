"""
Servicio de Cursos - FagSol Escuela Virtual
Maneja la lógica de negocio para CRUD de cursos
"""

import logging
import re
from typing import Dict, Optional, Tuple
from decimal import Decimal
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.courses.models import Course, Module, Lesson
from apps.users.permissions import can_edit_course, is_admin

logger = logging.getLogger('apps')


class CourseService:
    """
    Servicio de cursos que maneja la lógica de negocio
    """
    
    def __init__(self):
        pass
    
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
            
            # 10. Crear curso
            course = Course.objects.create(
                id=course_id,
                title=title,
                slug=slug,
                description=description.strip(),
                short_description=kwargs.get('short_description', description[:500].strip()),
                price=price,
                currency=kwargs.get('currency', 'PEN'),
                status=status,
                is_active=kwargs.get('is_active', True),
                thumbnail_url=thumbnail_url if thumbnail_url else None,
                banner_url=banner_url if banner_url else None,
                category=category,
                level=level,
                provider=kwargs.get('provider', 'fagsol'),
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
            
            # También verificar ownership (instructores solo pueden editar sus cursos)
            if not can_edit_course(user, course):
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
                course.price = price
            
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
                    
                    course.status = status
            
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
            user: Usuario que elimina el curso (debe ser admin)
            course_id: ID del curso
        
        Returns:
            Tuple[success, error_message]
        """
        try:
            # 1. Validar permisos (usando Django permissions)
            from apps.users.permissions import has_perm
            if not has_perm(user, 'courses.delete_course'):
                return False, "No tienes permiso para eliminar cursos"
            
            # 2. Obtener curso
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return False, "Curso no encontrado"
            
            # 3. Soft delete (cambiar status a archived y desactivar)
            course.status = 'archived'
            course.is_active = False
            course.save()
            
            logger.info(f"Curso archivado: {course.id} por usuario {user.id}")
            return True, ""
            
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

