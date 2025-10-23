"""
Base serializers for FagSol API
"""
from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    """
    Serializer base con campos comunes
    """
    created_at = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    updated_at = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')

    class Meta:
        abstract = True


class SuccessResponseSerializer(serializers.Serializer):
    """
    Serializer para respuestas exitosas estandarizadas
    """
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = serializers.DictField(required=False)


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer para respuestas de error estandarizadas
    """
    success = serializers.BooleanField(default=False)
    error = serializers.DictField()

