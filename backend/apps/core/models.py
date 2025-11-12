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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
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