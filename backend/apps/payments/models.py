"""
Payment models for FagSol Escuela Virtual
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.users.models import User


class Payment(BaseModel):
    """
    Modelo de Pago
    """
    class PaymentType(models.TextChoices):
        FULL_COURSE = 'full_course', _('Curso Completo')
        SINGLE_MODULE = 'single_module', _('Módulo Individual')
        MULTIPLE_MODULES = 'multiple_modules', _('Múltiples Módulos')

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pendiente')
        APPROVED = 'approved', _('Aprobado')
        REJECTED = 'rejected', _('Rechazado')
        REFUNDED = 'refunded', _('Reembolsado')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('Usuario'),
        help_text=_('Usuario que realiza el pago')
    )
    payment_type = models.CharField(
        _('Tipo de pago'),
        max_length=20,
        choices=PaymentType.choices,
        help_text=_('Tipo de compra realizada')
    )
    amount = models.DecimalField(
        _('Monto'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('Monto total pagado')
    )
    currency = models.CharField(
        _('Moneda'),
        max_length=3,
        default='PEN',
        help_text=_('Código de moneda (PEN, USD, etc.)')
    )
    
    # MercadoPago data
    mercadopago_preference_id = models.CharField(
        _('ID de Preferencia MP'),
        max_length=100,
        blank=True,
        help_text=_('ID de preferencia de MercadoPago')
    )
    mercadopago_payment_id = models.CharField(
        _('ID de Pago MP'),
        max_length=100,
        blank=True,
        help_text=_('ID de pago de MercadoPago')
    )
    
    status = models.CharField(
        _('Estado'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text=_('Estado del pago')
    )
    
    # Metadata
    metadata = models.JSONField(
        _('Metadatos'),
        default=dict,
        blank=True,
        help_text=_('Información adicional del pago (items comprados, etc.)')
    )
    
    class Meta:
        verbose_name = _('Pago')
        verbose_name_plural = _('Pagos')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['mercadopago_payment_id']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} ({self.status})"

