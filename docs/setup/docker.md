# 🐳 Guía de Docker - Fagsol Academy

Esta guía te ayudará a configurar y ejecutar Fagsol Academy usando Docker de manera profesional.

## 📋 Requisitos Previos

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- Al menos **4GB de RAM** disponibles

### Verificar instalación

```bash
docker --version
docker-compose --version
```

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

**Todos los sistemas:**
```bash
docker-compose build
docker-compose up -d
```

### Opción 2: Manual

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con tus configuraciones si es necesario
   ```

2. **Construir y levantar los servicios:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Ejecutar migraciones:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

4. **Crear superusuario (opcional):**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## 🌐 Acceso a los Servicios

Una vez iniciados, los servicios estarán disponibles en:

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Django)**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Base**: http://localhost:8000/api
- **PostgreSQL**: localhost:5432

## 📦 Servicios Incluidos

- **frontend**: Next.js 14 - Frontend de la aplicación
- **backend**: Django 5.0 - API REST backend
- **db**: PostgreSQL 15 - Base de datos
- **redis**: Redis 7 - Cache y cola de tareas
- **celery**: Worker de Celery para tareas asíncronas
- **celery-beat**: Scheduler para tareas programadas

## 🛠️ Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Ejecutar comandos en contenedores

**Backend (Django):**
```bash
# Migraciones
docker-compose exec backend python manage.py migrate

# Shell de Django
docker-compose exec backend python manage.py shell

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

**Frontend (Next.js):**
```bash
# Instalar nueva dependencia
docker-compose exec frontend npm install <paquete>

# Build de producción
docker-compose exec frontend npm run build
```

### Detener y limpiar

```bash
# Detener servicios (mantiene datos)
docker-compose down

# Detener y eliminar volúmenes (borra datos de DB)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Edita el archivo `.env` para personalizar:

- **Base de datos**: Credenciales y nombre de la BD
- **Frontend URL**: URL pública del frontend
- **CORS**: Orígenes permitidos
- **Mercado Pago**: Credenciales de la API (cuando estén disponibles)

### Volúmenes Persistentes

Los siguientes datos persisten entre reinicios:

- `postgres_data`: Base de datos PostgreSQL
- `redis_data`: Datos de Redis
- `backend_static`: Archivos estáticos del backend
- `backend_media`: Archivos media (uploads)

### Puertos Personalizados

Si necesitas cambiar los puertos, edita `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Cambia 3001 al puerto que prefieras
```

## 🐛 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Verificar qué está usando el puerto
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Cambiar puerto en docker-compose.yml o detener el proceso
```

### Error: Base de datos no conecta

1. Verificar que el contenedor `db` esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verificar logs de la base de datos:
   ```bash
   docker-compose logs db
   ```

3. Reiniciar la base de datos:
   ```bash
   docker-compose restart db
   ```

### Error: Migraciones pendientes

```bash
docker-compose exec backend python manage.py migrate
```

### Limpiar todo y empezar de nuevo

```bash
# ⚠️ ADVERTENCIA: Esto elimina TODOS los datos
docker-compose down -v
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d
```

### Reconstruir un servicio específico

```bash
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

## 📝 Desarrollo

### Hot Reload

El código está montado como volumen, por lo que los cambios se reflejan automáticamente:

- **Frontend**: Cambios en `frontend/` se reflejan inmediatamente
- **Backend**: Cambios en `backend/` requieren reinicio del servidor Django (o usa `python manage.py runserver` con auto-reload)

### Agregar nuevas dependencias

**Frontend:**
```bash
docker-compose exec frontend npm install <paquete>
# Luego actualiza package.json manualmente si es necesario
```

**Backend:**
```bash
# Edita requirements.txt, luego:
docker-compose exec backend pip install <paquete>
docker-compose restart backend
```

## 🚢 Producción

Para producción, considera:

1. **Usar imágenes optimizadas** (multi-stage builds)
2. **Configurar HTTPS** con un proxy reverso (nginx)
3. **Usar secrets** para variables sensibles
4. **Configurar backups** de la base de datos
5. **Monitoreo y logs** centralizados
6. **Variables de entorno** seguras

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js con Docker](https://nextjs.org/docs/deployment#docker-image)
- [Django con Docker](https://docs.djangoproject.com/en/stable/howto/deployment/docker/)

## ✅ Checklist Pre-Demo

Antes de mostrar al jefe, verifica:

- [ ] Todos los servicios están corriendo (`docker-compose ps`)
- [ ] Frontend carga correctamente (http://localhost:3000)
- [ ] Backend responde (http://localhost:8000/admin)
- [ ] Las migraciones están aplicadas
- [ ] El superusuario está creado (si es necesario)
- [ ] Los logs no muestran errores críticos
- [ ] El flujo de checkout funciona (mock)

¡Listo para la demo! 🎉

