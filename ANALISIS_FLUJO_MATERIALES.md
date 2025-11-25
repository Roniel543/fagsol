# 📋 Análisis Completo del Flujo de Materiales - FagSol

**Fecha:** 2025-01-27  
**Estado:** ✅ CRUD Completo Implementado

---

## 🎯 **RESUMEN EJECUTIVO**

El sistema de materiales permite agregar recursos complementarios a los cursos:
- **Videos de Vimeo**: Materiales de video adicionales
- **Enlaces Externos**: Recursos externos (documentos, artículos, etc.)

Los materiales pueden asociarse opcionalmente a:
- Un curso específico (siempre)
- Un módulo específico (opcional)
- Una lección específica (opcional)

---

## 📊 **MODELO DE DATOS**

### **Modelo Material** (`backend/apps/courses/models.py`)

```python
class Material(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Video Vimeo'),
        ('link', 'Enlace Externo'),
    ]
    
    # Identificación
    id = models.CharField(max_length=50, primary_key=True, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    
    # Asociación opcional
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información básica
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Tipo y contenido
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='video')
    url = models.URLField()
    
    # Orden y estado
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### **Características del Modelo:**

✅ **Validación Automática de URLs de Vimeo:**
- El método `clean()` valida y convierte URLs de Vimeo automáticamente
- Usa `video_url_service` para validación y conversión
- Se ejecuta automáticamente en `save()` mediante `full_clean()`

✅ **Relaciones Flexibles:**
- Material siempre pertenece a un curso
- Puede asociarse opcionalmente a un módulo
- Puede asociarse opcionalmente a una lección
- Si se elimina módulo/lección, el material se mantiene (SET_NULL)

---

## 🔌 **ENDPOINTS BACKEND**

### **1. Listar Materiales de un Curso**

**Endpoint:** `GET /api/v1/admin/courses/{course_id}/materials/`

**Parámetros de Query:**
- `material_type` (opcional): `'video'` | `'link'` - Filtrar por tipo

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mat_xxx",
      "title": "Video complementario",
      "description": "Descripción del material",
      "material_type": "video",
      "url": "https://player.vimeo.com/video/123456789",
      "order": 0,
      "is_active": true,
      "module_id": "mod_xxx",
      "module_title": "Módulo 1",
      "lesson_id": "les_xxx",
      "lesson_title": "Lección 1",
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  ],
  "count": 1
}
```

**Estado:** ✅ Funcionando

---

### **2. Crear Material**

**Endpoint:** `POST /api/v1/admin/courses/{course_id}/materials/create/`

**Body:**
```json
{
  "title": "Video complementario",
  "description": "Descripción opcional",
  "material_type": "video",
  "url": "https://vimeo.com/123456789",
  "module_id": "mod_xxx",  // Opcional
  "lesson_id": "les_xxx",  // Opcional
  "order": 0,
  "is_active": true
}
```

**Validaciones:**
- ✅ Título requerido
- ✅ URL requerida
- ✅ Tipo debe ser `'video'` o `'link'`
- ✅ Si se especifica `lesson_id`, debe pertenecer al `module_id` especificado
- ✅ Si se especifica `module_id`, debe pertenecer al curso

**Estado:** ✅ Funcionando

**⚠️ NOTA:** El endpoint NO convierte explícitamente URLs de Vimeo (solo el modelo lo hace en `clean()`). Esto es suficiente, pero podría mejorarse para consistencia con lecciones.

---

### **3. Actualizar Material**

**Endpoint:** `PUT /api/v1/admin/materials/{material_id}/update/`

**Body:** (Todos los campos son opcionales)
```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "material_type": "link",
  "url": "https://example.com",
  "module_id": "mod_xxx",  // Opcional, puede ser null
  "lesson_id": "les_xxx",  // Opcional, puede ser null
  "order": 1,
  "is_active": false
}
```

**Validaciones:**
- ✅ Mismo tipo de validaciones que crear
- ✅ Si se actualiza `lesson_id`, debe pertenecer al `module_id` especificado

**Estado:** ✅ Funcionando

**⚠️ NOTA:** Mismo comentario sobre conversión de URLs.

---

### **4. Eliminar Material**

**Endpoint:** `DELETE /api/v1/admin/materials/{material_id}/delete/`

**Respuesta:**
```json
{
  "success": true,
  "message": "Material eliminado exitosamente"
}
```

**Estado:** ✅ Funcionando

---

## 🎨 **FRONTEND - PÁGINAS Y COMPONENTES**

### **1. Lista de Materiales**

**Ruta:** `/admin/courses/[id]/materials`

**Componente:** `CourseMaterialsPage.tsx`

**Funcionalidades:**
- ✅ Lista todos los materiales del curso
- ✅ Filtro por tipo (video/link)
- ✅ Muestra información del material:
  - Tipo (icono)
  - Título y descripción
  - URL (enlace externo)
  - Módulo asociado (si existe)
  - Lección asociada (si existe)
  - Estado (activo/inactivo)
- ✅ Acciones: Editar, Eliminar
- ✅ Botón para agregar nuevo material

**Estado:** ✅ Funcionando

---

### **2. Crear Material**

**Ruta:** `/admin/courses/[id]/materials/new`

**Componente:** `CreateMaterialPage.tsx` + `MaterialForm.tsx`

**Formulario:**
- ✅ Título (requerido)
- ✅ Descripción (opcional)
- ✅ Tipo de material: Video Vimeo / Enlace Externo
- ✅ URL (requerido)
- ✅ Orden (auto-calculado o manual)
- ✅ Módulo (opcional, dropdown con módulos del curso)
- ✅ Lección (opcional, dropdown con lecciones del módulo seleccionado)
- ✅ Estado activo (solo en edición)

**Validaciones Frontend:**
- ✅ Título mínimo 3 caracteres
- ✅ URL debe comenzar con `http://` o `https://`
- ✅ Orden >= 0
- ✅ Si se selecciona módulo, se cargan las lecciones
- ✅ Si se cambia módulo, se limpia la lección seleccionada

**Estado:** ✅ Funcionando

---

### **3. Editar Material**

**Ruta:** `/admin/courses/[id]/materials/[materialId]/edit`

**Componente:** `EditMaterialPage.tsx` + `MaterialForm.tsx`

**Funcionalidades:**
- ✅ Carga datos del material existente
- ✅ Mismo formulario que crear
- ✅ Permite cambiar módulo/lección asociados
- ✅ Permite cambiar estado activo/inactivo

**Estado:** ✅ Funcionando

---

## 🔄 **FLUJO COMPLETO**

### **Flujo de Creación:**

1. Admin accede a `/admin/courses/[id]/materials`
2. Clic en "Agregar Material"
3. Completa formulario:
   - Título, descripción
   - Tipo (video o link)
   - URL (si es video, puede ser `https://vimeo.com/...`)
   - Opcionalmente selecciona módulo y/o lección
4. Guarda
5. Backend valida y convierte URL de Vimeo automáticamente (en `clean()`)
6. Material se crea y aparece en la lista

### **Flujo de Edición:**

1. Admin accede a lista de materiales
2. Clic en "Editar" en un material
3. Modifica campos necesarios
4. Guarda
5. Backend valida y actualiza

### **Flujo de Eliminación:**

1. Admin accede a lista de materiales
2. Clic en "Eliminar"
3. Confirmación
4. Material se elimina permanentemente

---

## ✅ **FUNCIONALIDADES VERIFICADAS**

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| **CRUD Completo** | ✅ | Create, Read, Update, Delete funcionando |
| **Filtros** | ✅ | Por tipo de material |
| **Asociación Opcional** | ✅ | Módulo y lección opcionales |
| **Validación de URLs** | ✅ | Automática en modelo |
| **Conversión URLs Vimeo** | ✅ | Automática en `clean()` |
| **UI/UX** | ✅ | Contraste corregido, formularios claros |
| **Validaciones Frontend** | ✅ | Campos requeridos, formatos |
| **Validaciones Backend** | ✅ | Relaciones, tipos, URLs |

---

## ⚠️ **MEJORAS SUGERIDAS**

### **1. Conversión Explícita de URLs en Endpoints** (Opcional)

**Problema:** Los endpoints de materiales no convierten explícitamente URLs de Vimeo (solo el modelo lo hace).

**Solución:** Agregar conversión explícita en `create_material` y `update_material`, similar a como se hace en lecciones:

```python
# En create_material y update_material
if material_type == 'video' and url:
    try:
        from infrastructure.services.video_url_service import video_url_service
        success, converted_url, error_message = video_url_service.validate_and_convert(
            url,
            lesson_type='video',
            add_params=True
        )
        if success and converted_url:
            url = converted_url
        elif not success:
            return Response({
                'success': False,
                'message': error_message or 'URL de video inválida'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Error converting video URL: {str(e)}')
```

**Prioridad:** Baja (el modelo ya lo hace, pero mejoraría consistencia y mensajes de error)

---

### **2. Visualización de Materiales para Estudiantes** (Pendiente)

**Problema:** Los materiales no se muestran en la vista de estudiantes (`/academy/course/{slug}/learn`).

**Solución:** Agregar sección de materiales en la vista de aprendizaje:

1. **Backend:** Incluir materiales en el endpoint `get_course_content`
2. **Frontend:** Mostrar materiales en `CourseLearnPage.tsx`:
   - Sección "Materiales Complementarios"
   - Agrupados por módulo/lección si están asociados
   - Videos embebidos si son tipo video
   - Enlaces externos si son tipo link

**Prioridad:** Media (funcionalidad útil pero no crítica)

---

### **3. Filtros Avanzados** (Opcional)

**Mejoras:**
- Filtrar por módulo
- Filtrar por lección
- Búsqueda por título
- Ordenar por orden, fecha, tipo

**Prioridad:** Baja

---

### **4. Acciones Masivas** (Opcional)

**Mejoras:**
- Activar/desactivar múltiples materiales
- Eliminar múltiples materiales
- Cambiar orden masivamente

**Prioridad:** Baja

---

## 📝 **NOTAS TÉCNICAS**

### **Validación de URLs de Vimeo:**

El modelo `Material` valida automáticamente URLs de Vimeo en el método `clean()`:

```python
def clean(self):
    if self.material_type == 'video' and self.url:
        from infrastructure.services.video_url_service import video_url_service
        success, converted_url, error_message = video_url_service.validate_and_convert(self.url)
        if success and converted_url:
            self.url = converted_url
        elif not success:
            raise ValidationError({
                'url': error_message or 'URL de Vimeo inválida'
            })
```

**Formatos soportados:**
- `https://vimeo.com/123456789` → `https://player.vimeo.com/video/123456789?autoplay=0&loop=0&muted=0`
- `https://www.vimeo.com/123456789` → Convertido automáticamente
- `https://player.vimeo.com/video/123456789` → Ya en formato correcto, solo agrega parámetros

### **Relaciones:**

- **Material → Curso:** Obligatoria (CASCADE)
- **Material → Módulo:** Opcional (SET_NULL)
- **Material → Lección:** Opcional (SET_NULL)

**Validaciones:**
- Si se especifica `lesson_id`, la lección debe pertenecer al `module_id` especificado
- Si se especifica `module_id`, el módulo debe pertenecer al curso

### **Orden:**

- El orden se calcula automáticamente al crear (máximo + 1)
- Se puede modificar manualmente
- Se usa para ordenar materiales en la lista

---

## 🎯 **CONCLUSIÓN**

El sistema de materiales está **completamente funcional** con:

✅ **CRUD completo** implementado y funcionando  
✅ **Validaciones** en frontend y backend  
✅ **Conversión automática** de URLs de Vimeo  
✅ **UI/UX** mejorada con buen contraste  
✅ **Asociación flexible** con módulos y lecciones  

**Pendiente (opcional):**
- Visualización de materiales para estudiantes
- Conversión explícita de URLs en endpoints (mejora de consistencia)

**El sistema está listo para uso en producción.**

---

**Última actualización:** 2025-01-27  
**Estado:** ✅ CRUD Completo | ⚠️ Mejoras Opcionales Identificadas

