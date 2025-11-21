"""
Modelos de Django para la base de datos - FagSol Escuela Virtual
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Perfil extendido del usuario de Django
    """
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('instructor', 'Instructor'),
        ('student', 'Estudiante'),
        ('guest', 'Invitado'),
    ]
    
    INSTRUCTOR_STATUS_CHOICES = [
        ('pending_approval', 'Pendiente de Aprobación'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Campos de aprobación de instructores (FASE 1)
    instructor_status = models.CharField(
        max_length=20,
        choices=INSTRUCTOR_STATUS_CHOICES,
        null=True,
        blank=True,
        verbose_name="Estado de Instructor",
        help_text="Estado de aprobación para usuarios con rol instructor"
    )
    instructor_rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Razón de Rechazo",
        help_text="Razón por la cual el instructor fue rechazado (si aplica)"
    )
    instructor_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_instructors',
        verbose_name="Aprobado por",
        help_text="Administrador que aprobó al instructor"
    )
    instructor_approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Aprobación",
        help_text="Fecha y hora en que el instructor fue aprobado"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.user.email})"

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"

    def is_student(self):
        return self.role == 'student'

    def is_instructor(self):
        return self.role == 'instructor'

    def is_admin(self):
        return self.role == 'admin'
    
    def is_guest(self):
        return self.role == 'guest'
    
    def is_instructor_approved(self):
        """
        Verifica si el instructor está aprobado
        Solo aplica para usuarios con rol 'instructor'
        """
        if self.role != 'instructor':
            return False
        return self.instructor_status == 'approved'
    
    def is_instructor_pending(self):
        """
        Verifica si el instructor está pendiente de aprobación
        """
        if self.role != 'instructor':
            return False
        return self.instructor_status == 'pending_approval'


class InstructorApplication(models.Model):
    """
    Solicitud de un usuario para convertirse en instructor.
    Los usuarios deben solicitar aprobación antes de poder crear cursos.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='instructor_applications',
        verbose_name="Usuario",
        help_text="Usuario que solicita ser instructor"
    )
    
    # Información profesional
    professional_title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Título Profesional",
        help_text="Título profesional o certificación (ej: Ingeniero, Licenciado, etc.)"
    )
    
    experience_years = models.IntegerField(
        default=0,
        verbose_name="Años de Experiencia",
        help_text="Años de experiencia en el área de especialización"
    )
    
    specialization = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Especialidad",
        help_text="Área de especialización (ej: Metalurgia, Energías Renovables, etc.)"
    )
    
    bio = models.TextField(
        blank=True,
        verbose_name="Biografía",
        help_text="Cuéntanos sobre ti y tu experiencia profesional"
    )
    
    portfolio_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Portfolio/Website",
        help_text="URL de tu portfolio, website o perfil profesional"
    )
    
    cv_file = models.FileField(
        upload_to='instructor_applications/cv/',
        blank=True,
        null=True,
        verbose_name="CV (PDF)",
        help_text="Archivo PDF con tu currículum vitae (opcional)"
    )
    
    motivation = models.TextField(
        verbose_name="Motivación",
        help_text="¿Por qué quieres ser instructor en FagSol? ¿Qué te motiva a enseñar?"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Estado",
        help_text="Estado de la solicitud"
    )
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        verbose_name="Revisado por",
        help_text="Administrador que revisó la solicitud"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Revisión",
        help_text="Fecha y hora en que se revisó la solicitud"
    )
    
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Razón de Rechazo",
        help_text="Razón por la cual la solicitud fue rechazada (si aplica)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")
    
    class Meta:
        db_table = 'instructor_applications'
        verbose_name = 'Solicitud de Instructor'
        verbose_name_plural = 'Solicitudes de Instructores'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"Solicitud de {self.user.email} - {self.get_status_display()}"
    
    @property
    def is_pending(self):
        """Verifica si la solicitud está pendiente"""
        return self.status == 'pending'
    
    @property
    def is_approved(self):
        """Verifica si la solicitud fue aprobada"""
        return self.status == 'approved'
    
    @property
    def is_rejected(self):
        """Verifica si la solicitud fue rechazada"""
        return self.status == 'rejected'