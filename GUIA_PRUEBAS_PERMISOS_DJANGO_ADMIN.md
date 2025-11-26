# 🧪 Guía de Pruebas - Sistema de Permisos desde Django Admin

**Fecha:** 2025-01-12  
**Objetivo:** Verificar que el sistema de permisos funciona correctamente

---

## 📋 **PREPARACIÓN**

### **1. Ejecutar comando de setup (si no lo has hecho):**

```bash
cd backend
python manage.py setup_permissions
```

Este comando crea:
- ✅ Los 4 grupos (Administradores, Instructores, Estudiantes, Invitados)
- ✅ Todos los permisos personalizados
- ✅ Asigna permisos a cada grupo

**Salida esperada:**
```
Creando grupos...
✓ Creado permiso: courses.view_course
✓ Creado permiso: courses.add_course
...
Asignando permisos a Administradores...
  ✓ 25 permisos asignados
Asignando permisos a Instructores...
  ✓ 11 permisos asignados
...
```

---

## 🔍 **PRUEBAS EN DJANGO ADMIN**

### **1. Verificar que los Grupos Existen**

**Pasos:**
1. Ir a `http://localhost:8000/admin/`
2. Iniciar sesión con un usuario admin
3. Ir a **"Groups"** (Grupos) en la sección **"AUTHENTICATION AND AUTHORIZATION"**
4. Verificar que existen 4 grupos:
   - ✅ **Administradores**
   - ✅ **Instructores**
   - ✅ **Estudiantes**
   - ✅ **Invitados**

**Qué verificar:**
- ✅ Los 4 grupos están presentes
- ✅ Cada grupo tiene permisos asignados (ver columna "Permissions")

---

### **2. Verificar Permisos Asignados a Cada Grupo**

**Para cada grupo, verificar los permisos:**

#### **Grupo: Administradores**
1. Hacer clic en **"Administradores"**
2. Ir a la pestaña **"Permissions"**
3. **Verificar:** Debe tener **TODOS** los permisos (aproximadamente 25+)

#### **Grupo: Instructores**
1. Hacer clic en **"Instructores"**
2. Ir a la pestaña **"Permissions"**
3. **Verificar:** Debe tener permisos de:
   - ✅ `courses.view_course`
   - ✅ `courses.add_course`
   - ✅ `courses.change_course`
   - ✅ `courses.view_module`
   - ✅ `courses.add_module`
   - ✅ `courses.change_module`
   - ✅ `courses.delete_module`
   - ✅ `courses.view_lesson`
   - ✅ `courses.add_lesson`
   - ✅ `courses.change_lesson`
   - ✅ `courses.delete_lesson`
   - ✅ `users.view_enrollment`

#### **Grupo: Estudiantes**
1. Hacer clic en **"Estudiantes"**
2. Ir a la pestaña **"Permissions"**
3. **Verificar:** Debe tener permisos de:
   - ✅ `courses.view_course`
   - ✅ `courses.view_module`
   - ✅ `courses.view_lesson`
   - ✅ `users.view_own_enrollment`
   - ✅ `payments.process_payment`
   - ✅ `payments.view_own_payment`
   - ✅ `payments.view_payment_intent`

#### **Grupo: Invitados**
1. Hacer clic en **"Invitados"**
2. Ir a la pestaña **"Permissions"**
3. **Verificar:** Debe tener solo:
   - ✅ `courses.view_course`

---

### **3. Probar Asignación Automática de Grupos (Signal)**

**Objetivo:** Verificar que cuando se crea/actualiza un `UserProfile`, el usuario se asigna automáticamente al grupo correspondiente.

#### **Prueba 3.1: Crear Usuario Nuevo**

**Pasos:**
1. Ir a **"Users"** en Django Admin
2. Hacer clic en **"Add user"**
3. Crear un usuario de prueba:
   - **Username:** `test_student@example.com`
   - **Password:** `testpass123`
   - **Password confirmation:** `testpass123`
4. Hacer clic en **"Save"**
5. **IMPORTANTE:** En la siguiente pantalla, crear el `UserProfile`:
   - Ir a la sección **"User profiles"**
   - Hacer clic en **"Add another User profile"**
   - Seleccionar **Role:** `student`
   - Hacer clic en **"Save"**

**Verificar:**
1. Ir a **"Users"** → Seleccionar el usuario creado
2. Ir a la pestaña **"Groups"**
3. **✅ DEBE estar en el grupo "Estudiantes"** (asignado automáticamente por el signal)

#### **Prueba 3.2: Cambiar Rol de Usuario**

**Pasos:**
1. Ir a **"Users"** → Seleccionar un usuario existente
2. Ir a la sección **"User profiles"**
3. Cambiar el **Role** de `student` a `instructor`
4. Hacer clic en **"Save"**

**Verificar:**
1. Ir a la pestaña **"Groups"** del usuario
2. **✅ DEBE estar en el grupo "Instructores"** (cambio automático)
3. **✅ NO debe estar en "Estudiantes"** (removido automáticamente)

#### **Prueba 3.3: Cambiar a Admin**

**Pasos:**
1. Seleccionar un usuario
2. Cambiar el **Role** a `admin`
3. Guardar

**Verificar:**
1. **✅ DEBE estar en el grupo "Administradores"**
2. **✅ NO debe estar en otros grupos**

---

### **4. Verificar Logs (Opcional)**

**Objetivo:** Verificar que el logging funciona correctamente.

**Dónde ver los logs:**
1. **Consola donde corre Django:** Los logs INFO aparecen en la consola
2. **Archivo de logs:** `backend/logs/django.log` (solo WARNING y superiores)

**Pasos:**
1. Abrir la consola donde corre `python manage.py runserver`
2. Crear o actualizar un `UserProfile` desde Django Admin (como en las pruebas anteriores)
3. **Verificar en la consola:**
   ```
   INFO apps.signals Usuario 1 (test@example.com) asignado al grupo Estudiantes (rol: student)
   ```

**Si se crea un grupo automáticamente:**
```
WARNING apps.signals Grupo Estudiantes no existía, creado automáticamente. Usuario 1 (test@example.com) asignado al grupo.
```

**Nota:** Los logs INFO solo aparecen en la consola. Los WARNING también se guardan en `backend/logs/django.log`.

---

### **5. Probar Permisos Directos en Usuario**

**Objetivo:** Verificar que se pueden asignar permisos individuales a usuarios.

**Pasos:**
1. Ir a **"Users"** → Seleccionar un usuario
2. Ir a la pestaña **"User permissions"**
3. Asignar un permiso individual (ej: `courses.add_course`)
4. Guardar

**Verificar:**
1. El permiso aparece en la lista de "User permissions"
2. El usuario tiene ese permiso además de los permisos de su grupo

---

### **6. Probar Endpoints de API (Verificación Adicional)**

**Objetivo:** Verificar que los permisos funcionan en los endpoints.

#### **6.1: Probar como Estudiante**

**Pasos:**
1. Crear un usuario con rol `student`
2. Obtener token JWT:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email": "student@test.com", "password": "password123"}'
   ```
3. Intentar crear un curso (debe fallar):
   ```bash
   curl -X POST http://localhost:8000/api/v1/courses/create/ \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "description": "Test", "price": 100}'
   ```
4. **✅ DEBE retornar error 403 o mensaje de "No tienes permiso"**

#### **6.2: Probar como Instructor**

**Pasos:**
1. Crear un usuario con rol `instructor` (y aprobarlo si es necesario)
2. Obtener token JWT
3. Intentar crear un curso (debe funcionar):
   ```bash
   curl -X POST http://localhost:8000/api/v1/courses/create/ \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "description": "Test", "price": 100}'
   ```
4. **✅ DEBE retornar éxito (201) y crear el curso**

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Configuración Inicial:**
- [ ] Comando `setup_permissions` ejecutado sin errores
- [ ] 4 grupos creados en Django Admin
- [ ] Permisos asignados a cada grupo

### **Grupos:**
- [ ] Grupo "Administradores" tiene todos los permisos
- [ ] Grupo "Instructores" tiene permisos de cursos
- [ ] Grupo "Estudiantes" tiene permisos de lectura y pagos
- [ ] Grupo "Invitados" tiene solo permiso de ver cursos

### **Signals (Asignación Automática):**
- [ ] Al crear usuario con rol `student` → se asigna a grupo "Estudiantes"
- [ ] Al cambiar rol de `student` a `instructor` → se cambia a grupo "Instructores"
- [ ] Al cambiar rol a `admin` → se asigna a grupo "Administradores"
- [ ] Al cambiar rol, se remueve del grupo anterior

### **Logging:**
- [ ] Los logs muestran asignación de usuarios a grupos
- [ ] Los logs muestran warnings si se crea un grupo automáticamente

### **Permisos:**
- [ ] Se pueden asignar permisos individuales a usuarios
- [ ] Los permisos de grupo funcionan correctamente
- [ ] Los endpoints respetan los permisos

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Problema: Los grupos no aparecen**

**Solución:**
```bash
python manage.py setup_permissions
```

### **Problema: El usuario no se asigna al grupo automáticamente**

**Verificar:**
1. ¿Existe el `UserProfile` para el usuario?
   - Ir a Django Admin → Users → Seleccionar usuario
   - Verificar que existe un "User profile" asociado
2. ¿El signal está registrado?
   - Verificar `backend/apps/users/apps.py` - debe importar signals
3. ¿Los grupos existen?
   - Ejecutar `python manage.py setup_permissions`

### **Problema: No veo los logs**

**Verificar:**
1. **Consola:** Los logs INFO aparecen en la consola donde corre `runserver`
2. **Nivel de logging:** Debe ser INFO o DEBUG (ya está configurado en `settings.py`)
3. **Logger:** Verificar que el logger se llama `'apps'` (ya está configurado)
4. **Archivo de logs:** Los WARNING se guardan en `backend/logs/django.log`
   - Verificar que existe el directorio `backend/logs/`
   - Si no existe, crearlo: `mkdir backend/logs`

---

## 📝 **NOTAS ADICIONALES**

### **Comandos Útiles:**

```bash
# Recrear todos los grupos y permisos
python manage.py setup_permissions --reset

# Verificar grupos en consola de Django
python manage.py shell
>>> from django.contrib.auth.models import Group
>>> Group.objects.all()
>>> Group.objects.get(name='Estudiantes').permissions.all()
```

### **Verificar desde Python Shell:**

```python
# En Django shell
from django.contrib.auth.models import User, Group
from apps.core.models import UserProfile

# Ver grupos de un usuario
user = User.objects.get(email='test@example.com')
print(user.groups.all())

# Ver permisos de un usuario (directos + de grupos)
print(user.get_all_permissions())

# Verificar si tiene un permiso específico
print(user.has_perm('courses.add_course'))
```

---

**Última actualización:** 2025-01-12

