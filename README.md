# FagSol Escuela Virtual

## 📚 Descripción del Proyecto

Plataforma educativa web moderna desarrollada para **FagSol S.A.C.**, orientada a digitalizar la oferta educativa y facilitar el acceso a capacitaciones en línea especializadas.

**Versión:** 1.0 (Piloto)  
**Fecha:** Octubre 2025  
**Desarrollador:** Roniel Fernando Chambilla del Carpio

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
- Shadcn/ui
- Zustand (State Management)

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
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Utilidades y servicios
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Estilos globales
│   ├── public/            # Assets estáticos
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
npm run dev
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

- Contraseñas hasheadas con bcrypt
- Autenticación JWT con refresh tokens
- Validación de entrada en frontend y backend
- Protección CSRF y CORS
- HTTPS en producción
- Variables de entorno para credenciales

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

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

---

## 📦 Deployment

El proyecto está configurado para desplegarse en **Render**:

- **Frontend:** Render Static Site / Vercel
- **Backend:** Render Web Service
- **Base de datos:** Render PostgreSQL

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

### Fase 1 - Piloto ✅ (Actual)
- Sistema básico de cursos modulares
- Pagos con MercadoPago
- Panel administrativo
- Certificados básicos

### Fase 2 - Expansión (Futuro)
- Certificados con blockchain
- Evaluaciones avanzadas
- Foros de discusión
- Aplicación móvil
- Gamificación completa
- Analytics avanzados

