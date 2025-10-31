# 🚀 Setup Completo - De Cero a Funcionando

## 📋 Flujo Completo (Paso a Paso)

### 1️⃣ Instalar Docker Desktop

**⚠️ ÚNICO REQUISITO PREVIO - NO necesitas instalar nada más**

**NO necesitas instalar:**
- ❌ PostgreSQL (corre en Docker)
- ❌ pgAdmin (opcional, no necesario)
- ❌ Node.js (corre en Docker)
- ❌ Python (corre en Docker)
- ❌ Redis (corre en Docker)

**SOLO necesitas:**
- ✅ Docker Desktop

👉 Ver guía detallada: `INSTALACION_DOCKER.md`
👉 **¿Nuevo en Docker?** Ver: `DOCKER_EXPLICACION.md` para entender cómo funciona

**Resumen:**
1. Ir a: https://www.docker.com/products/docker-desktop
2. Descargar "Download for Windows"
3. Instalar y reiniciar si lo solicita
4. Abrir Docker Desktop desde menú inicio
5. Esperar a que el ícono en la bandeja muestre "Docker Desktop is running"
6. Verificar: `docker --version`

---

### 2️⃣ Clonar el Repositorio

```powershell
# Navegar a donde quieras el proyecto (ej: Documents)
cd C:\Users\[TU_USUARIO]\Documents

# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Entrar al directorio
cd fagsol
```

**Ejemplo:**
```powershell
cd C:\Users\deadmau5\Documents
git clone https://github.com/tu-usuario/fagsol.git
cd fagsol
```

---

### 3️⃣ Configurar Variables de Entorno

```powershell
# Copiar archivo de ejemplo a .env
Copy-Item .env.example .env
```

**Nota:** El archivo `.env.example` ya tiene valores por defecto que funcionan. Solo modifica si necesitas cambiar algo específico.

---

### 4️⃣ Construir las Imágenes Docker

```powershell
docker-compose build
```

**⏳ Tiempo estimado:** 5-10 minutos (solo primera vez)
- Descarga las imágenes base
- Instala dependencias del frontend (Node.js)
- Instala dependencias del backend (Python)

---

### 5️⃣ Iniciar los Servicios

```powershell
docker-compose up -d
```

El flag `-d` ejecuta en segundo plano (detached mode).

**⏳ Tiempo estimado:** 1-2 minutos
- Inicia PostgreSQL
- Inicia Redis
- Inicia Backend (Django)
- Inicia Frontend (Next.js)
- Inicia Celery workers

---

### 6️⃣ Verificar que Todo Está Corriendo

```powershell
docker-compose ps
```

**Deberías ver:**
```
NAME                   STATUS              PORTS
fagsol_backend        Up (healthy)        0.0.0.0:8000->8000/tcp
fagsol_frontend       Up                   0.0.0.0:3000->3000/tcp
fagsol_db             Up (healthy)        0.0.0.0:5432->5432/tcp
fagsol_redis          Up (healthy)        0.0.0.0:6379->6379/tcp
fagsol_celery         Up
fagsol_celery_beat    Up
```

Todos deben mostrar estado `Up`.

---

### 7️⃣ Ejecutar Migraciones (Primera vez)

```powershell
docker-compose exec backend python manage.py migrate
```

Esto crea las tablas en la base de datos.

---

### 8️⃣ Crear Superusuario (Primera vez)

```powershell
docker-compose exec backend python create_superuser.py
```

O manualmente:
```powershell
docker-compose exec backend python manage.py createsuperuser
```

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin123`

---

### 9️⃣ Verificar en el Navegador

Abre tu navegador y visita:

- ✅ **Frontend:** http://localhost:3000
- ✅ **Backend Admin:** http://localhost:8000/admin
- ✅ **API:** http://localhost:8000/api

---

## 🎯 Resumen Rápido (Copy-Paste)

```powershell
# 1. Clonar repositorio
git clone [URL_DEL_REPO]
cd fagsol

# 2. Configurar .env
Copy-Item .env.example .env

# 3. Construir e iniciar
docker-compose build
docker-compose up -d

# 4. Esperar 30 segundos
Start-Sleep -Seconds 30

# 5. Inicializar BD
docker-compose exec backend python manage.py migrate
docker-compose exec backend python create_superuser.py

# 6. Verificar
docker-compose ps
```

**¡Listo!** Abre http://localhost:3000 🎉

---

## 🔍 Verificar Logs (Si algo falla)

```powershell
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

---

## 🛠️ Comandos Útiles

### Ver estado de servicios
```powershell
docker-compose ps
```

### Detener servicios
```powershell
docker-compose down
```

### Reiniciar servicios
```powershell
docker-compose restart
```

### Reconstruir después de cambios
```powershell
docker-compose up -d --build
```

---

## ❌ Si Algo Sale Mal

### Error: "Cannot connect to Docker daemon"
- Verificar que Docker Desktop esté corriendo
- Revisar el ícono en la bandeja del sistema

### Error: "Port already in use"
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Limpiar todo y empezar de nuevo
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Más Información

- **Instalación Docker:** `INSTALACION_DOCKER.md`
- **Comandos rápidos:** `COMANDOS_RAPIDOS.md`
- **Guía completa:** `DOCKER.md`
- **Demo rápida:** `QUICK_START.md`

---

**¡Todo listo para comenzar a trabajar! 🚀**

