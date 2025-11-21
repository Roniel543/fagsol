# 🎯 Plan: Flujo de Registro Separado para Instructores

**Fecha:** 2025-01-12  
**Estado:** 📋 Plan de Implementación

---

## 🎯 **OBJETIVO**

Separar completamente el registro de **estudiantes** del registro de **instructores**, implementando un sistema de solicitud y aprobación para instructores que quieren dar cursos propios (ajenos a FagSol).

---

## 📊 **SITUACIÓN ACTUAL vs PROPUESTA**

### **❌ FLUJO ACTUAL (PROBLEMÁTICO):**

```
1. Usuario va a /auth/register
2. Ve selector: "Estudiante" o "Instructor"
3. Selecciona "Instructor" → Se registra inmediatamente
4. ❌ Puede crear cursos sin aprobación
5. ❌ No hay control de calidad
```

### **✅ FLUJO PROPUESTO (CORRECTO):**

#### **Para Estudiantes:**
```
1. Usuario va a /auth/register
2. ✅ Solo ve campos: Nombre, Apellido, Email, Contraseña
3. ✅ Se registra automáticamente como "student"
4. ✅ Acceso inmediato a cursos
```

#### **Para Instructores:**
```
1. Usuario (ya registrado como estudiante O nuevo) va a /auth/become-instructor
2. Completa formulario de solicitud:
   - Información profesional
   - Experiencia
   - Especialidad
   - CV/Portfolio (opcional)
   - Motivo para ser instructor
3. ✅ Estado: "pending_approval"
4. Admin recibe notificación
5. Admin revisa y aprueba/rechaza
6. Si aprobado → Cambia rol a "instructor" + estado "approved"
7. ✅ Puede crear cursos (en draft)
```

---

## 🏗️ **CAMBIOS TÉCNICOS NECESARIOS**

### **FASE 1: Modificar Registro Público (Solo Estudiantes)**

#### **1.1 Frontend - Quitar Selector de Rol**

**Archivo:** `frontend/src/features/auth/components/RegisterForm.tsx`

**Cambios:**
- ❌ Eliminar el campo `Select` de "Tipo de Usuario"
- ✅ Forzar `role: 'student'` siempre
- ✅ Agregar link: "¿Quieres ser instructor? Solicita aquí"

#### **1.2 Backend - Validar Solo Estudiantes**

**Archivo:** `backend/infrastructure/services/auth_service.py`

**Cambios:**
- ✅ Modificar `register()` para **rechazar** cualquier `role != 'student'`
- ✅ Mensaje: "El registro público solo permite estudiantes. Para ser instructor, solicita aprobación."

#### **1.3 Backend - Endpoint de Registro**

**Archivo:** `backend/presentation/views/auth_views.py`

**Cambios:**
- ✅ Forzar `role = 'student'` en el endpoint
- ✅ Eliminar `role` del request body (o ignorarlo)

---

### **FASE 2: Crear Sistema de Solicitud de Instructor**

#### **2.1 Modelo - InstructorApplication (NUEVO)**

**Archivo:** `backend/apps/core/models.py`

```python
class InstructorApplication(models.Model):
    """
    Solicitud de un usuario para convertirse en instructor
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='instructor_applications',
        verbose_name="Usuario"
    )
    
    # Información profesional
    professional_title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Título Profesional"
    )
    
    experience_years = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Años de Experiencia"
    )
    
    specialization = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Especialidad"
    )
    
    bio = models.TextField(
        blank=True,
        verbose_name="Biografía",
        help_text="Cuéntanos sobre ti y tu experiencia"
    )
    
    portfolio_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Portfolio/Website"
    )
    
    cv_file = models.FileField(
        upload_to='instructor_applications/cv/',
        blank=True,
        null=True,
        verbose_name="CV (PDF)"
    )
    
    motivation = models.TextField(
        verbose_name="Motivación",
        help_text="¿Por qué quieres ser instructor en FagSol?"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Estado"
    )
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        verbose_name="Revisado por"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Revisión"
    )
    
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Razón de Rechazo"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'instructor_applications'
        verbose_name = 'Solicitud de Instructor'
        verbose_name_plural = 'Solicitudes de Instructores'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Solicitud de {self.user.email} - {self.status}"
```

#### **2.2 Endpoint - Solicitar Ser Instructor**

**Archivo:** `backend/presentation/views/auth_views.py` (o nuevo archivo)

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_be_instructor(request):
    """
    Solicitud para convertirse en instructor
    POST /api/v1/auth/apply-instructor/
    
    Requiere autenticación (usuario debe estar registrado)
    """
    # 1. Verificar que no sea ya instructor
    if request.user.profile.role == 'instructor':
        return Response({
            'success': False,
            'message': 'Ya eres instructor'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 2. Verificar que no tenga solicitud pendiente
    existing = InstructorApplication.objects.filter(
        user=request.user,
        status='pending'
    ).exists()
    
    if existing:
        return Response({
            'success': False,
            'message': 'Ya tienes una solicitud pendiente'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 3. Crear solicitud
    application = InstructorApplication.objects.create(
        user=request.user,
        professional_title=request.data.get('professional_title', ''),
        experience_years=request.data.get('experience_years', 0),
        specialization=request.data.get('specialization', ''),
        bio=request.data.get('bio', ''),
        portfolio_url=request.data.get('portfolio_url', ''),
        motivation=request.data.get('motivation', ''),
        status='pending'
    )
    
    # 4. Notificar a admin (futuro: email)
    
    return Response({
        'success': True,
        'message': 'Solicitud enviada. Te notificaremos cuando sea revisada.',
        'data': {
            'id': application.id,
            'status': application.status
        }
    }, status=status.HTTP_201_CREATED)
```

#### **2.3 Frontend - Formulario de Solicitud**

**Archivo:** `frontend/src/features/auth/components/BecomeInstructorForm.tsx` (NUEVO)

```tsx
'use client';

import { AuthBackground, Button, Input, Textarea } from '@/shared/components';
import { useState } from 'react';

export function BecomeInstructorForm() {
    const [formData, setFormData] = useState({
        professional_title: '',
        experience_years: '',
        specialization: '',
        bio: '',
        portfolio_url: '',
        motivation: '',
    });
    
    // ... lógica de envío
}
```

#### **2.4 Endpoint - Aprobar/Rechazar Solicitud (Admin)**

**Archivo:** `backend/presentation/views/admin_views.py` (o nuevo)

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_instructor_application(request, application_id):
    """
    Aprueba una solicitud de instructor
    POST /api/v1/admin/instructor-applications/{id}/approve/
    """
    # 1. Obtener solicitud
    application = InstructorApplication.objects.get(id=application_id)
    
    # 2. Cambiar rol del usuario
    profile = application.user.profile
    profile.role = 'instructor'
    profile.instructor_status = 'approved'
    profile.instructor_approved_by = request.user
    profile.instructor_approved_at = timezone.now()
    profile.save()
    
    # 3. Actualizar solicitud
    application.status = 'approved'
    application.reviewed_by = request.user
    application.reviewed_at = timezone.now()
    application.save()
    
    # 4. Notificar al usuario (futuro: email)
    
    return Response({
        'success': True,
        'message': 'Instructor aprobado exitosamente'
    })
```

---

### **FASE 3: Panel Admin para Gestionar Solicitudes**

#### **3.1 Endpoint - Listar Solicitudes Pendientes**

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_instructor_applications(request):
    """
    Lista todas las solicitudes de instructor
    GET /api/v1/admin/instructor-applications/
    """
    status_filter = request.query_params.get('status', 'pending')
    
    applications = InstructorApplication.objects.filter(
        status=status_filter
    ).select_related('user', 'reviewed_by')
    
    # Serializar y retornar
```

#### **3.2 Frontend - Panel Admin**

**Archivo:** `frontend/src/features/admin/pages/InstructorApplicationsPage.tsx` (NUEVO)

- Lista de solicitudes pendientes
- Botones: Aprobar / Rechazar
- Ver detalles de cada solicitud
- Historial de aprobaciones/rechazos

---

## 🔄 **FLUJO COMPLETO PROPUESTO**

### **Escenario 1: Usuario Nuevo Quiere Ser Instructor**

```
1. Usuario va a /auth/register
2. Se registra como ESTUDIANTE (única opción)
3. Inicia sesión
4. Ve link: "¿Quieres ser instructor? Solicita aquí"
5. Va a /auth/become-instructor
6. Completa formulario de solicitud
7. Estado: "pending"
8. Admin recibe notificación
9. Admin revisa y aprueba
10. Usuario recibe notificación: "¡Felicidades! Eres instructor"
11. Usuario puede crear cursos (en draft)
```

### **Escenario 2: Usuario Existente Quiere Ser Instructor**

```
1. Usuario (ya estudiante) inicia sesión
2. Ve link: "¿Quieres ser instructor? Solicita aquí"
3. Va a /auth/become-instructor
4. Completa formulario
5. Mismo flujo de aprobación
```

### **Escenario 3: Instructor Externo (Cursos Propios)**

```
1. Instructor externo se registra como estudiante
2. Solicita ser instructor
3. En el formulario indica: "Quiero dar cursos propios"
4. Admin aprueba
5. Instructor crea cursos con provider="instructor"
6. Cursos propios del instructor (no de FagSol)
```

---

## 📋 **ESTADOS Y TRANSICIONES**

### **Estados de Solicitud:**
```
pending → approved → (usuario se convierte en instructor)
        ↓
      rejected → (usuario sigue siendo estudiante)
```

### **Estados de Instructor (después de aprobación):**
```
approved → (puede crear cursos)
```

### **Estados de Curso:**
```
draft → pending_review → published
     ↓                ↓
  needs_revision ← (requiere cambios)
```

---

## 🛡️ **SEGURIDAD Y VALIDACIONES**

### **1. Validaciones de Solicitud:**
- ✅ Usuario debe estar autenticado
- ✅ No puede ser ya instructor
- ✅ No puede tener solicitud pendiente
- ✅ Campos requeridos: `motivation`, `specialization`

### **2. Permisos:**
- ✅ Solo admin puede aprobar/rechazar
- ✅ Solo instructores aprobados pueden crear cursos
- ✅ Solo admin puede publicar cursos

### **3. Límites:**
- ✅ Máximo 1 solicitud activa por usuario
- ✅ Tiempo mínimo entre solicitudes: 30 días (si rechazada)

---

## 📝 **IMPLEMENTACIÓN - ORDEN DE TAREAS**

### **PASO 1: Modificar Registro Público** ✅ **COMPLETADO**
1. ✅ Quitar selector de rol del formulario
2. ✅ Forzar `role='student'` en backend
3. ✅ Agregar link a formulario de solicitud
4. ✅ Actualizar enlaces en Footer y TeacherSection

### **PASO 2: Crear Modelo y Migración** ✅ **COMPLETADO**
1. ✅ Crear modelo `InstructorApplication`
2. ✅ Crear migración `0004_create_instructor_application.py`
3. ✅ Migración ejecutada exitosamente
4. ✅ Configurar admin de Django

### **PASO 3: Crear Endpoints** ✅ **COMPLETADO**
1. ✅ POST `/api/v1/auth/apply-instructor/` (solicitar)
2. ✅ GET `/api/v1/admin/instructor-applications/` (listar)
3. ✅ POST `/api/v1/admin/instructor-applications/{id}/approve/`
4. ✅ POST `/api/v1/admin/instructor-applications/{id}/reject/`
5. ✅ Documentación Swagger completa
6. ✅ Validaciones y seguridad implementadas

### **PASO 4: Crear Formulario Frontend** ✅ **COMPLETADO**
1. ✅ Crear `BecomeInstructorForm.tsx`
2. ✅ Crear página `/auth/become-instructor`
3. ✅ Integración con servicio API
4. ✅ Validaciones de frontend (PDF, tamaño, campos requeridos)
5. ✅ Estados de éxito y error

### **PASO 5: Panel Admin** ✅ **COMPLETADO**
1. ✅ Crear página de gestión de solicitudes
2. ✅ Listar solicitudes con filtros
3. ✅ Botones de aprobar/rechazar
4. ✅ Vista expandible de detalles
5. ✅ Estadísticas y métricas
6. ✅ Modal de rechazo con razón

### **PASO 6: Notificaciones** ⏳ **PENDIENTE (Opcional)**
1. ⏳ Email cuando solicitud es aprobada
2. ⏳ Email cuando solicitud es rechazada
3. ⏳ Email a admin cuando hay nueva solicitud

---

## ❓ **DECISIONES TOMADAS**

1. **¿Los instructores existentes?**
   - ✅ Mantener como están (ya aprobados)
   - ✅ Marcar `instructor_status = 'approved'` automáticamente

2. **¿Permitir múltiples solicitudes?**
   - ✅ No, máximo 1 activa
   - ✅ Si rechazada, puede volver a solicitar después de 30 días

3. **¿Instructores pueden dar cursos propios?**
   - ✅ Sí, con `provider="instructor"`
   - ✅ Mismo proceso de aprobación de cursos

4. **¿Estudiantes pueden convertirse en instructores?**
   - ✅ Sí, mediante solicitud
   - ✅ No pierden acceso a cursos como estudiantes

---

## ✅ **BENEFICIOS**

### **Para la Plataforma:**
✅ **Control Total**: Solo instructores aprobados pueden crear contenido  
✅ **Calidad**: Revisión previa de instructores  
✅ **Seguridad**: Previene spam y contenido fraudulento  
✅ **Escalabilidad**: Proceso claro y automatizable  

### **Para los Instructores:**
✅ **Credibilidad**: Ser aprobado da prestigio  
✅ **Flexibilidad**: Pueden dar cursos propios  
✅ **Feedback**: Reciben comentarios para mejorar  

### **Para los Estudiantes:**
✅ **Simplicidad**: Registro más simple  
✅ **Confianza**: Saben que instructores fueron revisados  
✅ **Calidad**: Solo contenido de instructores aprobados  

---

## ✅ **ESTADO DE IMPLEMENTACIÓN**

### **COMPLETADO (PASOS 1-5):**
- ✅ Registro público solo permite estudiantes
- ✅ Modelo `InstructorApplication` creado y migrado
- ✅ Endpoints backend completos y documentados
- ✅ Formulario de solicitud frontend funcional
- ✅ Panel admin para gestionar solicitudes

### **PENDIENTE (PASO 6 - Opcional):**
- ⏳ Sistema de notificaciones por email

---

## 🔄 **FLUJO COMPLETO IMPLEMENTADO**

### **📋 FLUJO PARA ESTUDIANTES:**

```
1. Usuario va a /auth/register
   ↓
2. Completa: Nombre, Apellido, Email, Contraseña, Confirmar Contraseña
   ↓
3. Se registra automáticamente como "student"
   ↓
4. Acceso inmediato a cursos y contenido
```

### **👨‍🏫 FLUJO PARA INSTRUCTORES:**

#### **Opción A: Usuario Nuevo**
```
1. Usuario va a /auth/register
   ↓
2. Se registra como ESTUDIANTE (única opción disponible)
   ↓
3. Inicia sesión
   ↓
4. Ve link: "¿Quieres ser instructor? Solicita aquí"
   (Disponible en: Footer, TeacherSection, RegisterForm)
   ↓
5. Va a /auth/become-instructor
   ↓
6. Completa formulario de solicitud:
   - Título Profesional (opcional)
   - Años de Experiencia (opcional)
   - Especialidad (opcional)
   - Biografía (opcional)
   - Portfolio/Website (opcional)
   - Motivación (REQUERIDO)
   - CV en PDF (opcional, máx. 5MB)
   ↓
7. Envía solicitud → Estado: "pending"
   ↓
8. Admin recibe solicitud en panel
   (Acceso: /admin/instructor-applications)
   ↓
9. Admin revisa detalles (expandible)
   ↓
10. Admin decide:
    - Aprobar → Usuario se convierte en instructor
    - Rechazar → Usuario sigue como estudiante (puede volver a solicitar)
   ↓
11. Si aprobado:
    - Rol cambia a "instructor"
    - Estado: "approved"
    - Puede crear cursos (en draft)
    - Cursos requieren aprobación de admin para publicar
```

#### **Opción B: Usuario Existente (Ya Estudiante)**
```
1. Usuario (ya estudiante) inicia sesión
   ↓
2. Ve link: "¿Quieres ser instructor? Solicita aquí"
   ↓
3. Va a /auth/become-instructor
   ↓
4. Mismo proceso de solicitud y aprobación
```

### **🔐 FLUJO PARA ADMINISTRADORES:**

```
1. Admin inicia sesión
   ↓
2. Accede a /admin/instructor-applications
   ↓
3. Ve panel con:
   - Estadísticas: Total, Pendientes, Aprobadas, Rechazadas
   - Filtros por estado
   - Lista de solicitudes
   ↓
4. Para cada solicitud puede:
   - Ver detalles (expandir)
   - Aprobar (con confirmación)
   - Rechazar (con razón requerida)
   ↓
5. Al aprobar:
   - Usuario cambia rol a "instructor"
   - Estado de solicitud: "approved"
   - Usuario puede crear cursos
   ↓
6. Al rechazar:
   - Estado de solicitud: "rejected"
   - Se guarda razón de rechazo
   - Usuario sigue como estudiante
```

---

## 📍 **RUTAS Y ENDPOINTS DISPONIBLES**

### **Frontend:**
- `/auth/register` - Registro (solo estudiantes)
- `/auth/login` - Login
- `/auth/become-instructor` - Solicitud de instructor
- `/admin/instructor-applications` - Panel admin (solo admin)

### **Backend API:**
- `POST /api/v1/auth/register/` - Registro (solo estudiantes)
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/apply-instructor/` - Solicitar ser instructor
- `GET /api/v1/admin/instructor-applications/` - Listar solicitudes
- `POST /api/v1/admin/instructor-applications/{id}/approve/` - Aprobar
- `POST /api/v1/admin/instructor-applications/{id}/reject/` - Rechazar

---

## 🎯 **GUÍA DE USO**

### **Para Usuarios que Quieren Ser Instructores:**

1. **Registrarse como Estudiante:**
   - Ir a `/auth/register`
   - Completar formulario (solo campos básicos)
   - Registrarse

2. **Solicitar Ser Instructor:**
   - Iniciar sesión
   - Buscar link "¿Quieres ser instructor? Solicita aquí"
   - Ir a `/auth/become-instructor`
   - Completar formulario (motivación es requerida)
   - Subir CV opcional (PDF, máx. 5MB)
   - Enviar solicitud

3. **Esperar Aprobación:**
   - La solicitud queda en estado "pending"
   - Un administrador la revisará
   - Se recibirá notificación cuando sea procesada

### **Para Administradores:**

1. **Acceder al Panel:**
   - Iniciar sesión como admin
   - Ir a `/admin/instructor-applications`

2. **Revisar Solicitudes:**
   - Ver estadísticas en la parte superior
   - Filtrar por estado si es necesario
   - Hacer clic en "Ver Detalles" para expandir información

3. **Aprobar Solicitud:**
   - Revisar información del candidato
   - Hacer clic en "Aprobar"
   - Confirmar acción
   - El usuario se convierte en instructor automáticamente

4. **Rechazar Solicitud:**
   - Hacer clic en "Rechazar"
   - Proporcionar razón de rechazo (requerida)
   - Confirmar acción
   - El usuario sigue como estudiante

---

## 🔒 **SEGURIDAD IMPLEMENTADA**

✅ **Validaciones Múltiples:**
- Frontend: Validación de campos, tipos de archivo, tamaños
- Backend: Validación de permisos, estados, datos

✅ **Protección de Rutas:**
- Panel admin protegido (solo admin)
- Endpoints protegidos con JWT y permisos

✅ **Prevención de Abusos:**
- Máximo 1 solicitud pendiente por usuario
- Solo usuarios autenticados pueden solicitar
- Solo admin puede aprobar/rechazar

---

## 📊 **ESTADOS Y TRANSICIONES**

### **Estados de Solicitud:**
```
pending → approved → (usuario se convierte en instructor)
        ↓
      rejected → (usuario sigue siendo estudiante, puede volver a solicitar)
```

### **Estados de Usuario:**
```
student → (solicita) → pending → approved → instructor
                      ↓
                   rejected → student (puede volver a solicitar)
```

---

## 🚀 **SISTEMA LISTO PARA USAR**

**Todo está implementado y funcional. El sistema está listo para:**
- ✅ Registrar estudiantes
- ✅ Recibir solicitudes de instructores
- ✅ Gestionar aprobaciones/rechazos
- ✅ Convertir estudiantes en instructores aprobados

**Próximos pasos opcionales:**
- ⏳ Sistema de notificaciones por email
- ⏳ Dashboard para instructores para ver estado de su solicitud
- ⏳ Historial de solicitudes por usuario

