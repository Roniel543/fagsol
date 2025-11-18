"""
Modelos de Usuarios - FagSol Escuela Virtual
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid
from django.utils import timezone
from apps.courses.models import Course, Lesson


def generate_enrollment_id():
    """Genera un ID único para Enrollment"""
    return f"enr_{uuid.uuid4().hex[:16]}"


def generate_certificate_id():
    """Genera un ID único para Certificate"""
    return f"cert_{uuid.uuid4().hex[:16]}"


def generate_lesson_progress_id():
    """Genera un ID único para LessonProgress"""
    return f"lp_{uuid.uuid4().hex[:16]}"


class Enrollment(models.Model):
    """
    Enrollment - Inscripción de usuario en curso
    """
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('expired', 'Expirado'),
        ('cancelled', 'Cancelado'),
    ]
    
    # Identificación
    id = models.CharField(max_length=100, primary_key=True, unique=True, default=generate_enrollment_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments', verbose_name="Usuario")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments', verbose_name="Curso")
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Estado")
    completed = models.BooleanField(default=False, verbose_name="Completado")
    completion_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Porcentaje de completitud"
    )
    
    # Fechas
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de inscripción")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de finalización")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de expiración")
    
    # Relación con pago
    payment = models.ForeignKey(
        'payments.Payment', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='enrollments',
        verbose_name="Pago asociado"
    )
    
    # Metadatos
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos adicionales")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        db_table = 'enrollments'
        verbose_name = 'Inscripción'
        verbose_name_plural = 'Inscripciones'
        ordering = ['-enrolled_at']
        unique_together = [['user', 'course']]  # Un usuario solo puede estar inscrito una vez por curso
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['course', 'status']),
            models.Index(fields=['status', 'completed']),
        ]
    
    def __str__(self):
        return f"Enrollment {self.id} - {self.user.email} - {self.course.title}"


class Certificate(models.Model):
    """
    Certificate - Certificado emitido
    """
    # Identificación
    id = models.CharField(max_length=100, primary_key=True, unique=True, default=generate_certificate_id)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate', verbose_name="Inscripción")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates', verbose_name="Usuario")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates', verbose_name="Curso")
    
    # Archivo
    file_url = models.URLField(blank=True, null=True, verbose_name="URL del certificado", help_text="URL firmada de S3 o storage")
    file_path = models.CharField(max_length=500, blank=True, null=True, verbose_name="Ruta del archivo")
    
    # Verificación
    verification_code = models.CharField(max_length=50, unique=True, verbose_name="Código de verificación", help_text="Código QR único")
    verification_url = models.URLField(blank=True, null=True, verbose_name="URL de verificación")
    
    # Metadatos
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de emisión")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos adicionales")
    
    class Meta:
        db_table = 'certificates'
        verbose_name = 'Certificado'
        verbose_name_plural = 'Certificados'
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['course']),
            models.Index(fields=['verification_code']),
        ]
    
    def __str__(self):
        return f"Certificate {self.id} - {self.user.email} - {self.course.title}"


class LessonProgress(models.Model):
    """
    LessonProgress - Progreso de un usuario en una lección específica
    """
    # Identificación
    id = models.CharField(max_length=100, primary_key=True, unique=True, default=generate_lesson_progress_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progresses', verbose_name="Usuario")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progresses', verbose_name="Lección")
    enrollment = models.ForeignKey(
        Enrollment, 
        on_delete=models.CASCADE, 
        related_name='lesson_progresses', 
        verbose_name="Inscripción",
        help_text="Enrollment asociado (para validar acceso)"
    )
    
    # Estado de completitud
    is_completed = models.BooleanField(default=False, verbose_name="Completada")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de finalización")
    
    # Progreso adicional (para videos, puede ser tiempo visto)
    progress_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Porcentaje de progreso",
        help_text="Porcentaje de progreso en la lección (ej: 50% visto de un video)"
    )
    
    # Tiempo visto (en segundos, para videos)
    time_watched_seconds = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Tiempo visto (segundos)",
        help_text="Tiempo total visto en la lección (útil para videos)"
    )
    
    # Metadatos
    last_accessed_at = models.DateTimeField(auto_now=True, verbose_name="Último acceso")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos adicionales")
    
    class Meta:
        db_table = 'lesson_progress'
        verbose_name = 'Progreso de Lección'
        verbose_name_plural = 'Progresos de Lecciones'
        ordering = ['-updated_at']
        unique_together = [['user', 'lesson', 'enrollment']]  # Un usuario solo puede tener un progreso por lección por enrollment
        indexes = [
            models.Index(fields=['user', 'enrollment']),
            models.Index(fields=['lesson', 'is_completed']),
            models.Index(fields=['enrollment', 'is_completed']),
        ]
    
    def __str__(self):
        status = "Completada" if self.is_completed else "En progreso"
        return f"LessonProgress {self.id} - {self.user.email} - {self.lesson.title} ({status})"
    
    def mark_as_completed(self):
        """Marca la lección como completada"""
        if not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
            self.progress_percentage = Decimal('100.00')
            self.save()
    
    def mark_as_incomplete(self):
        """Marca la lección como incompleta"""
        if self.is_completed:
            self.is_completed = False
            self.completed_at = None
            self.save()
