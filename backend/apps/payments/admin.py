"""
Admin configuration for Payments app
"""

from django.contrib import admin
from .models import PaymentIntent, Payment, PaymentWebhook


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total', 'currency', 'status', 'created_at', 'expires_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['id', 'user__email', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'user', 'status')
        }),
        ('Monto y Moneda', {
            'fields': ('total', 'currency')
        }),
        ('Items', {
            'fields': ('course_ids',)
        }),
        ('Metadatos', {
            'fields': ('metadata', 'created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'currency', 'status', 'mercado_pago_payment_id', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['id', 'user__email', 'mercado_pago_payment_id', 'idempotency_key']
    readonly_fields = ['id', 'created_at', 'updated_at', 'mercado_pago_response']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'payment_intent', 'user', 'status')
        }),
        ('Monto y Moneda', {
            'fields': ('amount', 'currency')
        }),
        ('Mercado Pago', {
            'fields': ('mercado_pago_payment_id', 'mercado_pago_status', 'payment_token', 'mercado_pago_response'),
            'classes': ('collapse',)
        }),
        ('Idempotencia', {
            'fields': ('idempotency_key',),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ['id', 'mercado_pago_id', 'event_type', 'payment_id', 'processed', 'created_at']
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['mercado_pago_id', 'payment_id']
    readonly_fields = ['id', 'mercado_pago_id', 'event_type', 'payment_id', 'data', 'created_at', 'processed_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'mercado_pago_id', 'event_type', 'payment_id')
        }),
        ('Datos del Webhook', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
        ('Estado de Procesamiento', {
            'fields': ('processed', 'processed_at', 'error_message')
        }),
        ('Metadatos', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
