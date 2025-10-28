# 🏗️ Arquitectura Limpia - FagSol Escuela Virtual

## 📋 Descripción

Este proyecto implementa una **Arquitectura Limpia (Clean Architecture)** con principios de **Hexagonal Architecture** para el sistema de educación virtual FagSol.

## 🎯 Objetivos

- **Desacoplamiento**: Las capas pueden evolucionar independientemente
- **Mantenibilidad**: Código limpio y fácil de mantener
- **Escalabilidad**: Preparado para crecer con el negocio
- **Testabilidad**: Fácil de probar unitariamente
- **Flexibilidad**: Cambios en infraestructura no afectan el dominio

## 🏛️ Estructura de Capas

```
backend/
├── domain/                 # 🎯 Capa de Dominio
│   ├── entities/           # Entidades de negocio
│   ├── value_objects/      # Objetos de valor
│   ├── repositories/       # Interfaces de repositorios
│   └── services/           # Servicios de dominio
│
├── application/            # 🔧 Capa de Aplicación
│   ├── use_cases/          # Casos de uso
│   ├── services/           # Servicios de aplicación
│   ├── dtos/               # Data Transfer Objects
│   └── interfaces/         # Interfaces de servicios
│
├── infrastructure/         # 🔌 Capa de Infraestructura
│   ├── database/           # Modelos de Django
│   ├── repositories/       # Implementaciones de repositorios
│   ├── adapters/           # Interfaces para servicios externos
│   └── external_services/  # Implementaciones de servicios externos
│
└── presentation/           # 🌐 Capa de Presentación
    ├── api/                # APIs REST
    ├── serializers/        # Serializers de Django REST
    └── views/              # Vistas de la API
```

## 🔄 Flujo de Datos

```
Frontend (Next.js) 
    ↓ HTTP/JSON
Presentation Layer (API REST)
    ↓ DTOs
Application Layer (Use Cases)
    ↓ Entities
Domain Layer (Business Logic)
    ↓ Repositories
Infrastructure Layer (Django ORM)
    ↓ SQL
Database (PostgreSQL)
```

## 🚀 Endpoints Disponibles

### Autenticación
- `POST /api/token/` - Obtener token JWT
- `POST /api/token/refresh/` - Refrescar token
- `POST /api/token/verify/` - Verificar token

### API v1
- `GET /api/v1/health/` - Health check
- `POST /api/v1/users/` - Crear usuario
- `GET /api/v1/users/{id}/` - Obtener usuario
- `PUT /api/v1/users/{id}/update/` - Actualizar usuario
- `GET /api/v1/courses/` - Listar cursos
- `POST /api/v1/courses/` - Crear curso
- `GET /api/v1/courses/{id}/` - Obtener curso
- `POST /api/v1/enrollments/` - Crear inscripción
- `POST /api/v1/payments/` - Crear pago

## 🛠️ Tecnologías

- **Backend**: Django 5.0 + Django REST Framework
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (Simple JWT)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Contenedores**: Docker + Docker Compose

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd fagsol
```

2. **Configurar entorno virtual**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

5. **Ejecutar migraciones**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Crear superusuario**
```bash
python manage.py createsuperuser
```

7. **Ejecutar servidor**
```bash
python manage.py runserver
```

## 🧪 Testing

```bash
# Ejecutar tests
python manage.py test

# Tests con cobertura
coverage run --source='.' manage.py test
coverage report
```

## 📚 Principios Aplicados

### SOLID
- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle  
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

### Clean Architecture
- **Independencia de frameworks**
- **Testabilidad**
- **Independencia de UI**
- **Independencia de base de datos**
- **Independencia de agentes externos**

### Hexagonal Architecture
- **Puertos**: Interfaces que definen contratos
- **Adaptadores**: Implementaciones concretas
- **Desacoplamiento**: Lógica de negocio aislada

## 🔧 Desarrollo

### Agregar nueva funcionalidad

1. **Definir entidad en `domain/entities/`**
2. **Crear repositorio en `domain/repositories/`**
3. **Implementar repositorio en `infrastructure/repositories/`**
4. **Crear caso de uso en `application/use_cases/`**
5. **Implementar servicio en `application/services/`**
6. **Crear endpoint en `presentation/views/`**
7. **Agregar URL en `presentation/api/v1/urls.py`**

### Estructura de commits

```
feat: agregar funcionalidad de inscripción
fix: corregir validación de email
docs: actualizar documentación de API
refactor: mejorar estructura de repositorios
test: agregar tests para casos de uso
```

## 📖 Documentación

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
