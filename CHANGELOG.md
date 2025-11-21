# 📝 Changelog - FagSol Escuela Virtual

Todos los cambios notables del proyecto serán documentados en este archivo.

---

## [2025-01-12] - Flujo de Instructores y Mejoras de Dashboard

### ✨ Agregado

#### **Sistema de Solicitud de Instructores:**
- Modelo `InstructorApplication` para gestionar solicitudes
- Endpoint `POST /api/v1/auth/apply-instructor/` para solicitar ser instructor
- Endpoints admin para listar, aprobar y rechazar solicitudes
- Formulario `BecomeInstructorForm` para usuarios
- Panel admin `InstructorApplicationsAdminPage` para gestionar solicitudes
- Modal reutilizable con variantes (confirm, warning, danger, success)

#### **Rutas Específicas para Instructores:**
- `/instructor/courses` - Lista de cursos del instructor
- `/instructor/courses/new` - Crear nuevo curso
- Página `InstructorCoursesPage` con filtros y gestión

#### **Mejoras de UI:**
- Botón "mostrar/ocultar contraseña" en todos los campos de contraseña
- Campo de confirmación de contraseña en registro
- Dashboard de instructor mejorado con gradientes y mejor diseño
- Mensajes de error más informativos con acciones
- Logo y formularios más grandes

### 🔧 Corregido

#### **Problema de Timing en Dashboard:**
- Hook `useDashboard` ahora espera a que termine la verificación de autenticación
- Eliminado error en primer render del dashboard
- Mejor manejo de estados de carga

#### **Registro Público:**
- Removido selector de rol del formulario público
- Registro público solo permite estudiantes
- Link a formulario de solicitud de instructor agregado

#### **Manejo de Errores:**
- Mejor manejo de errores en backend para estadísticas de estudiantes
- Protección contra cursos eliminados
- Manejo de casos sin enrollments

### 🔒 Seguridad

- Validación de permisos mejorada
- Validación de tipos de archivo (PDF para CV)
- Validación de tamaños de archivo (máx. 5MB)
- Validación de URLs

---

## [2025-01-11] - Optimización de Formulario de Pago

### ✨ Agregado
- Pre-carga del SDK de Mercado Pago en `layout.tsx`
- Paralelización de operaciones asíncronas
- Aplicación del sistema de diseño a Mercado Pago Bricks

### 🔧 Corregido
- Tiempo de carga del formulario de pago reducido de 10-20s a <3s
- Eliminación de timeouts innecesarios

---

## [2025-01-10] - Sistema de Autenticación

### ✨ Agregado
- Sistema completo de login y registro
- Validación de credenciales
- Manejo de tokens JWT
- Refresh automático de tokens

### 🔧 Corregido
- Problema de "Credenciales inválidas" por username NULL
- Bloqueos masivos de AXES por IP
- Comandos para corregir usuarios y desbloquear

---

## Formato

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

