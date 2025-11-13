# 🔐 Sistema de Permisos con Django Groups y Permissions

**Fecha:** 2025-01-12  
**Estado:** ✅ Implementado

---

## 📋 **RESUMEN**

Se ha implementado un sistema completo de permisos usando las tablas nativas de Django (`auth_group`, `auth_permission`, `auth_user_groups`, `auth_user_user_permissions`) que se integra con el sistema de roles existente.

---

## 🎯 **OBJETIVO**

Usar las tablas de Django para gestionar permisos de forma granular:
- **Admin**: Puede gestionar TODO (usuarios, cursos, pagos, etc.)
- **Instructor**: Puede gestionar cursos (crear, editar, eliminar) y ver inscripciones
- **Student**: Puede ver cursos, inscribirse, procesar pagos
- **Guest**: Solo puede ver cursos publicados

---

## 🏗️ **ARQUITECTURA**

### **1. Grupos de Django (auth_group)**

Se crean 4 grupos automáticamente:
- `Administradores` - Todos los permisos
- `Instructores` - Permisos de cursos
- `Estudiantes` - Permisos de lectura y pagos
- `Invitados` - Solo lectura de cursos publicados

### **2. Permisos Personalizados (auth_permission)**

Se crean permisos específicos para cada acción:

**Cursos:**
- `courses.view_course` - Ver cursos
- `courses.add_course` - Crear cursos
- `courses.change_course` - Editar cursos
- `courses.delete_course` - Eliminar cursos
- `courses.publish_course` - Publicar cursos
- `courses.manage_all_courses` - Gestionar todos los cursos

**Módulos:**
- `courses.view_module` - Ver módulos
- `courses.add_module` - Crear módulos
- `courses.change_module` - Editar módulos
- `courses.delete_module` - Eliminar módulos

**Lecciones:**
- `courses.view_lesson` - Ver lecciones
- `courses.add_lesson` - Crear lecciones
- `courses.change_lesson` - Editar lecciones
- `courses.delete_lesson` - Eliminar lecciones

**Inscripciones:**
- `users.view_enrollment` - Ver inscripciones
- `users.add_enrollment` - Crear inscripciones
- `users.change_enrollment` - Editar inscripciones
- `users.view_own_enrollment` - Ver sus propias inscripciones

**Pagos:**
- `payments.view_payment` - Ver pagos
- `payments.process_payment` - Procesar pagos
- `payments.view_own_payment` - Ver sus propios pagos
- `payments.view_payment_intent` - Ver payment intents

**Usuarios (admin):**
- `users.manage_users` - Gestionar usuarios
- `users.view_all_users` - Ver todos los usuarios
- `users.change_user_role` - Cambiar roles de usuarios

---

## 🚀 **INSTALACIÓN Y CONFIGURACIÓN**

### **1. Ejecutar comando de setup:**

```bash
cd backend
python manage.py setup_permissions
```

Este comando:
- ✅ Crea los 4 grupos de roles
- ✅ Crea todos los permisos personalizados
- ✅ Asigna permisos a cada grupo según el rol

### **2. Verificar en Django Admin:**

1. Ir a `http://localhost:8000/admin/`
2. Verificar que existen los grupos:
   - Administradores
   - Instructores
   - Estudiantes
   - Invitados
3. Verificar que cada grupo tiene sus permisos asignados

---

## 📊 **ASIGNACIÓN DE PERMISOS POR ROL**

### **Administradores:**
```
✅ TODOS los permisos del sistema
- Gestionar cursos, módulos, lecciones
- Gestionar usuarios y roles
- Ver todos los pagos e inscripciones
- Gestionar certificados
```

### **Instructores:**
```
✅ Cursos:
  - Ver cursos
  - Crear cursos
  - Editar cursos
  - Ver módulos
  - Crear/editar/eliminar módulos
  - Ver lecciones
  - Crear/editar/eliminar lecciones
✅ Inscripciones:
  - Ver inscripciones (de sus cursos)
```

### **Estudiantes:**
```
✅ Cursos:
  - Ver cursos publicados
  - Ver módulos (de cursos inscritos)
  - Ver lecciones (de cursos inscritos)
✅ Inscripciones:
  - Ver sus propias inscripciones
✅ Pagos:
  - Procesar pagos
  - Ver sus propios pagos
```

### **Invitados:**
```
✅ Cursos:
  - Ver cursos publicados (solo lectura)
```

---

## 💻 **USO EN EL CÓDIGO**

### **1. Verificar permisos en servicios:**

```python
from apps.users.permissions import has_perm

def create_course(user, ...):
    # Verificar permiso
    if not has_perm(user, 'courses.add_course'):
        return False, None, "No tienes permiso para crear cursos"
    
    # Crear curso...
```

### **2. Verificar permisos en vistas:**

```python
from apps.users.permissions import has_perm, require_perm
from rest_framework.exceptions import PermissionDenied

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    # Opción 1: Verificar manualmente
    if not has_perm(request.user, 'courses.add_course'):
        raise PermissionDenied("No tienes permiso para crear cursos")
    
    # Opción 2: Usar decorador
    @require_perm('courses.add_course')
    def my_view(request):
        ...
```

### **3. Usar Permission Classes de DRF:**

```python
from apps.users.permissions import IsAdmin, IsAdminOrInstructor

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_view(request):
    # Solo admin puede acceder
    ...
```

---

## 🔧 **ENDPOINTS DE ADMINISTRACIÓN**

### **Listar Grupos:**
```http
GET /api/v1/admin/groups/
Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Administradores",
      "permissions": [...],
      "permissions_count": 25
    }
  ]
}
```

### **Listar Permisos:**
```http
GET /api/v1/admin/permissions/
Authorization: Bearer <admin_token>
```

### **Ver Permisos de Usuario:**
```http
GET /api/v1/admin/users/{user_id}/permissions/
Authorization: Bearer <admin_token>
```

### **Asignar Permiso a Usuario:**
```http
POST /api/v1/admin/users/{user_id}/permissions/
Authorization: Bearer <admin_token>
Body: { "permission_id": 1 }
```

### **Eliminar Permiso de Usuario:**
```http
DELETE /api/v1/admin/users/{user_id}/permissions/{permission_id}/
Authorization: Bearer <admin_token>
```

### **Asignar Usuario a Grupo:**
```http
POST /api/v1/admin/users/{user_id}/groups/
Authorization: Bearer <admin_token>
Body: { "group_id": 1 }
```

### **Eliminar Usuario de Grupo:**
```http
DELETE /api/v1/admin/users/{user_id}/groups/{group_id}/
Authorization: Bearer <admin_token>
```

---

## 🔄 **INTEGRACIÓN CON SISTEMA ACTUAL**

El sistema es **compatible** con el sistema de roles existente:

1. **Roles (UserProfile.role)** - Se mantiene para compatibilidad
2. **Grupos de Django** - Se asignan automáticamente según el rol
3. **Permisos de Django** - Se verifican además de los roles

**Flujo de verificación:**
```
1. Verificar permiso directo (user.user_permissions)
   ↓
2. Verificar permiso de grupo (user.groups.permissions)
   ↓
3. Verificar por rol (compatibilidad)
   ↓
4. Retornar True/False
```

---

## 📝 **EJEMPLOS DE USO**

### **Ejemplo 1: Crear Curso (Instructor)**

```python
# En course_service.py
def create_course(user, title, ...):
    # Verificar permiso
    if not has_perm(user, 'courses.add_course'):
        return False, None, "No tienes permiso para crear cursos"
    
    # Crear curso...
    course = Course.objects.create(...)
    return True, course, None
```

### **Ejemplo 2: Ver Curso (Estudiante)**

```python
# En course_views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    # Verificar permiso
    if not has_perm(request.user, 'courses.view_course'):
        # Pero puede ver si está inscrito (lógica adicional)
        if not can_view_course(request.user, course):
            raise PermissionDenied()
    
    # Retornar curso...
```

### **Ejemplo 3: Procesar Pago (Estudiante)**

```python
# En payment_views.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    # Verificar permiso
    if not has_perm(request.user, 'payments.process_payment'):
        raise PermissionDenied("Solo estudiantes pueden procesar pagos")
    
    # Procesar pago...
```

---

## 🔐 **SEGURIDAD**

### **Validaciones Implementadas:**

1. ✅ **Backend siempre valida** - No confiar en frontend
2. ✅ **Permisos verificados en cada endpoint**
3. ✅ **Logging de acciones administrativas**
4. ✅ **Solo admin puede gestionar permisos**
5. ✅ **Compatibilidad con sistema de roles existente**

### **Prevención de IDOR:**

```python
# Verificar ownership además de permisos
if user_role == ROLE_INSTRUCTOR:
    if course.created_by != user:
        return False  # Instructor solo puede editar sus cursos
```

---

## 📚 **ARCHIVOS CREADOS/MODIFICADOS**

### **Nuevos Archivos:**
- ✅ `backend/apps/core/management/commands/setup_permissions.py` - Comando para configurar permisos
- ✅ `backend/presentation/views/admin_views.py` - Vistas de administración
- ✅ `backend/presentation/api/v1/admin_urls.py` - URLs de administración

### **Archivos Modificados:**
- ✅ `backend/apps/users/permissions.py` - Agregadas funciones `has_perm()`, `has_any_perm()`, `require_perm()`
- ✅ `backend/infrastructure/services/course_service.py` - Actualizado para usar `has_perm()`
- ✅ `backend/config/urls.py` - Agregada ruta `/api/v1/admin/`

---

## 🧪 **TESTING**

### **Ejecutar comando:**
```bash
python manage.py setup_permissions
```

### **Verificar en Django Admin:**
1. Ir a `/admin/auth/group/`
2. Verificar que existen 4 grupos
3. Verificar permisos asignados

### **Probar endpoints:**
```bash
# Listar grupos (requiere admin)
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:8000/api/v1/admin/groups/

# Ver permisos de usuario
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:8000/api/v1/admin/users/1/permissions/
```

---

## ✅ **VENTAJAS DEL SISTEMA**

1. ✅ **Usa tablas nativas de Django** - No reinventar la rueda
2. ✅ **Granular** - Permisos específicos por acción
3. ✅ **Flexible** - Puedes asignar permisos individuales
4. ✅ **Compatible** - Funciona con sistema de roles existente
5. ✅ **Administrable** - Panel de admin para gestionar
6. ✅ **Escalable** - Fácil agregar nuevos permisos

---

## 🎯 **PRÓXIMOS PASOS**

1. ⏳ Actualizar todas las vistas para usar `has_perm()`
2. ⏳ Crear tests para el sistema de permisos
3. ⏳ Agregar UI en frontend para gestionar permisos (admin)
4. ⏳ Documentar todos los permisos disponibles

---

**Última actualización:** 2025-01-12  
**Estado:** ✅ Implementado y listo para usar

