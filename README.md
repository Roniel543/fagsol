# FagSol Escuela Virtual

## 📚 Descripción del Proyecto

Plataforma educativa web moderna desarrollada para **FagSol S.A.C.**, orientada a digitalizar la oferta educativa y facilitar el acceso a capacitaciones en línea especializadas.

**Versión:** 1.0 (Piloto)  
**Fecha:** Octubre 2025  
**Desarrollador:** Roniel Fernando Chambilla del Carpio  
**Última actualización:** FASE 3 (Frontend SWR) - Completada ✅

---

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** con **Hexagonal Architecture**, garantizando:

- ✅ Código modular, escalable y mantenible
- ✅ Desacoplamiento entre capas
- ✅ Principios SOLID
- ✅ Fácil testing y extensibilidad

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR (Data Fetching)
- DOMPurify (Sanitización HTML)
- Jest + React Testing Library (Testing)
- Arquitectura feature-based

**Backend:**
- Django 5.0
- Django REST Framework
- PostgreSQL 15
- JWT Authentication
- Celery + Redis

**DevOps:**
- Docker + Docker Compose
- Render (Deployment)

---

## 📂 Estructura del Proyecto

```
fagsol/
├── backend/                 # Django Backend
│   ├── apps/
│   │   ├── users/          # Gestión de usuarios y autenticación
│   │   ├── courses/        # Cursos, módulos y lecciones
│   │   ├── payments/       # Integración MercadoPago
│   │   ├── evaluations/    # Sistema de evaluaciones
│   │   ├── certificates/   # Generación de certificados
│   │   └── core/           # Utilidades compartidas
│   ├── config/             # Configuración del proyecto
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── features/      # Arquitectura feature-based
│   │   │   ├── academy/   # Feature: Academia/Cursos
│   │   │   ├── auth/      # Feature: Autenticación
│   │   │   ├── dashboard/ # Feature: Dashboard
│   │   │   └── home/      # Feature: Home
│   │   ├── shared/        # Componentes y utilidades compartidas
│   │   │   ├── components/ # Componentes reutilizables
│   │   │   ├── contexts/   # Contexts (Auth, Cart)
│   │   │   ├── hooks/     # Hooks personalizados
│   │   │   ├── services/  # Servicios API
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # Utilidades (sanitize, tokenStorage)
│   │   └── types/         # Types globales
│   ├── public/            # Assets estáticos
│   ├── jest.config.js     # Configuración Jest
│   ├── jest.setup.js      # Setup de tests
│   ├── SECURITY_README_FRONTEND.md  # Documentación de seguridad
│   └── package.json
│
├── docker-compose.yml     # Orquestación de servicios
├── .env.example          # Variables de entorno de ejemplo
└── README.md
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local del frontend)
- Python 3.11+ (para desarrollo local del backend)

### ⚡ Quick Start

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd fagsol

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar servicios con Docker
docker-compose up -d

# 4. Inicializar base de datos
docker-compose exec backend python manage.py migrate
docker-compose exec backend python create_superuser.py

# 5. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend Admin: http://localhost:8000/admin
# API: http://localhost:8000/api
```

**📖 Para más detalles:** Ver `SETUP_COMPLETO.md`

### Instalación con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd fagsol

# Copiar variables de entorno
cp .env.example .env

# Configurar variables en .env (MercadoPago, DB, etc.)

# Levantar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend Admin: http://localhost:8000/admin
# API: http://localhost:8000/api
```

### Desarrollo Local

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm test           # Ejecutar tests
npm run lint       # Linter
```

---

## 🎯 Funcionalidades del Piloto

### Estudiantes
- ✅ Registro post-pago con verificación de email
- ✅ Acceso a módulos comprados
- ✅ Visualización de materiales (videos, documentos)
- ✅ Sistema de evaluaciones con intentos limitados
- ✅ Certificados descargables con código QR
- ✅ Tracking de progreso

### Administradores
- ✅ Panel de administración completo
- ✅ Gestión de cursos y módulos
- ✅ Subida de materiales (enlaces externos)
- ✅ Creación de evaluaciones
- ✅ Visualización de estudiantes inscritos
- ✅ Estadísticas básicas (inscripciones, ingresos)

### Sistema de Pagos
- ✅ Integración con MercadoPago (Checkout Pro)
- ✅ Compra de curso completo con descuento
- ✅ Compra de módulos individuales
- ✅ Webhooks para confirmación automática

---

## 🔐 Seguridad

### Backend
- Contraseñas hasheadas con bcrypt
- Autenticación JWT con refresh tokens
- Validación de entrada en frontend y backend
- Protección CSRF y CORS
- HTTPS en producción
- Variables de entorno para credenciales

### Frontend (FASE 1 - ✅ Implementado)
- ✅ **Tokens JWT en sessionStorage** (más seguro que localStorage)
- ✅ **Refresh token automático** (preventivo y reactivo)
- ✅ **Sanitización HTML con DOMPurify** (protección XSS)
- ✅ **Content Security Policy (CSP)** configurada
- ✅ **Logout server-side** (invalidación de tokens)
- ✅ **Headers de seguridad** (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ **Componente SafeHTML** para renderizar HTML dinámico seguro

**📚 Documentación de Seguridad:**
- Ver `frontend/SECURITY_README_FRONTEND.md` para guía completa
- Ver `frontend/IMPLEMENTACION_FASE1_COMPLETA.md` para detalles técnicos
- Ver `RIESGOS_SEGURIDAD_PAGOS.md` para análisis de riesgos

---

## 📊 Base de Datos

El sistema utiliza PostgreSQL con el siguiente modelo principal:

- **User:** Usuarios del sistema (estudiantes, profesores, admins)
- **Course:** Cursos principales
- **Module:** Módulos comprables individualmente
- **Lesson:** Lecciones dentro de cada módulo
- **Payment:** Registro de pagos
- **Enrollment:** Matrículas de usuarios en módulos
- **Evaluation:** Evaluaciones y exámenes
- **Certificate:** Certificados emitidos

---

## 🧪 Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm install
npm test              # Ejecutar tests
npm run test:watch    # Modo watch
npm run test:coverage # Con cobertura
```

**Tests Implementados:**
- ✅ Tests de sanitización HTML (`sanitize.test.ts`)
- ✅ Tests de gestión de tokens (`tokenStorage.test.ts`)
- ✅ Tests de autenticación (`useAuth.test.tsx`)

**Cobertura Actual:**
- Utilidades de seguridad: ✅ Testeadas
- Hooks de autenticación: ✅ Testeados
- Componentes críticos: En progreso

---

## 📦 Deployment

El proyecto está configurado para desplegarse en **Render**:

- **Frontend:** Render Static Site / Vercel
- **Backend:** Render Web Service
- **Base de datos:** Render PostgreSQL

---

## 📚 Documentación Adicional

### Seguridad
- **`frontend/SECURITY_README_FRONTEND.md`** - Guía completa de seguridad frontend
- **`frontend/IMPLEMENTACION_FASE1_COMPLETA.md`** - Detalles de implementación FASE 1
- **`frontend/BACKEND_ENDPOINTS_REQUIRED.md`** - Endpoints backend requeridos
- **`RIESGOS_SEGURIDAD_PAGOS.md`** - Análisis de riesgos con pagos reales

### Desarrollo
- **`SETUP_COMPLETO.md`** - Guía de instalación completa
- **`ANALISIS_PROYECTO_FRONTEND.md`** - Análisis del proyecto frontend
- **`backend/ARCHITECTURE.md`** - Arquitectura del backend
- **`backend/ARQUITECTURA_COMPLETA.md`** - Arquitectura completa

---

## 📝 Licencia

Propiedad de **FagSol S.A.C.** - Todos los derechos reservados.

---

## 👨‍💻 Desarrollador

**Roniel Fernando Chambilla del Carpio**  
Desarrollador Web Full Stack  
Email: [tu-email]  
LinkedIn: [tu-perfil]

---

## 🗓️ Roadmap

### Fase 1 - Seguridad Frontend ✅ (Completado)
- ✅ Tokens JWT seguros (sessionStorage)
- ✅ Refresh token automático
- ✅ Sanitización HTML (DOMPurify)
- ✅ Content Security Policy (CSP)
- ✅ Logout server-side
- ✅ Tests unitarios de seguridad
- ✅ Documentación completa de seguridad

### Fase 1.5 - Piloto (Actual)
- Sistema básico de cursos modulares
- Pagos con MercadoPago
- Panel administrativo
- Certificados básicos

### Fase 2 - Data Fetching ✅ (Completado)
- ✅ Instalar y configurar SWR
- ✅ Hooks de data fetching (useCourses, useCourse, useCourseBySlug, useEnrollments)
- ✅ Migración de componentes a SWR (CatalogPage, CourseDetailPage, AcademyHomePage, CartContext)
- ✅ Error handling y loading states
- ✅ Backend mejorado: endpoint por slug, modelo Course extendido

### Fase 3 - Testing E2E (Próximo)
- [ ] Configurar Playwright
- [ ] Tests E2E de flujos críticos
- [ ] Tests de acceso no autorizado

### Fase 4 - Observabilidad (Futuro)
- [ ] Integrar Sentry
- [ ] Error boundaries
- [ ] Request-id correlation

### Fase 5 - CI/CD (Futuro)
- [ ] GitHub Actions
- [ ] Linter + TypeScript check
- [ ] Security scans automáticos

### Fase 6 - Expansión (Futuro)
- Certificados con blockchain
- Evaluaciones avanzadas
- Foros de discusión
- Aplicación móvil
- Gamificación completa
- Analytics avanzados

