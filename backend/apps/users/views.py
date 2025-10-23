"""
Views for users app
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from apps.core.permissions import IsAdmin
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailVerificationSerializer, ChangePasswordSerializer, UserUpdateSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Vista para registro de usuarios
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # TODO: Enviar email de verificación
        
        return Response({
            'success': True,
            'message': 'Usuario registrado exitosamente. Por favor verifica tu email.',
            'data': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Vista para login
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Actualizar último login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Login exitoso',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        })


class LogoutView(APIView):
    """
    Vista para logout
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logout exitoso'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    Vista para verificar email
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        try:
            user = User.objects.get(email_verification_token=token)
            user.verify_email()
            
            return Response({
                'success': True,
                'message': 'Email verificado exitosamente'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Token de verificación inválido'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """
    Vista para reenviar email de verificación
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        
        if user.is_email_verified:
            return Response({
                'success': False,
                'error': 'El email ya está verificado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.generate_verification_token()
        # TODO: Enviar email de verificación
        
        return Response({
            'success': True,
            'message': 'Email de verificación enviado'
        })


class PasswordResetRequestView(APIView):
    """
    Vista para solicitar reseteo de contraseña
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            user.generate_password_reset_token()
            # TODO: Enviar email con token de reseteo
        except User.DoesNotExist:
            pass  # No revelar si el email existe
        
        return Response({
            'success': True,
            'message': 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
        })


class PasswordResetConfirmView(APIView):
    """
    Vista para confirmar reseteo de contraseña
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(password_reset_token=token)
            
            if not user.is_password_reset_token_valid():
                return Response({
                    'success': False,
                    'error': 'El token ha expirado'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_token_created_at = None
            user.save()
            
            return Response({
                'success': True,
                'message': 'Contraseña actualizada exitosamente'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Token inválido'
            }, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveAPIView):
    """
    Vista para obtener usuario actual
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    """
    Vista para actualizar perfil de usuario
    """
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Vista para cambiar contraseña
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Contraseña actualizada exitosamente'
        })


class UserListView(generics.ListAPIView):
    """
    Vista para listar usuarios (solo admins)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['role', 'is_active', 'is_email_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'last_login']


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para detalle de usuario (solo admins)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

