# 📚 Análisis Completo: Flujo de Contenido de Cursos

**Fecha:** 2025-01-27  
**Estado:** ✅ Funcional - Análisis y Plan de Mejoras

---

## 🎯 **RESUMEN EJECUTIVO**

El sistema de visualización de contenido **está funcionando correctamente**. Los usuarios pueden:
- ✅ Ver módulos y lecciones
- ✅ Navegar entre lecciones
- ✅ Ver videos embebidos (Vimeo)
- ✅ Ver contenido de texto
- ✅ Marcar lecciones como completadas

**Flujo actual:** Django Admin → Base de Datos → Backend API → Frontend → Usuario

---

## 📋 **FLUJO ACTUAL PASO A PASO**

### **1. ADMIN: Crear Curso desde Django Admin**

#### **Paso 1.1: Crear Curso**
- **URL:** `/admin/courses/course/add/`
- **Campos requeridos:**
  - `id`: Auto-generado (ej: `c-001`)
  - `title`: Título del curso
  - `slug`: Auto-generado desde título
  - `description`: Descripción completa
  - `price`: Precio en PEN
  - `status`: Estado (draft, published, etc.)
  - `is_active`: Activo/Inactivo

#### **Paso 1.2: Crear Módulo**
- **URL:** `/admin/courses/module/add/`
- **Campos requeridos:**
  - `course`: Seleccionar curso padre
  - `title`: Título del módulo
  - `description`: Descripción (opcional)
  - `order`: Orden de visualización
  - `is_active`: Activo/Inactivo

**Nota:** También se puede crear desde el inline del curso.

#### **Paso 1.3: Crear Lección**
- **URL:** `/admin/courses/lesson/add/`
- **Campos requeridos:**
  - `module`: Seleccionar módulo padre
  - `title`: Título de la lección
  - `description`: Descripción (opcional)
  - `lesson_type`: Tipo (video, text, document, quiz)
  - `content_url`: **URL del contenido**
  - `content_text`: **Contenido HTML** (para tipo "text")
  - `duration_minutes`: Duración en minutos
  - `order`: Orden de visualización
  - `is_active`: Activo/Inactivo

---

### **2. FLUJO DE VIDEOS (Vimeo)**

#### **Problema Actual:**
El sistema **NO convierte automáticamente** URLs de Vimeo a formato embed. El admin debe insertar la URL de embed directamente.

#### **URLs de Vimeo - Formatos:**

**❌ NO funciona (URL normal):**
```
https://vimeo.com/123456789
```

**✅ Funciona (URL de embed):**
```
https://player.vimeo.com/video/123456789
```

#### **Proceso Manual Actual:**
1. Admin copia URL de Vimeo: `https://vimeo.com/123456789`
2. Admin debe convertir manualmente a: `https://player.vimeo.com/video/123456789`
3. Admin pega en campo `content_url` del admin
4. Frontend muestra el video embebido

**Código actual:**
```93:102:frontend/src/features/academy/components/LessonPlayer.tsx
{lesson.lesson_type === 'video' && lesson.content_url && (
    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
        <iframe
            src={lesson.content_url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
        />
    </div>
)}
```

**✅ Funciona correctamente** si la URL es de embed.

---

### **3. FLUJO DE CONTENIDO DE TEXTO**

#### **Proceso:**
1. Admin crea lección con `lesson_type = 'text'`
2. Admin escribe HTML en campo `content_text`
3. Backend retorna el HTML
4. Frontend sanitiza con `SafeHTML` y muestra

**Código:**
```105:109:frontend/src/features/academy/components/LessonPlayer.tsx
{lesson.lesson_type === 'text' && lesson.content_text && (
    <div className="prose prose-invert max-w-none">
        <SafeHTML html={lesson.content_text} tag="div" />
    </div>
)}
```

**✅ Funciona correctamente** con sanitización HTML.

---

### **4. FLUJO COMPLETO: Usuario Ve Contenido**

#### **Paso 4.1: Usuario accede al curso**
- **URL:** `/academy/course/[slug]`
- **Componente:** `CourseDetailPage.tsx`
- **Verificación:** ¿Está inscrito?
  - ✅ SÍ → Botón "Acceder al Curso"
  - ❌ NO → Botón "Agregar al carrito"

#### **Paso 4.2: Usuario hace clic en "Acceder al Curso"**
- **Navegación:** `/academy/course/[slug]/learn`
- **Componente:** `CourseLearnPage.tsx`
- **Protección:** `ProtectedRoute` (requiere autenticación)

#### **Paso 4.3: Frontend solicita contenido**
- **Hook:** `useCourseContent(courseId)`
- **Servicio:** `getCourseContent(courseId)`
- **Endpoint:** `GET /api/v1/courses/{course_id}/content/`
- **Autenticación:** JWT Bearer token

#### **Paso 4.4: Backend valida y retorna contenido**
- **Archivo:** `backend/presentation/views/course_views.py` (línea 378)
- **Validación:**
  1. ✅ Curso existe y está activo
  2. ✅ Usuario tiene acceso (`can_access_course_content`)
  3. ✅ Solo módulos/lecciones activas
  4. ✅ Incluye `content_url` y `content_text`

**Respuesta del backend:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "c-001",
      "title": "Curso de Python",
      "slug": "curso-de-python"
    },
    "enrollment": {
      "id": "enr_123",
      "completion_percentage": 33.33
    },
    "modules": [
      {
        "id": "m_001",
        "title": "Introducción a Python",
        "lessons": [
          {
            "id": "l_001",
            "title": "Tu Primer Programa",
            "lesson_type": "video",
            "content_url": "https://player.vimeo.com/video/123456789",
            "duration_minutes": 10
          }
        ]
      }
    ]
  }
}
```

#### **Paso 4.5: Frontend muestra contenido**
- **Layout:**
  - **Sidebar izquierdo (1/3):** Lista de módulos y lecciones
  - **Área principal (2/3):** Reproductor de lección

- **Auto-selección:** Primera lección del primer módulo

- **Navegación:** Usuario hace clic en lección → `selectedLessonId` se actualiza → `LessonPlayer` se re-renderiza

---

## 🔍 **ANÁLISIS DEL CÓDIGO ACTUAL**

### **Backend - Modelos**

#### **Course Model** (`backend/apps/courses/models.py`)
```python
class Course(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)  # draft, published, etc.
    is_active = models.BooleanField(default=True)
    # ... más campos
```

#### **Module Model**
```python
class Module(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
```

#### **Lesson Model**
```python
class Lesson(models.Model):
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('document', 'Documento'),
        ('quiz', 'Quiz'),
        ('text', 'Texto'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES)
    content_url = models.URLField(blank=True, null=True)  # Para videos, documentos
    content_text = models.TextField(blank=True)  # Para contenido HTML
    duration_minutes = models.IntegerField(default=0)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
```

**✅ Estructura correcta** - Soporta todos los tipos de contenido.

---

### **Backend - Admin**

#### **CourseAdmin** (`backend/apps/courses/admin.py`)
- ✅ Lista cursos con filtros
- ✅ Búsqueda por título, slug, descripción
- ✅ Fieldsets organizados
- ✅ Slug auto-generado desde título

#### **ModuleAdmin**
- ✅ Inline de lecciones (`LessonInline`)
- ✅ Filtros por curso, estado
- ✅ Ordenamiento por curso y orden

#### **LessonAdmin**
- ✅ Fieldsets: Información Básica, Contenido, Orden y Estado
- ✅ Campos: `content_url` y `content_text` separados
- ✅ Filtros por tipo, estado, curso

**✅ Admin funcional** - Permite crear cursos, módulos y lecciones fácilmente.

---

### **Backend - API**

#### **Endpoint: GET /api/v1/courses/{course_id}/content/**
- **Archivo:** `backend/presentation/views/course_views.py` (línea 378)
- **Validaciones:**
  1. ✅ Curso existe y está activo
  2. ✅ Usuario tiene acceso (`can_access_course_content`)
  3. ✅ Solo módulos/lecciones activas
  4. ✅ Incluye `content_url` y `content_text` si existen

**✅ API funcional** - Retorna contenido completo y validado.

---

### **Frontend - Visualización**

#### **CourseLearnPage** (`frontend/src/features/academy/pages/CourseLearnPage.tsx`)
- ✅ Carga curso por slug
- ✅ Carga contenido del curso
- ✅ Verifica enrollment
- ✅ Auto-selecciona primera lección
- ✅ Sidebar con módulos/lecciones
- ✅ Barra de progreso
- ✅ Manejo de errores

#### **LessonPlayer** (`frontend/src/features/academy/components/LessonPlayer.tsx`)
- ✅ Soporta 4 tipos: video, text, document, quiz
- ✅ Video: iframe embebido
- ✅ Texto: HTML sanitizado con `SafeHTML`
- ✅ Documento: Enlace de descarga
- ✅ Quiz: Placeholder
- ✅ Checkbox de completado
- ✅ Muestra duración y tipo

**✅ Frontend funcional** - Muestra contenido correctamente.

---

## ⚠️ **PROBLEMAS IDENTIFICADOS**

### **1. URLs de Vimeo - Conversión Manual**

**Problema:**
- Admin debe convertir manualmente URLs de Vimeo a formato embed
- Fácil cometer errores
- No hay validación de formato

**Ejemplo:**
```
Admin pega: https://vimeo.com/123456789
❌ No funciona en iframe

Admin debe convertir a: https://player.vimeo.com/video/123456789
✅ Funciona en iframe
```

**Impacto:** 🟡 **MEDIO** - Funciona pero es propenso a errores.

---

### **2. No hay Validación de URLs de Video**

**Problema:**
- No se valida que la URL sea válida
- No se valida que sea URL de embed
- No se detecta si es Vimeo, YouTube, etc.

**Impacto:** 🟡 **MEDIO** - Puede causar errores en frontend.

---

### **3. No hay Preview en Admin**

**Problema:**
- Admin no puede ver cómo se verá el video antes de guardar
- No hay validación visual

**Impacto:** 🟢 **BAJO** - Mejora UX pero no crítico.

---

## ✅ **LO QUE FUNCIONA PERFECTAMENTE**

1. ✅ **Estructura de datos:** Course → Module → Lesson
2. ✅ **Admin de Django:** Fácil crear cursos, módulos, lecciones
3. ✅ **API Backend:** Retorna contenido validado y seguro
4. ✅ **Frontend:** Muestra contenido correctamente
5. ✅ **Videos embebidos:** Funcionan si la URL es correcta
6. ✅ **Contenido HTML:** Sanitizado correctamente
7. ✅ **Navegación:** Entre lecciones funciona bien
8. ✅ **Progreso:** Marcar lecciones como completadas funciona
9. ✅ **Seguridad:** Validación de acceso en backend y frontend

---

## 🎯 **PLAN DE MEJORAS**

### **FASE 1: Conversión Automática de URLs de Vimeo** ✅ **IMPLEMENTADO**

#### **Estado:** ✅ **COMPLETADO**

**Implementación:**
- ✅ Servicio `VideoURLService` creado en `infrastructure/services/`
- ✅ Método `clean()` agregado en modelo `Lesson`
- ✅ Validaciones de seguridad (SSRF, XSS)
- ✅ Tests completos (30+ unitarios + 15+ integración)
- ✅ Integración con Django Admin

**Archivos:**
- `backend/infrastructure/services/video_url_service.py` (NUEVO)
- `backend/infrastructure/services/tests/test_video_url_service.py` (NUEVO)
- `backend/apps/courses/tests/test_lesson_video_url_conversion.py` (NUEVO)
- `backend/apps/courses/models.py` (MODIFICADO)
- `backend/apps/courses/admin.py` (MODIFICADO)

**Documentación:** Ver `backend/apps/courses/README_VIDEO_URLS.md`

**Tiempo implementado:** 2 horas

---

### **FASE 2: Validación de URLs de Video** 🟡 **PRIORIDAD MEDIA**

#### **Objetivo:**
Validar que las URLs de video sean válidas y de formato embed.

#### **Implementación:**
```python
# En backend/apps/courses/models.py

def clean(self):
    if self.lesson_type == 'video' and self.content_url:
        # Validar que sea URL de embed válida
        valid_patterns = [
            r'https?://player\.vimeo\.com/video/\d+',  # Vimeo embed
            r'https?://www\.youtube\.com/embed/[\w-]+',  # YouTube embed
            # Agregar más plataformas según necesidad
        ]
        
        is_valid = any(re.match(pattern, self.content_url) for pattern in valid_patterns)
        if not is_valid:
            raise ValidationError({
                'content_url': 'URL de video inválida. Debe ser URL de embed (ej: https://player.vimeo.com/video/123456789)'
            })
```

**Tiempo estimado:** 1 hora

---

### **FASE 3: Soporte para YouTube** 🟢 **PRIORIDAD BAJA**

#### **Objetivo:**
Soportar videos de YouTube además de Vimeo.

#### **Implementación:**
- Agregar conversión de URLs de YouTube
- Validar formato embed de YouTube
- Actualizar documentación

**Tiempo estimado:** 1-2 horas

---

### **FASE 4: Preview en Admin (Opcional)** 🟢 **PRIORIDAD BAJA**

#### **Objetivo:**
Mostrar preview del video en el admin antes de guardar.

#### **Implementación:**
- Custom widget de admin
- JavaScript para mostrar iframe preview
- Validación visual

**Tiempo estimado:** 2-3 horas

---

## 📋 **CHECKLIST DE FUNCIONALIDADES ACTUALES**

### **Backend:**
- [x] ✅ Modelos: Course, Module, Lesson
- [x] ✅ Admin: Crear/editar cursos, módulos, lecciones
- [x] ✅ API: Endpoint de contenido con validación
- [x] ✅ Seguridad: Validación de acceso
- [ ] ⚠️ Conversión automática de URLs Vimeo (FALTA)
- [ ] ⚠️ Validación de URLs de video (FALTA)

### **Frontend:**
- [x] ✅ Página de aprendizaje
- [x] ✅ Sidebar de módulos/lecciones
- [x] ✅ Reproductor de contenido
- [x] ✅ Soporte para video, texto, documento
- [x] ✅ Navegación entre lecciones
- [x] ✅ Progreso de lecciones
- [x] ✅ Barra de progreso del curso

---

## 🚀 **RECOMENDACIÓN INMEDIATA**

### **Implementar FASE 1: Conversión Automática de URLs de Vimeo**

**Razones:**
1. ✅ Mejora significativa de UX para admin
2. ✅ Reduce errores
3. ✅ Implementación simple (1-2 horas)
4. ✅ No rompe funcionalidad existente

**Pasos:**
1. Agregar método `clean()` en modelo `Lesson`
2. Convertir URLs de Vimeo automáticamente
3. Probar con URLs normales y de embed
4. Actualizar documentación

---

## 📚 **DOCUMENTACIÓN ACTUAL**

### **Para Admin:**
1. Crear curso en `/admin/courses/course/add/`
2. Crear módulo en `/admin/courses/module/add/` (o inline)
3. Crear lección en `/admin/courses/lesson/add/`
4. **IMPORTANTE:** Para videos de Vimeo, usar URL de embed:
   - ✅ `https://player.vimeo.com/video/123456789`
   - ❌ `https://vimeo.com/123456789`

### **Para Desarrolladores:**
- Ver `FLUJO_VISUALIZACION_CONTENIDO.md` para flujo completo
- Ver código en `backend/apps/courses/models.py` para modelos
- Ver código en `frontend/src/features/academy/` para componentes

---

## 🎯 **CONCLUSIÓN**

### **Estado Actual:**
✅ **FUNCIONAL** - El sistema funciona correctamente para crear y visualizar contenido.

### **Mejoras Recomendadas:**
1. 🟡 **FASE 1:** Conversión automática de URLs Vimeo (1-2 horas)
2. 🟡 **FASE 2:** Validación de URLs de video (1 hora)
3. 🟢 **FASE 3:** Soporte YouTube (1-2 horas)
4. 🟢 **FASE 4:** Preview en admin (2-3 horas)

### **Prioridad:**
**Implementar FASE 1** para mejorar la experiencia del admin y reducir errores.

---

**¿Quieres que implemente la FASE 1 ahora?** 🚀

