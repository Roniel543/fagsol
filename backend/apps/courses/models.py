"""
Modelos de Cursos - FagSol Escuela Virtual
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid
import logging

logger = logging.getLogger('apps')


def generate_course_id():
    """Genera un ID único para Course"""
    return f"c_{uuid.uuid4().hex[:16]}"


def generate_module_id():
    """Genera un ID único para Module"""
    return f"m_{uuid.uuid4().hex[:16]}"


def generate_lesson_id():
    """Genera un ID único para Lesson"""
    return f"l_{uuid.uuid4().hex[:16]}"


def generate_material_id():
    """Genera un ID único para Material"""
    return f"mat_{uuid.uuid4().hex[:16]}"


class Course(models.Model):
    """
    Modelo de Curso
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending_review', 'Pendiente de Revisión'),
        ('needs_revision', 'Requiere Cambios'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True, help_text="ID único del curso (ej: c-001)")
    title = models.CharField(max_length=200, verbose_name="Título")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descripción")
    short_description = models.TextField(max_length=500, blank=True, verbose_name="Descripción corta")
    
    # Precio y monetización
    price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        null=True,
        blank=True,
        verbose_name="Precio en USD",
        help_text="Precio base en dólares estadounidenses (USD)"
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Precio",
        help_text="Precio en PEN (Soles) - calculado desde price_usd"
    )
    currency = models.CharField(max_length=3, default='PEN', verbose_name="Moneda")
    
    # Estado y visibilidad
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Estado")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    # Imágenes
    thumbnail_url = models.URLField(blank=True, null=True, verbose_name="URL de miniatura")
    banner_url = models.URLField(blank=True, null=True, verbose_name="URL de banner")
    
    # Metadatos
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses', verbose_name="Creado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    # Orden y categorización
    order = models.IntegerField(default=0, verbose_name="Orden")
    tags = models.JSONField(default=list, blank=True, verbose_name="Tags")
    
    # Campos adicionales para frontend
    LEVEL_CHOICES = [
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    ]
    
    category = models.CharField(max_length=100, blank=True, default='General', verbose_name="Categoría")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner', verbose_name="Nivel")
    provider = models.CharField(max_length=50, default='fagsol', verbose_name="Proveedor", help_text="fagsol o instructor")
    
    # Precio con descuento
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Precio con descuento"
    )
    
    # Metadatos del curso
    hours = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Horas totales")
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('5.00'))],
        verbose_name="Calificación"
    )
    ratings_count = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Número de calificaciones")
    
    # Instructor (almacenado como JSON para flexibilidad)
    instructor = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Instructor",
        help_text="JSON con id, name, title del instructor"
    )
    
    # Campos de moderación y revisión 
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_courses',
        verbose_name="Revisado por",
        help_text="Administrador que revisó el curso"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Revisión",
        help_text="Fecha y hora en que se realizó la revisión"
    )
    
    review_comments = models.TextField(
        blank=True,
        null=True,
        max_length=2000,
        verbose_name="Comentarios de Revisión",
        help_text="Comentarios del administrador sobre la revisión (máximo 2000 caracteres)"
    )
    
    class Meta:
        db_table = 'courses'
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.id})"
    
    @property
    def is_published(self):
        return self.status == 'published' and self.is_active
    
    def is_pending_review(self):
        """Verifica si el curso está pendiente de revisión"""
        return self.status == 'pending_review'
    
    def is_needs_revision(self):
        """Verifica si el curso requiere cambios"""
        return self.status == 'needs_revision'
    
    def can_request_review(self):
        """Verifica si el curso puede solicitar revisión (debe estar en draft o needs_revision)"""
        return self.status in ['draft', 'needs_revision'] and self.is_active
    
    def can_be_edited_by_instructor(self):
        """
        Verifica si el curso puede ser editado por un instructor.
        
        Los instructores solo pueden editar cursos en 'draft' o 'needs_revision'.
        No pueden editar cursos en 'pending_review' o 'published'.
        
        Returns:
            bool: True si el curso puede ser editado por un instructor
        """
        return self.status in ['draft', 'needs_revision'] and self.is_active


class Module(models.Model):
    """
    Modelo de Módulo (dentro de un curso)
    """
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True, default=generate_module_id, help_text="ID único del módulo (ej: m-001)")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules', verbose_name="Curso")
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    
    # Precio individual (si el módulo se vende por separado)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        verbose_name="Precio individual",
        help_text="Precio si se compra el módulo por separado (0 = no se vende por separado)"
    )
    is_purchasable = models.BooleanField(default=False, verbose_name="Se puede comprar por separado")
    
    # Orden y estado
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        db_table = 'modules'
        verbose_name = 'Módulo'
        verbose_name_plural = 'Módulos'
        ordering = ['course', 'order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title} ({self.id})"


class Lesson(models.Model):
    """
    Modelo de Lección (dentro de un módulo)
    """
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('document', 'Documento'),
        ('quiz', 'Quiz'),
        ('text', 'Texto'),
    ]
    
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True, default=generate_lesson_id, help_text="ID único de la lección")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons', verbose_name="Módulo")
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    
    # Tipo y contenido
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='video', verbose_name="Tipo")
    content_url = models.URLField(blank=True, null=True, verbose_name="URL del contenido", help_text="URL externa o firmada")
    content_text = models.TextField(blank=True, verbose_name="Contenido de texto")
    
    # Duración (para videos)
    duration_minutes = models.IntegerField(default=0, validators=[MinValueValidator(0)], verbose_name="Duración (minutos)")
    
    # Orden y estado
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        db_table = 'lessons'
        verbose_name = 'Lección'
        verbose_name_plural = 'Lecciones'
        ordering = ['module', 'order']
        indexes = [
            models.Index(fields=['module', 'order']),
        ]
    
    def __str__(self):
        return f"{self.module.title} - {self.title} ({self.id})"
    
    def clean(self):
        """
        Valida y convierte URLs de video automáticamente
        FASE 1: Conversión automática de URLs de Vimeo
        """
        # Solo procesar si es tipo video y tiene content_url
        if self.lesson_type == 'video' and self.content_url:
            try:
                # Importar servicio (evitar import circular)
                from infrastructure.services.video_url_service import video_url_service
                
                # Validar y convertir URL
                success, converted_url, error_message = video_url_service.validate_and_convert(
                    self.content_url,
                    self.lesson_type
                )
                
                if not success:
                    raise ValidationError({
                        'content_url': error_message
                    })
                
                # Si se convirtió, actualizar la URL
                if converted_url and converted_url != self.content_url:
                    logger.info(
                        f"URL de video convertida automáticamente para lección {self.id}: "
                        f"{self.content_url} -> {converted_url}"
                    )
                    self.content_url = converted_url
                    
            except ImportError as e:
                logger.error(f"Error al importar video_url_service: {str(e)}")
                # No fallar si el servicio no está disponible (desarrollo)
            except Exception as e:
                logger.error(f"Error al validar URL de video: {str(e)}")
                raise ValidationError({
                    'content_url': f'Error al validar URL de video: {str(e)}'
                })
    
    def save(self, *args, **kwargs):
        """
        Sobrescribe save para llamar clean() automáticamente
        """
        self.full_clean()  # Llama a clean() y valida todos los campos
        super().save(*args, **kwargs)


class Material(models.Model):
    """
    Modelo de Material (recursos complementarios del curso)
    Puede ser un video de Vimeo o un enlace externo
    """
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Video Vimeo'),
        ('link', 'Enlace Externo'),
    ]
    
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True, default=generate_material_id, help_text="ID único del material")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials', verbose_name="Curso")
    
    # Asociación opcional a módulo o lección
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True, related_name='materials', verbose_name="Módulo (opcional)")
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='materials', verbose_name="Lección (opcional)")
    
    # Información básica
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    
    # Tipo y contenido
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='video', verbose_name="Tipo")
    url = models.URLField(verbose_name="URL", help_text="URL del video de Vimeo o enlace externo")
    
    # Orden y estado
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        db_table = 'materials'
        verbose_name = 'Material'
        verbose_name_plural = 'Materiales'
        ordering = ['course', 'order']
        indexes = [
            models.Index(fields=['course', 'order']),
            models.Index(fields=['module']),
            models.Index(fields=['lesson']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title} ({self.id})"
    
    def clean(self):
        """
        Valida URLs de Vimeo automáticamente
        """
        if self.material_type == 'video' and self.url:
            try:
                from infrastructure.services.video_url_service import video_url_service
                success, converted_url, error_message = video_url_service.validate_and_convert(self.url)
                if success and converted_url:
                    self.url = converted_url
                elif not success:
                    raise ValidationError({
                        'url': error_message or 'URL de Vimeo inválida'
                    })
            except ImportError as e:
                logger.error(f"Error al importar video_url_service: {str(e)}")
            except Exception as e:
                logger.error(f"Error al validar URL de video: {str(e)}")
                raise ValidationError({
                    'url': f'Error al validar URL de video: {str(e)}'
                })
    
    def save(self, *args, **kwargs):
        """
        Sobrescribe save para llamar clean() automáticamente
        """
        self.full_clean()
        super().save(*args, **kwargs)
