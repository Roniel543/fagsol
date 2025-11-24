# ✅ Verificación CRUD de Cursos - Admin Frontend

## 📋 Endpoints Backend

### ✅ CREATE - Crear Curso
- **Endpoint**: `POST /api/v1/courses/create/`
- **Vista**: `create_course` en `course_views.py`
- **Permisos**: `IsAuthenticated, IsAdminOrInstructor`
- **Frontend**: `createCourse()` en `courses.ts` → `CourseForm.tsx`
- **Página**: `/admin/courses/new` → `CreateCoursePage.tsx`
- **Estado**: ✅ CONFIGURADO CORRECTAMENTE

### ✅ READ - Obtener Curso
- **Endpoint**: `GET /api/v1/courses/{course_id}/`
- **Vista**: `get_course` en `course_views.py`
- **Permisos**: `AllowAny` (pero filtra por `is_active` excepto para admins)
- **Frontend**: `getCourseById()` en `courses.ts` → `CourseForm.tsx`
- **Página**: `/admin/courses/{id}/edit` → `EditCoursePage.tsx`
- **Estado**: ✅ CONFIGURADO CORRECTAMENTE (admins pueden ver archivados)

### ✅ UPDATE - Actualizar Curso
- **Endpoint**: `PUT /api/v1/courses/{course_id}/update/`
- **Vista**: `update_course` en `course_views.py`
- **Permisos**: `IsAuthenticated, IsAdminOrInstructor`
- **Frontend**: `updateCourse()` en `courses.ts` → `CourseForm.tsx`
- **Página**: `/admin/courses/{id}/edit` → `EditCoursePage.tsx`
- **Estado**: ✅ CONFIGURADO CORRECTAMENTE

### ✅ DELETE - Eliminar (Archivar) Curso
- **Endpoint**: `DELETE /api/v1/courses/{course_id}/delete/`
- **Vista**: `delete_course` en `course_views.py`
- **Permisos**: `IsAuthenticated, IsAdmin` (solo admins)
- **Frontend**: `deleteCourse()` en `courses.ts` → `CoursesAdminPage.tsx`
- **Página**: `/admin/courses` → `CoursesAdminPage.tsx`
- **Estado**: ✅ CONFIGURADO CORRECTAMENTE

---

## 🔍 Verificación Detallada

### 1. CREATE (Crear)
```typescript
// frontend/src/shared/services/courses.ts
export async function createCourse(data: CreateCourseRequest): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>('/courses/create/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as CourseDetailResponse;
}
```
✅ **Ruta correcta**: `/courses/create/`
✅ **Método correcto**: `POST`
✅ **Usado en**: `CourseForm.tsx` línea 222

### 2. READ (Obtener)
```typescript
// frontend/src/shared/services/courses.ts
export async function getCourseById(courseId: string): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>(`/courses/${courseId}/`);
    return response as unknown as CourseDetailResponse;
}
```
✅ **Ruta correcta**: `/courses/{course_id}/`
✅ **Método correcto**: `GET`
✅ **Usado en**: `CourseForm.tsx` línea 52
✅ **Permite ver archivados**: Solo para admins (corregido en `course_views.py` línea 285-288)

### 3. UPDATE (Actualizar)
```typescript
// frontend/src/shared/services/courses.ts
export async function updateCourse(courseId: string, data: UpdateCourseRequest): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>(`/courses/${courseId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as CourseDetailResponse;
}
```
✅ **Ruta correcta**: `/courses/{course_id}/update/`
✅ **Método correcto**: `PUT`
✅ **Usado en**: `CourseForm.tsx` línea 219

### 4. DELETE (Eliminar/Archivar)
```typescript
// frontend/src/shared/services/courses.ts
export async function deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/courses/${courseId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}
```
✅ **Ruta correcta**: `/courses/{course_id}/delete/`
✅ **Método correcto**: `DELETE`
✅ **Usado en**: `CoursesAdminPage.tsx` línea 28

---

## 🧪 Pruebas Recomendadas

### Test 1: Crear Curso
1. Ir a `/admin/courses/new`
2. Llenar formulario
3. Click en "Crear Curso"
4. ✅ Debe crear y redirigir a `/admin/courses`

### Test 2: Leer Curso (Editar)
1. Ir a `/admin/courses`
2. Click en "Editar" de un curso
3. ✅ Debe cargar datos del curso en el formulario
4. ✅ Debe funcionar incluso con cursos archivados (solo admin)

### Test 3: Actualizar Curso
1. Ir a `/admin/courses/{id}/edit`
2. Modificar campos
3. Click en "Actualizar Curso"
4. ✅ Debe actualizar y mostrar mensaje de éxito

### Test 4: Eliminar Curso
1. Ir a `/admin/courses`
2. Click en "Eliminar" de un curso
3. Confirmar eliminación
4. ✅ Debe archivar el curso (soft delete)
5. ✅ Debe desaparecer de la lista (o aparecer en filtro "Archivados")

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: Error al editar curso archivado
**Solución**: ✅ Ya corregido - Admins pueden ver cursos archivados

### Problema 2: Error 403 al crear/editar
**Causas posibles**:
1. **No es admin ni instructor**: El decorador `IsAdminOrInstructor` rechaza la petición
2. **Instructor no aprobado**: Para crear cursos, el instructor debe estar aprobado (`instructor_status='approved'`)
3. **Instructor intenta editar curso ajeno**: Los instructores solo pueden editar sus propios cursos (verificando `course.created_by == user`)
4. **No tiene permiso Django**: Falta el permiso `courses.change_course` en el grupo/usuario

**Verificación**:
- Revisar `UserProfile.role` (debe ser 'admin' o 'instructor')
- Si es instructor, verificar `UserProfile.instructor_status` (debe ser 'approved')
- Si es instructor editando, verificar que el curso pertenezca al instructor (`course.created_by == user`)
- Verificar permisos Django en el grupo del usuario

**Solución**: 
- Para admin: Asignar rol 'admin' en `UserProfile`
- Para instructor: Aprobar instructor en Django Admin o cambiar `instructor_status='approved'`
- Verificar que el usuario tenga los permisos Django necesarios
- **IMPORTANTE**: Los instructores solo pueden editar cursos que ellos crearon (corregido en `permissions.py` línea 263)

### Problema 3: Error 404 al obtener curso
**Causa**: Curso no existe o está inactivo (y usuario no es admin)
**Solución**: Verificar que el curso existe y `is_active=True` (o ser admin)

### Problema 4: Error 500 al crear/actualizar
**Causa**: Datos inválidos o error en backend
**Solución**: Revisar logs del backend y validar datos del formulario

---

## ✅ Estado Final

| Operación | Endpoint Backend | Servicio Frontend | Página Frontend | Estado |
|-----------|-----------------|-------------------|-----------------|--------|
| CREATE | ✅ `POST /courses/create/` | ✅ `createCourse()` | ✅ `CreateCoursePage` | ✅ OK |
| READ | ✅ `GET /courses/{id}/` | ✅ `getCourseById()` | ✅ `EditCoursePage` | ✅ OK |
| UPDATE | ✅ `PUT /courses/{id}/update/` | ✅ `updateCourse()` | ✅ `EditCoursePage` | ✅ OK |
| DELETE | ✅ `DELETE /courses/{id}/delete/` | ✅ `deleteCourse()` | ✅ `CoursesAdminPage` | ✅ OK |

**🎉 TODOS LOS ENDPOINTS ESTÁN CONFIGURADOS CORRECTAMENTE**

