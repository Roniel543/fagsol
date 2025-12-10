# 📋 Plan de Rutas - Dashboard y Panel Admin

## 🎯 **ESTRUCTURA DE RUTAS**

### **1. Dashboard Principal (Dinámico)**
```
/dashboard
├── Admin → Dashboard con sidebar
├── Instructor → Dashboard sin sidebar
└── Student → Dashboard sin sidebar
```

### **2. Panel de Administración (Solo Admin)**
```
/admin
├── /users → Gestión de usuarios
├── /courses → Gestión de cursos
├── /materials → Gestión de materiales
└── /students → Alumnos inscritos
```

---

## ✅ **IMPLEMENTACIÓN**

### **Cambios Necesarios:**

1. **Eliminar `/admin` (raíz)**
   - Eliminar `frontend/src/app/admin/page.tsx`
   - O hacer que redirija a `/dashboard`

2. **Mantener `/admin/*` para páginas de gestión**
   - `/admin/users` → Gestión de usuarios
   - `/admin/courses` → Gestión de cursos
   - `/admin/materials` → Gestión de materiales
   - `/admin/students` → Alumnos inscritos
   - Todas con layout con sidebar

3. **Dashboard dinámico en `/dashboard`**
   - Admin: Layout con sidebar + AdminDashboard
   - Instructor: Layout tradicional + InstructorDashboard
   - Student: Layout tradicional + StudentDashboard

---

## 🔄 **FLUJO DE NAVEGACIÓN**

### **Admin:**
1. Login → `/dashboard` (con sidebar)
2. Sidebar tiene links a:
   - Dashboard (activo)
   - Usuarios → `/admin/users`
   - Cursos → `/admin/courses`
   - Materiales → `/admin/materials`
   - Alumnos → `/admin/students`

### **Instructor:**
1. Login → `/dashboard` (sin sidebar)
2. Header con botones de acciones rápidas

### **Student:**
1. Login → `/dashboard` (sin sidebar)
2. Header con información personal

---

## 📁 **ARCHIVOS A MODIFICAR**

1. ✅ `frontend/src/app/dashboard/page.tsx` - Ya está bien (dinámico)
2. ❌ `frontend/src/app/admin/page.tsx` - Eliminar o redirigir
3. ✅ `frontend/src/app/admin/layout.tsx` - Mantener (para rutas /admin/*)
4. ✅ `frontend/src/features/dashboard/components/DashboardContent.tsx` - Ya está bien

---

## 🎨 **SIDEBAR - Solo para Admin**

El sidebar solo aparece cuando:
- El usuario es admin
- Está en `/dashboard` o en cualquier ruta `/admin/*`

