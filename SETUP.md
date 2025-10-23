# 🚀 Guía de Configuración - FagSol Escuela Virtual

## 📋 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Git** para control de versiones
- **Node.js 18+** (opcional, si trabajas fuera de Docker)
- **Python 3.11+** (opcional, si trabajas fuera de Docker)

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd fagsol
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
copy env.example .env
```

Edita el archivo `.env` y configura:

```env
# Clave secreta de Django (genera una nueva)
SECRET_KEY=tu-clave-secreta-aqui

# JWT
JWT_SECRET_KEY=tu-jwt-secret-key

# MercadoPago
MERCADOPAGO_PUBLIC_KEY=tu-public-key
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# Email (opcional para desarrollo)
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
```

### 3. Construir y Levantar los Servicios con Docker

```bash
# Construir las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 4. Ejecutar Migraciones de Base de Datos

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Crear Superusuario

```bash
docker-compose exec backend python manage.py createsuperuser
```

Sigue las instrucciones y proporciona:
- Email
- Nombres
- Apellidos
- Contraseña

### 6. Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin
- **API:** http://localhost:8000/api

---

## 🛠️ Comandos Útiles

### Backend (Django)

```bash
# Crear nuevas migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Shell interactivo de Django
docker-compose exec backend python manage.py shell

# Recolectar archivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput
```

### Frontend (Next.js)

```bash
# Instalar dependencias (si trabajas local)
cd frontend
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

### Docker

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra la base de datos)
docker-compose down -v

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs celery

# Reconstruir servicios después de cambios
docker-compose up -d --build

# Ver estado de los servicios
docker-compose ps
```

---

## 📦 Instalar Dependencias (Sin Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## 🗄️ Base de Datos

La base de datos PostgreSQL se ejecuta en Docker con los siguientes datos por defecto:

- **Host:** localhost
- **Puerto:** 5432
- **Database:** fagsol_db
- **Usuario:** fagsol_user
- **Contraseña:** fagsol_password_2025

Puedes conectarte con cualquier cliente de PostgreSQL (pgAdmin, DBeaver, etc.)

---

## 🧪 Testing

### Backend

```bash
# Ejecutar todos los tests
docker-compose exec backend python manage.py test

# Ejecutar tests de una app específica
docker-compose exec backend python manage.py test apps.users

# Con pytest
docker-compose exec backend pytest
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 📝 Próximos Pasos

1. ✅ Configurar credenciales de MercadoPago
2. ✅ Crear datos de prueba (cursos, módulos)
3. ✅ Implementar las vistas del frontend
4. ✅ Configurar envío de emails
5. ✅ Implementar sistema de evaluaciones
6. ✅ Implementar generación de certificados

---

## 🐛 Troubleshooting

### Error: Puerto ya en uso

Si el puerto 8000 o 3000 ya está en uso:

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Cambiar el puerto en docker-compose.yml
```

### Error: Cannot connect to database

1. Verifica que el servicio de PostgreSQL esté corriendo:
```bash
docker-compose ps db
```

2. Revisa los logs:
```bash
docker-compose logs db
```

### Error: Migraciones pendientes

```bash
docker-compose exec backend python manage.py migrate
```

---

## 📧 Soporte

Para cualquier problema, contacta a:
- **Desarrollador:** Roniel Fernando Chambilla del Carpio
- **Email:** [tu-email]

---

**¡Listo para comenzar a desarrollar! 🚀**

