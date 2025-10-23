"""
Custom permissions for FagSol API
"""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es estudiante
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsTeacher(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es profesor
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'


class IsAdmin(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es administrador
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'superadmin']


class IsSuperAdmin(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es superadministrador
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'superadmin'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es el propietario del recurso o administrador
    """
    def has_object_permission(self, request, view, obj):
        # Los admins tienen acceso completo
        if request.user.role in ['admin', 'superadmin']:
            return True
        
        # El propietario tiene acceso a su propio recurso
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsEnrolledInCourse(permissions.BasePermission):
    """
    Permiso para verificar si el usuario está inscrito en un curso/módulo
    """
    def has_object_permission(self, request, view, obj):
        # Los admins y profesores siempre tienen acceso
        if request.user.role in ['admin', 'superadmin', 'teacher']:
            return True
        
        # Verificar si el estudiante está inscrito
        from apps.courses.models import Enrollment
        
        if hasattr(obj, 'module'):
            # Si es una lección, verificar inscripción al módulo
            return Enrollment.objects.filter(
                user=request.user,
                module=obj.module,
                status='active'
            ).exists()
        
        return False

