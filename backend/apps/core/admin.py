"""
Configuración del Admin de Django - FagSol Escuela Virtual
"""

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, InstructorApplication, ContactMessage


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


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """
    Admin para gestionar mensajes de contacto
    """
    list_display = [
        'name',
        'email',
        'phone',
        'status',
        'created_at',
        'read_at',
        'message_preview'
    ]
    list_filter = ['status', 'created_at', 'read_at']
    search_fields = [
        'name',
        'email',
        'phone',
        'message'
    ]
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    fieldsets = (
        ('Información del Contacto', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Mensaje', {
            'fields': ('message',)
        }),
        ('Estado y Seguimiento', {
            'fields': (
                'status',
                'read_at',
                'admin_notes'
            )
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def message_preview(self, obj):
        """Muestra una vista previa del mensaje"""
        if obj.message:
            return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
        return '-'
    message_preview.short_description = 'Vista Previa del Mensaje'
    
    def save_model(self, request, obj, form, change):
        """Marca como leído cuando el admin lo abre por primera vez"""
        if change and obj.status == 'new' and not obj.read_at:
            from django.utils import timezone
            obj.read_at = timezone.now()
            obj.status = 'read'
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """Optimizar queries"""
        return super().get_queryset(request).select_related()