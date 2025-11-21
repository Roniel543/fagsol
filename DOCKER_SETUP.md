# 🐳 Guía de Configuración Docker - FagSol Escuela Virtual

**Fecha:** 2025-01-12  
**Versión:** 1.0

---

## 📋 **REQUISITOS PREVIOS**

### **Software Necesario:**
- ✅ Docker Desktop (Windows/Mac) o Docker Engine + Docker Compose (Linux)
- ✅ Git (para clonar el repositorio)
- ✅ Editor de texto (para editar `.env`)

### **Verificar Instalación:**
```bash
# Verificar Docker
docker --version
docker-compose --version

# Deberías ver algo como:
# Docker version 24.0.0
# Docker Compose version v2.20.0
```

---

## 🚀 **INICIO RÁPIDO**

### **Paso 1: Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd fagsol
```

### **Paso 2: Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (opcional para desarrollo local)
# Para desarrollo, los valores por defecto funcionan
```

### **Paso 3: Levantar los Servicios**
```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### **Paso 4: Crear Superusuario (Primera Vez)**
```bash
# Ejecutar comando dentro del contenedor backend
docker-compose exec backend python manage.py createsuperuser

# Seguir las instrucciones para crear el admin
```

### **Paso 5: Acceder a la Aplicación**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger/API Docs:** http://localhost:8000/swagger/
- **Admin Django:** http://localhost:8000/admin/
- **PostgreSQL:** localhost:5432

---

## 📦 **SERVICIOS INCLUIDOS**

### **1. PostgreSQL (Base de Datos)**
- **Puerto:** 5432
- **Usuario:** postgres (configurable)
- **Contraseña:** postgres (configurable)
- **Base de datos:** fagsol_db (configurable)
- **Volumen persistente:** `postgres_data`

### **2. Redis (Caché y Celery)**
- **Puerto:** 6379
- **Volumen persistente:** `redis_data`

### **3. Django Backend**
- **Puerto:** 8000
- **Healthcheck:** `/api/v1/auth/health/`
- **Volúmenes:**
  - Código fuente (montado)
  - Archivos estáticos: `backend_static`
  - Archivos media: `backend_media`

### **4. Celery Worker (Tareas Asíncronas)**
- **Depende de:** Backend, DB, Redis
- **Concurrencia:** 2 workers

### **5. Next.js Frontend**
- **Puerto:** 3000
- **Modo:** Desarrollo (hot reload)
- **Volúmenes:**
  - Código fuente (montado)
  - `node_modules` (volumen anónimo)
  - `.next` (volumen anónimo)

---

## 🔧 **COMANDOS ÚTILES**

### **Gestión de Contenedores:**
```bash
# Levantar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Reconstruir sin cache
docker-compose build --no-cache

# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f [servicio]
```

### **Comandos Django:**
```bash
# Migraciones
docker-compose exec backend python manage.py migrate

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Shell de Django
docker-compose exec backend python manage.py shell

# Recolectar archivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput

# Comandos personalizados
docker-compose exec backend python manage.py fix_user_auth email@example.com
docker-compose exec backend python manage.py unlock_all_users
```

### **Comandos Frontend:**
```bash
# Instalar dependencias (si es necesario)
docker-compose exec frontend npm install

# Ver logs
docker-compose logs -f frontend
```

### **Base de Datos:**
```bash
# Conectar a PostgreSQL
docker-compose exec db psql -U postgres -d fagsol_db

# Backup de base de datos
docker-compose exec db pg_dump -U postgres fagsol_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres fagsol_db < backup.sql
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema: "Port already in use"**
```bash
# Ver qué proceso usa el puerto
# Windows:
netstat -ano | findstr :8000
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :8000
lsof -i :3000
lsof -i :5432

# Cambiar puertos en .env:
BACKEND_PORT=8001
FRONTEND_PORT=3001
DB_PORT=5433
```

### **Problema: "Database connection failed"**
```bash
# Verificar que la base de datos esté corriendo
docker-compose ps db

# Ver logs de la base de datos
docker-compose logs db

# Reiniciar servicios
docker-compose restart db backend
```

### **Problema: "Frontend no se conecta al backend"**
```bash
# Verificar variable de entorno
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Debe ser: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# O en Docker: NEXT_PUBLIC_API_URL=http://backend:8000/api/v1

# Actualizar .env y reiniciar
docker-compose restart frontend
```

### **Problema: "Migraciones no se aplican"**
```bash
# Aplicar migraciones manualmente
docker-compose exec backend python manage.py migrate

# Si hay conflictos, ver estado
docker-compose exec backend python manage.py showmigrations
```

### **Problema: "Permisos en archivos"**
```bash
# En Linux/Mac, ajustar permisos
sudo chown -R $USER:$USER backend/media backend/staticfiles
```

### **Limpiar Todo y Empezar de Nuevo:**
```bash
# ⚠️ ADVERTENCIA: Esto elimina TODOS los datos
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📊 **VERIFICAR QUE TODO FUNCIONA**

### **1. Verificar Servicios:**
```bash
docker-compose ps

# Todos deben estar "Up" y "healthy"
```

### **2. Verificar Backend:**
```bash
# Health check
curl http://localhost:8000/api/v1/auth/health/

# Debe retornar: {"success": true, "message": "Servicio de autenticación funcionando"}
```

### **3. Verificar Frontend:**
```bash
# Abrir en navegador
http://localhost:3000

# Debe cargar la página principal
```

### **4. Verificar Base de Datos:**
```bash
# Conectar y listar tablas
docker-compose exec db psql -U postgres -d fagsol_db -c "\dt"
```

---

## 🔐 **SEGURIDAD EN PRODUCCIÓN**

### **⚠️ IMPORTANTE: Antes de Desplegar en Producción:**

1. **Cambiar SECRET_KEY:**
   ```bash
   # Generar nuevo secret key
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   
   # Actualizar en .env
   SECRET_KEY=tu-nuevo-secret-key-aqui
   ```

2. **Configurar DEBUG=False:**
   ```env
   DEBUG=False
   ```

3. **Configurar ALLOWED_HOSTS:**
   ```env
   ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
   ```

4. **Usar HTTPS:**
   - Configurar reverse proxy (Nginx/Traefik)
   - Usar certificados SSL

5. **Variables Sensibles:**
   - No commitear `.env` al repositorio
   - Usar secrets management (Docker Secrets, Vault, etc.)

6. **Base de Datos:**
   - Usar contraseñas fuertes
   - No exponer puerto 5432 públicamente
   - Usar conexiones SSL

---

## 📝 **ESTRUCTURA DE VOLÚMENES**

```
postgres_data/     → Datos de PostgreSQL (persistente)
redis_data/        → Datos de Redis (persistente)
backend_static/    → Archivos estáticos de Django
backend_media/     → Archivos media (uploads, CVs, etc.)
```

**Nota:** Los volúmenes persisten aunque elimines los contenedores. Para eliminar datos:
```bash
docker-compose down -v
```

---

## 🎯 **FLUJO DE DESARROLLO**

### **Desarrollo Local con Docker:**
```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Ver logs
docker-compose logs -f

# 3. Hacer cambios en código
# Los cambios se reflejan automáticamente (volúmenes montados)

# 4. Aplicar migraciones si hay cambios en modelos
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# 5. Reiniciar servicio si es necesario
docker-compose restart backend
```

### **Hot Reload:**
- ✅ **Frontend:** Hot reload automático (Next.js)
- ✅ **Backend:** Auto-reload con `runserver` (Django)
- ✅ **Cambios en código:** Se reflejan inmediatamente

---

## 📚 **RECURSOS ADICIONALES**

- **Documentación Docker:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Django en Docker:** https://docs.djangoproject.com/en/stable/howto/deployment/
- **Next.js en Docker:** https://nextjs.org/docs/deployment#docker-image

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Antes de mostrar al cliente, verificar:

- [ ] Todos los servicios están corriendo (`docker-compose ps`)
- [ ] Backend responde en http://localhost:8000/api/v1/auth/health/
- [ ] Frontend carga en http://localhost:3000
- [ ] Swagger funciona en http://localhost:8000/swagger/
- [ ] Admin Django funciona en http://localhost:8000/admin/
- [ ] Se puede crear un usuario desde el frontend
- [ ] Se puede iniciar sesión
- [ ] Dashboard carga correctamente
- [ ] Se puede solicitar ser instructor
- [ ] Admin puede aprobar/rechazar solicitudes

---

**Última actualización:** 2025-01-12

