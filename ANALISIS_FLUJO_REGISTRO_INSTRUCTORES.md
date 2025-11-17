# 🔍 Análisis del Flujo de Registro y Validación de Instructores

**Fecha:** 2025-01-12  
**Estado:** 📋 Análisis y Propuesta

---

## 📊 **SITUACIÓN ACTUAL**

### **Flujo Actual de Registro de Instructores:**

```
1. Usuario se registra → Selecciona rol "instructor" 
2. ✅ Backend valida que no sea "admin" (ya implementado)
3. ❌ Usuario obtiene rol "instructor" INMEDIATAMENTE
4. ❌ Puede crear cursos INMEDIATAMENTE
5. ❌ Puede publicar cursos sin revisión
```

### **Problemas Identificados:**

#### 🔴 **CRÍTICO - Seguridad y Calidad:**

1. **Sin Validación de Instructores**
   - Cualquiera puede registrarse como instructor
   - No hay verificación de credenciales, experiencia o identidad
   - Riesgo de contenido fraudulento o de baja calidad

2. **Publicación Inmediata de Cursos**
   - Los instructores pueden publicar cursos sin revisión
   - No hay moderación de contenido
   - Riesgo de contenido inapropiado, spam o malicioso

3. **Sin Sistema de Aprobación**
   - No hay proceso de revisión de instructores
   - No hay proceso de revisión de cursos
   - Los administradores no tienen control sobre el contenido

4. **Sin Historial de Moderación**
   - No se registra quién aprobó/rechazó
   - No hay razones de rechazo
   - No hay sistema de reportes

---

## ✅ **FLUJO PROPUESTO - Sistema de Aprobación en Dos Etapas**

### **ETAPA 1: Aprobación de Instructores**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario se registra como "instructor"                │
│    → Estado: "pending_approval" (nuevo campo)           │
│    → NO puede crear cursos aún                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Admin recibe notificación                            │
│    → Ver perfil del instructor                          │
│    → Revisar información (opcional: CV, certificados)   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Admin aprueba/rechaza                                │
│    → Aprobado: Estado → "approved"                      │
│    → Rechazado: Estado → "rejected" + razón            │
│    → Notificación al instructor                         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Instructor aprobado puede crear cursos                │
│    → Pero cursos en estado "draft" por defecto          │
└─────────────────────────────────────────────────────────┘
```

### **ETAPA 2: Aprobación de Cursos**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Instructor crea curso                                │
│    → Estado automático: "draft"                          │
│    → NO visible públicamente                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Instructor solicita publicación                      │
│    → Cambia estado a "pending_review"                   │
│    → Admin recibe notificación                          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Admin revisa curso                                   │
│    → Verifica contenido, calidad, precio               │
│    → Aprobar → "published"                              │
│    → Rechazar → "draft" + comentarios                   │
│    → Solicitar cambios → "needs_revision"               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Curso publicado visible para estudiantes             │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ **CAMBIOS TÉCNICOS NECESARIOS**

### **1. Modelo UserProfile - Nuevo Campo**

```python
# backend/apps/core/models.py

class UserProfile(models.Model):
    # ... campos existentes ...
    
    # NUEVO: Estado de aprobación para instructores
    INSTRUCTOR_STATUS_CHOICES = [
        ('pending_approval', 'Pendiente de Aprobación'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    instructor_status = models.CharField(
        max_length=20,
        choices=INSTRUCTOR_STATUS_CHOICES,
        null=True,
        blank=True,
        verbose_name="Estado de Instructor"
    )
    
    instructor_rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Razón de Rechazo"
    )
    
    instructor_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_instructors',
        verbose_name="Aprobado por"
    )
    
    instructor_approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Aprobación"
    )
```

### **2. Modelo Course - Nuevo Estado**

```python
# backend/apps/courses/models.py

class Course(models.Model):
    # ... campos existentes ...
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending_review', 'Pendiente de Revisión'),  # NUEVO
        ('needs_revision', 'Requiere Cambios'),      # NUEVO
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    # NUEVO: Campos de moderación
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_courses',
        verbose_name="Revisado por"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Revisión"
    )
    
    review_comments = models.TextField(
        blank=True,
        null=True,
        verbose_name="Comentarios de Revisión"
    )
```

### **3. Permisos Actualizados**

```python
# backend/apps/users/permissions.py

def can_create_course(user):
    """
    Verifica si el usuario puede crear cursos
    - Admin: Siempre puede
    - Instructor: Solo si está aprobado
    """
    if is_admin(user):
        return True
    
    if is_instructor(user):
        try:
            profile = user.profile
            return profile.instructor_status == 'approved'
        except UserProfile.DoesNotExist:
            return False
    
    return False

def can_publish_course(user, course):
    """
    Verifica si el usuario puede publicar un curso
    - Admin: Siempre puede
    - Instructor: Solo puede solicitar revisión, no publicar directamente
    """
    if is_admin(user):
        return True
    
    # Instructores no pueden publicar directamente
    # Deben solicitar revisión
    return False
```

### **4. Endpoints Nuevos**

#### **A. Aprobar/Rechazar Instructores (Admin)**

```
POST /api/v1/admin/instructors/{user_id}/approve/
POST /api/v1/admin/instructors/{user_id}/reject/
GET  /api/v1/admin/instructors/pending/
```

#### **B. Solicitar Revisión de Curso (Instructor)**

```
POST /api/v1/courses/{course_id}/request-review/
```

#### **C. Aprobar/Rechazar Cursos (Admin)**

```
POST /api/v1/admin/courses/{course_id}/approve/
POST /api/v1/admin/courses/{course_id}/reject/
POST /api/v1/admin/courses/{course_id}/request-changes/
GET  /api/v1/admin/courses/pending-review/
```

---

## 📋 **ESTADOS Y TRANSICIONES**

### **Estados de Instructor:**

```
pending_approval → approved → (puede crear cursos)
                 ↓
              rejected → (no puede crear cursos)
```

### **Estados de Curso:**

```
draft → pending_review → published
     ↓                ↓
  needs_revision ← (requiere cambios)
```

**Reglas:**
- Solo instructores **aprobados** pueden crear cursos
- Los cursos se crean en estado **"draft"** por defecto
- Solo **admin** puede cambiar estado a **"published"**
- Instructores pueden solicitar revisión (draft → pending_review)
- Admin puede: aprobar, rechazar, o solicitar cambios

---

## 🛡️ **SEGURIDAD ADICIONAL**

### **1. Validación de Contenido**

- **Sanitización de HTML**: Ya implementada ✅
- **Validación de URLs**: Ya implementada ✅
- **Filtros de palabras**: Implementar lista de palabras prohibidas
- **Detección de spam**: Validar títulos/descripciones repetitivos

### **2. Límites y Restricciones**

- **Límite de cursos por instructor**: Máximo X cursos en revisión simultáneos
- **Tiempo mínimo entre solicitudes**: 24 horas entre solicitudes de revisión
- **Límite de rechazos**: Después de X rechazos, requiere revisión manual

### **3. Sistema de Reportes**

```
POST /api/v1/courses/{course_id}/report/
```

- Estudiantes pueden reportar contenido inapropiado
- Admin recibe notificación
- Curso puede ser suspendido automáticamente si tiene muchos reportes

---

## 🎯 **BENEFICIOS DEL NUEVO FLUJO**

### **Para la Plataforma:**

✅ **Control de Calidad**: Solo contenido revisado se publica  
✅ **Seguridad**: Previene spam, contenido malicioso o fraudulento  
✅ **Reputación**: Mantiene estándares de calidad  
✅ **Compliance**: Cumple con regulaciones de contenido educativo  

### **Para los Instructores:**

✅ **Credibilidad**: Ser aprobado da credibilidad  
✅ **Feedback**: Reciben comentarios para mejorar  
✅ **Protección**: Sus cursos están protegidos de contenido de baja calidad  

### **Para los Estudiantes:**

✅ **Confianza**: Saben que el contenido fue revisado  
✅ **Calidad**: Solo ven cursos de calidad aprobada  
✅ **Seguridad**: Contenido seguro y apropiado  

---

## 📝 **IMPLEMENTACIÓN RECOMENDADA - FASES**

### **FASE 1: Aprobación de Instructores** (Prioridad Alta)

1. Agregar campo `instructor_status` a `UserProfile`
2. Modificar registro para establecer `pending_approval`
3. Crear endpoints de aprobación/rechazo (admin)
4. Modificar permisos para verificar estado aprobado
5. Panel admin para revisar instructores pendientes

### **FASE 2: Aprobación de Cursos** (Prioridad Alta)

1. Agregar estados `pending_review` y `needs_revision` a `Course`
2. Modificar creación de cursos para forzar `draft`
3. Crear endpoint para solicitar revisión
4. Crear endpoints de aprobación/rechazo (admin)
5. Panel admin para revisar cursos pendientes

### **FASE 3: Notificaciones** (Prioridad Media)

1. Notificaciones por email cuando instructor es aprobado/rechazado
2. Notificaciones cuando curso es aprobado/rechazado
3. Notificaciones a admin cuando hay pendientes

### **FASE 4: Sistema de Reportes** (Prioridad Baja)

1. Endpoint para reportar contenido
2. Panel admin para ver reportes
3. Sistema de suspensión automática

---

## 🔄 **MIGRACIÓN DE DATOS EXISTENTES**

Para instructores ya registrados:

```python
# Comando de migración
python manage.py migrate_instructors

# Lógica:
# - Instructores existentes → instructor_status = 'approved'
# - Cursos publicados existentes → mantener 'published'
# - Cursos draft existentes → mantener 'draft'
```

---

## ❓ **DECISIONES A TOMAR**

1. **¿Los instructores existentes se aprueban automáticamente?**
   - ✅ Recomendado: Sí, con revisión manual posterior

2. **¿Los cursos ya publicados se mantienen publicados?**
   - ✅ Recomendado: Sí, pero marcar para revisión

3. **¿Permitir que instructores editen cursos publicados?**
   - ✅ Recomendado: Sí, pero cambios requieren nueva revisión

4. **¿Tiempo límite para revisión?**
   - ⏱️ Recomendado: 48-72 horas

5. **¿Permitir múltiples solicitudes de revisión?**
   - ✅ Recomendado: Sí, con límite de tiempo entre solicitudes

---

## 📊 **MÉTRICAS A TRACKING**

- Tiempo promedio de aprobación de instructores
- Tiempo promedio de aprobación de cursos
- Tasa de rechazo de instructores
- Tasa de rechazo de cursos
- Número de cursos por instructor aprobado
- Reportes de contenido inapropiado

---

## ✅ **CONCLUSIÓN**

El flujo propuesto implementa un **sistema de moderación en dos etapas** que:

1. ✅ Valida instructores antes de permitir crear contenido
2. ✅ Revisa cursos antes de publicarlos
3. ✅ Mantiene control de calidad
4. ✅ Protege a estudiantes de contenido inapropiado
5. ✅ Da credibilidad a la plataforma

**¿Procedemos con la implementación?**

