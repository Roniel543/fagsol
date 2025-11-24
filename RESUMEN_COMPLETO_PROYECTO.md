# 📚 Resumen Completo del Proyecto - FagSol Escuela Virtual

**Fecha de Actualización:** 2025-01-23  
**Estado:** 🚀 En Desarrollo Activo - Panel de Administración Completado

---

## 🎯 **RESUMEN EJECUTIVO**

FagSol Escuela Virtual es una plataforma educativa en línea que permite:
- **Estudiantes**: Acceder a cursos, inscribirse y seguir su progreso
- **Instructores**: Crear y gestionar contenido educativo (requiere aprobación)
- **Administradores**: Gestionar toda la plataforma (usuarios, cursos, materiales, alumnos)

El proyecto implementa un sistema de roles con flujos de aprobación y moderación, siguiendo principios de **Clean Architecture** tanto en backend como frontend.

---

## 🏗️ **ARQUITECTURA DEL PROYECTO**

### **Backend (Django 5.0 + PostgreSQL)**

#### **Estructura Clean Architecture:**
```
backend/
├── domain/                 # 🎯 Capa de Dominio
│   ├── entities/          # Entidades de negocio
│   ├── value_objects/      # Objetos de valor
│   └── repositories/       # Interfaces de repositorios
│
├── application/            # 🔧 Capa de Aplicación
│   ├── use_cases/         # Casos de uso
│   ├── dtos/              # Data Transfer Objects
│   └── interfaces/         # Interfaces de servicios
│
├── infrastructure/        # 🔌 Capa de Infraestructura
│   ├── database/          # Modelos de Django
│   ├── repositories/      # Implementaciones de repositorios
│   ├── services/          # Servicios (auth, dashboard, etc.)
│   └── external_services/ # Servicios externos
│
├── presentation/           # 🌐 Capa de Presentación
│   ├── api/               # URLs de la API
│   ├── serializers/       # Serializers de DRF
│   └── views/             # Vistas/Endpoints REST
│
└── apps/                  # 📦 Apps Django (modelos)
    ├── core/              # UserProfile, InstructorApplication
    ├── users/             # Gestión de usuarios
    ├── courses/           # Cursos, Módulos, Lecciones, Materiales
    └── payments/          # Pagos y transacciones
```

#### **Tecnologías Backend:**
- **Framework**: Django 5.0
- **API**: Django REST Framework (DRF)
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (access + refresh tokens)
- **Documentación**: Swagger/OpenAPI (drf-yasg)
- **Seguridad**: Django AXES (rate limiting)
- **Validación**: Serializers de DRF

### **Frontend (Next.js 14 + TypeScript)**

#### **Estructura Feature-Based:**
```
frontend/src/
├── app/                    # 🛣️ Rutas de Next.js (App Router)
│   ├── auth/              # Login, registro
│   ├── dashboard/         # Dashboard dinámico por rol
│   ├── admin/             # Panel de administración
│   ├── academy/           # Catálogo de cursos
│   └── instructor/        # Panel de instructor
│
├── features/              # 🎨 Módulos por funcionalidad
│   ├── auth/              # Componentes de autenticación
│   ├── dashboard/         # Dashboards (Student, Instructor, Admin)
│   ├── admin/             # Panel admin completo
│   ├── academy/           # Catálogo y visualización de cursos
│   └── instructor/        # Panel de instructor
│
└── shared/                # 🔄 Componentes y servicios compartidos
    ├── components/         # Componentes reutilizables
    ├── hooks/             # Hooks personalizados (SWR)
    ├── services/          # Servicios API
    └── utils/             # Utilidades
```

#### **Tecnologías Frontend:**
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Data Fetching**: SWR (React Hooks para data fetching)
- **Iconos**: Lucide React
- **Autenticación**: JWT en sessionStorage

---

## 👥 **SISTEMA DE ROLES Y PERMISOS**

### **Roles Disponibles:**

1. **Estudiante (student)**
   - Ver cursos publicados
   - Inscribirse en cursos
   - Acceder a contenido de cursos inscritos
   - Solicitar ser instructor
   - Ver su propio progreso

2. **Instructor (instructor)**
   - Requiere aprobación de administrador
   - Crear cursos (en estado draft)
   - Gestionar sus propios cursos
   - Ver estadísticas de sus cursos
   - Cursos requieren aprobación de admin para publicarse

3. **Administrador (admin)**
   - Acceso completo al sistema
   - Aprobar/rechazar instructores
   - Aprobar/rechazar cursos
   - Gestión completa de usuarios (CRUD)
   - Gestión de cursos, módulos, lecciones, materiales
   - Ver alumnos inscritos y su progreso

---

## ✅ **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Sistema de Autenticación Completo**

#### **Registro:**
- ✅ Formulario de registro con validación
- ✅ Confirmación de contraseña
- ✅ Botón mostrar/ocultar contraseña
- ✅ Normalización de email (lowercase, trim)
- ✅ Validación de contraseña (mínimo 8 caracteres)
- ✅ Registro automático como "student"

#### **Login:**
- ✅ Formulario de login con validación
- ✅ Botón mostrar/ocultar contraseña
- ✅ Manejo de bloqueos AXES (rate limiting)
- ✅ Mensajes de error claros
- ✅ Refresh automático de tokens

#### **Logout:**
- ✅ Invalidación de tokens server-side
- ✅ Limpieza de sessionStorage
- ✅ Redirección a login

**Archivos Clave:**
- `backend/infrastructure/services/auth_service.py`
- `backend/presentation/views/auth_views.py`
- `frontend/src/features/auth/components/LoginForm.tsx`
- `frontend/src/features/auth/components/RegisterForm.tsx`

---

### **2. Sistema de Solicitud de Instructor**

#### **Flujo Completo:**
1. Usuario (estudiante) solicita ser instructor
2. Completa formulario con información profesional
3. Solicitud queda en estado "pending"
4. Administrador revisa y aprueba/rechaza
5. Si aprobado, usuario se convierte en instructor

#### **Formulario de Solicitud:**
- Título Profesional (opcional)
- Años de Experiencia (opcional)
- Especialidad (opcional)
- Biografía (opcional)
- Portfolio/Website (opcional)
- Motivación (REQUERIDO)
- CV en PDF (opcional, máx. 5MB)

**Endpoints:**
- `POST /api/v1/auth/apply-instructor/` - Solicitar ser instructor
- `GET /api/v1/admin/instructor-applications/` - Listar solicitudes
- `POST /api/v1/admin/instructor-applications/{id}/approve/` - Aprobar
- `POST /api/v1/admin/instructor-applications/{id}/reject/` - Rechazar

**Archivos Clave:**
- `backend/apps/core/models.py` - Modelo `InstructorApplication`
- `backend/infrastructure/services/instructor_application_service.py`
- `frontend/src/features/auth/components/BecomeInstructorForm.tsx`
- `frontend/src/features/admin/pages/InstructorApplicationsAdminPage.tsx`

---

### **3. Dashboard Dinámico por Rol**

#### **Características:**
- ✅ Dashboard único en `/dashboard` que se adapta según el rol
- ✅ Redirección automática según rol del usuario
- ✅ Estadísticas específicas por rol

#### **Dashboard de Estudiante:**
- Cursos inscritos
- Progreso de cursos
- Certificados obtenidos
- Recomendaciones

#### **Dashboard de Instructor:**
- Mis cursos (total, publicados, borradores)
- Estudiantes únicos
- Inscripciones (activas, completadas)
- Calificación promedio
- Acciones rápidas (crear curso, ver catálogo)

#### **Dashboard de Administrador:**
- Estadísticas generales del sistema
- Usuarios totales (por rol)
- Cursos totales (por estado)
- Solicitudes pendientes
- Acciones rápidas

**Endpoints:**
- `GET /api/v1/dashboard/stats/` - Estadísticas según rol
- `GET /api/v1/dashboard/student/stats/` - Estadísticas de estudiante
- `GET /api/v1/dashboard/instructor/stats/` - Estadísticas de instructor
- `GET /api/v1/dashboard/admin/stats/` - Estadísticas de admin

**Archivos Clave:**
- `backend/infrastructure/services/dashboard_service.py`
- `backend/presentation/views/dashboard_views.py`
- `frontend/src/features/dashboard/components/DashboardContent.tsx`
- `frontend/src/features/dashboard/components/StudentDashboard.tsx`
- `frontend/src/features/dashboard/components/InstructorDashboard.tsx`
- `frontend/src/features/dashboard/components/AdminDashboard.tsx`

---

### **4. Panel de Administración Completo**

#### **4.1. Layout y Navegación**

**AdminSidebar:**
- ✅ Logo de FagSol con favicon
- ✅ Navegación principal:
  - Dashboard
  - Usuarios
  - Cursos
  - Materiales
  - Alumnos
- ✅ Información del usuario actual
- ✅ Botón de logout
- ✅ Diseño responsive (mobile-friendly)
- ✅ Indicador de página activa

**AdminLayout:**
- ✅ Layout consistente para todas las páginas admin
- ✅ Integración con ProtectedRoute
- ✅ Sidebar + área de contenido

**Archivos Clave:**
- `frontend/src/features/admin/components/layout/AdminSidebar.tsx`
- `frontend/src/features/admin/components/layout/AdminLayout.tsx`
- `frontend/src/app/admin/layout.tsx`

---

#### **4.2. Gestión de Usuarios (CRUD Completo)**

**Funcionalidades:**
- ✅ Lista de usuarios con filtros:
  - Por rol (student, instructor, admin)
  - Por estado (activo, inactivo)
  - Búsqueda por nombre, email
- ✅ Paginación
- ✅ Crear nuevo usuario
- ✅ Editar usuario existente
- ✅ Ver detalle de usuario
- ✅ Eliminar usuario (soft delete)
- ✅ Activar/Desactivar usuario

**Páginas:**
- `/admin/users` - Lista de usuarios
- `/admin/users/new` - Crear usuario
- `/admin/users/[id]/edit` - Editar usuario

**Endpoints Backend:**
- `GET /api/v1/admin/users/` - Listar usuarios (con filtros)
- `GET /api/v1/admin/users/{id}/` - Detalle de usuario
- `POST /api/v1/admin/users/create/` - Crear usuario
- `PUT /api/v1/admin/users/{id}/update/` - Actualizar usuario
- `DELETE /api/v1/admin/users/{id}/delete/` - Eliminar usuario
- `POST /api/v1/admin/users/{id}/activate/` - Activar usuario
- `POST /api/v1/admin/users/{id}/deactivate/` - Desactivar usuario

**Archivos Clave:**
- `backend/presentation/views/admin_views.py` - Endpoints CRUD
- `frontend/src/features/admin/pages/UsersAdminPage.tsx`
- `frontend/src/features/admin/components/UserForm.tsx`
- `frontend/src/shared/services/adminUsers.ts`
- `frontend/src/shared/hooks/useAdminUsers.ts`

---

#### **4.3. Gestión de Cursos**

**Funcionalidades:**
- ✅ Lista de cursos con filtros
- ✅ Crear nuevo curso
- ✅ Editar curso existente
- ✅ Eliminar curso
- ✅ Ver curso
- ✅ Enlaces a módulos, materiales y alumnos

**Páginas:**
- `/admin/courses` - Lista de cursos
- `/admin/courses/new` - Crear curso
- `/admin/courses/[id]/edit` - Editar curso
- `/admin/courses/[id]/modules` - Módulos del curso
- `/admin/courses/[id]/materials` - Materiales del curso
- `/admin/courses/[id]/students` - Alumnos inscritos

**Endpoints Backend:**
- `GET /api/v1/admin/courses/` - Listar cursos
- `POST /api/v1/admin/courses/` - Crear curso
- `PUT /api/v1/admin/courses/{id}/` - Actualizar curso
- `DELETE /api/v1/admin/courses/{id}/` - Eliminar curso

**Archivos Clave:**
- `frontend/src/features/admin/pages/CoursesAdminPage.tsx`
- `frontend/src/features/admin/components/CourseForm.tsx`

---

#### **4.4. Gestión de Módulos**

**Funcionalidades:**
- ✅ Lista de módulos de un curso
- ✅ Crear nuevo módulo
- ✅ Editar módulo existente
- ✅ Eliminar módulo
- ✅ Orden de módulos
- ✅ Módulos separables (con precio)
- ✅ Enlace a lecciones del módulo

**Páginas:**
- `/admin/courses/[id]/modules` - Lista de módulos
- `/admin/courses/[id]/modules/new` - Crear módulo
- `/admin/courses/[id]/modules/[moduleId]/edit` - Editar módulo
- `/admin/courses/[id]/modules/[moduleId]/lessons` - Lecciones del módulo

**Endpoints Backend:**
- `GET /api/v1/admin/courses/{id}/modules/` - Listar módulos
- `POST /api/v1/admin/courses/{id}/modules/create/` - Crear módulo
- `PUT /api/v1/admin/modules/{id}/update/` - Actualizar módulo
- `DELETE /api/v1/admin/modules/{id}/delete/` - Eliminar módulo

**Archivos Clave:**
- `backend/presentation/views/admin_views.py` - Endpoints de módulos
- `frontend/src/features/admin/pages/CourseModulesPage.tsx`
- `frontend/src/features/admin/components/ModuleForm.tsx`
- `frontend/src/shared/services/adminModules.ts`
- `frontend/src/shared/hooks/useAdminModules.ts`

---

#### **4.5. Gestión de Lecciones**

**Funcionalidades:**
- ✅ Lista de lecciones de un módulo
- ✅ Crear nueva lección
- ✅ Editar lección existente
- ✅ Eliminar lección
- ✅ Orden de lecciones
- ✅ Tipos de lección:
  - Video (Vimeo)
  - Texto
  - Documento
  - Quiz
- ✅ Duración de lección

**Páginas:**
- `/admin/courses/[id]/modules/[moduleId]/lessons` - Lista de lecciones
- `/admin/courses/[id]/modules/[moduleId]/lessons/new` - Crear lección
- `/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]/edit` - Editar lección

**Endpoints Backend:**
- `GET /api/v1/admin/modules/{id}/lessons/` - Listar lecciones
- `POST /api/v1/admin/modules/{id}/lessons/create/` - Crear lección
- `PUT /api/v1/admin/lessons/{id}/update/` - Actualizar lección
- `DELETE /api/v1/admin/lessons/{id}/delete/` - Eliminar lección

**Archivos Clave:**
- `backend/presentation/views/admin_views.py` - Endpoints de lecciones
- `frontend/src/features/admin/pages/ModuleLessonsPage.tsx`
- `frontend/src/features/admin/components/LessonForm.tsx`
- `frontend/src/shared/services/adminLessons.ts`
- `frontend/src/shared/hooks/useAdminLessons.ts`

---

#### **4.6. Gestión de Materiales**

**Funcionalidades:**
- ✅ Lista de materiales de un curso
- ✅ Crear nuevo material
- ✅ Editar material existente
- ✅ Eliminar material
- ✅ Tipos de material:
  - Video Vimeo
  - Enlace Externo
- ✅ Filtros por tipo
- ✅ Asociación opcional a módulo/lección

**Páginas:**
- `/admin/courses/[id]/materials` - Lista de materiales
- `/admin/courses/[id]/materials/new` - Crear material
- `/admin/courses/[id]/materials/[materialId]/edit` - Editar material

**Endpoints Backend:**
- `GET /api/v1/admin/courses/{id}/materials/` - Listar materiales
- `POST /api/v1/admin/courses/{id}/materials/create/` - Crear material
- `PUT /api/v1/admin/materials/{id}/update/` - Actualizar material
- `DELETE /api/v1/admin/materials/{id}/delete/` - Eliminar material

**Archivos Clave:**
- `backend/apps/courses/models.py` - Modelo `Material`
- `backend/presentation/views/admin_views.py` - Endpoints de materiales
- `frontend/src/features/admin/pages/CourseMaterialsPage.tsx`
- `frontend/src/features/admin/components/MaterialForm.tsx`
- `frontend/src/shared/services/adminMaterials.ts`
- `frontend/src/shared/hooks/useAdminMaterials.ts`

---

#### **4.7. Visualización de Alumnos Inscritos**

**Funcionalidades:**
- ✅ Lista de alumnos inscritos en un curso
- ✅ Filtros por estado y progreso
- ✅ Búsqueda por nombre/email
- ✅ Ver progreso detallado de cada alumno:
  - Módulos completados
  - Lecciones completadas
  - Porcentaje de avance
  - Tiempo invertido

**Páginas:**
- `/admin/courses/[id]/students` - Lista de alumnos
- `/admin/courses/[id]/students/[enrollmentId]/progress` - Progreso detallado

**Endpoints Backend:**
- `GET /api/v1/admin/courses/{id}/students/` - Listar alumnos inscritos
- `GET /api/v1/admin/courses/{id}/students/{student_id}/progress/` - Progreso del alumno

**Archivos Clave:**
- `backend/presentation/views/admin_views.py` - Endpoints de alumnos
- `frontend/src/features/admin/pages/CourseStudentsPage.tsx`
- `frontend/src/features/admin/pages/StudentProgressPage.tsx`
- `frontend/src/shared/services/adminStudents.ts`
- `frontend/src/shared/hooks/useAdminStudents.ts`

---

### **5. Mejoras de UI/UX**

#### **Contraste y Legibilidad:**
- ✅ Cards con fondo blanco (`bg-white`) en lugar de oscuro
- ✅ Textos con mejor contraste:
  - Títulos: `text-gray-900` (negro)
  - Descripciones: `text-gray-700` (gris oscuro)
  - Textos secundarios: `text-gray-700` con `font-medium`
- ✅ Badges con bordes para mejor definición
- ✅ Iconos con colores más saturados
- ✅ Enlaces con `font-medium` para mejor contraste

#### **Diseño Responsive:**
- ✅ Botones que se adaptan a diferentes tamaños de pantalla
- ✅ Uso de `flex-wrap` para elementos que se ajustan
- ✅ Sidebar responsive con menú móvil
- ✅ Tablas y listas adaptables

#### **Componentes Reutilizables:**
- ✅ `UserForm` - Formulario de usuario
- ✅ `ModuleForm` - Formulario de módulo
- ✅ `LessonForm` - Formulario de lección
- ✅ `MaterialForm` - Formulario de material
- ✅ `CourseForm` - Formulario de curso
- ✅ `Card` - Tarjeta con variantes
- ✅ `Button` - Botón con variantes
- ✅ `Input` - Campo de entrada
- ✅ `Modal` - Modal reutilizable

#### **Favicon y Logo:**
- ✅ Logo de FagSol en el sidebar
- ✅ Favicon configurado en todas las páginas
- ✅ Diseño consistente con la marca

---

## 🔐 **SEGURIDAD IMPLEMENTADA**

### **Autenticación:**
- ✅ JWT con access y refresh tokens
- ✅ Tokens almacenados en sessionStorage (más seguro)
- ✅ Refresh automático de tokens antes de expirar
- ✅ Validación de tokens en cada request
- ✅ Logout que invalida tokens server-side

### **Autorización:**
- ✅ Validación de permisos en backend (nunca confiar en frontend)
- ✅ Middleware de permisos por rol (`IsAdmin`, `IsInstructor`, etc.)
- ✅ Validación de ownership (instructor solo puede editar sus cursos)
- ✅ `ProtectedRoute` en frontend para redirección

### **Rate Limiting:**
- ✅ Django AXES configurado
- ✅ Bloqueo por usuario (no por IP) para evitar bloqueos masivos
- ✅ Configuración:
  - `AXES_LOCKOUT_BY_USER = True`
  - `AXES_LOCKOUT_BY_IP = False`
  - `AXES_FAILURE_LIMIT = 5` (dev) / `10` (prod)
  - `AXES_COOLOFF_TIME = 0.5` horas (dev) / `1` hora (prod)
- ✅ Comandos para desbloquear usuarios

### **Validaciones:**
- ✅ Sanitización de inputs
- ✅ Validación de tipos de archivo (PDF para CV)
- ✅ Validación de tamaños de archivo (máx. 5MB)
- ✅ Validación de URLs (deben comenzar con http:// o https://)
- ✅ Validación de emails (normalización)

---

## 🔧 **PROBLEMAS RESUELTOS**

### **1. Error de Login "Credenciales Inválidas"**
- **Problema:** Usuarios no podían iniciar sesión incluso con credenciales correctas
- **Causas:**
  - Username NULL en base de datos
  - Bloqueos de AXES por IP (bloqueaba a todos)
  - Tokens expirados
- **Soluciones:**
  - Comando `fix_user_auth` para corregir usernames
  - Configuración de AXES para bloquear por usuario, no por IP
  - Comando `unlock_all_users` para desbloquear usuarios
  - Refresh automático de tokens

### **2. Contador de Intentos de Login Incorrecto**
- **Problema:** Mostraba "2 de 5" en lugar de "1 de 5" después del primer intento fallido
- **Causa:** `authenticate()` se llamaba dos veces, incrementando el contador de AXES dos veces
- **Solución:** Refactorización de `auth_service.py` para llamar `authenticate()` solo una vez

### **3. Dashboard Mostraba Error en Primer Render**
- **Problema:** Dashboard mostraba error al cargar, funcionaba al recargar
- **Causa:** Hook intentaba cargar estadísticas antes de que autenticación terminara
- **Solución:** Hook espera a que `loading` de `useAuth` sea `false` antes de hacer petición

### **4. Rutas Confusas para Instructores**
- **Problema:** Instructores usaban rutas `/admin/courses/*` (confuso)
- **Solución:** Creación de rutas específicas `/instructor/courses/*`

### **5. Problemas de Contraste en UI**
- **Problema:** Textos no se veían bien en cards oscuras
- **Solución:** Cambio a fondo blanco en cards, mejor contraste en textos y badges

### **6. Botones No Responsive**
- **Problema:** Botones no se mostraban bien en pantallas pequeñas
- **Solución:** Ajuste de clases CSS con `flex-wrap`, `w-auto`, `sm:w-auto`

---

## 📊 **ESTADO ACTUAL DEL PROYECTO**

### **✅ Completado:**

#### **Backend:**
- ✅ Sistema de autenticación completo (login, registro, logout)
- ✅ Sistema de roles y permisos
- ✅ Flujo de solicitud de instructor
- ✅ Endpoints CRUD de usuarios
- ✅ Endpoints CRUD de cursos
- ✅ Endpoints CRUD de módulos
- ✅ Endpoints CRUD de lecciones
- ✅ Endpoints CRUD de materiales
- ✅ Endpoints de alumnos inscritos y progreso
- ✅ Dashboard con estadísticas por rol
- ✅ Sistema de aprobación de instructores
- ✅ Sistema de aprobación de cursos
- ✅ Django AXES para rate limiting
- ✅ Documentación Swagger/OpenAPI

#### **Frontend:**
- ✅ Sistema de autenticación completo
- ✅ Dashboard dinámico por rol
- ✅ Panel de administración completo:
  - Gestión de usuarios (CRUD)
  - Gestión de cursos
  - Gestión de módulos
  - Gestión de lecciones
  - Gestión de materiales
  - Visualización de alumnos inscritos
- ✅ Layout con sidebar
- ✅ Componentes reutilizables
- ✅ Hooks personalizados (SWR)
- ✅ Servicios API organizados
- ✅ Mejoras de UI/UX (contraste, responsive)
- ✅ Favicon y logo integrados

### **⏳ En Progreso:**
- Sistema de notificaciones por email
- Mejoras adicionales de UI/UX

### **📋 Pendiente:**
- Sistema completo de certificados
- Sistema de pagos completo
- Sistema de reviews/calificaciones
- Sistema de comentarios en cursos
- Analytics avanzados
- Exportación de reportes

---

## 📁 **ESTRUCTURA DE ARCHIVOS CLAVE**

### **Backend:**

#### **Modelos:**
- `apps/core/models.py`
  - `UserProfile` - Perfil de usuario con rol
  - `InstructorApplication` - Solicitudes de instructor
- `apps/courses/models.py`
  - `Course` - Cursos
  - `Module` - Módulos
  - `Lesson` - Lecciones
  - `Material` - Materiales del curso
  - `Enrollment` - Inscripciones

#### **Servicios:**
- `infrastructure/services/auth_service.py` - Lógica de autenticación
- `infrastructure/services/instructor_application_service.py` - Solicitudes de instructor
- `infrastructure/services/dashboard_service.py` - Estadísticas del dashboard
- `infrastructure/services/course_service.py` - Gestión de cursos

#### **Views:**
- `presentation/views/auth_views.py` - Login, registro, solicitud instructor
- `presentation/views/admin_views.py` - Gestión admin completa (CRUD)
- `presentation/views/dashboard_views.py` - Estadísticas del dashboard
- `presentation/views/course_views.py` - Gestión de cursos

#### **URLs:**
- `presentation/api/v1/admin_urls.py` - URLs de administración
- `presentation/api/v1/auth_urls.py` - URLs de autenticación
- `presentation/api/v1/dashboard_urls.py` - URLs de dashboard

#### **Comandos de Gestión:**
- `apps/core/management/commands/fix_user_auth.py` - Corregir problemas de auth
- `apps/core/management/commands/unlock_all_users.py` - Desbloquear usuarios
- `apps/core/management/commands/test_unlock_login.py` - Test de unlock y login

### **Frontend:**

#### **Componentes de Auth:**
- `features/auth/components/LoginForm.tsx` - Formulario de login
- `features/auth/components/RegisterForm.tsx` - Formulario de registro
- `features/auth/components/BecomeInstructorForm.tsx` - Solicitud de instructor

#### **Componentes de Dashboard:**
- `features/dashboard/components/StudentDashboard.tsx` - Dashboard estudiante
- `features/dashboard/components/InstructorDashboard.tsx` - Dashboard instructor
- `features/dashboard/components/AdminDashboard.tsx` - Dashboard admin
- `features/dashboard/components/DashboardContent.tsx` - Router de dashboards

#### **Componentes de Admin:**
- `features/admin/components/layout/AdminSidebar.tsx` - Sidebar de navegación
- `features/admin/components/layout/AdminLayout.tsx` - Layout principal
- `features/admin/pages/UsersAdminPage.tsx` - Lista de usuarios
- `features/admin/pages/CoursesAdminPage.tsx` - Lista de cursos
- `features/admin/pages/CourseModulesPage.tsx` - Módulos de curso
- `features/admin/pages/ModuleLessonsPage.tsx` - Lecciones de módulo
- `features/admin/pages/CourseMaterialsPage.tsx` - Materiales de curso
- `features/admin/pages/CourseStudentsPage.tsx` - Alumnos inscritos
- `features/admin/pages/StudentProgressPage.tsx` - Progreso de alumno
- `features/admin/components/UserForm.tsx` - Formulario de usuario
- `features/admin/components/ModuleForm.tsx` - Formulario de módulo
- `features/admin/components/LessonForm.tsx` - Formulario de lección
- `features/admin/components/MaterialForm.tsx` - Formulario de material

#### **Hooks:**
- `shared/hooks/useAuth.tsx` - Estado de autenticación
- `shared/hooks/useDashboard.ts` - Estadísticas del dashboard
- `shared/hooks/useAdminUsers.ts` - Gestión de usuarios
- `shared/hooks/useAdminModules.ts` - Gestión de módulos
- `shared/hooks/useAdminLessons.ts` - Gestión de lecciones
- `shared/hooks/useAdminMaterials.ts` - Gestión de materiales
- `shared/hooks/useAdminStudents.ts` - Gestión de alumnos

#### **Servicios:**
- `shared/services/api.ts` - Cliente API base
- `shared/services/dashboard.ts` - Endpoints de dashboard
- `shared/services/adminUsers.ts` - Endpoints de usuarios
- `shared/services/adminModules.ts` - Endpoints de módulos
- `shared/services/adminLessons.ts` - Endpoints de lecciones
- `shared/services/adminMaterials.ts` - Endpoints de materiales
- `shared/services/adminStudents.ts` - Endpoints de alumnos

#### **Componentes Compartidos:**
- `shared/components/index.tsx` - Button, Input, PasswordInput, Modal, Card, etc.
- `shared/components/ProtectedRoute.tsx` - Protección de rutas por rol
- `shared/components/Toast.tsx` - Sistema de notificaciones

---

## 🚀 **PRÓXIMOS PASOS SUGERIDOS**

1. **Sistema de Notificaciones:**
   - Email cuando solicitud es aprobada/rechazada
   - Email cuando curso es aprobado/rechazado
   - Notificaciones en dashboard

2. **Mejoras de UX:**
   - Loading states más informativos
   - Skeleton loaders
   - Animaciones de transición
   - Confirmaciones antes de eliminar

3. **Sistema de Pagos:**
   - Integración con pasarela de pagos
   - Gestión de transacciones
   - Historial de pagos

4. **Sistema de Certificados:**
   - Generación de certificados
   - Descarga de certificados
   - Validación de certificados

5. **Analytics y Reportes:**
   - Estadísticas avanzadas
   - Exportación de reportes
   - Gráficos y visualizaciones

---

## 📝 **NOTAS TÉCNICAS IMPORTANTES**

### **Configuración de AXES:**
```python
AXES_LOCKOUT_BY_USER = True  # Bloquear por usuario
AXES_LOCKOUT_BY_IP = False   # NO bloquear por IP
AXES_FAILURE_LIMIT = 5       # 5 intentos fallidos (dev)
AXES_COOLOFF_TIME = 0.5      # 30 minutos de bloqueo (dev)
```

### **Almacenamiento de Tokens:**
- Usa `sessionStorage` en lugar de `localStorage` (más seguro)
- Tokens se eliminan al cerrar la pestaña
- Refresh automático antes de expirar

### **Validación de Permisos:**
- Siempre validar en backend
- Frontend solo muestra/oculta UI, no controla acceso
- `ProtectedRoute` redirige si no tiene permisos

### **Arquitectura:**
- Backend: Clean Architecture (domain, application, infrastructure, presentation)
- Frontend: Feature-based (features, shared)
- Separación clara de responsabilidades
- Código escalable y mantenible

---

## 🔗 **ENLACES ÚTILES**

- **Swagger API:** `http://localhost:8000/swagger/`
- **Admin Django:** `http://localhost:8000/admin/`
- **Frontend:** `http://localhost:3000/`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Panel Admin:** `http://localhost:3000/admin`

---

## 📞 **CONTACTO Y SOPORTE**

Para problemas o preguntas sobre el proyecto, revisar:
- Documentación en `/backend/docs/`
- Planes en `/Futura Fases/`
- Logs del backend para debugging
- Swagger para documentación de API

---

**Última actualización:** 2025-01-23  
**Versión del documento:** 2.0  
**Estado:** Panel de Administración Completado ✅

