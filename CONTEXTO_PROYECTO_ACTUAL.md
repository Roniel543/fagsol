# 📋 Contexto del Proyecto FagSol Escuela Virtual - Estado Actual

**Fecha de actualización:** 2025-11-12  
**Última sesión:** Frontend SWR - COMPLETADO ✅

---

## 🎯 **PROYECTO: FagSol Escuela Virtual**

Plataforma educativa en línea con:
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + SWR
- **Backend:** Django 5.0 + DRF + PostgreSQL
- **Arquitectura:** Clean Architecture (domain, application, infrastructure, presentation)
- **Seguridad:** JWT, Argon2, Rate limiting, Token blacklist
- **Pagos:** MercadoPago con tokenización

---

## ✅ **LO QUE YA ESTÁ COMPLETADO**

### **FASE 1: Backend - Autorización y Tests** ✅ **COMPLETADO**

#### 1. Autorización con Roles y Permisos
- ✅ Modelo `UserProfile` con roles: `admin`, `instructor`, `student`, `guest`
- ✅ Django Groups automáticos (signals en `apps/users/signals.py`)
- ✅ Permisos personalizados en `apps/users/permissions.py`:
  - `IsAdmin`, `IsInstructor`, `IsStudent`
  - `can_view_course()`, `can_access_course_content()`
  - `can_view_enrollment()`, `can_view_certificate()`
  - `can_process_payment()`
- ✅ Comando de migración: `python manage.py migrate_roles`

**Archivos clave:**
- `backend/apps/core/models.py` - UserProfile
- `backend/apps/users/permissions.py` - Permisos y políticas
- `backend/apps/users/signals.py` - Asignación automática de grupos
- `backend/apps/core/management/commands/migrate_roles.py`

#### 2. Tests Unitarios e Integración
- ✅ **33 tests de integración** pasando:
  - `test_auth_integration.py` (11 tests) - Login, register, logout, health
  - `test_payments_integration.py` (12 tests) - Payment intents, procesamiento
  - `test_certificates_integration.py` (10 tests) - Descarga y verificación
- ✅ **25 tests unitarios** de permisos en `apps/users/tests/test_permissions.py`
- ✅ **10 tests IDOR** en `apps/users/tests/test_idor.py`

**Ejecutar tests:**
```bash
cd backend
python manage.py test presentation.views.tests -v 1
python manage.py test apps.users.tests -v 1
```

#### 3. Tests IDOR
- ✅ Tests para prevenir acceso no autorizado a:
  - Payment intents de otros usuarios
  - Enrollments de otros usuarios
  - Certificados de otros usuarios
  - Contenido de cursos sin inscripción

---

### **FASE 2: Backend - Documentación** ✅ **COMPLETADO**

#### 4. OpenAPI/Swagger
- ✅ Configurado `drf-yasg` en `backend/config/settings.py`
- ✅ URLs agregadas en `backend/config/urls.py`:
  - `/swagger/` - Swagger UI interactivo
  - `/redoc/` - Documentación ReDoc
  - `/swagger.json` - Schema JSON
- ✅ Endpoints documentados con `@swagger_auto_schema`:
  - Autenticación: login, register, logout, health
  - Cursos: listar, contenido protegido
  - Pagos: crear intent, procesar pago

**Acceso:**
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

**Nota importante:** Para usar endpoints protegidos en Swagger:
1. Obtén token con `POST /api/v1/login/`
2. Haz clic en "Authorize" (🔓)
3. Pega token CON "Bearer " al inicio: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Haz clic en "Authorize" y cierra

---

### **Backend - Modelos y Endpoints** ✅ **COMPLETADO**

#### Modelos Creados:
- ✅ `Course`, `Module`, `Lesson` (`apps/courses/models.py`)
- ✅ `PaymentIntent`, `Payment`, `PaymentWebhook` (`apps/payments/models.py`)
- ✅ `Enrollment`, `Certificate` (`apps/users/models.py`)
- ✅ `UserProfile` (`apps/core/models.py`)

#### Endpoints Implementados:
- ✅ **Autenticación:** `/api/v1/login/`, `/api/v1/register/`, `/api/v1/logout/`, `/api/v1/health/`
- ✅ **Cursos:** `/api/v1/courses/`, `/api/v1/courses/{id}/`, `/api/v1/courses/{id}/content/`
- ✅ **Pagos:** `/api/v1/payments/intent/`, `/api/v1/payments/process/`, `/api/v1/payments/webhook/`
- ✅ **Enrollments:** `/api/v1/enrollments/`, `/api/v1/enrollments/{id}/`
- ✅ **Certificados:** `/api/v1/certificates/{course_id}/download/`, `/api/v1/certificates/{course_id}/verify/`

#### Servicios:
- ✅ `AuthService` (`infrastructure/services/auth_service.py`) - Login, register
- ✅ `PaymentService` (`infrastructure/services/payment_service.py`) - MercadoPago integration

#### Seguridad:
- ✅ Argon2 password hashing
- ✅ Rate limiting con `django-axes` (10 intentos, 30 min bloqueo)
- ✅ JWT token blacklist (`djangorestframework-simplejwt[blacklist]`)
- ✅ Security headers (HSTS, X-Frame-Options, CSP, etc.)

---

### **Frontend - Seguridad** ✅ **COMPLETADO**

- ✅ Tokens JWT en `sessionStorage` (no localStorage)
- ✅ Refresh token automático
- ✅ Sanitización HTML con DOMPurify
- ✅ Content Security Policy (CSP)
- ✅ Logout server-side
- ✅ Tests unitarios de seguridad

**Archivos clave:**
- `frontend/src/shared/hooks/useAuth.tsx`
- `frontend/src/shared/services/api.ts`
- `frontend/src/shared/utils/tokenStorage.ts`
- `frontend/src/shared/utils/sanitize.ts`

---

## ⏳ **LO QUE FALTA POR HACER**

### **FASE 4: Backend - CI/CD** ⏳ **PENDIENTE** (Próximo paso recomendado)

#### 5. Configurar CI/CD con GitHub Actions
**Tiempo estimado:** 4-6 horas

**Qué incluir:**
- Linters: `flake8`, `black`, `isort` para Python
- TypeScript check para frontend
- Tests automáticos (unit + integration)
- SAST (Static Application Security Testing):
  - `bandit` para Python
  - `safety` para dependencias vulnerables
- DAST (Dynamic Application Security Testing):
  - OWASP ZAP en staging
- Bloquear merge si falla cualquier check

**Archivo a crear:**
- `.github/workflows/ci.yml`

**Ejemplo de estructura:**
```yaml
name: CI/CD Pipeline

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  backend-tests:
    - Linters (flake8, black, isort)
    - Tests (pytest)
    - SAST (bandit, safety)
  
  frontend-tests:
    - TypeScript check
    - ESLint
    - Unit tests (Jest)
  
  security-scan:
    - SAST (bandit, safety)
    - Dependency check
  
  merge-block:
    - Bloquear si cualquier job falla
```

---

### **FASE 3: Frontend - Data Fetching** ✅ **COMPLETADO**

#### 6. SWR Instalado y Configurado ✅
- ✅ `swr` instalado en `frontend/package.json`
- ✅ Hooks SWR creados:
  - `useCourses()` - Listar cursos con filtros
  - `useCourse(id)` - Obtener curso por ID
  - `useCourseBySlug(slug)` - Obtener curso por slug
  - `useEnrollments()` - Listar enrollments del usuario
  - `useEnrollment(id)` - Obtener enrollment por ID

**Archivos creados:**
- `frontend/src/shared/hooks/useCourses.ts` ✅
- `frontend/src/shared/hooks/useEnrollments.ts` ✅
- `frontend/src/shared/services/courses.ts` ✅
- `frontend/src/shared/services/enrollments.ts` ✅

#### 7. Componentes Migrados de MOCK a SWR ✅
- ✅ `CatalogPage.tsx` - Usa `useCourses()` con loading/error states
- ✅ `CourseDetailPage.tsx` - Usa `useCourseBySlug()` con módulos reales
- ✅ `AcademyHomePage.tsx` - Usa `useCourses()` para cursos destacados
- ✅ `CartContext.tsx` - Usa datos reales del backend en lugar de `MOCK_COURSES`

**Archivos migrados:**
- `frontend/src/features/academy/pages/CatalogPage.tsx` ✅
- `frontend/src/features/academy/pages/CourseDetailPage.tsx` ✅
- `frontend/src/features/academy/pages/AcademyHomePage.tsx` ✅
- `frontend/src/shared/contexts/CartContext.tsx` ✅

#### 8. Backend - Endpoints y Modelos Mejorados ✅
- ✅ Endpoint `/api/v1/courses/slug/{slug}/` creado
- ✅ Modelo `Course` extendido con campos:
  - `category`, `level`, `provider`
  - `discount_price`, `hours`, `rating`, `ratings_count`
  - `instructor` (JSONField)
- ✅ Migraciones aplicadas
- ✅ Cursos de ejemplo creados en base de datos

#### 9. Configuración de Variables de Entorno ✅
- ✅ `.env` en `backend/` - Django lo encuentra correctamente
- ✅ `.env.local` en `frontend/` - Next.js lo encuentra correctamente
- ✅ CSP configurado para permitir conexiones al backend
- ✅ URLs de API correctas (`/api/v1/`)

---

### **FASE 5: Frontend - Testing y Observabilidad** ⏳ **PENDIENTE**

#### 8. Configurar Playwright y tests E2E
**Tiempo estimado:** 6-8 horas

**Qué hacer:**
- Instalar Playwright
- Crear tests E2E para flujos críticos:
  - Login/Register
  - Compra de curso
  - Acceso a contenido protegido
  - Intentos de acceso no autorizado

#### 9. Integrar Sentry
**Tiempo estimado:** 3-4 horas

**Qué hacer:**
- Instalar `@sentry/nextjs`
- Configurar sin PII (no enviar datos personales)
- Configurar request-id correlation
- Error boundaries

---

### **FASE 6: Opcionales** ⏳ **PENDIENTE**

#### 10. MFA/2FA
**Tiempo estimado:** 6-8 horas

**Para roles:** admin, instructor (opcional)

#### 11. SECURITY_CHECKLIST.md
**Tiempo estimado:** 1-2 horas

**Qué incluir:**
- Checklist de revisión manual de seguridad
- Verificación de auth logic
- Validación de pagos
- Storage policy
- Token revocation
- CSP headers
- S3 ACLs

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### **Backend - Variables de Entorno (.env)**
```env
# Database
DB_NAME=fagsol_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET_KEY=tu_secret_key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

# AWS S3 (opcional)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
```

### **Backend - Comandos Útiles**
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test -v 1

# Limpiar bloqueos de Axes
python manage.py axes_reset

# Migrar roles a grupos Django
python manage.py migrate_roles

# Iniciar servidor
python manage.py runserver
```

### **Datos de Prueba Creados**
- ✅ Usuario: `alison@gmail.com` / `123` (rol: student)
- ✅ Usuario: `deadmau5` / `test123` (rol: admin)
- ✅ Cursos: `course-1` (Python), `course-2` (Django), `course-3` (React)

---

## 📁 **ESTRUCTURA DE ARCHIVOS IMPORTANTES**

### **Backend**
```
backend/
├── apps/
│   ├── core/
│   │   ├── models.py (UserProfile)
│   │   └── management/commands/migrate_roles.py
│   ├── users/
│   │   ├── models.py (Enrollment, Certificate)
│   │   ├── permissions.py (Permisos y políticas)
│   │   ├── signals.py (Asignación automática de grupos)
│   │   └── tests/
│   │       ├── test_permissions.py
│   │       └── test_idor.py
│   ├── courses/
│   │   └── models.py (Course, Module, Lesson)
│   └── payments/
│       └── models.py (PaymentIntent, Payment, PaymentWebhook)
├── infrastructure/
│   └── services/
│       ├── auth_service.py
│       └── payment_service.py
├── presentation/
│   ├── views/
│   │   ├── auth_views.py
│   │   ├── course_views.py
│   │   ├── payment_views.py
│   │   ├── enrollment_views.py
│   │   ├── certificate_views.py
│   │   └── tests/
│   │       ├── test_auth_integration.py
│   │       ├── test_payments_integration.py
│   │       └── test_certificates_integration.py
│   └── api/v1/
│       ├── auth_urls.py
│       ├── courses/urls.py
│       ├── payments/urls.py
│       ├── enrollments/urls.py
│       └── certificates/urls.py
└── config/
    ├── settings.py
    └── urls.py
```

### **Frontend**
```
frontend/
├── src/
│   ├── shared/
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx
│   │   │   ├── useCourses.ts ✅
│   │   │   └── useEnrollments.ts ✅
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── courses.ts ✅
│   │   │   └── enrollments.ts ✅
│   │   └── contexts/
│   │       └── CartContext.tsx ✅ (Migrado a SWR)
│   │   └── utils/
│   │       ├── tokenStorage.ts
│   │       └── sanitize.ts
│   └── features/
│       └── academy/
│           └── pages/
│               ├── CatalogPage.tsx
│               ├── CourseDetailPage.tsx
│               └── CheckoutPage.tsx
```

---

## 🐛 **PROBLEMAS CONOCIDOS Y SOLUCIONES**

### **1. Error 401 en Swagger con token**
**Problema:** Token no se envía con prefijo "Bearer "  
**Solución:** Al autorizar en Swagger, pegar token CON "Bearer " al inicio:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Usuario bloqueado por Axes**
**Problema:** Múltiples intentos fallidos bloquean IP/usuario  
**Solución:**
```bash
python manage.py axes_reset
```

### **3. Autenticación falla con email**
**Problema:** `authenticate()` necesita `request` para AxesBackend  
**Solución:** Ya implementado en `AuthService.login()` - pasa `request=request` a `authenticate()`

---

## 🎯 **PRÓXIMOS PASOS RECOMENDADOS**

### **Opción 1: CI/CD (Recomendado - 4-6 horas)**
1. Crear `.github/workflows/ci.yml`
2. Configurar linters (flake8, black, isort)
3. Configurar tests automáticos
4. Configurar SAST (bandit, safety)
5. Configurar bloqueo de merge

### **Opción 2: SECURITY_CHECKLIST.md (Rápido - 1-2 horas)**
1. Crear checklist de revisión manual
2. Documentar verificación de seguridad
3. Incluir pasos para auth, pagos, certificados

### **Opción 3: Playwright E2E (6-8 horas)** ✅ SWR ya completado
1. Instalar Playwright
2. Crear tests E2E para flujos críticos
3. Integrar en CI/CD

---

## 📚 **DOCUMENTACIÓN DISPONIBLE**

- `backend/IMPLEMENTACION_BACKEND_COMPLETA.md` - Backend completo
- `backend/IMPLEMENTACION_TESTS_INTEGRACION.md` - Tests de integración
- `backend/IMPLEMENTACION_SWAGGER.md` - Documentación Swagger
- `frontend/SECURITY_README_FRONTEND.md` - Seguridad frontend
- `frontend/IMPLEMENTACION_PAGOS_COMPLETA.md` - Integración de pagos

---

## 💡 **NOTAS PARA CONTINUAR**

1. **Swagger está funcionando:** Accede a `http://localhost:8000/swagger/` para probar endpoints
2. **Tests pasando:** 33 tests de integración + 25 unitarios + 10 IDOR
3. **Cursos de prueba:** Ya creados (`course-1`, `course-2`, `course-3`)
4. **Usuario de prueba:** `alison@gmail.com` / `123` (student)
5. **Token Bearer:** Recordar agregar "Bearer " al inicio en Swagger

---

**Última actualización:** 2025-11-12  
**Estado:** ✅ FASE 1, 2 y 3 (SWR) completadas. Listo para CI/CD o E2E tests.

