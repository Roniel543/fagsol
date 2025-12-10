# 🎯 Plan de Implementación - Demo para Cliente

**Fecha:** 2025-01-12  
**Objetivo:** Implementar funcionalidades core visibles para demostrar avances al cliente

---

## 📊 **ESTADO ACTUAL - LO QUE YA TENEMOS**

### ✅ **Backend Completo**
- ✅ Modelos: `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`
- ✅ Endpoints GET: Listar cursos, obtener curso, contenido protegido
- ✅ Autenticación: Login, register, logout con JWT
- ✅ Pagos: Payment intents, procesamiento con MercadoPago
- ✅ Permisos: Roles (admin, instructor, student, guest)
- ✅ Tests: 33 tests de integración + 25 unitarios

### ✅ **Frontend Completo**
- ✅ SWR configurado y conectado al backend
- ✅ Páginas: Home, Catálogo, Detalle de Curso, Checkout
- ✅ Autenticación: Login, Register, Dashboard básico
- ✅ Carrito de compras funcional
- ✅ Integración de pagos con MercadoPago

### ❌ **LO QUE FALTA (Core para Demo)**
1. ❌ **CRUD de Cursos** - No se puede crear/editar cursos desde frontend
2. ❌ **Visualización de Contenido** - No se puede ver contenido cuando estás inscrito
3. ❌ **Progreso de Lecciones** - No se puede marcar lecciones como completadas
4. ❌ **Dashboard Mejorado** - Solo muestra info básica del usuario

---

## 🚀 **PLAN DE IMPLEMENTACIÓN - PRIORIDADES**

### **PRIORIDAD 1: CRUD de Cursos** ⭐⭐⭐ (MÁS IMPORTANTE)
**Tiempo estimado:** 3-4 horas  
**Por qué es crítico:** El cliente quiere "agregar un curso y que se muestre en frontend"

#### **Backend (1.5-2 horas)**
- [ ] Crear endpoint `POST /api/v1/courses/` (crear curso)
  - Permisos: Solo `admin` o `instructor`
  - Validar campos requeridos
  - Generar slug automáticamente
  - Asignar `created_by` al usuario actual
  
- [ ] Crear endpoint `PUT /api/v1/courses/{id}/` (actualizar curso)
  - Permisos: Solo `admin` o el `instructor` que creó el curso
  - Validar que el curso existe
  - Actualizar campos permitidos
  
- [ ] Crear endpoint `DELETE /api/v1/courses/{id}/` (eliminar curso)
  - Permisos: Solo `admin`
  - Soft delete (cambiar status a 'archived')
  
- [ ] Documentar en Swagger

#### **Frontend (1.5-2 horas)**
- [ ] Crear página `/admin/courses` (solo para admin/instructor)
  - Lista de cursos con acciones (editar, eliminar)
  - Botón "Crear Nuevo Curso"
  
- [ ] Crear página `/admin/courses/new` (formulario crear curso)
  - Formulario con todos los campos del modelo
  - Validación client-side
  - Envío a backend
  
- [ ] Crear página `/admin/courses/[id]/edit` (formulario editar curso)
  - Cargar datos del curso
  - Formulario prellenado
  - Guardar cambios
  
- [ ] Agregar navegación en Dashboard para admin/instructor

**Resultado:** Admin puede crear un curso desde el frontend y aparece inmediatamente en el catálogo

---

### **PRIORIDAD 2: Visualización de Contenido del Curso** ⭐⭐
**Tiempo estimado:** 2-3 horas  
**Por qué es importante:** Muestra que los estudiantes pueden acceder al contenido cuando están inscritos

#### **Backend (Ya existe)**
- ✅ Endpoint `GET /api/v1/courses/{id}/content/` ya implementado
- ✅ Verifica enrollment automáticamente

#### **Frontend (2-3 horas)**
- [ ] Crear página `/courses/[slug]/learn` (página de aprendizaje)
  - Verificar que el usuario está inscrito
  - Mostrar lista de módulos y lecciones
  - Navegación entre lecciones
  - Reproductor de video/contenido
  
- [ ] Agregar botón "Acceder al Curso" en:
  - `CourseDetailPage` (si está inscrito)
  - Dashboard (mis cursos)

**Resultado:** Estudiantes pueden ver el contenido completo del curso cuando están inscritos

---

### **PRIORIDAD 3: Progreso de Lecciones** ⭐⭐
**Tiempo estimado:** 3-4 horas  
**Por qué es importante:** Muestra funcionalidad educativa completa

#### **Backend (1.5-2 horas)**
- [ ] Crear modelo `LessonProgress` en `apps/users/models.py`
  ```python
  class LessonProgress(models.Model):
      enrollment = ForeignKey(Enrollment)
      lesson = ForeignKey(Lesson)
      is_completed = BooleanField(default=False)
      completed_at = DateTimeField(null=True)
      progress_percentage = IntegerField(default=0)  # 0-100
  ```
  
- [ ] Crear endpoints:
  - `POST /api/v1/enrollments/{id}/lessons/{lesson_id}/complete/` - Marcar como completada
  - `GET /api/v1/enrollments/{id}/progress/` - Obtener progreso del curso
  
- [ ] Migraciones

#### **Frontend (1.5-2 horas)**
- [ ] En página `/courses/[slug]/learn`:
  - Checkbox "Marcar como completada" en cada lección
  - Barra de progreso del curso
  - Indicador visual de lecciones completadas
  
- [ ] En Dashboard:
  - Mostrar progreso de cada curso inscrito

**Resultado:** Estudiantes pueden marcar lecciones como completadas y ver su progreso

---

### **PRIORIDAD 4: Dashboard Mejorado** ⭐
**Tiempo estimado:** 2 horas  
**Por qué es útil:** Mejora la experiencia del usuario

#### **Frontend (2 horas)**
- [ ] Mejorar `DashboardPage.tsx`:
  - Sección "Mis Cursos" (usando `useEnrollments()`)
  - Mostrar progreso de cada curso
  - Botones "Continuar Aprendiendo" y "Ver Certificado"
  
- [ ] Agregar sección "Certificados Obtenidos"
  - Lista de certificados descargables
  
- [ ] Agregar sección "Actividad Reciente"
  - Últimas lecciones completadas

**Resultado:** Dashboard más completo y útil para estudiantes

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Fase 1: CRUD de Cursos (3-4 horas)**
- [ ] Backend: POST /api/v1/courses/
- [ ] Backend: PUT /api/v1/courses/{id}/
- [ ] Backend: DELETE /api/v1/courses/{id}/
- [ ] Backend: Documentar en Swagger
- [ ] Frontend: Página /admin/courses (lista)
- [ ] Frontend: Página /admin/courses/new (crear)
- [ ] Frontend: Página /admin/courses/[id]/edit (editar)
- [ ] Frontend: Proteger rutas (solo admin/instructor)
- [ ] Probar: Crear curso → Ver en catálogo

### **Fase 2: Visualización de Contenido (2-3 horas)**
- [ ] Frontend: Página /courses/[slug]/learn
- [ ] Frontend: Verificar enrollment antes de mostrar contenido
- [ ] Frontend: Mostrar módulos y lecciones
- [ ] Frontend: Reproductor de video/contenido
- [ ] Frontend: Botón "Acceder al Curso" en detalle
- [ ] Probar: Inscribirse → Ver contenido

### **Fase 3: Progreso de Lecciones (3-4 horas)**
- [ ] Backend: Modelo LessonProgress
- [ ] Backend: Migraciones
- [ ] Backend: POST /api/v1/enrollments/{id}/lessons/{lesson_id}/complete/
- [ ] Backend: GET /api/v1/enrollments/{id}/progress/
- [ ] Frontend: Checkbox "Completada" en lecciones
- [ ] Frontend: Barra de progreso
- [ ] Frontend: Mostrar progreso en dashboard
- [ ] Probar: Completar lecciones → Ver progreso

### **Fase 4: Dashboard Mejorado (2 horas)**
- [ ] Frontend: Sección "Mis Cursos" en dashboard
- [ ] Frontend: Mostrar progreso de cursos
- [ ] Frontend: Sección "Certificados"
- [ ] Frontend: Sección "Actividad Reciente"
- [ ] Probar: Ver dashboard completo

---

## 🎯 **DEMO PARA EL CLIENTE - FLUJO SUGERIDO**

### **1. Crear un Curso (5 minutos)**
1. Login como admin
2. Ir a Dashboard → "Administrar Cursos"
3. Click "Crear Nuevo Curso"
4. Llenar formulario (título, descripción, precio, etc.)
5. Guardar
6. **Mostrar:** El curso aparece inmediatamente en el catálogo público

### **2. Ver Contenido del Curso (5 minutos)**
1. Login como estudiante
2. Ir a Catálogo → Ver el curso creado
3. Inscribirse (simular pago o crear enrollment manual)
4. Click "Acceder al Curso"
5. **Mostrar:** Lista de módulos y lecciones disponibles

### **3. Progreso de Aprendizaje (5 minutos)**
1. En la página de aprendizaje
2. Completar algunas lecciones
3. **Mostrar:** Barra de progreso actualizada
4. Ir a Dashboard
5. **Mostrar:** Progreso visible en "Mis Cursos"

### **4. Dashboard Completo (2 minutos)**
1. Mostrar todas las secciones del dashboard
2. **Mostrar:** Cursos inscritos, progreso, certificados

---

## ⏱️ **TIEMPO TOTAL ESTIMADO**

- **Fase 1 (CRUD):** 3-4 horas
- **Fase 2 (Contenido):** 2-3 horas
- **Fase 3 (Progreso):** 3-4 horas
- **Fase 4 (Dashboard):** 2 horas

**Total:** 10-13 horas

**Recomendación:** Implementar al menos Fase 1 y Fase 2 para la demo (5-7 horas)

---

## 🚨 **NOTAS IMPORTANTES**

1. **Permisos:** Asegurar que solo admin/instructor pueden crear/editar cursos
2. **Validación:** Validar todos los campos en backend y frontend
3. **UX:** Mensajes de éxito/error claros
4. **Testing:** Probar cada funcionalidad después de implementarla
5. **Swagger:** Documentar todos los nuevos endpoints

---

## 📝 **PRÓXIMOS PASOS**

1. ✅ Revisar este plan
2. ⏭️ Empezar con Fase 1 (CRUD de Cursos)
3. ⏭️ Continuar con Fase 2 (Visualización de Contenido)
4. ⏭️ Si hay tiempo, implementar Fase 3 y 4

---

**Estado:** 📋 Plan creado - Listo para implementar

