# 🔐 Flujo de Aprobación de Instructores - FagSol

## 📋 PROBLEMA IDENTIFICADO

Cuando un administrador cambia el rol de un usuario a "instructor" desde Django Admin, el usuario no puede crear cursos porque falta la aprobación.

**Causa:** El sistema requiere dos condiciones para que un instructor pueda crear cursos:
1. ✅ `role = 'instructor'` en `UserProfile`
2. ❌ `instructor_status = 'approved'` en `UserProfile` (falta cuando se cambia desde Django admin)

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **Opción 1: Aprobación Automática al Cambiar Rol (IMPLEMENTADA)**

Cuando un **admin** cambia el rol de un usuario a instructor desde el panel de admin del frontend, se aprueba automáticamente.

**Lógica:**
- Si un admin cambia `role` a `'teacher'` → Automáticamente se establece:
  - `instructor_status = 'approved'`
  - `instructor_approved_by = admin_user`
  - `instructor_approved_at = now()`

**Archivo modificado:**
- `backend/presentation/views/admin_views.py` - Función `update_user`

---

## 🔄 FLUJOS CORRECTOS

### **FLUJO 1: Usuario Solicita Ser Instructor (Flujo Normal)**

1. Usuario se registra como `student`
2. Usuario solicita ser instructor (`POST /api/v1/auth/apply-instructor/`)
3. Se crea `InstructorApplication` con `status='pending'`
4. Admin revisa la solicitud
5. Admin aprueba (`POST /api/v1/admin/instructor-applications/{id}/approve/`)
6. Se actualiza `UserProfile`:
   - `role = 'instructor'`
   - `instructor_status = 'approved'`
   - `instructor_approved_by = admin`
   - `instructor_approved_at = now()`
7. ✅ Instructor puede crear cursos

---

### **FLUJO 2: Admin Cambia Rol Directamente (Flujo Admin)**

1. Admin accede a `/admin/users/{id}/edit`
2. Admin cambia `role` de `student` a `instructor`
3. **AUTOMÁTICAMENTE** se establece:
   - `role = 'instructor'`
   - `instructor_status = 'approved'` ✅ **NUEVO**
   - `instructor_approved_by = admin_user` ✅ **NUEVO**
   - `instructor_approved_at = now()` ✅ **NUEVO**
4. ✅ Instructor puede crear cursos inmediatamente

---

### **FLUJO 3: Admin Crea Usuario Como Instructor**

1. Admin accede a `/admin/users/new`
2. Admin crea usuario con `role = 'instructor'`
3. **AUTOMÁTICAMENTE** se establece:
   - `role = 'instructor'`
   - `instructor_status = 'approved'` ✅ **NUEVO**
   - `instructor_approved_by = admin_user` ✅ **NUEVO**
   - `instructor_approved_at = now()` ✅ **NUEVO**
4. ✅ Instructor puede crear cursos inmediatamente

---

## ⚠️ CASO ESPECIAL: Django Admin

**Problema:** Si se cambia el rol desde Django Admin (`/admin/core/userprofile/`), NO se ejecuta la lógica de aprobación automática.

**Solución Manual:**
1. Ir a Django Admin → Core → Perfiles de Usuario
2. Editar el perfil del usuario
3. Cambiar `role` a `instructor`
4. **IMPORTANTE:** También cambiar `instructor_status` a `approved`
5. Guardar

**O mejor aún:** Usar el panel de admin del frontend (`/admin/users/{id}/edit`) que ya tiene la lógica automática.

---

## 🔍 VERIFICACIÓN DE PERMISOS

### **Función `can_create_course(user)`**

```python
def can_create_course(user):
    # Admin siempre puede
    if user_role == ROLE_ADMIN:
        return True
    
    # Instructor solo si está aprobado
    if user_role == ROLE_INSTRUCTOR:
        return profile.is_instructor_approved()  # Verifica instructor_status == 'approved'
    
    return False
```

### **Función `is_instructor_approved()`**

```python
def is_instructor_approved(self):
    if self.role != 'instructor':
        return False
    return self.instructor_status == 'approved'  # ← Requiere esto
```

---

## 📝 CAMPOS DEL MODELO UserProfile

```python
class UserProfile(models.Model):
    role = models.CharField(...)  # 'student', 'instructor', 'admin', 'guest'
    instructor_status = models.CharField(...)  # 'pending_approval', 'approved', 'rejected'
    instructor_approved_by = models.ForeignKey(User, ...)  # Admin que aprobó
    instructor_approved_at = models.DateTimeField(...)  # Fecha de aprobación
```

---

## ✅ CHECKLIST PARA VERIFICAR

- [ ] Usuario tiene `role = 'instructor'` en `UserProfile`
- [ ] Usuario tiene `instructor_status = 'approved'` en `UserProfile`
- [ ] `instructor_approved_by` está establecido (no null)
- [ ] `instructor_approved_at` está establecido (no null)
- [ ] Usuario puede acceder a `/instructor/courses/new`
- [ ] Usuario puede crear cursos sin error 403

---

## 🛠️ SOLUCIÓN PARA EL CASO ACTUAL

**Usuario:** `roniel.car.50@gmail.com` (ID: 9)

**Opción A: Desde Django Admin (Manual)**
1. Ir a `/admin/core/userprofile/9/change/`
2. Cambiar `instructor_status` a `approved`
3. Guardar

**Opción B: Desde Panel Admin Frontend (Recomendado)**
1. Ir a `/admin/users/9/edit`
2. Cambiar `role` a `instructor` (si no lo está)
3. Guardar → Se aprobará automáticamente

**Opción C: Usar Endpoint de Aprobación**
1. Como admin, llamar a `POST /api/v1/admin/instructors/9/approve/`
2. Esto aprobará al instructor

---

## 🎯 RECOMENDACIÓN

**Para el futuro:** Siempre usar el panel de admin del frontend (`/admin/users/`) en lugar de Django Admin para gestionar usuarios, ya que tiene la lógica de aprobación automática.

**Para casos existentes:** Crear un script de migración o comando de gestión para aprobar instructores que fueron creados desde Django Admin.

---

**Última actualización:** 2025-01-27  
**Estado:** ✅ Solución Implementada

