"""
Abstract base models for the FagSol application
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """
    Modelo abstracto que proporciona campos de fecha de creación y actualización
    """
    created_at = models.DateTimeField(
        _('Fecha de creación'),
        auto_now_add=True,
        help_text=_('Fecha y hora de creación del registro')
    )
    updated_at = models.DateTimeField(
        _('Fecha de actualización'),
        auto_now=True,
        help_text=_('Fecha y hora de última actualización')
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']


class ActiveManager(models.Manager):
    """
    Manager personalizado que filtra solo registros activos
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class BaseModel(TimeStampedModel):
    """
    Modelo base con campos comunes para todas las entidades
    """
    is_active = models.BooleanField(
        _('¿Activo?'),
        default=True,
        help_text=_('Indica si el registro está activo')
    )

    objects = models.Manager()  # Manager por defecto
    active = ActiveManager()    # Manager para registros activos

    class Meta:
        abstract = True

    def soft_delete(self):
        """
        Eliminación suave del registro
        """
        self.is_active = False
        self.save()

    def activate(self):
        """
        Activar el registro
        """
        self.is_active = True
        self.save()

