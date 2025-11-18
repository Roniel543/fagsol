# 📚 Flujo Completo: Visualización de Contenido de Curso

**PRIORIDAD 1: Visualización de Contenido** ✅ Implementado

---

## 🎯 **FLUJO COMPLETO PASO A PASO**

### **ESCENARIO 1: Estudiante Inscrito en un Curso**

#### **Paso 1: Usuario ve el detalle del curso**
- **URL:** `/academy/course/[slug]`
- **Componente:** `CourseDetailPage.tsx`
- **Acciones:**
  1. El usuario navega al catálogo o busca un curso
  2. Hace clic en un curso para ver sus detalles
  3. El frontend carga el curso usando `useCourseBySlug(slug)`
  4. Se muestra la información del curso (título, descripción, precio, módulos)

#### **Paso 2: Verificación de enrollment**
- **Componente:** `CourseDetailPage.tsx` (líneas 34-40)
- **Lógica:**
  ```typescript
  const isEnrolled = useMemo(() => {
      if (!detail || !isAuthenticated || !enrollments.length) return false;
      return enrollments.some(
          (enrollment) => enrollment.course.id === detail.id && enrollment.status === 'active'
      );
  }, [detail, enrollments, isAuthenticated]);
  ```
- **Resultado:**
  - Si está inscrito → Muestra botón **"Acceder al Curso"**
  - Si NO está inscrito → Muestra botón **"Agregar al carrito"**

#### **Paso 3: Usuario hace clic en "Acceder al Curso"**
- **Acción:** `handleAccessCourse()` (línea 82-84)
- **Navegación:** `router.push(/academy/course/${slug}/learn)`
- **URL destino:** `/academy/course/[slug]/learn`

#### **Paso 4: Página de aprendizaje se carga**
- **Componente:** `CourseLearnPage.tsx`
- **Ruta:** `frontend/src/app/academy/course/[slug]/learn/page.tsx`
- **Protección:** `ProtectedRoute` (requiere autenticación)

#### **Paso 5: Verificaciones de acceso**
- **Verificación 1: Enrollment** (líneas 31-36)
  ```typescript
  const isEnrolled = useMemo(() => {
      if (!courseDetail || !enrollments.length) return false;
      return enrollments.some(
          (enrollment) => enrollment.course.id === courseDetail.id && enrollment.status === 'active'
      );
  }, [courseDetail, enrollments]);
  ```

- **Verificación 2: Rol Admin/Instructor** (líneas 38-41)
  ```typescript
  const isAdminOrInstructor = useMemo(() => {
      return user?.role === 'admin' || user?.role === 'instructor';
  }, [user]);
  ```

- **Si NO tiene acceso:**
  - Muestra mensaje: "No estás inscrito en este curso"
  - Botón para volver al detalle del curso

#### **Paso 6: Solicitud al backend**
- **Hook:** `useCourseContent(courseId)` (línea 25)
- **Servicio:** `getCourseContent(courseId)` en `courses.ts`
- **Endpoint Backend:** `GET /api/v1/courses/{course_id}/content/`
- **Autenticación:** Requiere JWT token (Bearer)

#### **Paso 7: Backend valida acceso**
- **Archivo:** `backend/presentation/views/course_views.py` (línea 378)
- **Validación:**
  1. Verifica que el curso existe y está activo
  2. Usa `can_access_course_content(user, course)` para verificar permisos:
     - Admin/Instructor: ✅ Acceso permitido
     - Estudiante: ✅ Solo si tiene enrollment activo
     - Otros: ❌ Acceso denegado
  3. Obtiene módulos y lecciones activas
  4. Incluye contenido completo (URLs, texto, etc.)

#### **Paso 8: Frontend recibe y muestra contenido**
- **Respuesta del backend:**
  ```json
  {
    "success": true,
    "data": {
      "course": { "id": "...", "title": "...", "slug": "..." },
      "enrollment": { "id": "...", "completion_percentage": 0 },
      "modules": [
        {
          "id": "...",
          "title": "Módulo 1",
          "lessons": [
            {
              "id": "...",
              "title": "Lección 1",
              "lesson_type": "video",
              "content_url": "https://...",
              "duration_minutes": 10
            }
          ]
        }
      ]
    }
  }
  ```

#### **Paso 9: Auto-selección de primera lección**
- **Lógica:** `useEffect` (líneas 55-62)
- **Comportamiento:**
  - Si no hay lección seleccionada Y hay contenido
  - Selecciona automáticamente la primera lección del primer módulo

#### **Paso 10: Usuario ve el contenido**
- **Layout:**
  - **Sidebar izquierdo:** Lista de módulos y lecciones (1/3 del ancho)
  - **Área principal:** Reproductor de lección (2/3 del ancho)

- **Sidebar:**
  - Muestra todos los módulos ordenados
  - Cada módulo muestra sus lecciones
  - Lección seleccionada se resalta en naranja
  - Muestra duración y tipo de cada lección

- **Reproductor:**
  - **Componente:** `LessonPlayer.tsx`
  - **Tipos soportados:**
    - **Video:** iframe embebido
    - **Texto:** HTML sanitizado con SafeHTML
    - **Documento:** Enlace de descarga
    - **Quiz:** Placeholder (futuro)

#### **Paso 11: Navegación entre lecciones**
- **Acción:** Usuario hace clic en otra lección del sidebar
- **Estado:** `selectedLessonId` se actualiza
- **Efecto:** `LessonPlayer` se re-renderiza con la nueva lección

---

### **ESCENARIO 2: Admin/Instructor (sin enrollment)**

#### **Diferencias clave:**
1. **En CourseDetailPage:**
   - Admin/Instructor siempre ve el botón **"Acceder al Curso"**
   - No necesita estar inscrito

2. **En CourseLearnPage:**
   - Backend permite acceso sin enrollment
   - Respuesta incluye `access_type: 'admin_or_instructor'`
   - NO muestra `enrollment` en la respuesta

3. **Backend:**
   - `can_access_course_content()` retorna `True` para admin/instructor
   - No requiere enrollment activo

---

### **ESCENARIO 3: Usuario NO inscrito**

#### **Flujo:**
1. Usuario ve detalle del curso
2. Ve botón **"Agregar al carrito"** (no "Acceder al Curso")
3. Si intenta acceder directamente a `/learn`:
   - Frontend verifica enrollment → ❌ No tiene acceso
   - Muestra mensaje: "No estás inscrito en este curso"
   - Botón para volver al detalle

4. Si intenta acceder con URL directa:
   - Backend valida → ❌ 403 Forbidden
   - Frontend muestra error: "Acceso Denegado"

---

## 🔐 **SEGURIDAD IMPLEMENTADA**

### **Backend:**
1. ✅ Autenticación requerida (JWT)
2. ✅ Validación de permisos con `can_access_course_content()`
3. ✅ Verificación de enrollment activo
4. ✅ Solo módulos/lecciones activas se devuelven
5. ✅ Sanitización de datos

### **Frontend:**
1. ✅ Protección de ruta con `ProtectedRoute`
2. ✅ Verificación de enrollment antes de mostrar contenido
3. ✅ Manejo de errores (403, 404)
4. ✅ Sanitización de HTML con `SafeHTML`
5. ✅ Validación de roles (admin/instructor)

---

## 📊 **ESTADOS Y FLUJOS**

### **Estados de la página de aprendizaje:**

1. **Loading:**
   - Muestra spinner mientras carga curso y contenido

2. **Error (403/404):**
   - Muestra mensaje de error
   - Botón para volver al curso

3. **Sin acceso:**
   - Muestra mensaje: "No estás inscrito"
   - Botón para ver detalles del curso

4. **Contenido cargado:**
   - Sidebar con módulos/lecciones
   - Reproductor con lección seleccionada

---

## 🎨 **COMPONENTES INVOLUCRADOS**

### **Frontend:**
1. **CourseDetailPage.tsx**
   - Muestra detalle del curso
   - Botón "Acceder al Curso" condicional

2. **CourseLearnPage.tsx**
   - Página principal de aprendizaje
   - Maneja navegación y estados

3. **LessonPlayer.tsx**
   - Reproductor de contenido
   - Soporta video, texto, documentos

4. **Hooks:**
   - `useCourseBySlug()` - Obtener curso por slug
   - `useCourseContent()` - Obtener contenido completo
   - `useEnrollments()` - Verificar enrollments

5. **Servicios:**
   - `getCourseContent()` - Llamada API al backend

### **Backend:**
1. **course_views.py**
   - `get_course_content()` - Endpoint principal

2. **permissions.py**
   - `can_access_course_content()` - Policy de acceso

3. **Tests:**
   - `test_course_content_integration.py` - 12 tests completos

---

## 🚀 **FLUJO RESUMIDO (Diagrama)**

```
Usuario → Catálogo → Detalle Curso
                          ↓
                    ¿Está inscrito?
                    /           \
                  SÍ            NO
                   ↓             ↓
        "Acceder al Curso"  "Agregar al carrito"
                   ↓
        /academy/course/[slug]/learn
                   ↓
        Verificación de acceso (Frontend)
                   ↓
        GET /api/v1/courses/{id}/content/
                   ↓
        Validación Backend (can_access_course_content)
                   ↓
        ¿Tiene acceso?
        /           \
       SÍ           NO
        ↓            ↓
   Muestra contenido   403 Forbidden
        ↓
   Auto-selecciona primera lección
        ↓
   Usuario navega entre lecciones
```

---

## ✅ **CHECKLIST DE FUNCIONALIDADES**

- ✅ Verificación de enrollment en detalle del curso
- ✅ Botón "Acceder al Curso" condicional
- ✅ Página de aprendizaje protegida
- ✅ Verificación de acceso en frontend y backend
- ✅ Carga de contenido completo del curso
- ✅ Sidebar con módulos y lecciones
- ✅ Reproductor de contenido (video, texto, documentos)
- ✅ Navegación entre lecciones
- ✅ Auto-selección de primera lección
- ✅ Manejo de errores y estados de carga
- ✅ Soporte para admin/instructor sin enrollment
- ✅ Tests de integración completos

---

## 🎯 **PRÓXIMOS PASOS SUGERIDOS**

1. **Probar el flujo completo:**
   - Inscribirse en un curso
   - Acceder al contenido
   - Navegar entre lecciones

2. **Mejoras futuras:**
   - Guardar última lección vista
   - Indicador de lecciones completadas
   - Barra de progreso más detallada
   - Navegación anterior/siguiente

3. **Prioridad 2:**
   - Sistema de progreso de lecciones
   - Marcar lecciones como completadas
   - Actualizar porcentaje de completitud

---

**¿Quieres que probemos el flujo o continuamos con la Prioridad 2?**

