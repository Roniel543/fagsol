"""
Modelos de Cursos - FagSol Escuela Virtual
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Course(models.Model):
    """
    Modelo de Curso
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
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
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Precio",
        help_text="Precio en PEN (Soles)"
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


class Module(models.Model):
    """
    Modelo de Módulo (dentro de un curso)
    """
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True, help_text="ID único del módulo (ej: m-001)")
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
    id = models.CharField(max_length=50, primary_key=True, unique=True, help_text="ID único de la lección")
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
