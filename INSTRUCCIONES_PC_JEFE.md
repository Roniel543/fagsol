# 🚀 Fagsol Academy - Guía de Inicio Profesional

## 📋 Prerrequisitos

### 1. Instalar Docker (Solo Requisito Previo)

**⚠️ IMPORTANTE:** En una máquina limpia, Docker es lo ÚNICO que necesitas instalar. Todo lo demás (Node.js, Python, PostgreSQL) corre dentro de contenedores.

#### Verificar si ya está instalado:

```powershell
docker --version
docker-compose --version
```

#### Si NO está instalado:

1. **Descargar Docker Desktop:**
   - Ir a: https://www.docker.com/products/docker-desktop
   - Click en "Download for Windows"
   - Ejecutar el instalador

2. **Instalar:**
   - Aceptar términos
   - Recomendado: Marcar "Use WSL 2"
   - Reiniciar PC si lo solicita

3. **Iniciar Docker Desktop:**
   - Buscar "Docker Desktop" en el menú inicio
   - Esperar a que el ícono en la bandeja muestre "Docker Desktop is running"

4. **Verificar:**
   ```powershell
   docker --version
   ```
   
   Debe mostrar la versión de Docker.

**📖 Guía completa de instalación:** Ver `INSTALACION_DOCKER.md`

### 2. Navegar al Directorio del Proyecto

```powershell
cd C:\Users\[TU_USUARIO]\Documents\fagsol
# O la ruta donde tengas el proyecto
```

---

## 🔧 Inicio de Servicios

### Paso 1: Configurar Variables de Entorno

```powershell
# Verificar si existe .env
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Archivo .env creado"
}
```

### Paso 2: Construir las Imágenes Docker

```powershell
docker-compose build
```

**Tiempo estimado:** 3-5 minutos (solo primera vez)

### Paso 3: Iniciar los Contenedores

```powershell
docker-compose up -d
```

El flag `-d` ejecuta los contenedores en modo "detached" (segundo plano).

### Paso 4: Verificar Estado de los Servicios

```powershell
docker-compose ps
```

Deberías ver todos los servicios con estado `Up`:
- `fagsol_frontend`
- `fagsol_backend`
- `fagsol_db`
- `fagsol_redis`
- `fagsol_celery`
- `fagsol_celery_beat`

### Paso 5: Ejecutar Migraciones (Primera vez)

```powershell
docker-compose exec backend python manage.py migrate
```

### Paso 6: Crear Superusuario (Primera vez)

```powershell
docker-compose exec backend python create_superuser.py
```

O manualmente:

```powershell
docker-compose exec backend python manage.py createsuperuser
```

---

## 🌐 Acceso a los Servicios

Una vez iniciados, los servicios están disponibles en:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8000/api | - |
| **Admin Panel** | http://localhost:8000/admin | `admin` / `admin123` |
| **PostgreSQL** | localhost:5432 | `fagsol_user` / `fagsol_password_2025` |

---

## 📊 Monitoreo y Logs

### Ver Logs de Todos los Servicios

```powershell
docker-compose logs -f
```

### Ver Logs de un Servicio Específico

```powershell
# Frontend
docker-compose logs -f frontend

# Backend
docker-compose logs -f backend

# Base de datos
docker-compose logs -f db
```

### Ver Estado en Tiempo Real

```powershell
docker-compose ps
```

---

## 🛠️ Comandos Útiles

### Ejecutar Comandos Django

```powershell
# Shell de Django
docker-compose exec backend python manage.py shell

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Collectstatic
docker-compose exec backend python manage.py collectstatic --noinput
```

### Reiniciar un Servicio Específico

```powershell
docker-compose restart frontend
docker-compose restart backend
```

### Reconstruir un Servicio (después de cambios)

```powershell
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

### Ver Uso de Recursos

```powershell
docker stats
```

---

## 🛑 Detener Servicios

### Detener (mantiene contenedores y datos)

```powershell
docker-compose stop
```

### Detener y Eliminar Contenedores

```powershell
docker-compose down
```

### Detener y Eliminar Todo (incluye volúmenes - ⚠️ borra datos)

```powershell
docker-compose down -v
```

---

## 🔄 Reinicio Completo

Si algo falla, reinicia todo desde cero:

```powershell
# 1. Detener y limpiar
docker-compose down -v

# 2. Reconstruir imágenes
docker-compose build --no-cache

# 3. Iniciar servicios
docker-compose up -d

# 4. Esperar 30 segundos
Start-Sleep -Seconds 30

# 5. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 6. Crear superusuario
docker-compose exec backend python create_superuser.py
```

---

## 🐛 Troubleshooting

### Error: "Port already in use"

```powershell
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparezca)
taskkill /PID [PID] /F
```

### Error: "Cannot connect to Docker daemon"

- Abre **Docker Desktop**
- Espera a que el ícono en la bandeja muestre "Docker Desktop is running"
- Verifica con: `docker ps`

### Error: Base de datos no conecta

```powershell
# Ver logs de la base de datos
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db
```

### Limpiar Sistema Docker (si hay problemas)

```powershell
# Limpiar contenedores parados
docker container prune

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (⚠️ cuidadoso)
docker system prune -a --volumes
```

---

## 📝 Checklist Pre-Demo

Antes de mostrar al jefe, verifica:

```powershell
# ✅ Todos los servicios están corriendo
docker-compose ps

# ✅ Frontend responde
curl http://localhost:3000

# ✅ Backend responde
curl http://localhost:8000/admin

# ✅ No hay errores en logs
docker-compose logs --tail=50
```

---

## 🎯 Flujo de Demo Sugerido

1. **Catálogo:** http://localhost:3000/academy/catalog
2. **Detalle de curso:** Click en cualquier curso
3. **Agregar al carrito:** Botón "Agregar al carrito"
4. **Ver carrito:** http://localhost:3000/academy/cart
5. **Checkout:** Proceder al checkout
6. **Formulario:** Completar datos de contacto
7. **Pago demo:** Click en "Pagar con Mercado Pago (demo)"
8. **Éxito:** Ver página de confirmación con matriculación mock

---

## 💼 Puntos Clave para la Presentación

- **Aislamiento:** Todo corre en contenedores Docker, sin afectar el sistema
- **Reproducibilidad:** Funciona igual en cualquier máquina con Docker
- **Escalabilidad:** Arquitectura preparada para producción
- **Profesionalismo:** Separación Frontend/Backend, base de datos, cache, tareas asíncronas

---

**Comando rápido de inicio completo:**

```powershell
docker-compose build && docker-compose up -d && Start-Sleep -Seconds 30 && docker-compose exec backend python manage.py migrate && docker-compose exec backend python create_superuser.py
```

