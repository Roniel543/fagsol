"""
User models for FagSol Escuela Virtual
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_verification_token


class UserManager(BaseUserManager):
    """
    Custom user manager
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Crea y guarda un usuario con el email y password dados
        """
        if not email:
            raise ValueError(_('El email es obligatorio'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crea y guarda un superusuario
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'superadmin')
        extra_fields.setdefault('is_email_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """
    Modelo de usuario personalizado
    """
    class Role(models.TextChoices):
        STUDENT = 'student', _('Estudiante')
        TEACHER = 'teacher', _('Profesor')
        ADMIN = 'admin', _('Administrador')
        SUPERADMIN = 'superadmin', _('Super Administrador')

    email = models.EmailField(
        _('Email'),
        unique=True,
        validators=[EmailValidator()],
        help_text=_('Email del usuario')
    )
    first_name = models.CharField(
        _('Nombres'),
        max_length=100,
        help_text=_('Nombres del usuario')
    )
    last_name = models.CharField(
        _('Apellidos'),
        max_length=100,
        help_text=_('Apellidos del usuario')
    )
    phone = models.CharField(
        _('Teléfono'),
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Número de teléfono')
    )
    role = models.CharField(
        _('Rol'),
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text=_('Rol del usuario en el sistema')
    )
    
    # Email verification
    is_email_verified = models.BooleanField(
        _('¿Email verificado?'),
        default=False,
        help_text=_('Indica si el email ha sido verificado')
    )
    email_verification_token = models.CharField(
        _('Token de verificación'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Token para verificar el email')
    )
    email_verified_at = models.DateTimeField(
        _('Fecha de verificación'),
        blank=True,
        null=True,
        help_text=_('Fecha y hora en que se verificó el email')
    )
    
    # Password reset
    password_reset_token = models.CharField(
        _('Token de reseteo'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Token para resetear la contraseña')
    )
    password_reset_token_created_at = models.DateTimeField(
        _('Token creado'),
        blank=True,
        null=True,
        help_text=_('Fecha de creación del token de reseteo')
    )
    
    # Profile info
    avatar = models.ImageField(
        _('Avatar'),
        upload_to='avatars/',
        blank=True,
        null=True,
        help_text=_('Imagen de perfil del usuario')
    )
    bio = models.TextField(
        _('Biografía'),
        blank=True,
        null=True,
        help_text=_('Biografía del usuario')
    )
    
    # Status
    is_active = models.BooleanField(
        _('¿Activo?'),
        default=True,
        help_text=_('Indica si el usuario está activo')
    )
    is_staff = models.BooleanField(
        _('¿Staff?'),
        default=False,
        help_text=_('Indica si el usuario puede acceder al admin')
    )
    
    # Timestamps
    last_login = models.DateTimeField(
        _('Último acceso'),
        blank=True,
        null=True,
        help_text=_('Fecha y hora del último acceso')
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """
        Retorna el nombre completo del usuario
        """
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """
        Retorna el primer nombre del usuario
        """
        return self.first_name

    def generate_verification_token(self):
        """
        Genera un token de verificación de email
        """
        self.email_verification_token = generate_verification_token()
        self.save()
        return self.email_verification_token

    def verify_email(self):
        """
        Marca el email como verificado
        """
        from django.utils import timezone
        self.is_email_verified = True
        self.email_verified_at = timezone.now()
        self.email_verification_token = None
        self.save()

    def generate_password_reset_token(self):
        """
        Genera un token para resetear la contraseña
        """
        from django.utils import timezone
        self.password_reset_token = generate_verification_token()
        self.password_reset_token_created_at = timezone.now()
        self.save()
        return self.password_reset_token

    def is_password_reset_token_valid(self):
        """
        Verifica si el token de reseteo sigue siendo válido (24 horas)
        """
        if not self.password_reset_token or not self.password_reset_token_created_at:
            return False
        
        from django.utils import timezone
        from datetime import timedelta
        
        expiry_time = self.password_reset_token_created_at + timedelta(hours=24)
        return timezone.now() < expiry_time

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_admin(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPERADMIN]

