"""
Modelos de Pagos - FagSol Escuela Virtual
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


def generate_payment_intent_id():
    """Genera un ID único para PaymentIntent"""
    return f"pi_{uuid.uuid4().hex[:16]}"


def generate_payment_id():
    """Genera un ID único para Payment"""
    return f"pay_{uuid.uuid4().hex[:16]}"


class PaymentIntent(models.Model):
    """
    Payment Intent - Intención de pago (antes de procesar)
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('succeeded', 'Exitoso'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]
    
    # Identificación
    id = models.CharField(max_length=100, primary_key=True, unique=True, default=generate_payment_intent_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_intents', verbose_name="Usuario")
    
    # Monto y moneda
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Total"
    )
    currency = models.CharField(max_length=3, default='PEN', verbose_name="Moneda")
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    
    # Items (cursos que se están comprando)
    course_ids = models.JSONField(default=list, verbose_name="IDs de cursos", help_text="Lista de IDs de cursos")
    
    # Metadatos
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos adicionales")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expira en")
    
    class Meta:
        db_table = 'payment_intents'
        verbose_name = 'Payment Intent'
        verbose_name_plural = 'Payment Intents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Payment Intent {self.id} - {self.user.email} - {self.status}"


class Payment(models.Model):
    """
    Payment - Pago procesado
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('refunded', 'Reembolsado'),
        ('cancelled', 'Cancelado'),
    ]
    
    # Identificación
    id = models.CharField(max_length=100, primary_key=True, unique=True, default=generate_payment_id)
    payment_intent = models.OneToOneField(PaymentIntent, on_delete=models.CASCADE, related_name='payment', verbose_name="Payment Intent")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', verbose_name="Usuario")
    
    # Monto y moneda
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Monto"
    )
    currency = models.CharField(max_length=3, default='PEN', verbose_name="Moneda")
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    
    # Integración con Mercado Pago
    mercado_pago_payment_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID de pago Mercado Pago")
    mercado_pago_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="Estado Mercado Pago")
    mercado_pago_response = models.JSONField(default=dict, blank=True, verbose_name="Respuesta completa de Mercado Pago")
    
    # Tokenización (NO almacenar datos de tarjeta)
    payment_token = models.CharField(max_length=200, blank=True, null=True, verbose_name="Token de pago", help_text="Token de Mercado Pago (NO datos de tarjeta)")
    
    # Cuotas
    installments = models.IntegerField(default=1, validators=[MinValueValidator(1)], verbose_name="Cuotas", help_text="Número de cuotas del pago")
    
    # Idempotency (evitar cobros duplicados)
    idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True, verbose_name="Clave de idempotencia")
    
    # Metadatos
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos adicionales")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['idempotency_key']),
            models.Index(fields=['mercado_pago_payment_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.id} - {self.user.email} - {self.status} - {self.amount} {self.currency}"


class PaymentWebhook(models.Model):
    """
    Payment Webhook - Registro de webhooks recibidos de Mercado Pago
    """
    # Identificación
    id = models.AutoField(primary_key=True)
    mercado_pago_id = models.CharField(max_length=100, unique=True, verbose_name="ID de webhook Mercado Pago")
    
    # Datos del webhook
    event_type = models.CharField(max_length=50, verbose_name="Tipo de evento")
    payment_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID de pago relacionado")
    data = models.JSONField(default=dict, verbose_name="Datos del webhook")
    
    # Estado de procesamiento
    processed = models.BooleanField(default=False, verbose_name="Procesado")
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de procesamiento")
    error_message = models.TextField(blank=True, null=True, verbose_name="Mensaje de error")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de recepción")
    
    class Meta:
        db_table = 'payment_webhooks'
        verbose_name = 'Webhook de Pago'
        verbose_name_plural = 'Webhooks de Pago'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['mercado_pago_id']),
            models.Index(fields=['payment_id']),
            models.Index(fields=['processed', 'created_at']),
        ]
    
    def __str__(self):
        return f"Webhook {self.mercado_pago_id} - {self.event_type} - {'Procesado' if self.processed else 'Pendiente'}"
