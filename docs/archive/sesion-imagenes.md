# 📋 Contexto de Sesión - Sistema de Imágenes y Gestión de Cursos para Instructores

**Fecha:** 2025-01-27  
**Última actualización:** 2025-01-27  
**Estado:** ✅ Sistema Completo Implementado y Funcionando

---

## 🎯 **RESUMEN EJECUTIVO**

Esta sesión implementó un sistema completo de gestión de cursos para instructores, incluyendo:

1. ✅ **Sistema de subida de imágenes** con optimización automática (redimensionado, compresión)
2. ✅ **Almacenamiento híbrido** (local para desarrollo, Azure Blob Storage para producción)
3. ✅ **Flujo completo de gestión** de módulos y lecciones para instructores
4. ✅ **Mejoras de UI/UX** con tema oscuro consistente
5. ✅ **Modales interactivos** para feedback y próximos pasos
6. ✅ **Content Security Policy (CSP)** configurado para imágenes
7. ✅ **Sistema de solicitud de instructor mejorado** con validación de tiempo y re-aplicación
8. ✅ **Formulario de solicitud rediseñado** con layout de 3 columnas y contenido motivacional
9. ✅ **Banner de invitación** en dashboard de estudiantes para fomentar solicitudes

---

## 📸 **1. SISTEMA DE SUBIDA DE IMÁGENES**

### **1.1 Arquitectura del Sistema**

El sistema implementa un enfoque **híbrido** que permite:
- **Subida directa de archivos** (drag & drop o selección)
- **URLs externas** (pegar URL de imagen existente)
- **Optimización automática** (redimensionado, compresión, validación)
- **Almacenamiento flexible** (local o Azure Blob Storage)

### **1.2 Componentes Backend**

#### **ImageOptimizer** (`backend/infrastructure/services/image_service.py`)

**Funcionalidades:**
- ✅ Validación de formato (JPEG, PNG, WebP)
- ✅ Validación de tamaño de archivo (máx. 5MB)
- ✅ Validación de dimensiones mínimas y máximas
- ✅ Redimensionado automático manteniendo aspecto
- ✅ Compresión con calidad 85%
- ✅ Conversión a RGB si es necesario

**Especificaciones:**
```python
# Thumbnails
THUMBNAIL_MAX_SIZE = (400, 300)  # Máximo
THUMBNAIL_MIN_SIZE = (200, 150)  # Mínimo

# Banners
BANNER_MAX_SIZE = (1920, 600)   # Máximo
BANNER_MIN_SIZE = (800, 300)    # Mínimo

# Archivo
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_FORMATS = ['JPEG', 'PNG', 'WEBP']
JPEG_QUALITY = 85
WEBP_QUALITY = 85
```

#### **ImageUploadService** (`backend/infrastructure/services/image_upload_service.py`)

**Orquestación:**
- ✅ Selección automática de almacenamiento (local o Azure)
- ✅ Validación y optimización de imágenes
- ✅ Generación de rutas únicas organizadas por fecha
- ✅ Retorno de metadata (dimensiones, tamaño, ratio de compresión)

**Estructura de rutas:**
```
courses/images/{type}/{year}/{month}/{type}_{unique_id}.{ext}
```

#### **FileStorageService** (`backend/infrastructure/external_services/__init__.py`)

**Interfaz abstracta:**
- `upload_file(file_path, file_content, content_type) -> str`
- `delete_file(file_url) -> bool`
- `get_file_url(file_path) -> str`

**Implementaciones:**
- ✅ `LocalFileStorageService` - Almacenamiento local en `MEDIA_ROOT`
- ✅ `AzureBlobStorageService` - Almacenamiento en Azure Blob Storage

#### **AzureBlobStorageService** (`backend/infrastructure/external_services/azure_storage.py`)

**Funcionalidades:**
- ✅ Conexión a Azure Blob Storage
- ✅ Subida de archivos con metadata
- ✅ Generación de URLs públicas
- ✅ Eliminación de archivos

**Configuración requerida:**
```python
USE_AZURE_STORAGE = True  # En producción
AZURE_STORAGE_ACCOUNT_NAME = "..."
AZURE_STORAGE_ACCOUNT_KEY = "..."
AZURE_STORAGE_CONTAINER_NAME = "fagsol-images"
```

### **1.3 Endpoint de API**

**Endpoint:** `POST /api/v1/courses/upload-image/`

**Permisos:** `IsAuthenticated` + `IsAdminOrInstructor`

**Request:**
```python
FormData:
  - file: File (opcional si se usa URL)
  - type: str ("thumbnail" | "banner")
  - url: str (opcional, para URLs externas)
```

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:8000/media/courses/images/thumbnail/2025/01/thumbnail_abc123.jpg",
  "metadata": {
    "width": 400,
    "height": 300,
    "original_width": 1920,
    "original_height": 1080,
    "size": 45678,
    "original_size": 234567,
    "compression_ratio": 0.19,
    "format": "JPEG"
  }
}
```

**Características:**
- ✅ Convierte URLs relativas a absolutas para desarrollo local
- ✅ Valida tipo de imagen (thumbnail/banner)
- ✅ Procesa y optimiza automáticamente
- ✅ Retorna URL lista para usar en el formulario

### **1.4 Componentes Frontend**

#### **useImageUpload Hook** (`frontend/src/shared/hooks/useImageUpload.ts`)

**Funcionalidades:**
- ✅ Gestión de estado (loading, progress, error)
- ✅ Validación client-side (tipo, tamaño)
- ✅ Llamada a API de subida
- ✅ Manejo de errores

#### **ImageUploader Component** (`frontend/src/shared/components/ImageUploader.tsx`)

**Características:**
- ✅ **Modo híbrido:** Subida directa o URL externa
- ✅ **Drag & Drop** con feedback visual
- ✅ **Preview** de imagen antes de subir
- ✅ **Validación visual** (tamaño, formato)
- ✅ **Tema oscuro** consistente
- ✅ **Estados:** idle, uploading, success, error

**Props:**
```typescript
interface ImageUploaderProps {
  value?: string;              // URL actual
  onChange: (url: string) => void;
  type: 'thumbnail' | 'banner';
  label?: string;
  required?: boolean;
  error?: string;
}
```

### **1.5 Integración en CourseForm**

**Cambios realizados:**
- ✅ Reemplazo de inputs de texto por `ImageUploader`
- ✅ Validación automática de imágenes
- ✅ Preview de imágenes subidas
- ✅ Feedback visual durante la subida

---

## 🎓 **2. FLUJO COMPLETO DE GESTIÓN PARA INSTRUCTORES**

### **2.1 Flujo de Trabajo**

```
1. Instructor crea curso → Estado: "Borrador"
   ↓
2. Instructor edita curso → Ve botón "Gestionar Módulos y Lecciones"
   ↓
3. Click en botón → Va a /instructor/courses/[id]/modules
   ↓
4. Crea módulos → Click en "Crear Módulo"
   ↓
5. Agrega lecciones → Click en "Lecciones" del módulo → "Crear Lección"
   ↓
6. Solicita revisión → Cuando el curso esté completo
   ↓
7. Admin revisa → Aprueba o solicita cambios
   ↓
8. Curso publicado → Disponible para estudiantes
```

### **2.2 Permisos y Autorización**

#### **Backend - Permisos Actualizados**

**Archivo:** `backend/presentation/views/admin_views.py`

**Endpoints modificados:**
- `list_course_modules` - Permiso: `IsAdminOrInstructor`
- `create_module` - Permiso: `IsAdminOrInstructor` + Validación de ownership
- `update_module` - Permiso: `IsAdminOrInstructor` + Validación de ownership
- `delete_module` - Permiso: `IsAdminOrInstructor` + Validación de ownership
- `list_module_lessons` - Permiso: `IsAdminOrInstructor`
- `create_lesson` - Permiso: `IsAdminOrInstructor` + Validación de ownership
- `update_lesson` - Permiso: `IsAdminOrInstructor` + Validación de ownership
- `delete_lesson` - Permiso: `IsAdminOrInstructor` + Validación de ownership

**Validación de ownership:**
```python
# Verificar que el instructor es el creador del curso
if not can_edit_course(request.user, course):
    return Response({
        'success': False,
        'message': 'No tienes permiso para editar este curso.'
    }, status=status.HTTP_403_FORBIDDEN)
```

#### **Política de Permisos**

**Archivo:** `backend/apps/users/permissions.py`

**Función `can_edit_course`:**
- ✅ **Admin:** Puede editar cualquier curso
- ✅ **Instructor:** Solo puede editar cursos que creó (`course.created_by == user`)
- ✅ **Otros:** No pueden editar

### **2.3 Páginas Frontend para Instructores**

#### **Rutas Implementadas**

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/instructor/courses/[id]/modules` | `CourseModulesPage` | Lista de módulos del curso |
| `/instructor/courses/[id]/modules/new` | `CreateModulePage` | Crear nuevo módulo |
| `/instructor/courses/[id]/modules/[moduleId]/edit` | `EditModulePage` | Editar módulo existente |
| `/instructor/courses/[id]/modules/[moduleId]/lessons` | `ModuleLessonsPage` | Lista de lecciones del módulo |
| `/instructor/courses/[id]/modules/[moduleId]/lessons/new` | `CreateLessonPage` | Crear nueva lección |
| `/instructor/courses/[id]/modules/[moduleId]/lessons/[lessonId]/edit` | `EditLessonPage` | Editar lección existente |

#### **Componentes Reutilizados**

- ✅ `ModuleForm` - Formulario de módulos (usado por admin e instructor)
- ✅ `LessonForm` - Formulario de lecciones (usado por admin e instructor)
- ✅ `useModules` - Hook para gestión de módulos
- ✅ `useLessons` - Hook para gestión de lecciones

### **2.4 Integración en EditCoursePage**

**Cambio realizado:**
- ✅ Agregado botón "Gestionar Módulos y Lecciones" en sidebar
- ✅ Visible solo para instructores (no para admins)
- ✅ Redirige a `/instructor/courses/[id]/modules`

---

## 🎨 **3. MEJORAS DE UI/UX**

### **3.1 Sistema de Diseño Oscuro**

#### **Componentes Base Actualizados**

**Input Component:**
- ✅ Variante `dark`: `bg-primary-black/40`, `border-primary-orange/20`, `text-primary-white`
- ✅ Labels con `text-primary-white`
- ✅ Errores con `text-red-400`

**Select Component:**
- ✅ Mismas variantes que Input
- ✅ Opciones con fondo oscuro

**Textarea:**
- ✅ Estilos consistentes con Input
- ✅ `placeholder-secondary-light-gray`

### **3.2 Páginas Mejoradas**

#### **InstructorCoursesPage** (`frontend/src/features/instructor/pages/InstructorCoursesPage.tsx`)

**Mejoras:**
- ✅ Header con gradiente y sombras
- ✅ Búsqueda integrada
- ✅ Filtros por estado (Borrador, Pendiente, Publicado)
- ✅ Cards de cursos con diseño oscuro
- ✅ Badges de estado con colores distintivos
- ✅ Acciones rápidas (Editar, Ver, Gestionar)

#### **EditCoursePage** (`frontend/src/features/admin/pages/EditCoursePage.tsx`)

**Mejoras:**
- ✅ Layout con sidebar para navegación
- ✅ Botón "Gestionar Módulos y Lecciones" para instructores
- ✅ Fondo oscuro consistente
- ✅ Formulario con mejor contraste

#### **ModuleForm y LessonForm**

**Mejoras:**
- ✅ Todos los inputs con `variant="dark"`
- ✅ Labels con `text-primary-white`
- ✅ Textareas con fondo oscuro
- ✅ Errores con mejor contraste

### **3.3 Corrección de "White Frame"**

**Problema:** Fondo blanco alrededor del formulario en `/admin/courses/new`

**Solución:**
- ✅ `AdminLayout.tsx`: Cambiado `bg-gray-50` → `bg-primary-black`
- ✅ `CreateCoursePage.tsx`: Removido contenedor con fondo blanco
- ✅ Formulario ahora se renderiza directamente sobre fondo oscuro

---

## 🎭 **4. MODALES INTERACTIVOS**

### **4.1 Modal de Éxito al Crear Curso**

**Ubicación:** `frontend/src/features/admin/components/CourseForm.tsx`

**Características:**
- ✅ Reemplaza toast notification (que desaparecía muy rápido)
- ✅ Contenido dinámico según rol (admin vs. instructor)
- ✅ Próximos pasos estructurados
- ✅ Botones de acción (Ver Cursos, Agregar Contenido)

**Contenido para Instructores:**
```
1. Agregar Módulos y Lecciones
2. Revisar y Completar Información
3. Solicitar Revisión
```

**Contenido para Admins:**
```
1. Agregar Módulos y Lecciones
2. Revisar y Completar Información
3. Publicar el Curso
```

**Botones:**
- Instructores: "Ver Mis Cursos" + "Agregar Contenido"
- Admins: "Ver Todos los Cursos" + "Agregar Contenido"

### **4.2 Modal de Solicitar Revisión**

**Características:**
- ✅ Explicación del proceso de revisión
- ✅ Checklist de requisitos (título, descripción, imágenes)
- ✅ Tiempo estimado de revisión (24-48 horas)
- ✅ Advertencia sobre no poder editar después
- ✅ Botones: "Cancelar" y "Solicitar Revisión" (con loading)

**Contenido:**
- "Qué pasará después" (Admin review, status change, review outcome)
- "Requisitos para Revisión" (checklist visual)
- "Tiempo de Revisión" (estimación)

---

## 🔒 **5. CONTENT SECURITY POLICY (CSP)**

### **5.1 Configuración en Next.js**

**Archivo:** `frontend/next.config.js`

**Cambios realizados:**
- ✅ Agregado `http://localhost:8000` a `img-src` (desarrollo)
- ✅ Agregado `http://127.0.0.1:8000` a `img-src` (desarrollo alternativo)
- ✅ Agregado `https://*.blob.core.windows.net` a `img-src` (producción Azure)
- ✅ `upgrade-insecure-requests` condicional según `NODE_ENV`

**Configuración:**
```javascript
"img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 https://*.blob.core.windows.net",
```

### **5.2 Problema Resuelto**

**Error original:**
```
Content Security Policy: The page's settings blocked the loading of a resource at http://localhost:8000/media/...
```

**Solución:**
- ✅ CSP actualizado para permitir imágenes del backend
- ✅ URLs absolutas generadas correctamente en backend
- ✅ Imágenes cargando correctamente en frontend

---

## 📁 **6. ESTRUCTURA DE ARCHIVOS**

### **6.1 Archivos Nuevos**

#### **Backend:**
- `backend/infrastructure/services/image_service.py` - Optimización de imágenes
- `backend/infrastructure/services/image_upload_service.py` - Orquestación de subida
- `backend/infrastructure/external_services/azure_storage.py` - Azure Blob Storage

#### **Frontend:**
- `frontend/src/shared/hooks/useImageUpload.ts` - Hook de subida
- `frontend/src/shared/components/ImageUploader.tsx` - Componente de subida
- `frontend/src/features/instructor/pages/CourseModulesPage.tsx`
- `frontend/src/features/instructor/pages/CreateModulePage.tsx`
- `frontend/src/features/instructor/pages/EditModulePage.tsx`
- `frontend/src/features/instructor/pages/ModuleLessonsPage.tsx`
- `frontend/src/features/instructor/pages/CreateLessonPage.tsx`
- `frontend/src/features/instructor/pages/EditLessonPage.tsx`

### **6.2 Archivos Modificados**

#### **Backend:**
- `backend/presentation/views/course_views.py` - Endpoint `upload_course_image`
- `backend/presentation/views/admin_views.py` - Permisos actualizados para instructores
- `backend/presentation/api/v1/courses/urls.py` - Ruta de subida
- `backend/config/settings.py` - Configuración Azure
- `backend/infrastructure/external_services/__init__.py` - Interfaz FileStorageService
- `backend/requirements.txt` - `azure-storage-blob==12.19.0`

#### **Frontend:**
- `frontend/src/features/admin/components/CourseForm.tsx` - ImageUploader + Modales
- `frontend/src/features/admin/components/ModuleForm.tsx` - Tema oscuro
- `frontend/src/features/admin/components/LessonForm.tsx` - Tema oscuro
- `frontend/src/features/admin/pages/CreateCoursePage.tsx` - Removido white frame
- `frontend/src/features/admin/pages/EditCoursePage.tsx` - Botón gestionar módulos
- `frontend/src/features/admin/components/layout/AdminLayout.tsx` - Fondo oscuro
- `frontend/src/features/instructor/pages/InstructorCoursesPage.tsx` - UI mejorada
- `frontend/src/shared/components/index.tsx` - Variantes dark para Input/Select
- `frontend/src/shared/services/courses.ts` - Función `uploadCourseImage`
- `frontend/next.config.js` - CSP actualizado

---

## ✅ **7. ESTADO FINAL**

### **7.1 Funcionalidades Completadas**

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Subida de imágenes | ✅ | Optimización automática |
| Almacenamiento híbrido | ✅ | Local + Azure |
| Gestión de módulos (instructor) | ✅ | CRUD completo |
| Gestión de lecciones (instructor) | ✅ | CRUD completo |
| UI/UX tema oscuro | ✅ | Consistente en todas las páginas |
| Modales interactivos | ✅ | Éxito y solicitar revisión |
| CSP configurado | ✅ | Imágenes cargando correctamente |
| Permisos validados | ✅ | Instructores solo editan sus cursos |
| Validación de re-aplicación | ✅ | 30 días de espera después de rechazo |
| Banner de invitación | ✅ | Dashboard de estudiantes |
| Formulario rediseñado | ✅ | Layout 3 columnas, sidebar motivacional |

### **7.2 Flujo Completo Verificado**

✅ **Instructor crea curso** → Estado "Borrador"  
✅ **Instructor edita curso** → Ve botón "Gestionar Módulos y Lecciones"  
✅ **Instructor crea módulos** → Desde `/instructor/courses/[id]/modules`  
✅ **Instructor agrega lecciones** → Desde módulo específico  
✅ **Instructor solicita revisión** → Modal con información completa  
✅ **Admin revisa** → Puede aprobar o solicitar cambios  
✅ **Curso publicado** → Disponible para estudiantes  

### **7.3 Próximos Pasos Sugeridos**

1. **Optimización de imágenes en frontend:**
   - Lazy loading de imágenes
   - Placeholder mientras carga
   - Error handling mejorado

2. **Gestión de imágenes existentes:**
   - Eliminar imágenes antiguas al subir nuevas
   - Galería de imágenes subidas
   - Reutilizar imágenes existentes

3. **Estadísticas para instructores:**
   - Progreso de creación de curso
   - Checklist visual de requisitos
   - Sugerencias de mejora

4. **Notificaciones:**
   - Email cuando curso es aprobado/rechazado
   - Notificación en dashboard
   - Historial de cambios de estado

---

## 📝 **8. NOTAS TÉCNICAS**

### **8.1 Configuración de Azure Blob Storage**

**Variables de entorno requeridas:**
```env
USE_AZURE_STORAGE=True
AZURE_STORAGE_ACCOUNT_NAME=tu_cuenta
AZURE_STORAGE_ACCOUNT_KEY=tu_clave
AZURE_STORAGE_CONTAINER_NAME=fagsol-images
```

**Desarrollo:**
- `USE_AZURE_STORAGE=False` → Usa almacenamiento local
- Imágenes en `backend/media/courses/images/`
- URLs: `http://localhost:8000/media/...`

**Producción:**
- `USE_AZURE_STORAGE=True` → Usa Azure Blob Storage
- Imágenes en contenedor de Azure
- URLs: `https://{account}.blob.core.windows.net/{container}/...`

### **8.2 Optimización de Imágenes**

**Proceso automático:**
1. Validación de formato y tamaño
2. Validación de dimensiones (mínimas y máximas)
3. Redimensionado manteniendo aspecto
4. Compresión con calidad 85%
5. Conversión a RGB si es necesario
6. Guardado en formato optimizado

**Resultados típicos:**
- Reducción de tamaño: 60-80%
- Mantenimiento de calidad visual
- Carga más rápida en frontend

### **8.3 Permisos y Seguridad**

**Validación en múltiples capas:**
1. **Frontend:** Oculta botones/acciones según rol
2. **Backend - Permisos:** `IsAdminOrInstructor` en decoradores
3. **Backend - Ownership:** `can_edit_course()` valida propiedad
4. **Base de datos:** Constraints en modelos

**Principio de menor privilegio:**
- Instructores solo pueden editar sus propios cursos
- Admins pueden editar cualquier curso
- Validación en cada endpoint crítico

---

## 🎯 **CONCLUSIÓN**

Se ha implementado un sistema completo de gestión de cursos para instructores, con:

- ✅ **Subida de imágenes** optimizada y flexible
- ✅ **Flujo completo** de creación de contenido
- ✅ **UI/UX mejorada** con tema oscuro consistente
- ✅ **Modales interactivos** para mejor feedback
- ✅ **Seguridad** con validación de permisos y ownership
- ✅ **CSP configurado** para cargar imágenes correctamente

**El sistema está listo para que los instructores creen y gestionen sus cursos de forma completa antes de solicitar revisión.**

---

## 🎓 **9. SISTEMA DE SOLICITUD DE INSTRUCTOR MEJORADO**

### **9.1 Mejoras Implementadas (2025-01-27)**

#### **Backend - Validación de Tiempo para Re-aplicar**

**Archivo:** `backend/infrastructure/services/instructor_application_service.py`

**Funcionalidades agregadas:**
- ✅ Validación de tiempo de espera (30 días) después de rechazo
- ✅ Método `can_reapply()` que verifica si puede volver a aplicar
- ✅ Retorna días restantes si aún no puede aplicar

**Constante:**
```python
REAPPLY_COOLDOWN_DAYS = 30  # Días de espera antes de re-aplicar
```

**Lógica de validación:**
```python
# Verifica si hay un rechazo reciente
last_rejected = InstructorApplication.objects.filter(
    user=user,
    status='rejected'
).order_by('-reviewed_at').first()

if last_rejected and last_rejected.reviewed_at:
    days_since_rejection = (timezone.now() - last_rejected.reviewed_at).days
    if days_since_rejection < REAPPLY_COOLDOWN_DAYS:
        days_remaining = REAPPLY_COOLDOWN_DAYS - days_since_rejection
        return False, None, f"Debes esperar {days_remaining} día(s) más..."
```

#### **Endpoint Actualizado**

**Archivo:** `backend/presentation/views/auth_views.py`

**Endpoint:** `GET /api/v1/auth/my-instructor-application/`

**Response mejorado:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "can_reapply": false,
    "days_remaining": 15,
    "reviewed_by": { "id": 1, "email": "admin@example.com" },
    "reviewed_at": "2025-01-12T10:00:00Z",
    "rejection_reason": "..."
  }
}
```

**Campos nuevos:**
- `can_reapply`: `boolean | null` - Si puede volver a aplicar
- `days_remaining`: `number | null` - Días que faltan para poder aplicar

### **9.2 Frontend - Dashboard de Estudiantes**

#### **Banner de Invitación a Ser Instructor**

**Archivo:** `frontend/src/features/dashboard/components/StudentDashboard.tsx`

**Características:**
- ✅ Banner atractivo con gradientes y efectos visuales
- ✅ Muestra beneficios: llegar a más estudiantes, generar ingresos, construir marca
- ✅ Call-to-action directo: "Solicitar Ser Instructor"
- ✅ Lógica inteligente de visualización:
  - Se muestra si no tiene solicitud
  - Se muestra si tiene solicitud rechazada y puede volver a aplicar
  - No se muestra si tiene solicitud pendiente o aprobada
  - No se muestra si tiene solicitud rechazada y aún no puede volver a aplicar

**Diseño:**
- Gradiente naranja/ámbar
- Iconos contextuales (Users, DollarSign, Award, Zap)
- Efectos hover y animaciones sutiles
- Responsive: se adapta a móvil y desktop

#### **Banner de Estado de Solicitud Mejorado**

**Mejoras:**
- ✅ Información de revisión (fecha, revisor)
- ✅ Botón "Volver a Aplicar" cuando `can_reapply === true`
- ✅ Mensaje con días restantes cuando `can_reapply === false`
- ✅ Diseño diferenciado por estado (pending, approved, rejected)

### **9.3 Formulario de Solicitud Rediseñado**

#### **Layout de 3 Columnas**

**Archivo:** `frontend/src/features/auth/components/BecomeInstructorForm.tsx`

**Estructura:**
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar Izquierdo (1/3)  │  Formulario Central (2/3)  │
│  - Beneficios             │  - Campos del formulario   │
│  - Proceso                │  - Validaciones            │
│  - Tips                   │  - Botones de acción       │
└─────────────────────────────────────────────────────────┘
```

**Sidebar Izquierdo (Solo Desktop):**
- ✅ **Card de Beneficios:** ¿Por qué ser instructor?
  - Llega a más estudiantes
  - Genera ingresos
  - Construye tu marca
  - Flexibilidad total
- ✅ **Card de Proceso:** Pasos de revisión (1, 2, 3)
- ✅ **Card de Tips:** Consejos para mejorar la solicitud
- ✅ Sticky positioning: se mantiene visible al hacer scroll

**Formulario Central:**
- ✅ Layout más amplio: `max-w-7xl` (antes `max-w-3xl`)
- ✅ Grid de 2 columnas para campos básicos
- ✅ Campo de motivación destacado con borde dinámico
- ✅ Validación en tiempo real mejorada

#### **Mejoras de Validación**

**Bug corregido:**
- ✅ Error de validación se limpia automáticamente al alcanzar 50 caracteres
- ✅ `useEffect` que monitorea cambios en el campo de motivación
- ✅ Feedback visual inmediato

**Estados visuales del campo de motivación:**
- 🔴 **Rojo:** Error o faltan caracteres
- 🟢 **Verde:** Completado correctamente (≥50 caracteres)
- ⚪ **Gris:** Estado inicial

**Contador de caracteres:**
- Cambia de color según progreso:
  - Gris: < 40 caracteres
  - Amarillo: 40-49 caracteres
  - Verde: ≥ 50 caracteres

#### **Optimizaciones de UX**

**Reducción de scroll:**
- ✅ Header más compacto (logo 60px)
- ✅ Espaciado reducido (`p-4 sm:p-6` en lugar de `p-8 sm:p-10`)
- ✅ Campos más compactos (`py-2.5` en lugar de `py-3`)
- ✅ Textareas más pequeñas (3-4 filas)
- ✅ Eliminadas secciones grandes innecesarias

**Mejoras de accesibilidad:**
- ✅ Labels asociados correctamente
- ✅ Aria-labels donde corresponde
- ✅ Navegación por teclado mejorada
- ✅ Contraste de colores adecuado

**Feedback mejorado:**
- ✅ Validación en tiempo real
- ✅ Mensajes de error contextuales
- ✅ Indicadores visuales de progreso
- ✅ Estados de éxito claros

### **9.4 Interfaz TypeScript Actualizada**

**Archivo:** `frontend/src/shared/services/instructorApplications.ts`

**Interfaz `InstructorApplication` actualizada:**
```typescript
export interface InstructorApplication {
  // ... campos existentes ...
  
  // Nuevos campos para re-aplicar
  can_reapply?: boolean | null;
  days_remaining?: number | null;
}
```

### **9.5 Flujo Completo de Re-aplicación**

```
1. Usuario tiene solicitud rechazada
   ↓
2. Dashboard muestra banner con información de rechazo
   ↓
3. Si pasaron 30 días:
   - Muestra botón "Volver a Aplicar"
   - Usuario puede hacer clic y llenar formulario nuevamente
   ↓
4. Si NO pasaron 30 días:
   - Muestra mensaje: "Debes esperar X días más"
   - Botón deshabilitado o no visible
   ↓
5. Al intentar aplicar antes de tiempo:
   - Backend rechaza con mensaje claro
   - Frontend muestra error con días restantes
```

### **9.6 Archivos Modificados**

#### **Backend:**
- `backend/infrastructure/services/instructor_application_service.py`
  - Agregado `REAPPLY_COOLDOWN_DAYS = 30`
  - Agregado método `can_reapply(user)`
  - Validación de tiempo en `create_application()`
- `backend/presentation/views/auth_views.py`
  - Endpoint `get_my_instructor_application` actualizado
  - Retorna `can_reapply` y `days_remaining`

#### **Frontend:**
- `frontend/src/shared/services/instructorApplications.ts`
  - Interfaz `InstructorApplication` actualizada
- `frontend/src/features/dashboard/components/StudentDashboard.tsx`
  - Banner de invitación agregado
  - Banner de estado mejorado con botón de re-aplicar
- `frontend/src/features/auth/components/BecomeInstructorForm.tsx`
  - Rediseño completo con layout de 3 columnas
  - Sidebar con contenido motivacional
  - Validación mejorada con bug corregido
  - Optimizaciones de scroll y UX

---

**Última actualización:** 2025-01-27  
**Estado:** ✅ Sistema Completo Implementado + Mejoras de UX

