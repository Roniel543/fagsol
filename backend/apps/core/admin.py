"""
Configuración del Admin de Django - FagSol Escuela Virtual
"""

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, InstructorApplication


# Extender el admin de User para incluir el perfil
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil'


# Re-registrar UserAdmin con el perfil inline
admin.site.unregister(User)
admin.site.register(User, BaseUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone', 'is_email_verified', 'created_at']
    list_filter = ['role', 'is_email_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']


@admin.register(InstructorApplication)
class InstructorApplicationAdmin(admin.ModelAdmin):
    """
    Admin para gestionar solicitudes de instructores
    """
    list_display = [
        'user',
        'specialization',
        'experience_years',
        'status',
        'created_at',
        'reviewed_by',
        'reviewed_at'
    ]
    list_filter = ['status', 'created_at', 'reviewed_at']
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'specialization',
        'professional_title'
    ]
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user',)
        }),
        ('Información Profesional', {
            'fields': (
                'professional_title',
                'experience_years',
                'specialization',
                'bio',
                'portfolio_url',
                'cv_file'
            )
        }),
        ('Motivación', {
            'fields': ('motivation',)
        }),
        ('Revisión', {
            'fields': (
                'status',
                'reviewed_by',
                'reviewed_at',
                'rejection_reason'
            )
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Hacer campos readonly según el estado"""
        readonly = ['created_at', 'updated_at']
        if obj and obj.status != 'pending':
            readonly.extend(['user', 'professional_title', 'experience_years', 
                           'specialization', 'bio', 'portfolio_url', 'cv_file', 'motivation'])
        return readonly