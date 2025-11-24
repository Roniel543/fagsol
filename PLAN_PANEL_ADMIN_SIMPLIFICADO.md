# 🎯 Plan Simplificado: Panel de Administrador - FagSol

## 📋 Alcance del Proyecto

**Solo implementaremos:**
1. ✅ **Gestión de Usuarios** (CRUD completo)
2. ✅ **Gestión de Cursos** (CRUD con módulos y lecciones)
3. ✅ **Gestión de Materiales** (Videos de Vimeo, enlaces)
4. ✅ **Visualización de Alumnos Inscritos** (por curso)
5. ✅ **Creación de Curso Piloto** (flujo completo)

**NO incluimos:**
- ❌ Gestión de pagos
- ❌ Gestión de certificados
- ❌ Reportes avanzados
- ❌ Configuración del sistema
- ❌ Logs y auditoría
- ❌ Analytics complejos

---

## 🏗️ Estructura Simplificada

```
frontend/src/app/admin/
├── layout.tsx                    # Layout con sidebar
├── page.tsx                      # Dashboard básico
│
├── users/                       # Gestión de usuarios
│   ├── page.tsx                 # Lista de usuarios
│   ├── [id]/
│   │   ├── page.tsx             # Detalle de usuario
│   │   └── edit/
│   │       └── page.tsx         # Editar usuario
│   └── new/
│       └── page.tsx             # Crear usuario
│
├── courses/                     # Gestión de cursos
│   ├── page.tsx                 # Lista de cursos (✅ YA EXISTE - mejorar)
│   ├── new/
│   │   └── page.tsx             # Crear curso (✅ YA EXISTE - mejorar)
│   └── [id]/
│       ├── page.tsx             # Detalle de curso
│       ├── edit/
│       │   └── page.tsx         # Editar curso (✅ YA EXISTE - mejorar)
│       ├── modules/              # Gestión de módulos
│       │   ├── page.tsx         # Lista de módulos
│       │   ├── new/
│       │   │   └── page.tsx     # Crear módulo
│       │   └── [moduleId]/
│       │       ├── edit/
│       │       │   └── page.tsx # Editar módulo
│       │       └── lessons/     # Gestión de lecciones
│       │           ├── page.tsx # Lista de lecciones
│       │           ├── new/
│       │           │   └── page.tsx # Crear lección
│       │           └── [lessonId]/
│       │               └── edit/
│       │                   └── page.tsx # Editar lección
│       ├── materials/           # Gestión de materiales
│       │   ├── page.tsx         # Lista de materiales
│       │   └── new/
│       │       └── page.tsx     # Agregar material (video/enlace)
│       └── students/            # Alumnos inscritos
│           └── page.tsx         # Lista de alumnos inscritos
```

---

## 🎯 Funcionalidades por Módulo

### **1. Dashboard Principal** (`/admin`)

#### **Estadísticas Básicas:**
- Total de usuarios (por rol)
- Total de cursos (publicados, borradores)
- Total de alumnos inscritos
- Cursos pendientes de revisión

#### **Acciones Rápidas:**
- Crear nuevo curso
- Crear nuevo usuario
- Ver cursos pendientes

---

### **2. Gestión de Usuarios** (`/admin/users`)

#### **Lista de Usuarios:**
- 🔍 **Filtros:**
  - Por rol (admin, instructor, student)
  - Por estado (activo, inactivo)
  - Búsqueda por nombre, email

- 📋 **Tabla:**
  - ID, Nombre, Email, Rol, Estado, Fecha de registro
  - Acciones: Ver, Editar, Eliminar, Activar/Desactivar
  - Paginación

#### **Detalle de Usuario** (`/admin/users/[id]`):
- Información personal
- Rol y permisos
- Cursos inscritos
- Acciones: Editar, Activar/Desactivar

#### **Crear/Editar Usuario:**
- Formulario: Nombre, Email, Contraseña, Rol
- Validación completa
- Asignación de rol

---

### **3. Gestión de Cursos** (`/admin/courses`)

#### **Lista de Cursos:**
- 🔍 **Filtros:**
  - Por estado (published, draft, pending_review)
  - Por categoría
  - Búsqueda por título

- 📋 **Tabla:**
  - Título, Estado, Instructor, Fecha, Inscripciones
  - Acciones: Ver, Editar, Eliminar, Publicar

#### **Crear Curso** (`/admin/courses/new`):
- **Información Básica:**
  - Título, Descripción, Categoría
  - Precio, Imagen
  - Estado (draft por defecto)

- **Guardar como borrador** o **Solicitar revisión**

#### **Editar Curso** (`/admin/courses/[id]/edit`):
- Mismo formulario que crear
- Guardar cambios
- Publicar curso (si es admin)

#### **Detalle de Curso** (`/admin/courses/[id]`):
- **Información General:**
  - Título, descripción, precio, estado
  - Instructor

- **Navegación a:**
  - Módulos y Lecciones
  - Materiales (videos, enlaces)
  - Alumnos inscritos

---

### **4. Gestión de Módulos** (`/admin/courses/[id]/modules`)

#### **Lista de Módulos:**
- Tabla con: Nombre, Orden, Lecciones, Acciones
- Botón: "Agregar Módulo"

#### **Crear/Editar Módulo:**
- Nombre del módulo
- Descripción
- Orden (posición)
- Guardar

---

### **5. Gestión de Lecciones** (`/admin/courses/[id]/modules/[moduleId]/lessons`)

#### **Lista de Lecciones:**
- Tabla con: Título, Orden, Duración, Tipo, Acciones
- Botón: "Agregar Lección"

#### **Crear/Editar Lección:**
- **Información:**
  - Título
  - Descripción
  - Orden (posición en el módulo)
  - Duración (opcional)

- **Tipo de Contenido:**
  - Video (Vimeo)
  - Enlace externo
  - Texto/Contenido

- **Si es Video:**
  - URL de Vimeo
  - Validación de formato

- **Si es Enlace:**
  - URL
  - Título del enlace
  - Descripción

- **Si es Texto:**
  - Editor de texto enriquecido

---

### **6. Gestión de Materiales** (`/admin/courses/[id]/materials`)

#### **Lista de Materiales:**
- Tabla con todos los materiales del curso:
  - Videos de Vimeo
  - Enlaces externos
  - Archivos (si aplica)

- **Filtros:**
  - Por tipo (video, enlace)
  - Por módulo/lección

#### **Agregar Material:**
- **Tipo de Material:**
  - Video de Vimeo
  - Enlace externo

- **Si es Video Vimeo:**
  - URL de Vimeo
  - Título
  - Descripción
  - Asociar a módulo/lección (opcional)

- **Si es Enlace:**
  - URL
  - Título
  - Descripción
  - Asociar a módulo/lección (opcional)

---

### **7. Alumnos Inscritos** (`/admin/courses/[id]/students`)

#### **Lista de Alumnos:**
- 📋 **Tabla:**
  - Nombre, Email, Fecha de inscripción, Progreso, Estado
  - Acciones: Ver perfil, Ver progreso

- 🔍 **Filtros:**
  - Por estado (activo, completado)
  - Por progreso
  - Búsqueda por nombre/email

#### **Detalle de Alumno:**
- Información del alumno
- Progreso en el curso:
  - Módulos completados
  - Lecciones completadas
  - Porcentaje de avance
- Historial de actividad

---

## 🎨 UI/UX Simplificado

### **Componentes Necesarios:**

```
frontend/src/features/admin/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx          # Layout con sidebar
│   │   ├── AdminSidebar.tsx         # Sidebar de navegación
│   │   └── AdminHeader.tsx          # Header
│   │
│   ├── tables/
│   │   ├── UserTable.tsx            # Tabla de usuarios
│   │   ├── CourseTable.tsx          # Tabla de cursos
│   │   └── StudentTable.tsx         # Tabla de alumnos
│   │
│   ├── forms/
│   │   ├── UserForm.tsx             # Formulario de usuario
│   │   ├── CourseForm.tsx           # Formulario de curso
│   │   ├── ModuleForm.tsx           # Formulario de módulo
│   │   ├── LessonForm.tsx           # Formulario de lección
│   │   └── MaterialForm.tsx          # Formulario de material
│   │
│   └── cards/
│       ├── StatCard.tsx             # Tarjeta de estadística
│       └── CourseCard.tsx           # Tarjeta de curso
│
├── hooks/
│   ├── useAdminUsers.ts             # Hook para usuarios
│   ├── useAdminCourses.ts           # Hook para cursos
│   └── useAdminStudents.ts          # Hook para alumnos
│
└── services/
    ├── adminUsers.ts                # Servicio de usuarios
    ├── adminCourses.ts              # Servicio de cursos
    └── adminStudents.ts             # Servicio de alumnos
```

---

## 📡 Endpoints Backend Necesarios

### **Gestión de Usuarios:**
```
GET    /api/v1/admin/users/                    # Lista (con filtros)
GET    /api/v1/admin/users/{id}/               # Detalle
POST   /api/v1/admin/users/                    # Crear
PUT    /api/v1/admin/users/{id}/               # Actualizar
DELETE /api/v1/admin/users/{id}/               # Eliminar (soft)
POST   /api/v1/admin/users/{id}/activate/      # Activar
POST   /api/v1/admin/users/{id}/deactivate/    # Desactivar
```

### **Gestión de Cursos:**
```
GET    /api/v1/admin/courses/                  # Lista (✅ YA EXISTE)
GET    /api/v1/admin/courses/{id}/             # Detalle
POST   /api/v1/admin/courses/                  # Crear (✅ YA EXISTE)
PUT    /api/v1/admin/courses/{id}/             # Actualizar (✅ YA EXISTE)
DELETE /api/v1/admin/courses/{id}/             # Eliminar
```

### **Gestión de Módulos:**
```
GET    /api/v1/admin/courses/{id}/modules/     # Lista de módulos
POST   /api/v1/admin/courses/{id}/modules/     # Crear módulo
PUT    /api/v1/admin/modules/{id}/             # Actualizar módulo
DELETE /api/v1/admin/modules/{id}/             # Eliminar módulo
```

### **Gestión de Lecciones:**
```
GET    /api/v1/admin/modules/{id}/lessons/     # Lista de lecciones
POST   /api/v1/admin/modules/{id}/lessons/     # Crear lección
PUT    /api/v1/admin/lessons/{id}/             # Actualizar lección
DELETE /api/v1/admin/lessons/{id}/             # Eliminar lección
```

### **Gestión de Materiales:**
```
GET    /api/v1/admin/courses/{id}/materials/   # Lista de materiales
POST   /api/v1/admin/courses/{id}/materials/   # Agregar material
PUT    /api/v1/admin/materials/{id}/           # Actualizar material
DELETE /api/v1/admin/materials/{id}/           # Eliminar material
```

### **Alumnos Inscritos:**
```
GET    /api/v1/admin/courses/{id}/students/    # Lista de alumnos
GET    /api/v1/admin/courses/{id}/students/{student_id}/progress/  # Progreso
```

---

## 🚀 Plan de Implementación (Simplificado)

### **Fase 1: Layout y Dashboard (Semana 1)**
1. ✅ Crear layout con sidebar
2. ✅ Dashboard básico con estadísticas
3. ✅ Navegación entre secciones

### **Fase 2: Gestión de Usuarios (Semana 2)**
1. ✅ Backend: Endpoints CRUD de usuarios
2. ✅ Frontend: Lista de usuarios
3. ✅ Frontend: Crear/Editar usuario

### **Fase 3: Gestión de Cursos - Mejoras (Semana 3)**
1. ✅ Mejorar formulario de curso existente
2. ✅ Agregar vista de detalle de curso
3. ✅ Mejorar lista de cursos

### **Fase 4: Módulos y Lecciones (Semana 4)**
1. ✅ Backend: Endpoints de módulos
2. ✅ Backend: Endpoints de lecciones
3. ✅ Frontend: Gestión de módulos
4. ✅ Frontend: Gestión de lecciones

### **Fase 5: Materiales (Semana 5)**
1. ✅ Backend: Endpoints de materiales
2. ✅ Frontend: Agregar videos de Vimeo
3. ✅ Frontend: Agregar enlaces
4. ✅ Frontend: Lista de materiales

### **Fase 6: Alumnos Inscritos (Semana 6)**
1. ✅ Backend: Endpoint de alumnos por curso
2. ✅ Backend: Endpoint de progreso
3. ✅ Frontend: Lista de alumnos
4. ✅ Frontend: Vista de progreso

---

## 🎨 Diseño Visual

### **Sidebar de Navegación:**
```
📊 Dashboard
👥 Usuarios
📚 Cursos
  ├─ Todos los cursos
  ├─ Crear curso
  └─ Pendientes
```

### **Colores:**
- Primario: Naranja (#FF6B35)
- Secundario: Azul (#004E89)
- Fondo: Gris claro (#F5F5F5)

---

## ✅ Checklist Simplificado

### **Backend:**
- [ ] Endpoints CRUD de usuarios
- [ ] Endpoints de módulos
- [ ] Endpoints de lecciones
- [ ] Endpoints de materiales
- [ ] Endpoint de alumnos inscritos
- [ ] Endpoint de progreso de alumnos

### **Frontend:**
- [ ] Layout con sidebar
- [ ] Dashboard básico
- [ ] Gestión de usuarios (CRUD)
- [ ] Gestión de cursos (mejorar existente)
- [ ] Gestión de módulos
- [ ] Gestión de lecciones
- [ ] Gestión de materiales (videos Vimeo, enlaces)
- [ ] Vista de alumnos inscritos

---

**Última actualización:** 2025-11-23
**Versión:** 2.0 (Simplificado)
**Alcance:** Solo funcionalidades esenciales

