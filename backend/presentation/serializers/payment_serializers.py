"""
Serializers para Pagos - FagSol Escuela Virtual
"""

from rest_framework import serializers
from decimal import Decimal


class ProcessPaymentSerializer(serializers.Serializer):
    """
    Serializer para procesar un pago con Mercado Pago Bricks
    
    IMPORTANTE: Solo acepta token, payment_method_id, installments, amount.
    NO acepta datos de tarjeta (card_number, expiration_month, expiration_year, security_code).
    """
    
    token = serializers.CharField(
        required=True,
        help_text="Token de Mercado Pago obtenido de CardPayment Brick"
    )
    payment_method_id = serializers.CharField(
        required=True,
        help_text="Payment method ID (ej: visa, master, amex)"
    )
    installments = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="Número de cuotas"
    )
    amount = serializers.DecimalField(
        required=True,
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
        help_text="Monto del pago (será validado contra el payment intent)"
    )
    payment_intent_id = serializers.CharField(
        required=True,
        help_text="ID del payment intent a procesar"
    )
    idempotency_key = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Clave de idempotencia (opcional, se genera si no se proporciona)"
    )
    
    def validate_payment_method_id(self, value):
        """Validar que el payment_method_id sea válido"""
        valid_methods = ['visa', 'master', 'amex', 'diners', 'elo', 'mastercard']
        value_lower = value.lower()
        if value_lower not in valid_methods:
            # Permitir cualquier string pero loggear advertencia
            # El backend puede validar conflictos de bins si es necesario
            pass
        return value_lower
    
    def validate_installments(self, value):
        """Validar que las cuotas sean válidas"""
        if value < 1:
            raise serializers.ValidationError("El número de cuotas debe ser al menos 1")
        if value > 12:
            raise serializers.ValidationError("El número máximo de cuotas es 12")
        return value
    
    def validate_token(self, value):
        """Validar formato básico del token"""
        if not value or len(value) < 10:
            raise serializers.ValidationError("Token inválido")
        return value


class PaymentHistorySerializer(serializers.Serializer):
    """
    Serializer para el historial de pagos de un usuario
    """
    id = serializers.CharField(read_only=True)
    payment_intent_id = serializers.CharField(source='payment_intent.id', read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    currency = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    installments = serializers.IntegerField(read_only=True)
    mercado_pago_payment_id = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    course_names = serializers.SerializerMethodField()
    course_ids = serializers.SerializerMethodField()
    
    def get_course_names(self, obj):
        """Obtener nombres de cursos del payment intent"""
        try:
            course_ids = obj.payment_intent.course_ids
            from apps.courses.models import Course
            courses = Course.objects.filter(id__in=course_ids)
            return [course.title for course in courses]
        except Exception:
            return []
    
    def get_course_ids(self, obj):
        """Obtener IDs de cursos del payment intent"""
        try:
            return obj.payment_intent.course_ids
        except Exception:
            return []

