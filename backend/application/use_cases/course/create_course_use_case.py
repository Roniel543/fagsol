"""
Caso de uso: Crear curso - FagSol Escuela Virtual
"""

import logging
import re
from typing import Optional
from decimal import Decimal, ROUND_HALF_UP
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.conf import settings
from apps.courses.models import Course
from apps.users.permissions import can_create_course, is_admin, get_user_role, ROLE_INSTRUCTOR
from application.dtos.use_case_result import UseCaseResult

logger = logging.getLogger('apps')


class CreateCourseUseCase:
    """
    Caso de uso: Crear nuevo curso
    
    Responsabilidades:
    - Validar permisos
    - Validar datos
    - Generar slug único
    - Calcular price_usd
    - Crear curso
    """
    
    def __init__(self, currency_service=None):
        """
        Inicializa el caso de uso
        
        Args:
            currency_service: Servicio de conversión de monedas (inyección de dependencias)
        """
        self.currency_service = currency_service
        self.default_usd_to_pen_rate = Decimal(str(getattr(settings, 'DEFAULT_USD_TO_PEN_RATE', '3.75')))
    
    def _calculate_price_usd_from_pen(self, price_pen: Decimal) -> Decimal:
        """
        Calcula price_usd desde price (PEN) usando la tasa REAL de la API
        """
        if price_pen <= 0:
            return Decimal('0.00')
        
        # Intentar obtener tasa real de la API
        if self.currency_service:
            try:
                usd_to_pen_rate = self.currency_service.get_exchange_rate('USD', 'PEN')
                price_usd = price_pen / usd_to_pen_rate
                logger.info(f"Calculado price_usd usando tasa REAL: {price_pen} PEN -> {price_usd} USD")
            except Exception as e:
                logger.warning(f"Error al obtener tasa real, usando por defecto: {str(e)}")
                price_usd = price_pen / self.default_usd_to_pen_rate
        else:
            price_usd = price_pen / self.default_usd_to_pen_rate
        
        return price_usd.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _generate_course_id(self) -> str:
        """Genera un ID único para un curso"""
        last_course = Course.objects.filter(id__startswith='c-').order_by('-id').first()
        
        if last_course:
            match = re.search(r'c-(\d+)', last_course.id)
            if match:
                new_num = int(match.group(1)) + 1
            else:
                new_num = 1
        else:
            new_num = 1
        
        return f"c-{new_num:03d}"
    
    def _is_valid_url(self, url: str) -> bool:
        """Valida si una URL es válida y segura (previene SSRF)"""
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
        
        # Prevenir SSRF
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
        title: str,
        description: str,
        price: Decimal,
        **kwargs
    ) -> UseCaseResult:
        """
        Ejecuta el caso de uso de crear curso
        
        Args:
            user: Usuario que crea el curso
            title: Título del curso
            description: Descripción del curso
            price: Precio del curso
            **kwargs: Campos adicionales
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar permisos
            if not can_create_course(user):
                return UseCaseResult(
                    success=False,
                    error_message="No tienes permiso para crear cursos. Los instructores deben estar aprobados por un administrador."
                )
            
            # 2. Validar campos requeridos
            if not title or not title.strip():
                return UseCaseResult(
                    success=False,
                    error_message="El título es requerido"
                )
            
            if not description or not description.strip():
                return UseCaseResult(
                    success=False,
                    error_message="La descripción es requerida"
                )
            
            if price < 0:
                return UseCaseResult(
                    success=False,
                    error_message="El precio no puede ser negativo"
                )
            
            # 3. Sanitizar título
            title = title.strip()
            if len(title) > 200:
                return UseCaseResult(
                    success=False,
                    error_message="El título no puede exceder 200 caracteres"
                )
            
            # 4. Generar slug único
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # 5. Generar ID único
            course_id = self._generate_course_id()
            
            # 6. Validar estado (instructores solo pueden crear en draft)
            status = kwargs.get('status', 'draft')
            if not is_admin(user):
                status = 'draft'
            elif status not in ['draft', 'pending_review', 'needs_revision', 'published', 'archived']:
                status = 'draft'
            
            # 7. Validar campos opcionales
            category = kwargs.get('category', 'General').strip()[:100]
            level = kwargs.get('level', 'beginner')
            if level not in ['beginner', 'intermediate', 'advanced']:
                level = 'beginner'
            
            # 8. Validar URLs
            thumbnail_url = kwargs.get('thumbnail_url', '')
            if thumbnail_url and not self._is_valid_url(thumbnail_url):
                return UseCaseResult(
                    success=False,
                    error_message="URL de miniatura inválida"
                )
            
            banner_url = kwargs.get('banner_url', '')
            if banner_url and not self._is_valid_url(banner_url):
                return UseCaseResult(
                    success=False,
                    error_message="URL de banner inválida"
                )
            
            # 9. Validar instructor y tags
            instructor = kwargs.get('instructor', {})
            if instructor and not isinstance(instructor, dict):
                return UseCaseResult(
                    success=False,
                    error_message="Instructor debe ser un objeto JSON"
                )
            
            tags = kwargs.get('tags', [])
            if tags and not isinstance(tags, list):
                return UseCaseResult(
                    success=False,
                    error_message="Tags debe ser una lista"
                )
            
            # 10. Determinar provider
            provider = kwargs.get('provider')
            if not provider:
                user_role = get_user_role(user)
                provider = 'instructor' if user_role == ROLE_INSTRUCTOR else 'fagsol'
            
            # 11. Calcular price_usd
            price_usd = kwargs.get('price_usd')
            currency = kwargs.get('currency', 'PEN')
            
            if price_usd is None and currency == 'PEN' and price > 0:
                price_usd = self._calculate_price_usd_from_pen(price)
            elif price_usd is None:
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
            
            return UseCaseResult(
                success=True,
                data={
                    'course': {
                        'id': course.id,
                        'title': course.title,
                        'slug': course.slug,
                        'status': course.status
                    }
                },
                extra={'course': course}
            )
            
        except ValidationError as e:
            logger.error(f"Error de validación al crear curso: {str(e)}")
            return UseCaseResult(
                success=False,
                error_message=f"Error de validación: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error al crear curso: {str(e)}", exc_info=True)
            return UseCaseResult(
                success=False,
                error_message=f"Error al crear curso: {str(e)}"
            )

