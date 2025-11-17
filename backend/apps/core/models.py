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