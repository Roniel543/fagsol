# 📖 Guía de Uso - Sistema de Permisos Django

**Fecha:** 2025-01-12

---

## 🚀 **INICIO RÁPIDO**

### **1. Configurar Permisos (Primera vez):**

```bash
cd backend
python manage.py setup_permissions
```

**Salida esperada:**
```
Creando grupos...
Creando permisos personalizados...
  ✓ Creado permiso: courses.add_course
  ✓ Creado permiso: courses.change_course
  ...
Asignando permisos a Administradores...
  ✓ 25 permisos asignados
Asignando permisos a Instructores...
  ✓ 12 permisos asignados
Asignando permisos a Estudiantes...
  ✓ 7 permisos asignados
Asignando permisos a Invitados...
  ✓ 1 permisos asignados

✅ Permisos configurados correctamente!
```

---

## 📊 **ESTRUCTURA DE PERMISOS**

### **Permisos por Módulo:**

#### **Cursos (courses):**
- `courses.view_course` - Ver cursos
- `courses.add_course` - Crear cursos
- `courses.change_course` - Editar cursos
- `courses.delete_course` - Eliminar cursos
- `courses.publish_course` - Publicar cursos
- `courses.manage_all_courses` - Gestionar todos los cursos

#### **Módulos (courses):**
- `courses.view_module` - Ver módulos
- `courses.add_module` - Crear módulos
- `courses.change_module` - Editar módulos
- `courses.delete_module` - Eliminar módulos

#### **Lecciones (courses):**
- `courses.view_lesson` - Ver lecciones
- `courses.add_lesson` - Crear lecciones
- `courses.change_lesson` - Editar lecciones
- `courses.delete_lesson` - Eliminar lecciones

#### **Inscripciones (users):**
- `users.view_enrollment` - Ver inscripciones
- `users.add_enrollment` - Crear inscripciones
- `users.change_enrollment` - Editar inscripciones
- `users.view_own_enrollment` - Ver sus propias inscripciones

#### **Pagos (payments):**
- `payments.view_payment` - Ver pagos
- `payments.process_payment` - Procesar pagos
- `payments.view_own_payment` - Ver sus propios pagos
- `payments.view_payment_intent` - Ver payment intents

#### **Usuarios (users):**
- `users.manage_users` - Gestionar usuarios
- `users.view_all_users` - Ver todos los usuarios
- `users.change_user_role` - Cambiar roles de usuarios

---

## 💻 **USO EN CÓDIGO**

### **1. Verificar Permisos en Servicios:**

```python
from apps.users.permissions import has_perm

def create_course(user, title, ...):
    # Verificar permiso
    if not has_perm(user, 'courses.add_course'):
        return False, None, "No tienes permiso para crear cursos"
    
    # Crear curso...
    course = Course.objects.create(...)
    return True, course, None
```

### **2. Verificar Permisos en Vistas:**

```python
from apps.users.permissions import has_perm
from rest_framework.exceptions import PermissionDenied

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    if not has_perm(request.user, 'courses.add_course'):
        raise PermissionDenied("No tienes permiso para crear cursos")
    
    # Crear curso...
```

### **3. Usar Decorador:**

```python
from apps.users.permissions import require_perm

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@require_perm('courses.add_course')
def create_course(request):
    # El decorador ya verificó el permiso
    # Crear curso...
```

### **4. Verificar Múltiples Permisos:**

```python
from apps.users.permissions import has_any_perm

if has_any_perm(user, ['courses.add_course', 'courses.change_course']):
    # Usuario puede crear o editar
    ...
```

---

## 🔧 **GESTIÓN DESDE API (Admin)**

### **Listar Grupos:**

```bash
curl -X GET \
  http://localhost:8000/api/v1/admin/groups/ \
  -H "Authorization: Bearer <admin_token>"
```

### **Listar Permisos:**

```bash
curl -X GET \
  http://localhost:8000/api/v1/admin/permissions/ \
  -H "Authorization: Bearer <admin_token>"
```

### **Ver Permisos de Usuario:**

```bash
curl -X GET \
  http://localhost:8000/api/v1/admin/users/1/permissions/ \
  -H "Authorization: Bearer <admin_token>"
```

### **Asignar Permiso a Usuario:**

```bash
curl -X POST \
  http://localhost:8000/api/v1/admin/users/1/permissions/assign/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"permission_id": 1}'
```

### **Asignar Usuario a Grupo:**

```bash
curl -X POST \
  http://localhost:8000/api/v1/admin/users/1/groups/assign/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"group_id": 1}'
```

---

## 🎯 **EJEMPLOS POR ROL**

### **Admin puede:**
```python
has_perm(user, 'courses.add_course')  # ✅ True
has_perm(user, 'courses.delete_course')  # ✅ True
has_perm(user, 'users.manage_users')  # ✅ True
has_perm(user, 'payments.view_payment')  # ✅ True
```

### **Instructor puede:**
```python
has_perm(user, 'courses.add_course')  # ✅ True
has_perm(user, 'courses.change_course')  # ✅ True
has_perm(user, 'courses.delete_course')  # ❌ False (solo admin)
has_perm(user, 'users.manage_users')  # ❌ False
```

### **Estudiante puede:**
```python
has_perm(user, 'courses.view_course')  # ✅ True
has_perm(user, 'courses.add_course')  # ❌ False
has_perm(user, 'payments.process_payment')  # ✅ True
has_perm(user, 'payments.view_own_payment')  # ✅ True
```

### **Invitado puede:**
```python
has_perm(user, 'courses.view_course')  # ✅ True (solo publicados)
has_perm(user, 'courses.add_course')  # ❌ False
has_perm(user, 'payments.process_payment')  # ❌ False
```

---

## 🔄 **COMPATIBILIDAD**

El sistema es **100% compatible** con el sistema de roles existente:

```python
# Ambas formas funcionan:
has_perm(user, 'courses.add_course')  # ✅ Nuevo (Django permissions)
has_any_role(user, [ROLE_ADMIN, ROLE_INSTRUCTOR])  # ✅ Antiguo (roles)
```

**Recomendación:** Usar `has_perm()` para nuevos desarrollos, mantener `has_any_role()` para compatibilidad.

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

- [x] ✅ Comando `setup_permissions` creado
- [x] ✅ Grupos de Django configurados
- [x] ✅ Permisos personalizados creados
- [x] ✅ Funciones `has_perm()` implementadas
- [x] ✅ Endpoints de administración creados
- [x] ✅ Servicios actualizados (course_service)
- [x] ✅ Vistas actualizadas (enrollment_views.py usa `has_perm()`)
- [x] ✅ Tests para permisos de Django creados (`test_django_permissions.py`)
- [x] ✅ Documentación Swagger completa:
  - [x] `enrollment_views.py` - Documentación completa
  - [x] `admin_views.py` - Documentación mejorada

---

**Última actualización:** 2025-01-12

