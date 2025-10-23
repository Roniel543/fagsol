"""
Course models for FagSol Escuela Virtual
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel
from apps.core.utils import slugify
from apps.users.models import User


class Course(BaseModel):
    """
    Modelo de Curso (contiene módulos)
    """
    class Level(models.TextChoices):
        BEGINNER = 'beginner', _('Principiante')
        INTERMEDIATE = 'intermediate', _('Intermedio')
        ADVANCED = 'advanced', _('Avanzado')

    title = models.CharField(
        _('Título'),
        max_length=200,
        help_text=_('Título del curso')
    )
    slug = models.SlugField(
        _('Slug'),
        max_length=250,
        unique=True,
        help_text=_('Slug para URL amigable')
    )
    description = models.TextField(
        _('Descripción'),
        help_text=_('Descripción completa del curso')
    )
    short_description = models.CharField(
        _('Descripción corta'),
        max_length=300,
        blank=True,
        help_text=_('Descripción breve para listados')
    )
    image = models.ImageField(
        _('Imagen'),
        upload_to='courses/',
        blank=True,
        null=True,
        help_text=_('Imagen de portada del curso')
    )
    
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses_teaching',
        limit_choices_to={'role__in': ['teacher', 'admin', 'superadmin']},
        verbose_name=_('Instructor'),
        help_text=_('Profesor encargado del curso')
    )
    
    level = models.CharField(
        _('Nivel'),
        max_length=20,
        choices=Level.choices,
        default=Level.BEGINNER,
        help_text=_('Nivel de dificultad del curso')
    )
    duration_hours = models.PositiveIntegerField(
        _('Duración en horas'),
        default=0,
        help_text=_('Duración estimada del curso completo')
    )
    
    # Pricing
    full_price = models.DecimalField(
        _('Precio completo'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('Precio del curso completo (todos los módulos)')
    )
    discount_percentage = models.DecimalField(
        _('Porcentaje de descuento'),
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Descuento al comprar el curso completo vs módulos individuales')
    )
    
    # Metadata
    requirements = models.TextField(
        _('Requisitos'),
        blank=True,
        help_text=_('Requisitos previos para el curso')
    )
    what_you_learn = models.TextField(
        _('Qué aprenderás'),
        blank=True,
        help_text=_('Lista de objetivos de aprendizaje')
    )
    target_audience = models.TextField(
        _('Público objetivo'),
        blank=True,
        help_text=_('A quién está dirigido el curso')
    )
    
    # Stats
    total_students = models.PositiveIntegerField(
        _('Total de estudiantes'),
        default=0,
        help_text=_('Contador de estudiantes inscritos')
    )
    
    class Meta:
        verbose_name = _('Curso')
        verbose_name_plural = _('Cursos')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def modules_count(self):
        """Retorna el número de módulos del curso"""
        return self.modules.filter(is_active=True).count()

    @property
    def total_lessons(self):
        """Retorna el total de lecciones en todos los módulos"""
        return sum(module.lessons_count for module in self.modules.filter(is_active=True))

    def calculate_duration(self):
        """Calcula la duración total sumando todos los módulos"""
        total = sum(
            module.duration_hours 
            for module in self.modules.filter(is_active=True)
        )
        self.duration_hours = total
        self.save(update_fields=['duration_hours'])
        return total


class Module(BaseModel):
    """
    Modelo de Módulo (comprable individualmente)
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='modules',
        verbose_name=_('Curso'),
        help_text=_('Curso al que pertenece el módulo')
    )
    title = models.CharField(
        _('Título'),
        max_length=200,
        help_text=_('Título del módulo')
    )
    slug = models.SlugField(
        _('Slug'),
        max_length=250,
        help_text=_('Slug para URL amigable')
    )
    description = models.TextField(
        _('Descripción'),
        help_text=_('Descripción del módulo')
    )
    order = models.PositiveIntegerField(
        _('Orden'),
        default=0,
        help_text=_('Orden del módulo dentro del curso')
    )
    price = models.DecimalField(
        _('Precio'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('Precio individual del módulo')
    )
    duration_hours = models.PositiveIntegerField(
        _('Duración en horas'),
        default=0,
        help_text=_('Duración estimada del módulo')
    )
    
    class Meta:
        verbose_name = _('Módulo')
        verbose_name_plural = _('Módulos')
        ordering = ['course', 'order']
        unique_together = ['course', 'slug']
        indexes = [
            models.Index(fields=['course', 'order']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def lessons_count(self):
        """Retorna el número de lecciones del módulo"""
        return self.lessons.filter(is_active=True).count()


class Lesson(BaseModel):
    """
    Modelo de Lección (contenido del módulo)
    """
    class ContentType(models.TextChoices):
        VIDEO = 'video', _('Video')
        DOCUMENT = 'document', _('Documento')
        LINK = 'link', _('Enlace')
        TEXT = 'text', _('Texto')

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='lessons',
        verbose_name=_('Módulo'),
        help_text=_('Módulo al que pertenece la lección')
    )
    title = models.CharField(
        _('Título'),
        max_length=200,
        help_text=_('Título de la lección')
    )
    description = models.TextField(
        _('Descripción'),
        blank=True,
        help_text=_('Descripción de la lección')
    )
    order = models.PositiveIntegerField(
        _('Orden'),
        default=0,
        help_text=_('Orden de la lección dentro del módulo')
    )
    content_type = models.CharField(
        _('Tipo de contenido'),
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.VIDEO,
        help_text=_('Tipo de contenido de la lección')
    )
    content_url = models.URLField(
        _('URL del contenido'),
        max_length=500,
        help_text=_('URL del video (YouTube) o documento (Drive)')
    )
    content_text = models.TextField(
        _('Contenido de texto'),
        blank=True,
        help_text=_('Contenido en formato texto')
    )
    duration_minutes = models.PositiveIntegerField(
        _('Duración en minutos'),
        default=0,
        help_text=_('Duración de la lección')
    )
    is_free = models.BooleanField(
        _('¿Es gratis?'),
        default=False,
        help_text=_('Si es True, la lección es vista previa gratuita')
    )
    
    class Meta:
        verbose_name = _('Lección')
        verbose_name_plural = _('Lecciones')
        ordering = ['module', 'order']
        indexes = [
            models.Index(fields=['module', 'order']),
        ]

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Enrollment(BaseModel):
    """
    Modelo de Matrícula (relación User-Module)
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Activo')
        COMPLETED = 'completed', _('Completado')
        EXPIRED = 'expired', _('Expirado')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Usuario'),
        help_text=_('Usuario matriculado')
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Módulo'),
        help_text=_('Módulo en el que está matriculado')
    )
    payment = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        related_name='enrollments',
        verbose_name=_('Pago'),
        help_text=_('Pago asociado a la matrícula')
    )
    status = models.CharField(
        _('Estado'),
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text=_('Estado de la matrícula')
    )
    progress_percentage = models.DecimalField(
        _('Porcentaje de progreso'),
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Porcentaje de avance en el módulo')
    )
    enrolled_at = models.DateTimeField(
        _('Fecha de matrícula'),
        auto_now_add=True,
        help_text=_('Fecha y hora de inscripción')
    )
    completed_at = models.DateTimeField(
        _('Fecha de finalización'),
        blank=True,
        null=True,
        help_text=_('Fecha y hora de finalización del módulo')
    )
    expires_at = models.DateTimeField(
        _('Fecha de expiración'),
        blank=True,
        null=True,
        help_text=_('Fecha de expiración del acceso (opcional)')
    )
    
    class Meta:
        verbose_name = _('Matrícula')
        verbose_name_plural = _('Matrículas')
        unique_together = ['user', 'module']
        ordering = ['-enrolled_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['module']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.module.title}"

    def calculate_progress(self):
        """Calcula el progreso del estudiante en el módulo"""
        total_lessons = self.module.lessons.filter(is_active=True).count()
        if total_lessons == 0:
            return 0
        
        completed_lessons = LessonProgress.objects.filter(
            user=self.user,
            lesson__module=self.module,
            is_completed=True
        ).count()
        
        progress = (completed_lessons / total_lessons) * 100
        self.progress_percentage = round(progress, 2)
        
        # Marcar como completado si llegó al 100%
        if progress >= 100 and self.status == self.Status.ACTIVE:
            from django.utils import timezone
            self.status = self.Status.COMPLETED
            self.completed_at = timezone.now()
        
        self.save()
        return self.progress_percentage


class LessonProgress(BaseModel):
    """
    Modelo de Progreso de Lección
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lesson_progress',
        verbose_name=_('Usuario'),
        help_text=_('Usuario que avanza en la lección')
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progress',
        verbose_name=_('Lección'),
        help_text=_('Lección en progreso')
    )
    is_completed = models.BooleanField(
        _('¿Completada?'),
        default=False,
        help_text=_('Indica si la lección está completada')
    )
    time_spent_minutes = models.PositiveIntegerField(
        _('Tiempo dedicado (minutos)'),
        default=0,
        help_text=_('Tiempo total dedicado a la lección')
    )
    last_position_seconds = models.PositiveIntegerField(
        _('Última posición (segundos)'),
        default=0,
        help_text=_('Última posición reproducida en videos')
    )
    started_at = models.DateTimeField(
        _('Iniciado el'),
        auto_now_add=True,
        help_text=_('Fecha de inicio de la lección')
    )
    completed_at = models.DateTimeField(
        _('Completado el'),
        blank=True,
        null=True,
        help_text=_('Fecha de completado de la lección')
    )
    
    class Meta:
        verbose_name = _('Progreso de Lección')
        verbose_name_plural = _('Progresos de Lecciones')
        unique_together = ['user', 'lesson']
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'is_completed']),
            models.Index(fields=['lesson']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.lesson.title}"

    def mark_completed(self):
        """Marca la lección como completada"""
        from django.utils import timezone
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()
        
        # Actualizar progreso de la matrícula
        try:
            enrollment = Enrollment.objects.get(
                user=self.user,
                module=self.lesson.module
            )
            enrollment.calculate_progress()
        except Enrollment.DoesNotExist:
            pass

