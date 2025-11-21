"""
Admin configuration for Courses app
"""

from django.contrib import admin
from .models import Course, Module, Lesson


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'slug', 'price', 'currency', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at']
    search_fields = ['id', 'title', 'slug', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'title', 'slug', 'description', 'short_description')
        }),
        ('Precio y Monetización', {
            'fields': ('price', 'currency')
        }),
        ('Estado y Visibilidad', {
            'fields': ('status', 'is_active', 'order')
        }),
        ('Imágenes', {
            'fields': ('thumbnail_url', 'banner_url'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_by', 'tags', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['id', 'title', 'lesson_type', 'duration_minutes', 'order', 'is_active']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'course', 'price', 'is_purchasable', 'order', 'is_active']
    list_filter = ['is_purchasable', 'is_active', 'course']
    search_fields = ['id', 'title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['course', 'order']
    inlines = [LessonInline]
    
    def save_model(self, request, obj, form, change):
        """Asegura que el ID se genere si no existe"""
        if not obj.id:
            from .models import generate_module_id
            obj.id = generate_module_id()
        super().save_model(request, obj, form, change)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'course', 'title', 'description')
        }),
        ('Precio Individual', {
            'fields': ('price', 'is_purchasable')
        }),
        ('Orden y Estado', {
            'fields': ('order', 'is_active')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'module', 'lesson_type', 'duration_minutes', 'order', 'is_active']
    list_filter = ['lesson_type', 'is_active', 'module__course']
    search_fields = ['id', 'title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['module', 'order']
    
    def save_model(self, request, obj, form, change):
        """Asegura que el ID se genere si no existe y valida el modelo"""
        if not obj.id:
            from .models import generate_lesson_id
            obj.id = generate_lesson_id()
        # full_clean() se llama automáticamente en save() del modelo
        # pero lo llamamos aquí también para mostrar errores en el admin
        try:
            obj.full_clean()
        except Exception as e:
            # Si hay errores de validación, Django los mostrará en el formulario
            pass
        super().save_model(request, obj, form, change)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'module', 'title', 'description')
        }),
        ('Contenido', {
            'fields': ('lesson_type', 'content_url', 'content_text', 'duration_minutes')
        }),
        ('Orden y Estado', {
            'fields': ('order', 'is_active')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
