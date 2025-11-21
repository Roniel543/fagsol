# 📖 Guía de Uso: Sistema de Solicitud de Instructores

**Fecha:** 2025-01-12  
**Estado:** ✅ Sistema Completo e Implementado

---

## 🎯 **RESUMEN EJECUTIVO**

El sistema de solicitud de instructores está **100% implementado y funcional**. Permite separar completamente el registro de estudiantes del proceso de convertirse en instructor, garantizando control de calidad y seguridad.

---

## 🔄 **FLUJO COMPLETO PASO A PASO**

### **👤 FLUJO PARA USUARIOS (Estudiantes → Instructores)**

#### **Paso 1: Registro como Estudiante**
```
📍 Ruta: /auth/register

1. Usuario accede al formulario de registro
2. Completa únicamente:
   - Nombre
   - Apellido
   - Email
   - Contraseña
   - Confirmar Contraseña
3. NO hay opción de seleccionar "Instructor"
4. Se registra automáticamente como "student"
5. Acceso inmediato a cursos
```

#### **Paso 2: Solicitar Ser Instructor**
```
📍 Ruta: /auth/become-instructor

Acceso al formulario:
- Link en Footer: "Conviértete en Instructor"
- Link en TeacherSection: Botón "Comienza a Enseñar Hoy"
- Link en RegisterForm: "¿Quieres ser instructor? Solicita aquí"

Formulario incluye:
✅ Título Profesional (opcional)
✅ Años de Experiencia (opcional)
✅ Especialidad (opcional)
✅ Biografía (opcional, textarea)
✅ Portfolio/Website (opcional, URL)
✅ Motivación (REQUERIDO, textarea)
✅ CV en PDF (opcional, máx. 5MB)

Validaciones:
- Motivación es obligatoria
- CV solo acepta PDF
- CV máximo 5MB
- URLs deben ser válidas
```

#### **Paso 3: Esperar Revisión**
```
Estado: "pending"

- La solicitud queda pendiente
- Un administrador la revisará
- El usuario puede seguir usando la plataforma como estudiante
- (Futuro: Notificación por email cuando sea procesada)
```

#### **Paso 4: Resultado de la Solicitud**

**Si es Aprobada:**
```
✅ Rol cambia a "instructor"
✅ Estado: "approved"
✅ Puede crear cursos (en draft)
✅ Cursos requieren aprobación de admin para publicar
```

**Si es Rechazada:**
```
❌ Sigue siendo "student"
❌ Estado: "rejected"
✅ Puede volver a solicitar (después de 30 días recomendado)
✅ Razón de rechazo disponible para referencia
```

---

### **👨‍💼 FLUJO PARA ADMINISTRADORES**

#### **Paso 1: Acceder al Panel**
```
📍 Ruta: /admin/instructor-applications

Requisitos:
- Debe estar autenticado
- Debe tener rol "admin"
- Si no cumple, redirige a /dashboard
```

#### **Paso 2: Revisar Solicitudes**
```
Panel muestra:
📊 Estadísticas:
   - Total de solicitudes
   - Pendientes
   - Aprobadas
   - Rechazadas

🔍 Filtros:
   - Todos
   - Pendientes
   - Aprobadas
   - Rechazadas

📋 Lista de Solicitudes:
   - Nombre y email del usuario
   - Estado con badge visual
   - Fecha de creación
   - Botón "Ver Detalles" (expandible)
```

#### **Paso 3: Ver Detalles de Solicitud**
```
Al expandir se muestra:
- Título Profesional
- Años de Experiencia
- Especialidad
- Biografía completa
- Portfolio (con link externo)
- Motivación completa
- Información de revisión (si ya fue procesada)
- Razón de rechazo (si fue rechazada)
- Fechas de creación y actualización
```

#### **Paso 4: Aprobar Solicitud**
```
1. Hacer clic en botón "Aprobar"
2. Confirmar acción en diálogo
3. Sistema automáticamente:
   - Cambia rol del usuario a "instructor"
   - Establece estado "approved"
   - Registra quién aprobó y cuándo
   - Actualiza estado de la solicitud
4. Usuario ahora puede crear cursos
```

#### **Paso 5: Rechazar Solicitud**
```
1. Hacer clic en botón "Rechazar"
2. Se abre modal
3. Proporcionar razón de rechazo (REQUERIDA)
4. Confirmar acción
5. Sistema automáticamente:
   - Cambia estado a "rejected"
   - Guarda razón de rechazo
   - Registra quién rechazó y cuándo
   - Usuario sigue como estudiante
```

---

## 🔗 **ENLACES Y RUTAS**

### **Públicas:**
- `/auth/register` - Registro de estudiantes
- `/auth/login` - Inicio de sesión
- `/auth/become-instructor` - Solicitud de instructor

### **Protegidas (Requieren Autenticación):**
- `/dashboard` - Dashboard del usuario
- `/admin/instructor-applications` - Panel admin (solo admin)

### **API Endpoints:**
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/apply-instructor/` - Solicitar instructor
- `GET /api/v1/admin/instructor-applications/` - Listar solicitudes
- `POST /api/v1/admin/instructor-applications/{id}/approve/` - Aprobar
- `POST /api/v1/admin/instructor-applications/{id}/reject/` - Rechazar

---

## ✅ **VALIDACIONES Y REGLAS**

### **Registro Público:**
- ✅ Solo permite `role='student'`
- ✅ Cualquier otro rol es rechazado
- ✅ Mensaje claro: "Para ser instructor, solicita aprobación"

### **Solicitud de Instructor:**
- ✅ Usuario debe estar autenticado
- ✅ No puede ser ya instructor
- ✅ No puede tener solicitud pendiente
- ✅ Motivación es requerida
- ✅ CV solo PDF, máximo 5MB

### **Aprobación/Rechazo:**
- ✅ Solo admin puede aprobar/rechazar
- ✅ Solo solicitudes "pending" pueden procesarse
- ✅ Rechazo requiere razón
- ✅ Se registra quién y cuándo procesó

---

## 📊 **ESTADÍSTICAS Y MÉTRICAS**

El panel admin muestra:
- **Total:** Todas las solicitudes
- **Pendientes:** Esperando revisión
- **Aprobadas:** Convertidas en instructores
- **Rechazadas:** No aprobadas

---

## 🛠️ **TROUBLESHOOTING**

### **Problema: "Ya eres instructor"**
**Solución:** El usuario ya tiene rol instructor, no necesita solicitar.

### **Problema: "Ya tienes una solicitud pendiente"**
**Solución:** Esperar a que la solicitud actual sea procesada.

### **Problema: "No autorizado" en panel admin**
**Solución:** Verificar que el usuario tenga rol "admin".

### **Problema: "La solicitud ya fue procesada"**
**Solución:** La solicitud ya fue aprobada o rechazada, no se puede procesar nuevamente.

---

## 🎓 **EJEMPLOS DE USO**

### **Ejemplo 1: Usuario Nuevo Quiere Ser Instructor**
```
1. Juan va a /auth/register
2. Se registra como estudiante
3. Inicia sesión
4. Ve link en footer: "Conviértete en Instructor"
5. Completa formulario con:
   - Título: "Ingeniero Metalúrgico"
   - Experiencia: 5 años
   - Especialidad: "Procesos de Fundición"
   - Motivación: "Quiero compartir mi experiencia..."
6. Envía solicitud
7. Admin revisa y aprueba
8. Juan ahora es instructor y puede crear cursos
```

### **Ejemplo 2: Admin Rechaza Solicitud**
```
1. Admin ve solicitud pendiente
2. Expande detalles
3. Revisa información
4. Decide rechazar
5. Hace clic en "Rechazar"
6. Escribe razón: "No cumple con experiencia mínima requerida"
7. Confirma
8. Solicitud queda como "rejected"
9. Usuario puede volver a solicitar en el futuro
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Instructores Existentes:** Los instructores ya registrados se mantienen como están (aprobados automáticamente).

2. **Múltiples Solicitudes:** Un usuario solo puede tener 1 solicitud pendiente a la vez.

3. **Cursos de Instructores:** Los instructores pueden crear cursos con `provider="instructor"` (cursos propios).

4. **Aprobación de Cursos:** Los cursos creados por instructores requieren aprobación de admin antes de publicarse.

---

## ✅ **SISTEMA COMPLETO Y FUNCIONAL**

**Estado:** ✅ **100% Implementado**

**Funcionalidades:**
- ✅ Registro solo estudiantes
- ✅ Solicitud de instructor
- ✅ Panel admin de gestión
- ✅ Aprobación/rechazo
- ✅ Conversión automática a instructor

**Pendiente (Opcional):**
- ⏳ Notificaciones por email

---

**Última actualización:** 2025-01-12

