"""
Admin configuration for Users app
"""

from django.contrib import admin
from .models import Enrollment, Certificate


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'course', 'status', 'completed', 'completion_percentage', 'enrolled_at']
    list_filter = ['status', 'completed', 'enrolled_at']
    search_fields = ['id', 'user__email', 'course__title', 'course__id']
    readonly_fields = ['id', 'enrolled_at', 'created_at', 'updated_at']
    ordering = ['-enrolled_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'user', 'course', 'status')
        }),
        ('Progreso', {
            'fields': ('completed', 'completion_percentage', 'completed_at')
        }),
        ('Fechas', {
            'fields': ('enrolled_at', 'expires_at')
        }),
        ('Relaciones', {
            'fields': ('payment',),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'course', 'verification_code', 'issued_at']
    list_filter = ['issued_at', 'course']
    search_fields = ['id', 'user__email', 'course__title', 'verification_code']
    readonly_fields = ['id', 'verification_code', 'verification_url', 'issued_at']
    ordering = ['-issued_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'enrollment', 'user', 'course')
        }),
        ('Archivo', {
            'fields': ('file_url', 'file_path')
        }),
        ('Verificación', {
            'fields': ('verification_code', 'verification_url')
        }),
        ('Metadatos', {
            'fields': ('metadata', 'issued_at'),
            'classes': ('collapse',)
        }),
    )
