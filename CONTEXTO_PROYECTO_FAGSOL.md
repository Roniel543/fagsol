# 📊 CONTEXTO COMPLETO - Proyecto FagSol Escuela Virtual

**Fecha de creación:** 23 de Octubre 2025  
**Desarrollador:** Roniel Fernando Chambilla del Carpio  
**Estado:** Estructura base completada, esperando levantar con Docker

---

## 🎯 **RESUMEN EJECUTIVO**

Estamos desarrollando una **plataforma educativa web modular** para FagSol S.A.C., que permite:
- Venta de cursos completos con descuento
- Venta de módulos individuales
- Sistema de pagos con MercadoPago
- Tracking de progreso de estudiantes
- Evaluaciones y certificados

**Presupuesto:** S/ 3,200.00  
**Fase Actual:** Piloto (MVP)  
**Cronograma:** 7 semanas

---

## 🏗️ **ARQUITECTURA TECNOLÓGICA**

### **Stack Implementado:**

| Capa | Tecnología | Estado | Notas |
|------|------------|--------|-------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | ✅ Configurado | App Router, SSR/SSG ready |
| **Backend** | Django 5.0 + Django REST Framework | ✅ Configurado | 6 apps creadas |
| **Base de Datos** | PostgreSQL 15 | ✅ Docker | Modelo completo definido |
| **Autenticación** | JWT (SimpleJWT) | ✅ Configurado | Access + Refresh tokens |
| **Cache/Tasks** | Redis + Celery | ✅ Docker | Para emails y tareas asíncronas |
| **Contenedores** | Docker + Docker Compose | ⏳ Pendiente | 6 servicios configurados |
| **Despliegue** | Render / Vercel | 📋 Planeado | Para fase piloto |

### **Tipo de Arquitectura:**
- ✅ **Django Pragmático** (no Clean Architecture pura)
- ✅ **Modular** (apps separadas)
- ✅ **Principios SOLID** aplicados parcialmente
- ✅ **REST API** (JSON)

**Decisión tomada:** Para el piloto, usamos arquitectura Django estándar (más rápido). Se puede refactorizar a Clean Architecture en Fase 2 si es necesario.

---

## 📂 **ESTRUCTURA DEL PROYECTO**

```
fagsol/
├── backend/                           # Django Backend
│   ├── apps/
│   │   ├── core/                     # ✅ Utilidades compartidas
│   │   │   ├── models.py            # BaseModel, TimeStampedModel
│   │   │   ├── permissions.py       # IsStudent, IsTeacher, IsAdmin
│   │   │   ├── serializers.py       # Serializers base
│   │   │   ├── exceptions.py        # Custom exceptions
│   │   │   └── utils.py             # Funciones útiles
│   │   │
│   │   ├── users/                    # ✅ Sistema de usuarios completo
│   │   │   ├── models.py            # User (custom) con roles
│   │   │   ├── serializers.py       # UserSerializer, LoginSerializer
│   │   │   ├── views.py             # Register, Login, Profile
│   │   │   ├── admin.py             # Admin configurado
│   │   │   └── urls.py              # Endpoints de usuarios
│   │   │
│   │   ├── courses/                  # ✅ Cursos y módulos
│   │   │   ├── models.py            # Course, Module, Lesson, Enrollment, LessonProgress
│   │   │   ├── admin.py             # Admin con inlines
│   │   │   └── urls.py              # Endpoints (views pendientes)
│   │   │
│   │   ├── payments/                 # ✅ Pagos MercadoPago
│   │   │   ├── models.py            # Payment
│   │   │   ├── admin.py             # Admin de pagos
│   │   │   └── urls.py              # Endpoints (views pendientes)
│   │   │
│   │   ├── evaluations/              # 📝 Base creada
│   │   │   └── models.py            # Pendiente implementar
│   │   │
│   │   └── certificates/             # 📝 Base creada
│   │       └── models.py            # Pendiente implementar
│   │
│   ├── config/
│   │   ├── settings.py              # ✅ Configuración completa
│   │   ├── urls.py                  # ✅ Rutas principales
│   │   ├── wsgi.py                  # ✅ WSGI
│   │   ├── asgi.py                  # ✅ ASGI
│   │   └── celery.py                # ✅ Celery config
│   │
│   ├── requirements.txt             # ✅ Dependencias Python
│   ├── Dockerfile                   # ✅ Imagen Docker
│   └── manage.py                    # ✅ Django CLI
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # ✅ Layout principal
│   │   │   └── page.tsx            # ✅ Home page básica
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts              # ✅ Axios client con JWT
│   │   │
│   │   ├── types/
│   │   │   └── index.ts            # ✅ TypeScript types completos
│   │   │
│   │   └── styles/
│   │       └── globals.css         # ✅ Tailwind CSS
│   │
│   ├── package.json                 # ✅ Dependencias Node
│   ├── tsconfig.json                # ✅ TypeScript config
│   ├── tailwind.config.js           # ✅ Tailwind config
│   ├── next.config.js               # ✅ Next.js config
│   └── Dockerfile                   # ✅ Imagen Docker
│
├── docker-compose.yml               # ✅ 6 servicios configurados
├── .env                             # ✅ Variables de entorno
├── .gitignore                       # ✅ Git ignore
│
└── Documentación/
    ├── README.md                    # ✅ Descripción general
    ├── SETUP.md                     # ✅ Guía de instalación
    ├── ARQUITECTURA.md              # ✅ Análisis de arquitectura
    ├── DOCKER_COMMANDS.md           # ✅ Comandos Docker
    ├── CHECKLIST_INSTALACION.md    # ✅ Checklist paso a paso
    └── start-project.ps1            # ✅ Script de inicio automático
```

**Total de archivos creados:** 60+

---

## 🗄️ **MODELO DE DATOS IMPLEMENTADO**

### **Entidades Principales:**

```python
# USUARIOS
User
├── id (PK)
├── email (unique)
├── password (hashed)
├── first_name, last_name
├── role (student, teacher, admin, superadmin)
├── is_email_verified
└── timestamps

# CURSOS
Course (Curso Padre)
├── id (PK)
├── title, slug, description
├── instructor_id (FK → User)
├── full_price (precio completo)
├── discount_percentage (descuento al comprar completo)
├── level (beginner, intermediate, advanced)
└── timestamps

Module (Módulo - Comprable individualmente)
├── id (PK)
├── course_id (FK → Course)
├── title, slug, description
├── order (orden dentro del curso)
├── price (precio individual)
└── timestamps

Lesson (Lección)
├── id (PK)
├── module_id (FK → Module)
├── title, description
├── order
├── content_type (video, document, link, text)
├── content_url (YouTube, Drive)
├── duration_minutes
├── is_free (para preview)
└── timestamps

# MATRÍCULAS Y PROGRESO
Enrollment (Matrícula)
├── id (PK)
├── user_id (FK → User)
├── module_id (FK → Module)
├── payment_id (FK → Payment)
├── status (active, completed, expired)
├── progress_percentage (0-100)
├── enrolled_at
└── completed_at

LessonProgress (Progreso por lección)
├── id (PK)
├── user_id (FK → User)
├── lesson_id (FK → Lesson)
├── is_completed
├── time_spent_minutes
├── last_position_seconds (para videos)
└── timestamps

# PAGOS
Payment
├── id (PK)
├── user_id (FK → User)
├── payment_type (full_course, single_module, multiple_modules)
├── amount, currency
├── mercadopago_preference_id
├── mercadopago_payment_id
├── status (pending, approved, rejected, refunded)
├── metadata (JSON con items comprados)
└── timestamps
```

### **Lógica de Negocio Clave:**

```python
# Cálculo automático de progreso
enrollment.calculate_progress()
# → Cuenta lecciones completadas vs total
# → Actualiza progress_percentage
# → Marca como completed al llegar a 100%

# Generación de tokens
user.generate_verification_token()
user.generate_password_reset_token()

# Soft delete
model.soft_delete()  # is_active = False
model.activate()     # is_active = True
```

---

## 💰 **MODELO DE MONETIZACIÓN**

### **Sistema de Precios:**

```
Ejemplo: Curso "Automatización Industrial"

Módulo 1: PLC Básico        → S/ 120
Módulo 2: HMI Avanzado      → S/ 120  
Módulo 3: SCADA             → S/ 120
Módulo 4: Robótica          → S/ 120
─────────────────────────────────────
SUMA INDIVIDUAL:              S/ 480
PRECIO CURSO COMPLETO:        S/ 400
AHORRO:                       S/ 80 (16.7% descuento)
```

### **Flujos de Compra:**

**1. Compra de Módulo Individual:**
```
Usuario → Selecciona Módulo
       → MercadoPago (Checkout Pro)
       → Pago exitoso
       → Webhook recibido
       → Sistema crea Enrollment automático
       → Email de bienvenida + credenciales
```

**2. Compra de Curso Completo:**
```
Usuario → Selecciona Curso Completo
       → Aplicación de descuento automático
       → MercadoPago
       → Pago exitoso
       → Sistema crea Enrollments para TODOS los módulos
       → Email de bienvenida
```

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **JWT Implementado:**

```typescript
// Frontend: src/lib/api.ts
- Access Token: 60 minutos (localStorage)
- Refresh Token: 24 horas (localStorage)
- Interceptor automático para renovar tokens
- Logout: Blacklist del refresh token
```

### **Roles y Permisos:**

| Rol | Puede hacer |
|-----|-------------|
| **Student** | Ver sus cursos, completar lecciones, tomar evaluaciones |
| **Teacher** | Crear/editar cursos, ver sus estudiantes, calificar |
| **Admin** | Todo de teacher + gestionar usuarios, ver pagos |
| **SuperAdmin** | Acceso total al sistema |

### **Permisos Implementados:**
```python
# apps/core/permissions.py
IsStudent          # Solo estudiantes
IsTeacher          # Solo profesores
IsAdmin            # Admin o SuperAdmin
IsSuperAdmin       # Solo SuperAdmin
IsOwnerOrAdmin     # Dueño del recurso o admin
IsEnrolledInCourse # Matriculado en el módulo
```

---

## 🐳 **DOCKER - SERVICIOS CONFIGURADOS**

### **6 Servicios en docker-compose.yml:**

```yaml
1. db (PostgreSQL 15)
   - Puerto: 5432
   - Usuario: fagsol_user
   - DB: fagsol_db
   - Volumen persistente

2. redis (Redis 7)
   - Puerto: 6379
   - Para Celery y caché

3. backend (Django)
   - Puerto: 8000
   - API REST
   - Healthcheck configurado

4. celery (Worker)
   - Tareas asíncronas
   - Envío de emails

5. celery-beat (Scheduler)
   - Tareas programadas
   - Recordatorios, limpiezas

6. frontend (Next.js)
   - Puerto: 3000
   - Hot reload habilitado
```

### **Comandos Principales:**

```bash
# Levantar todo
docker-compose up -d --build

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Detener
docker-compose down
```

---

## 📊 **ESTADO ACTUAL DEL PROYECTO**

### ✅ **COMPLETADO (100%):**

**Backend:**
- [x] Estructura de Django con 6 apps
- [x] Modelos completos (User, Course, Module, Lesson, Enrollment, Payment, LessonProgress)
- [x] Autenticación JWT completa
- [x] Views de usuarios (Register, Login, Profile, Password Reset)
- [x] Serializers de usuarios
- [x] Permisos personalizados
- [x] Admin panels configurados
- [x] Settings completo (CORS, JWT, Email, Celery)
- [x] requirements.txt con todas las dependencias

**Frontend:**
- [x] Next.js 14 inicializado
- [x] TypeScript configurado
- [x] Tailwind CSS configurado
- [x] API client con Axios + JWT interceptors
- [x] Types completos (User, Course, Module, etc.)
- [x] Layout básico

**DevOps:**
- [x] Docker Compose con 6 servicios
- [x] Dockerfiles (backend y frontend)
- [x] .env configurado
- [x] .gitignore

**Documentación:**
- [x] README.md completo
- [x] SETUP.md (guía de instalación)
- [x] ARQUITECTURA.md (análisis detallado)
- [x] DOCKER_COMMANDS.md (comandos útiles)
- [x] CHECKLIST_INSTALACION.md
- [x] start-project.ps1 (script automático)

---

### ⏳ **EN PROGRESO:**

- [ ] Instalación de Docker Desktop
- [ ] Primer levantamiento del proyecto

---

### 📝 **PENDIENTE (Para siguiente sesión):**

**Backend - Alta Prioridad:**
- [ ] `apps/courses/serializers.py` - Serializers de cursos/módulos/lecciones
- [ ] `apps/courses/views.py` - ViewSets con CRUD completo
- [ ] `apps/payments/views.py` - CreatePreferenceView, WebhookView
- [ ] `apps/payments/serializers.py`
- [ ] `apps/payments/services.py` - MercadoPagoService

**Frontend - Alta Prioridad:**
- [ ] Landing page institucional (Home)
- [ ] Página de catálogo de cursos
- [ ] Página de detalle de curso
- [ ] Sistema de login/registro
- [ ] Dashboard de estudiante

**Funcionalidades Completas:**
- [ ] Sistema de evaluaciones (modelos + API)
- [ ] Sistema de certificados (generación PDF + QR)
- [ ] Envío de emails (Celery tasks)
- [ ] Tests unitarios

**Datos de Prueba:**
- [ ] Fixtures con cursos de ejemplo
- [ ] Usuarios de prueba
- [ ] Pagos de prueba

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### **Variables de Entorno (.env):**

```env
# Base de datos
DB_NAME=fagsol_db
DB_USER=fagsol_user
DB_PASSWORD=fagsol_password_2025
DB_HOST=db
DB_PORT=5432

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60      # minutos
JWT_REFRESH_TOKEN_LIFETIME=1440   # minutos (24 horas)

# MercadoPago (por configurar con credenciales reales)
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui

# URLs
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Puertos en Uso:**

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000/api |
| Admin Django | 8000 | http://localhost:8000/admin |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

## 🎯 **PRÓXIMOS PASOS (En orden)**

### **Sesión Actual (Instituto):**
1. ✅ Contexto documentado (este archivo)
2. ⏳ Instalación de Docker Desktop

### **Próxima Sesión (Casa):**

**1. Levantar el Proyecto (15 min):**
```bash
# Script automático
.\start-project.ps1

# O manual:
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

**2. Completar Backend de Courses (45 min):**
- Serializers completos
- ViewSets con permisos
- Tests básicos

**3. Integración MercadoPago (1 hora):**
- Servicio de MercadoPago
- Webhook handler
- Flujo de inscripción automática

**4. Frontend Básico (2 horas):**
- Landing page
- Catálogo de cursos
- Sistema de login

**5. Datos de Prueba (30 min):**
- Crear fixtures
- Poblar base de datos

---

## 📚 **RECURSOS Y REFERENCIAS**

### **Documentación Oficial:**
- Django: https://docs.djangoproject.com/en/5.0/
- Django REST Framework: https://www.django-rest-framework.org/
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Docker: https://docs.docker.com/

### **APIs Externas:**
- MercadoPago: https://www.mercadopago.com.pe/developers

### **Archivos de Referencia en el Proyecto:**
- `backend/apps/users/views.py` - Ejemplo de views completo
- `backend/apps/courses/models.py` - Modelos con lógica de negocio
- `frontend/src/lib/api.ts` - Cliente API con interceptors

---

## 🐛 **PROBLEMAS CONOCIDOS Y SOLUCIONES**

### **1. Docker no está instalado**
**Estado:** En proceso de instalación  
**Solución:** Instalar Docker Desktop y reiniciar

### **2. Puerto en uso**
**Síntoma:** Error al levantar servicios  
**Solución:**
```bash
netstat -ano | findstr :8000
# Cambiar puerto o matar proceso
```

### **3. Migraciones pendientes**
**Síntoma:** Error al acceder a endpoints  
**Solución:**
```bash
docker-compose exec backend python manage.py migrate
```

---

## 💡 **DECISIONES TÉCNICAS IMPORTANTES**

### **1. Arquitectura: Django Pragmático vs Clean Architecture**
**Decisión:** Django pragmático para el piloto  
**Razón:** Más rápido de desarrollar, suficiente para MVP  
**Refactorización:** Considerar Clean en Fase 2 si escala mucho

### **2. Módulos Comprables vs Curso Monolítico**
**Decisión:** Módulos comprables individualmente  
**Razón:** Flexibilidad para el estudiante, más opciones de monetización  
**Implementación:** Tabla Enrollment con relación a Module (no Course)

### **3. Evaluaciones: Por Módulo + Examen Final**
**Decisión:** Cada módulo tiene evaluación obligatoria  
**Razón:** Asegura que el estudiante aprendió antes de avanzar  
**Certificados:** Por módulo individual + certificado del curso completo

### **4. Contenido: Enlaces Externos vs Hosting Propio**
**Decisión:** Enlaces a YouTube y Google Drive  
**Razón:** Simplicidad y costos para el piloto  
**Futuro:** Migrar a AWS S3 o Cloudinary en producción

### **5. Emails: Celery vs Síncrono**
**Decisión:** Celery para envío asíncrono  
**Razón:** No bloquear el flujo de registro/pago  
**Implementación:** Redis como broker

---

## 🔐 **CREDENCIALES Y ACCESOS**

### **Para Desarrollo Local:**

**PostgreSQL:**
- Host: localhost
- Puerto: 5432
- Database: fagsol_db
- User: fagsol_user
- Password: fagsol_password_2025

**Django Admin:**
- URL: http://localhost:8000/admin
- User: (crear con createsuperuser)

**MercadoPago:**
- Entorno: TEST
- Public Key: Por configurar
- Access Token: Por configurar

---

## 📞 **CONTACTO Y SOPORTE**

**Desarrollador:** Roniel Fernando Chambilla del Carpio  
**Cliente:** FagSol S.A.C.  
**Presupuesto:** S/ 3,200.00  
**Plazo:** 7 semanas

---

## 🎓 **PARA CONTINUAR EN CASA**

### **Contexto para Cursor AI:**

```
"Estoy desarrollando FagSol Escuela Virtual, una plataforma educativa 
modular con Django + Next.js. El proyecto usa Docker con 6 servicios.

Estado actual:
- ✅ Estructura completa (60+ archivos)
- ✅ Modelos implementados (User, Course, Module, Lesson, Enrollment, Payment)
- ✅ Autenticación JWT completa
- ⏳ Docker instalándose
- 📝 Pendiente: Views de courses, integración MercadoPago, frontend

Stack: Django 5.0 + DRF, Next.js 14 + TypeScript, PostgreSQL, Redis, 
Celery, Docker Compose.

Arquitectura: Django pragmático modular (no Clean Architecture pura).

Próximo paso: Levantar proyecto con Docker y completar serializers/views 
de courses."
```

### **Comandos para Empezar:**

```bash
# Ubicarte en el proyecto
cd C:\Users\deadmau5\Documents\fagsol

# Verificar Docker
docker --version

# Levantar todo
.\start-project.ps1

# O manual:
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## ✅ **CHECKLIST RÁPIDO**

**Antes de codificar:**
- [ ] Docker Desktop corriendo
- [ ] Proyecto levantado (`docker-compose ps`)
- [ ] Migraciones ejecutadas
- [ ] Superusuario creado
- [ ] Acceso a http://localhost:8000/admin

**Para nueva sesión:**
- [ ] `docker-compose up -d` (levantar servicios)
- [ ] `docker-compose logs -f` (ver logs)
- [ ] Revisar pendientes en este documento

---

## 🚀 **LISTO PARA CONTINUAR**

Este documento tiene TODO el contexto necesario para:
- ✅ Continuar el proyecto desde cero
- ✅ Compartir con otro developer
- ✅ Dar contexto a Cursor AI
- ✅ Recordar decisiones tomadas
- ✅ Saber qué sigue

**¡Guarda este archivo y úsalo como referencia principal!** 📖

---

**Última actualización:** 23 de Octubre 2025 - 13:30  
**Ubicación:** Instituto  
**Próxima sesión:** Casa (con Docker instalado)

