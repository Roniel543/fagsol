"""
Admin configuration for payments app
"""
from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'payment_type', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['payment_type', 'status', 'created_at']
    search_fields = ['user__email', 'mercadopago_payment_id']
    readonly_fields = ['created_at', 'updated_at']

