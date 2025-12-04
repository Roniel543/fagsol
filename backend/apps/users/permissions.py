"""
Sistema de Permisos y Roles - FagSol Escuela Virtual

Este módulo implementa el sistema de autorización usando roles y permisos.
Utiliza grupos de Django para gestionar roles y policies reutilizables.
"""

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import Group
from apps.core.models import UserProfile


# Constantes de roles
ROLE_ADMIN = 'admin'
ROLE_INSTRUCTOR = 'instructor'
ROLE_STUDENT = 'student'
ROLE_GUEST = 'guest'

# Nombres de grupos de Django (se crearán automáticamente)
GROUP_ADMIN = 'Administradores'
GROUP_INSTRUCTOR = 'Instructores'
GROUP_STUDENT = 'Estudiantes'
GROUP_GUEST = 'Invitados'


def get_user_role(user):
    """
    Obtiene el rol del usuario desde su perfil.
    
    Args:
        user: Usuario de Django
        
    Returns:
        str: Rol del usuario ('admin', 'instructor', 'student', 'guest')
    """
    if not user or not user.is_authenticated:
        return ROLE_GUEST
    
    try:
        profile = user.profile
        return profile.role
    except UserProfile.DoesNotExist:
        # Si no tiene perfil, es guest
        return ROLE_GUEST


def has_role(user, role):
    """
    Verifica si el usuario tiene un rol específico.
    
    Args:
        user: Usuario de Django
        role: Rol a verificar ('admin', 'instructor', 'student', 'guest')
        
    Returns:
        bool: True si el usuario tiene el rol
    """
    user_role = get_user_role(user)
    return user_role == role


def has_any_role(user, roles):
    """
    Verifica si el usuario tiene alguno de los roles especificados.
    
    Args:
        user: Usuario de Django
        roles: Lista de roles a verificar
        
    Returns:
        bool: True si el usuario tiene alguno de los roles
    """
    user_role = get_user_role(user)
    return user_role in roles


def is_admin(user):
    """Verifica si el usuario es administrador"""
    return has_role(user, ROLE_ADMIN)


def is_instructor(user):
    """Verifica si el usuario es instructor"""
    return has_role(user, ROLE_INSTRUCTOR)


def is_student(user):
    """Verifica si el usuario es estudiante"""
    return has_role(user, ROLE_STUDENT)


def is_guest(user):
    """Verifica si el usuario es invitado (no autenticado)"""
    return not user or not user.is_authenticated or has_role(user, ROLE_GUEST)


# ============================================
# POLICIES REUTILIZABLES
# ============================================

def can_view_course(user, course):
    """
    Policy: Verifica si el usuario puede ver un curso.
    
    Reglas:
    - Admin e instructores pueden ver todos los cursos
    - Estudiantes pueden ver cursos publicados o cursos en los que están inscritos
    - Invitados solo pueden ver cursos publicados
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
        
    Returns:
        bool: True si el usuario puede ver el curso
    """
    if not user or not user.is_authenticated:
        # Invitados solo pueden ver cursos publicados
        return course.status == 'published' and course.is_active
    
    user_role = get_user_role(user)
    
    # Admin e instructores pueden ver todo
    if user_role in [ROLE_ADMIN, ROLE_INSTRUCTOR]:
        return True
    
    # Estudiantes pueden ver cursos publicados o cursos en los que están inscritos
    if user_role == ROLE_STUDENT:
        if course.status == 'published' and course.is_active:
            return True
        # Verificar si está inscrito
        from apps.users.models import Enrollment
        return Enrollment.objects.filter(
            user=user,
            course=course,
            status='active'
        ).exists()
    
    return False


def can_create_course(user):
    """
    Verifica si el usuario puede crear cursos
    
    Reglas:
    - Admin: Siempre puede crear cursos
    - Instructor: Solo si está aprobado (FASE 1)
    - Otros: No pueden crear cursos
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin siempre puede crear
    if user_role == ROLE_ADMIN:
        return True
    
    # Instructor solo si está aprobado
    if user_role == ROLE_INSTRUCTOR:
        try:
            profile = user.profile
            return profile.is_instructor_approved()
        except UserProfile.DoesNotExist:
            return False
    
    return False


def can_publish_course(user, course):
    """
    Verifica si el usuario puede publicar un curso
    
    Reglas:
    - Admin: Siempre puede publicar
    - Instructor: NO puede publicar directamente, debe solicitar revisión
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
        
    Returns:
        bool: True si el usuario puede publicar el curso
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin siempre puede publicar
    if user_role == ROLE_ADMIN:
        return True
    
    # Instructores NO pueden publicar directamente
    # Deben solicitar revisión primero
    return False


def can_request_review(user, course):
    """
    Verifica si el usuario puede solicitar revisión de un curso
    
    Reglas:
    - Admin: Puede solicitar revisión (aunque normalmente publica directamente)
    - Instructor: Solo si puede editar el curso y el curso está en draft o needs_revision
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
        
    Returns:
        bool: True si el usuario puede solicitar revisión
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin puede solicitar revisión
    if user_role == ROLE_ADMIN:
        return course.can_request_review()
    
    # Instructor solo si puede editar y el curso puede solicitar revisión
    if user_role == ROLE_INSTRUCTOR:
        return can_edit_course(user, course) and course.can_request_review()
    
    return False


def can_edit_course(user, course):
    """
    Policy: Verifica si el usuario puede editar un curso.
    
    Reglas:
    - Solo admin e instructores pueden editar cursos
    - Los instructores solo pueden editar sus propios cursos (si tienen campo owner)
    - Los instructores NO pueden editar cursos en 'pending_review' o 'published'
      (solo pueden editar cursos en 'draft' o 'needs_revision')
    - Los admins pueden editar cursos en cualquier estado
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
        
    Returns:
        bool: True si el usuario puede editar el curso
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin puede editar todo (sin restricciones de estado)
    if user_role == ROLE_ADMIN:
        return True
    
    # Instructores pueden editar sus propios cursos
    if user_role == ROLE_INSTRUCTOR:
        # Verificar ownership primero
        is_owner = False
        if course.created_by and course.created_by == user:
            is_owner = True
        elif hasattr(course, 'instructor') and course.instructor == user:
            is_owner = True
        elif hasattr(course, 'owner') and course.owner == user:
            is_owner = True
        
        if not is_owner:
            return False
        
        # Validar estado: instructores NO pueden editar cursos en pending_review o published
        # Solo pueden editar cursos en draft o needs_revision
        if course.status in ['pending_review', 'published']:
            return False
        
        # Puede editar si está en draft o needs_revision
        return course.status in ['draft', 'needs_revision']
    
    return False


def can_delete_course(user, course):
    """
    Policy: Verifica si el usuario puede eliminar un curso.
    
    Reglas:
    - Admin: Puede eliminar cualquier curso (pero se recomienda validar estudiantes)
    - Instructor: Solo puede eliminar sus propios cursos que:
        * Estén en estado 'draft' o 'needs_revision'
        * NO tengan estudiantes inscritos (enrollments activos)
    - Otros: No pueden eliminar cursos
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
    
    Returns:
        Tuple[bool, str]: (puede_eliminar, mensaje_explicativo)
    """
    if not user or not user.is_authenticated:
        return False, "Debes estar autenticado para eliminar cursos"
    
    user_role = get_user_role(user)
    
    # Admin puede eliminar cualquier curso
    if user_role == ROLE_ADMIN:
        # Verificar si hay estudiantes inscritos (advertencia, no bloqueo)
        from apps.users.models import Enrollment
        enrollments_count = Enrollment.objects.filter(
            course=course,
            status__in=['active', 'completed']
        ).count()
        
        if enrollments_count > 0:
            return True, f"Advertencia: Este curso tiene {enrollments_count} estudiante(s) inscrito(s). Se recomienda contactar a los estudiantes antes de eliminar."
        return True, ""
    
    # Instructor solo puede eliminar sus propios cursos
    if user_role == ROLE_INSTRUCTOR:
        # Verificar que es el creador del curso
        if not course.created_by or course.created_by.id != user.id:
            return False, "Solo puedes eliminar tus propios cursos"
        
        # Verificar estado del curso
        if course.status not in ['draft', 'needs_revision']:
            return False, "Solo puedes eliminar cursos en estado 'Borrador' o 'Requiere Cambios'. Para eliminar cursos publicados, contacta a un administrador."
        
        # Verificar si hay estudiantes inscritos
        from apps.users.models import Enrollment
        enrollments_count = Enrollment.objects.filter(
            course=course,
            status__in=['active', 'completed']
        ).count()
        
        if enrollments_count > 0:
            return False, f"No puedes eliminar este curso porque tiene {enrollments_count} estudiante(s) inscrito(s). Contacta a un administrador si necesitas eliminar este curso."
        
        return True, ""
    
    return False, "No tienes permiso para eliminar cursos"


def can_access_course_content(user, course):
    """
    Policy: Verifica si el usuario puede acceder al contenido completo de un curso.
    
    Reglas:
    - Admin puede acceder a todo
    - Instructores solo pueden acceder a sus propios cursos (donde son creadores)
    - Estudiantes solo si están inscritos y el enrollment está activo
    
    Args:
        user: Usuario de Django
        course: Instancia de Course
        
    Returns:
        bool: True si el usuario puede acceder al contenido
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin puede acceder a todo
    if user_role == ROLE_ADMIN:
        return True
    
    # Instructores solo pueden acceder a sus propios cursos
    if user_role == ROLE_INSTRUCTOR:
        # Verificar que el curso fue creado por este instructor
        if course.created_by and course.created_by.id == user.id:
            return True
        # Si el curso tiene un campo instructor/owner, verificar
        if hasattr(course, 'instructor') and course.instructor and course.instructor.id == user.id:
            return True
        if hasattr(course, 'owner') and course.owner and course.owner.id == user.id:
            return True
        # Si no es el creador, no puede acceder (debe pagar como cualquier estudiante)
        return False
    
    # Estudiantes solo si están inscritos
    if user_role == ROLE_STUDENT:
        from apps.users.models import Enrollment
        return Enrollment.objects.filter(
            user=user,
            course=course,
            status='active'
        ).exists()
    
    return False


def can_view_enrollment(user, enrollment):
    """
    Policy: Verifica si el usuario puede ver un enrollment.
    
    Reglas:
    - Admin e instructores pueden ver todos los enrollments
    - Estudiantes solo pueden ver sus propios enrollments
    
    Args:
        user: Usuario de Django
        enrollment: Instancia de Enrollment
        
    Returns:
        bool: True si el usuario puede ver el enrollment
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin e instructores pueden ver todo
    if user_role in [ROLE_ADMIN, ROLE_INSTRUCTOR]:
        return True
    
    # Estudiantes solo pueden ver sus propios enrollments
    if user_role == ROLE_STUDENT:
        return enrollment.user == user
    
    return False


def can_update_lesson_progress(user, lesson, enrollment):
    """
    Policy: Verifica si el usuario puede actualizar el progreso de una lección.
    
    Reglas:
    - Admin e instructores pueden actualizar cualquier progreso
    - Estudiantes solo pueden actualizar su propio progreso
    - Debe tener un enrollment activo en el curso
    
    Args:
        user: Usuario de Django
        lesson: Instancia de Lesson
        enrollment: Instancia de Enrollment
        
    Returns:
        bool: True si el usuario puede actualizar el progreso
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin e instructores pueden actualizar cualquier progreso
    if user_role in [ROLE_ADMIN, ROLE_INSTRUCTOR]:
        return True
    
    # Estudiantes solo pueden actualizar su propio progreso
    if user_role == ROLE_STUDENT:
        # Verificar que el enrollment pertenece al usuario
        if enrollment.user != user:
            return False
        
        # Verificar que el enrollment está activo
        if enrollment.status != 'active':
            return False
        
        # Verificar que la lección pertenece al curso del enrollment
        if lesson.module.course != enrollment.course:
            return False
        
        return True
    
    return False


def can_view_certificate(user, certificate):
    """
    Policy: Verifica si el usuario puede ver/descargar un certificado.
    
    Reglas:
    - Admin e instructores pueden ver todos los certificados
    - Estudiantes solo pueden ver sus propios certificados
    
    Args:
        user: Usuario de Django
        certificate: Instancia de Certificate
        
    Returns:
        bool: True si el usuario puede ver el certificado
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Admin e instructores pueden ver todo
    if user_role in [ROLE_ADMIN, ROLE_INSTRUCTOR]:
        return True
    
    # Estudiantes solo pueden ver sus propios certificados
    if user_role == ROLE_STUDENT:
        return certificate.user == user
    
    return False


def can_process_payment(user):
    """
    Policy: Verifica si el usuario puede procesar pagos.
    
    Reglas:
    - Solo estudiantes autenticados pueden procesar pagos
    - Admin e instructores no pueden procesar pagos (solo ver)
    
    Args:
        user: Usuario de Django
        
    Returns:
        bool: True si el usuario puede procesar pagos
    """
    if not user or not user.is_authenticated:
        return False
    
    user_role = get_user_role(user)
    
    # Solo estudiantes pueden procesar pagos
    return user_role == ROLE_STUDENT


# ============================================
# PERMISSION CLASSES PARA DRF
# ============================================

class IsAdmin(permissions.BasePermission):
    """
    Permission class: Solo permite acceso a administradores
    """
    
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsInstructor(permissions.BasePermission):
    """
    Permission class: Solo permite acceso a instructores
    """
    
    def has_permission(self, request, view):
        return is_instructor(request.user)


class IsStudent(permissions.BasePermission):
    """
    Permission class: Solo permite acceso a estudiantes
    """
    
    def has_permission(self, request, view):
        return is_student(request.user)


class IsAdminOrInstructor(permissions.BasePermission):
    """
    Permission class: Permite acceso a admin e instructores
    """
    
    def has_permission(self, request, view):
        return has_any_role(request.user, [ROLE_ADMIN, ROLE_INSTRUCTOR])


class IsAdminOrStudent(permissions.BasePermission):
    """
    Permission class: Permite acceso a admin y estudiantes
    """
    
    def has_permission(self, request, view):
        return has_any_role(request.user, [ROLE_ADMIN, ROLE_STUDENT])


class CanViewCourse(permissions.BasePermission):
    """
    Permission class: Verifica si el usuario puede ver un curso específico
    """
    
    def has_object_permission(self, request, view, obj):
        return can_view_course(request.user, obj)


class CanAccessCourseContent(permissions.BasePermission):
    """
    Permission class: Verifica si el usuario puede acceder al contenido de un curso
    """
    
    def has_object_permission(self, request, view, obj):
        return can_access_course_content(request.user, obj)


class CanViewEnrollment(permissions.BasePermission):
    """
    Permission class: Verifica si el usuario puede ver un enrollment específico
    """
    
    def has_object_permission(self, request, view, obj):
        return can_view_enrollment(request.user, obj)


class CanViewCertificate(permissions.BasePermission):
    """
    Permission class: Verifica si el usuario puede ver un certificado específico
    """
    
    def has_object_permission(self, request, view, obj):
        return can_view_certificate(request.user, obj)


# ============================================
# UTILIDADES PARA GRUPOS DE DJANGO
# ============================================

def ensure_groups_exist():
    """
    Asegura que los grupos de roles existan en la base de datos.
    Se puede llamar desde una migración o signal.
    """
    groups_data = [
        (GROUP_ADMIN, ROLE_ADMIN),
        (GROUP_INSTRUCTOR, ROLE_INSTRUCTOR),
        (GROUP_STUDENT, ROLE_STUDENT),
        (GROUP_GUEST, ROLE_GUEST),
    ]
    
    for group_name, role in groups_data:
        Group.objects.get_or_create(name=group_name)


def assign_user_to_group(user, role):
    """
    Asigna un usuario a un grupo de Django según su rol.
    
    Args:
        user: Usuario de Django
        role: Rol del usuario ('admin', 'instructor', 'student', 'guest')
    """
    # Asegurar que los grupos existan
    ensure_groups_exist()
    
    # Mapeo de roles a grupos
    role_to_group = {
        ROLE_ADMIN: GROUP_ADMIN,
        ROLE_INSTRUCTOR: GROUP_INSTRUCTOR,
        ROLE_STUDENT: GROUP_STUDENT,
        ROLE_GUEST: GROUP_GUEST,
    }
    
    group_name = role_to_group.get(role)
    if group_name:
        # Usar get_or_create para mayor robustez (evita DoesNotExist)
        group, created = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)


# ============================================
# FUNCIONES PARA VERIFICAR PERMISOS DE DJANGO
# ============================================

def has_perm(user, perm_codename):
    """
    Verifica si el usuario tiene un permiso específico de Django.
    Combina verificación de permisos directos, de grupos y de roles.
    
    Args:
        user: Usuario de Django
        perm_codename: Código del permiso (ej: 'courses.add_course')
        
    Returns:
        bool: True si el usuario tiene el permiso
    """
    if not user or not user.is_authenticated:
        return False
    
    # Verificar permiso directo
    if user.has_perm(perm_codename):
        return True
    
    # Verificar por rol (compatibilidad con sistema actual)
    user_role = get_user_role(user)
    app_label, codename = perm_codename.split('.', 1)
    
    # Admin tiene todos los permisos
    if user_role == ROLE_ADMIN:
        return True
    
    # Verificar permisos específicos por rol
    if user_role == ROLE_INSTRUCTOR:
        # Instructores pueden crear/editar cursos
        if codename in ['add_course', 'change_course', 'view_course', 
                       'add_module', 'change_module', 'delete_module',
                       'add_lesson', 'change_lesson', 'delete_lesson',
                       'view_enrollment']:
            return True
    
    if user_role == ROLE_STUDENT:
        # Estudiantes pueden ver cursos y procesar pagos
        if codename in ['view_course', 'view_module', 'view_lesson',
                       'view_own_enrollment', 'process_payment', 'view_own_payment']:
            return True
    
    if user_role == ROLE_GUEST:
        # Invitados solo pueden ver cursos publicados
        if codename == 'view_course':
            return True
    
    return False


def has_any_perm(user, perm_codenames):
    """
    Verifica si el usuario tiene alguno de los permisos especificados.
    
    Args:
        user: Usuario de Django
        perm_codenames: Lista de códigos de permisos
        
    Returns:
        bool: True si el usuario tiene al menos uno de los permisos
    """
    return any(has_perm(user, perm) for perm in perm_codenames)


def require_perm(perm_codename):
    """
    Decorador para verificar permisos en vistas.
    
    Uso:
        @require_perm('courses.add_course')
        def my_view(request):
            ...
    """
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not has_perm(request.user, perm_codename):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"No tienes permiso para: {perm_codename}")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
