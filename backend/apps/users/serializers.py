"""
User serializers for FagSol API
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from apps.core.serializers import BaseSerializer
from .models import User


class UserSerializer(BaseSerializer):
    """
    Serializer para el modelo User
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'avatar', 'bio', 'is_email_verified',
            'is_active', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'role', 'is_email_verified', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear usuarios
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone'
        ]

    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return attrs

    def create(self, validated_data):
        """
        Crear usuario con contraseña hasheada
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Generar token de verificación
        user.generate_verification_token()
        
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer para el login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validar credenciales
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if not user:
                raise serializers.ValidationError(
                    'No se pudo iniciar sesión con las credenciales proporcionadas.',
                    code='authorization'
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    'La cuenta está desactivada.',
                    code='authorization'
                )

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Debe incluir "email" y "password".',
                code='authorization'
            )


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar reseteo de contraseña
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Validar que el email exista
        """
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # No revelar si el email existe o no por seguridad
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar reseteo de contraseña
    """
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer para verificación de email
    """
    token = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar contraseña
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_old_password(self, value):
        """
        Validar que la contraseña actual sea correcta
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

    def validate(self, attrs):
        """
        Validar que las contraseñas nuevas coincidan
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Las contraseñas no coinciden."
            })
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar perfil de usuario
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'bio', 'avatar']

    def update(self, instance, validated_data):
        """
        Actualizar usuario
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

