"""
Admin configuration for courses app
"""
from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment, LessonProgress


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    fields = ['title', 'order', 'price', 'duration_hours', 'is_active']


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['title', 'order', 'content_type', 'content_url', 'duration_minutes', 'is_free']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'level', 'full_price', 'total_students', 'is_active', 'created_at']
    list_filter = ['level', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]
    readonly_fields = ['total_students', 'created_at', 'updated_at']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'price', 'duration_hours', 'is_active']
    list_filter = ['course', 'is_active']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'order', 'content_type', 'duration_minutes', 'is_free', 'is_active']
    list_filter = ['content_type', 'is_free', 'is_active']
    search_fields = ['title', 'description']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'module', 'status', 'progress_percentage', 'enrolled_at']
    list_filter = ['status', 'enrolled_at']
    search_fields = ['user__email', 'module__title']
    readonly_fields = ['enrolled_at', 'completed_at']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'is_completed', 'time_spent_minutes', 'started_at']
    list_filter = ['is_completed', 'started_at']
    search_fields = ['user__email', 'lesson__title']

