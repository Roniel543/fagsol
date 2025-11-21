# 🎓 FagSol Escuela Virtual

**Plataforma educativa en línea con sistema de roles, cursos, pagos y certificados**

[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 **TABLA DE CONTENIDOS**

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido con Docker](#-inicio-rápido-con-docker)
- [Instalación Manual](#-instalación-manual)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [API Endpoints](#-api-endpoints)
- [Sistema de Roles](#-sistema-de-roles)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)

---

## ✨ **CARACTERÍSTICAS**

### **Para Estudiantes:**
- ✅ Registro e inicio de sesión seguro
- ✅ Explorar catálogo de cursos
- ✅ Inscribirse en cursos
- ✅ Acceder a contenido educativo
- ✅ Seguir progreso de aprendizaje
- ✅ Obtener certificados al completar cursos
- ✅ Solicitar ser instructor

### **Para Instructores:**
- ✅ Sistema de solicitud y aprobación
- ✅ Crear y gestionar cursos propios
- ✅ Dashboard con estadísticas
- ✅ Ver estudiantes e inscripciones
- ✅ Rutas específicas para gestión

### **Para Administradores:**
- ✅ Panel de control completo
- ✅ Gestionar solicitudes de instructores
- ✅ Aprobar/rechazar cursos
- ✅ Gestionar usuarios y permisos
- ✅ Estadísticas del sistema

---

## 🏗️ **ARQUITECTURA**

### **Backend:**
- **Framework:** Django 5.0
- **Arquitectura:** Clean Architecture
- **API:** Django REST Framework + Swagger
- **Base de Datos:** PostgreSQL 15
- **Autenticación:** JWT con refresh tokens
- **Seguridad:** Django AXES, rate limiting, validaciones

### **Frontend:**
- **Framework:** Next.js 14 + TypeScript
- **Arquitectura:** Feature-based
- **Estilos:** Tailwind CSS
- **Data Fetching:** SWR
- **Autenticación:** JWT en sessionStorage

### **Infraestructura:**
- **Containerización:** Docker + Docker Compose
- **Base de Datos:** PostgreSQL
- **Caché:** Redis
- **Tareas Asíncronas:** Celery

---

## 🚀 **INICIO RÁPIDO CON DOCKER**

### **Prerrequisitos:**
- Docker Desktop (Windows/Mac) o Docker Engine + Docker Compose (Linux)
- Git

### **Pasos:**

```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd fagsol

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (valores por defecto funcionan para desarrollo)

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Crear superusuario (primera vez)
docker-compose exec backend python manage.py createsuperuser

# 6. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Swagger: http://localhost:8000/swagger/
# Admin: http://localhost:8000/admin/
```

**📖 Ver [DOCKER_SETUP.md](./DOCKER_SETUP.md) para documentación completa de Docker**

---

## 🛠️ **INSTALACIÓN MANUAL**

### **Backend:**

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### **Frontend:**

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con NEXT_PUBLIC_API_URL

# Iniciar servidor de desarrollo
npm run dev
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
fagsol/
├── backend/                 # Django Backend
│   ├── apps/               # Aplicaciones Django
│   │   ├── core/          # Modelos base (UserProfile, InstructorApplication)
│   │   ├── users/         # Usuarios y permisos
│   │   ├── courses/       # Cursos, módulos, lecciones
│   │   └── payments/      # Pagos y transacciones
│   ├── config/            # Configuración Django
│   ├── domain/            # Entidades y reglas de negocio
│   ├── application/       # Casos de uso
│   ├── infrastructure/    # Servicios y repositorios
│   └── presentation/      # Views, serializers, URLs
│
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Rutas de Next.js
│   │   ├── features/     # Módulos por funcionalidad
│   │   │   ├── auth/    # Autenticación
│   │   │   ├── dashboard/ # Dashboards
│   │   │   ├── academy/  # Cursos y catálogo
│   │   │   ├── admin/    # Panel admin
│   │   │   └── instructor/ # Panel instructor
│   │   └── shared/       # Componentes y servicios compartidos
│   └── public/           # Archivos estáticos
│
├── docker-compose.yml     # Orquestación Docker
├── .env.example          # Variables de entorno de ejemplo
└── README.md            # Este archivo
```

---

## 📚 **DOCUMENTACIÓN**

### **Documentos Principales:**
- **[CONTEXTO_PROYECTO.md](./CONTEXTO_PROYECTO.md)** - Contexto completo del proyecto
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Guía completa de Docker
- **[CHANGELOG.md](./CHANGELOG.md)** - Registro de cambios

### **Documentos de Funcionalidades:**
- **[Futura Fases/Instructors/PLAN_FLUJO_INSTRUCTORES.md](./Futura%20Fases/Instructors/PLAN_FLUJO_INSTRUCTORES.md)** - Flujo de instructores
- **[Futura Fases/Instructors/GUIA_USO_SISTEMA_INSTRUCTORES.md](./Futura%20Fases/Instructors/GUIA_USO_SISTEMA_INSTRUCTORES.md)** - Guía de uso

### **API Documentation:**
- **Swagger UI:** http://localhost:8000/swagger/
- **ReDoc:** http://localhost:8000/redoc/

---

## 🔌 **API ENDPOINTS**

### **Autenticación:**
- `POST /api/v1/auth/register/` - Registro de estudiantes
- `POST /api/v1/auth/login/` - Inicio de sesión
- `POST /api/v1/auth/logout/` - Cerrar sesión
- `GET /api/v1/auth/me/` - Usuario actual
- `POST /api/v1/auth/apply-instructor/` - Solicitar ser instructor

### **Dashboard:**
- `GET /api/v1/dashboard/stats/` - Estadísticas según rol
- `GET /api/v1/dashboard/student/stats/` - Estadísticas de estudiante
- `GET /api/v1/dashboard/instructor/stats/` - Estadísticas de instructor
- `GET /api/v1/dashboard/admin/stats/` - Estadísticas de admin

### **Admin:**
- `GET /api/v1/admin/instructor-applications/` - Listar solicitudes
- `POST /api/v1/admin/instructor-applications/{id}/approve/` - Aprobar
- `POST /api/v1/admin/instructor-applications/{id}/reject/` - Rechazar

### **Cursos:**
- `GET /api/v1/courses/` - Listar cursos
- `POST /api/v1/courses/create/` - Crear curso (instructor/admin)
- `GET /api/v1/courses/{id}/` - Detalle de curso
- `PUT /api/v1/courses/{id}/update/` - Actualizar curso

**Ver Swagger para documentación completa:** http://localhost:8000/swagger/

---

## 👥 **SISTEMA DE ROLES**

### **Estudiante (student):**
- Ver cursos publicados
- Inscribirse en cursos
- Acceder a contenido
- Solicitar ser instructor

### **Instructor (instructor):**
- Requiere aprobación de admin
- Crear cursos (draft)
- Gestionar sus cursos
- Ver estadísticas

### **Administrador (admin):**
- Acceso completo
- Aprobar/rechazar instructores
- Aprobar/rechazar cursos
- Gestionar usuarios

---

## 💻 **DESARROLLO**

### **Comandos Útiles:**

#### **Backend:**
```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Shell de Django
python manage.py shell

# Tests
python manage.py test

# Comandos personalizados
python manage.py fix_user_auth email@example.com
python manage.py unlock_all_users
```

#### **Frontend:**
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Tests
npm test
npm run test:e2e
```

### **Hot Reload:**
- ✅ Frontend: Automático con Next.js
- ✅ Backend: Auto-reload con `runserver`

---

## 🚢 **DESPLIEGUE**

### **Producción con Docker:**
```bash
# Build para producción
docker-compose -f docker-compose.prod.yml build

# Levantar en producción
docker-compose -f docker-compose.prod.yml up -d
```

### **Variables de Entorno Importantes:**
- `DEBUG=False` en producción
- `SECRET_KEY` único y seguro
- `ALLOWED_HOSTS` con tu dominio
- `DB_PASSWORD` fuerte
- Configurar HTTPS

**Ver [DOCKER_SETUP.md](./DOCKER_SETUP.md) para más detalles**

---

## 🔐 **SEGURIDAD**

- ✅ JWT con refresh tokens
- ✅ Rate limiting (Django AXES)
- ✅ Validación de permisos en backend
- ✅ Sanitización de inputs
- ✅ CORS configurado
- ✅ Tokens en sessionStorage (no localStorage)

---

## 📊 **ESTADO DEL PROYECTO**

### **✅ Completado:**
- Sistema de autenticación completo
- Sistema de roles y permisos
- Flujo de solicitud de instructor
- Panel admin para gestionar solicitudes
- Dashboard para todos los roles
- Rutas específicas para instructores
- UI mejorada

### **⏳ En Desarrollo:**
- Sistema completo de cursos
- Sistema de aprobación de cursos
- Notificaciones por email

---

## 🤝 **CONTRIBUIR**

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 **LICENCIA**

Este proyecto es propiedad de FagSol S.A.C.

---

## 📞 **CONTACTO**

- **Email:** soporte@fagsol.com
- **Website:** https://fagsol.com

---

## 🙏 **AGRADECIMIENTOS**

- Django Community
- Next.js Team
- Todos los contribuidores

---

**Última actualización:** 2025-01-12
