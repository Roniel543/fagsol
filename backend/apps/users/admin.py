"""
Admin configuration for users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin para el modelo User
    """
    list_display = [
        'email', 'first_name', 'last_name', 'role',
        'is_email_verified', 'is_active', 'created_at'
    ]
    list_filter = ['role', 'is_email_verified', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Información Personal'), {
            'fields': ('first_name', 'last_name', 'phone', 'avatar', 'bio')
        }),
        (_('Permisos'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Verificación de Email'), {
            'fields': ('is_email_verified', 'email_verification_token', 'email_verified_at')
        }),
        (_('Fechas Importantes'), {
            'fields': ('last_login', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'email_verified_at']
    
    def get_queryset(self, request):
        """
        Personalizar queryset
        """
        qs = super().get_queryset(request)
        return qs.select_related()

