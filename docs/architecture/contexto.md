# 📚 Contexto del Proyecto - FagSol Escuela Virtual

**Fecha de Actualización:** 2025-01-12  
**Estado:** 🚀 En Desarrollo Activo

---

## 🎯 **RESUMEN EJECUTIVO**

FagSol Escuela Virtual es una plataforma educativa en línea que permite a estudiantes acceder a cursos, a instructores crear y gestionar contenido educativo, y a administradores gestionar toda la plataforma. El proyecto implementa un sistema de roles (estudiante, instructor, admin) con flujos de aprobación y moderación.

---

## 🏗️ **ARQUITECTURA DEL PROYECTO**

### **Backend (Django 5.0)**
- **Arquitectura:** Clean Architecture
  - `domain/` - Entidades y reglas de negocio
  - `application/` - Casos de uso
  - `infrastructure/` - Repositorios y servicios externos
  - `presentation/` - Views, serializers, URLs
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT con refresh tokens
- **API:** Django REST Framework con Swagger/OpenAPI
- **Seguridad:** Django AXES para rate limiting, validaciones de permisos

### **Frontend (Next.js 14 + TypeScript)**
- **Arquitectura:** Feature-based
  - `features/` - Módulos por funcionalidad (auth, dashboard, academy, admin)
  - `shared/` - Componentes, hooks, servicios reutilizables
- **Estilos:** Tailwind CSS
- **Data Fetching:** SWR
- **Autenticación:** JWT almacenado en sessionStorage

---

## 👥 **SISTEMA DE ROLES Y PERMISOS**

### **Roles Disponibles:**
1. **Estudiante (student)**
   - Puede ver cursos publicados
   - Puede inscribirse en cursos
   - Puede acceder a contenido de cursos inscritos
   - Puede solicitar ser instructor

2. **Instructor (instructor)**
   - Requiere aprobación de administrador
   - Puede crear cursos (en estado draft)
   - Puede gestionar sus propios cursos
   - Cursos requieren aprobación de admin para publicarse

3. **Administrador (admin)**
   - Acceso completo al sistema
   - Puede aprobar/rechazar instructores
   - Puede aprobar/rechazar cursos
   - Puede gestionar usuarios y permisos

---

## 🔄 **FLUJOS PRINCIPALES IMPLEMENTADOS**

### **1. Flujo de Registro y Autenticación**

#### **Registro de Estudiantes:**
```
1. Usuario va a /auth/register
2. Completa: Nombre, Apellido, Email, Contraseña, Confirmar Contraseña
3. Se registra automáticamente como "student"
4. Acceso inmediato a cursos
```

#### **Login:**
```
1. Usuario va a /auth/login
2. Ingresa email y contraseña
3. Sistema valida credenciales
4. Retorna tokens JWT (access + refresh)
5. Redirige a /dashboard según rol
```

**Características:**
- ✅ Validación de email normalizado (lowercase, trim)
- ✅ Validación de contraseña (mínimo 8 caracteres)
- ✅ Confirmación de contraseña en registro
- ✅ Botón "mostrar/ocultar contraseña" (ojito)
- ✅ Manejo de bloqueos AXES (rate limiting)
- ✅ Refresh automático de tokens

---

### **2. Flujo de Solicitud de Instructor (NUEVO)**

#### **Proceso Completo:**
```
1. Usuario (estudiante) solicita ser instructor
   → Va a /auth/become-instructor
   
2. Completa formulario:
   - Título Profesional (opcional)
   - Años de Experiencia (opcional)
   - Especialidad (opcional)
   - Biografía (opcional)
   - Portfolio/Website (opcional)
   - Motivación (REQUERIDO)
   - CV en PDF (opcional, máx. 5MB)
   
3. Solicitud queda en estado "pending"
   
4. Administrador revisa en /admin/instructor-applications
   
5. Admin decide:
   - Aprobar → Usuario se convierte en instructor
   - Rechazar → Usuario sigue como estudiante
   
6. Si aprobado:
   - Rol cambia a "instructor"
   - Estado: "approved"
   - Puede crear cursos
```

**Archivos Clave:**
- `backend/apps/core/models.py` - Modelo `InstructorApplication`
- `backend/infrastructure/services/instructor_application_service.py` - Lógica de negocio
- `backend/presentation/views/auth_views.py` - Endpoint `apply_to_be_instructor`
- `backend/presentation/views/admin_views.py` - Endpoints de aprobación/rechazo
- `frontend/src/features/auth/components/BecomeInstructorForm.tsx` - Formulario
- `frontend/src/features/admin/pages/InstructorApplicationsAdminPage.tsx` - Panel admin

**Endpoints:**
- `POST /api/v1/auth/apply-instructor/` - Solicitar ser instructor
- `GET /api/v1/admin/instructor-applications/` - Listar solicitudes
- `POST /api/v1/admin/instructor-applications/{id}/approve/` - Aprobar
- `POST /api/v1/admin/instructor-applications/{id}/reject/` - Rechazar

---

### **3. Flujo de Instructor Aceptado**

#### **Dashboard de Instructor:**
```
1. Instructor accede a /dashboard
2. Ve estadísticas:
   - Mis Cursos (total, publicados, borradores)
   - Estudiantes únicos
   - Inscripciones (activas, completadas)
   - Calificación promedio
   
3. Acciones rápidas:
   - Crear Nuevo Curso → /instructor/courses/new
   - Ver Mis Cursos → /instructor/courses
   - Ver Catálogo → /academy/catalog
```

#### **Creación de Cursos:**
```
1. Instructor va a /instructor/courses/new
2. Completa formulario de curso
3. Curso se crea en estado "draft"
4. Instructor puede editar curso
5. Instructor solicita revisión
6. Admin aprueba → Curso se publica
```

**Rutas Específicas para Instructores:**
- `/instructor/courses` - Lista de cursos del instructor
- `/instructor/courses/new` - Crear nuevo curso
- `/instructor/courses/[id]` - Ver/editar curso (pendiente)

**Permisos:**
- ✅ `IsAdminOrInstructor` - Permite admin e instructores
- ✅ `can_create_course()` - Valida que instructor esté aprobado
- ✅ `can_edit_course()` - Valida que instructor sea dueño del curso

---

### **4. Flujo de Dashboard**

#### **Problema Resuelto:**
- **Antes:** Dashboard mostraba error en primer render, funcionaba al recargar
- **Causa:** Hook intentaba cargar estadísticas antes de que autenticación terminara
- **Solución:** Hook espera a que `loading` de `useAuth` sea `false`

#### **Componentes:**
- `StudentDashboard` - Estadísticas de estudiante (cursos inscritos, progreso, certificados)
- `InstructorDashboard` - Estadísticas de instructor (cursos, estudiantes, inscripciones)
- `AdminDashboard` - Estadísticas generales del sistema

**Endpoints:**
- `GET /api/v1/dashboard/stats/` - Estadísticas según rol
- `GET /api/v1/dashboard/student/stats/` - Estadísticas de estudiante
- `GET /api/v1/dashboard/instructor/stats/` - Estadísticas de instructor
- `GET /api/v1/dashboard/admin/stats/` - Estadísticas de admin

---

## 🔐 **SEGURIDAD IMPLEMENTADA**

### **Autenticación:**
- ✅ JWT con access y refresh tokens
- ✅ Tokens almacenados en sessionStorage (más seguro que localStorage)
- ✅ Refresh automático de tokens antes de expirar
- ✅ Validación de tokens en cada request
- ✅ Logout que invalida tokens server-side

### **Autorización:**
- ✅ Validación de permisos en backend (nunca confiar en frontend)
- ✅ Middleware de permisos por rol
- ✅ Validación de ownership (instructor solo puede editar sus cursos)

### **Rate Limiting:**
- ✅ Django AXES configurado
- ✅ Bloqueo por usuario (no por IP) para evitar bloqueos masivos
- ✅ Comandos para desbloquear usuarios

### **Validaciones:**
- ✅ Sanitización de inputs
- ✅ Validación de tipos de archivo (PDF para CV)
- ✅ Validación de tamaños de archivo (máx. 5MB)
- ✅ Validación de URLs (deben comenzar con http:// o https://)

---

## 📁 **ESTRUCTURA DE ARCHIVOS CLAVE**

### **Backend:**

#### **Modelos:**
- `apps/core/models.py`
  - `UserProfile` - Perfil de usuario con rol
  - `InstructorApplication` - Solicitudes de instructor

#### **Servicios:**
- `infrastructure/services/auth_service.py` - Lógica de autenticación
- `infrastructure/services/instructor_application_service.py` - Lógica de solicitudes
- `infrastructure/services/dashboard_service.py` - Estadísticas del dashboard
- `infrastructure/services/course_service.py` - Gestión de cursos

#### **Views:**
- `presentation/views/auth_views.py` - Login, registro, solicitud instructor
- `presentation/views/admin_views.py` - Gestión admin (aprobaciones)
- `presentation/views/dashboard_views.py` - Estadísticas del dashboard
- `presentation/views/course_views.py` - Gestión de cursos

#### **Permisos:**
- `apps/users/permissions.py` - Funciones y clases de permisos

#### **Comandos de Gestión:**
- `apps/core/management/commands/fix_user_auth.py` - Corregir problemas de auth
- `apps/core/management/commands/unlock_all_users.py` - Desbloquear usuarios

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
- `features/admin/pages/InstructorApplicationsAdminPage.tsx` - Panel de solicitudes
- `features/admin/pages/CreateCoursePage.tsx` - Crear curso (compartido)

#### **Componentes de Instructor:**
- `features/instructor/pages/InstructorCoursesPage.tsx` - Lista de cursos

#### **Hooks:**
- `shared/hooks/useAuth.tsx` - Estado de autenticación
- `shared/hooks/useDashboard.ts` - Estadísticas del dashboard
- `shared/hooks/useInstructorApplications.ts` - Gestión de solicitudes

#### **Servicios:**
- `shared/services/api.ts` - Cliente API base
- `shared/services/dashboard.ts` - Endpoints de dashboard
- `shared/services/instructorApplications.ts` - Endpoints de solicitudes

#### **Componentes Compartidos:**
- `shared/components/index.tsx` - Button, Input, PasswordInput, Modal, etc.
- `shared/components/ProtectedRoute.tsx` - Protección de rutas por rol

---

## 🎨 **MEJORAS DE UI/UX IMPLEMENTADAS**

### **Formularios:**
- ✅ Botón "mostrar/ocultar contraseña" (ojito) en todos los campos de contraseña
- ✅ Campo de confirmación de contraseña en registro
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros y específicos
- ✅ Logo y formularios más grandes

### **Modales:**
- ✅ Componente Modal reutilizable con variantes (confirm, warning, danger, success)
- ✅ Modales amigables para aprobar/rechazar solicitudes
- ✅ Animaciones fade-in
- ✅ Diseño consistente con el sistema

### **Dashboard:**
- ✅ Diseño moderno con gradientes y sombras
- ✅ Iconos visuales en tarjetas de estadísticas
- ✅ Mensaje de bienvenida personalizado
- ✅ Botones con iconos y mejor diseño
- ✅ Manejo de errores mejorado con acciones

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

### **2. Dashboard Mostraba Error en Primer Render**
- **Problema:** Dashboard mostraba error al cargar, funcionaba al recargar
- **Causa:** Hook intentaba cargar estadísticas antes de que autenticación terminara
- **Solución:** Hook espera a que `loading` de `useAuth` sea `false` antes de hacer petición

### **3. Rutas Confusas para Instructores**
- **Problema:** Instructores usaban rutas `/admin/courses/*` (confuso)
- **Solución:** Creación de rutas específicas `/instructor/courses/*`

---

## 📊 **ESTADO ACTUAL DEL PROYECTO**

### **✅ Completado:**
- Sistema de autenticación completo (login, registro, logout)
- Sistema de roles y permisos
- Flujo de solicitud de instructor
- Panel admin para gestionar solicitudes
- Dashboard para estudiantes, instructores y admin
- Rutas específicas para instructores
- UI mejorada en formularios y dashboards
- Manejo de errores robusto

### **⏳ En Progreso:**
- Sistema de creación de cursos para instructores
- Sistema de aprobación de cursos
- Sistema de notificaciones por email

### **📋 Pendiente:**
- Dashboard para instructores ver estado de su solicitud
- Historial de solicitudes por usuario
- Sistema completo de gestión de cursos (editar, eliminar)
- Sistema de certificados
- Sistema de pagos completo

---

## 🚀 **PRÓXIMOS PASOS SUGERIDOS**

1. **Completar Sistema de Cursos:**
   - Edición de cursos por instructores
   - Eliminación de cursos
   - Sistema de módulos y lecciones

2. **Sistema de Aprobación de Cursos:**
   - Flujo completo de revisión
   - Comentarios de admin a instructor
   - Estados: draft → pending_review → published/rejected

3. **Notificaciones:**
   - Email cuando solicitud es aprobada/rechazada
   - Email cuando curso es aprobado/rechazado
   - Notificaciones en dashboard

4. **Mejoras de UX:**
   - Loading states más informativos
   - Skeleton loaders
   - Animaciones de transición

---

## 📝 **NOTAS TÉCNICAS IMPORTANTES**

### **Configuración de AXES:**
```python
AXES_LOCKOUT_BY_USER = True  # Bloquear por usuario
AXES_LOCKOUT_BY_IP = False   # NO bloquear por IP
AXES_FAILURE_LIMIT = 10      # 10 intentos fallidos
AXES_COOLOFF_TIME = 0.5      # 30 minutos de bloqueo
```

### **Almacenamiento de Tokens:**
- Usa `sessionStorage` en lugar de `localStorage` (más seguro)
- Tokens se eliminan al cerrar la pestaña
- Refresh automático antes de expirar

### **Validación de Permisos:**
- Siempre validar en backend
- Frontend solo muestra/oculta UI, no controla acceso
- `ProtectedRoute` redirige si no tiene permisos

---

## 🔗 **ENLACES ÚTILES**

- **Swagger API:** `http://localhost:8000/swagger/`
- **Admin Django:** `http://localhost:8000/admin/`
- **Frontend:** `http://localhost:3000/`

---

## 📞 **CONTACTO Y SOPORTE**

Para problemas o preguntas sobre el proyecto, revisar:
- Documentación en `/backend/docs/`
- Planes en `/Futura Fases/`
- Logs del backend para debugging

---

**Última actualización:** 2025-01-12  
**Versión del documento:** 1.0

