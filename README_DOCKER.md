# 🐳 Fagsol Academy - Setup con Docker

## 🎯 Resumen

Este proyecto usa **Docker** para que funcione en cualquier máquina sin instalar dependencias manualmente.

**Requisito Único:** Docker Desktop

**NO necesitas instalar:**
- ❌ PostgreSQL (corre en Docker)
- ❌ pgAdmin (opcional)
- ❌ Node.js, Python, Redis (todo corre en Docker)

👉 **¿Nuevo en Docker?** Ver: `DOCKER_EXPLICACION.md` para entender cómo funciona

---

## ⚡ Inicio Rápido - Desde Cero

### Opción 1: Desde Git (Máquina Nueva)

```powershell
# 1. Instalar Docker Desktop (si no está)
# Ver: INSTALACION_DOCKER.md

# 2. Clonar repositorio
git clone [URL_DEL_REPOSITORIO]
cd fagsol

# 3. Configurar .env
Copy-Item .env.example .env

# 4. Construir e iniciar
docker-compose build
docker-compose up -d

# 5. Inicializar BD (primera vez)
docker-compose exec backend python manage.py migrate
docker-compose exec backend python create_superuser.py
```

👉 **Guía completa paso a paso:** Ver `SETUP_COMPLETO.md`

### Opción 2: Ya Tienes el Código

```powershell
# Navegar al proyecto
cd ruta\del\proyecto\fagsol

# Configurar .env (si no existe)
if (!(Test-Path .env)) { Copy-Item .env.example .env }

# Construir e iniciar
docker-compose build
docker-compose up -d

# Verificar
docker-compose ps
```

**¡Listo!** Servicios disponibles en:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin (admin/admin123)

---

## 📚 Documentación Completa

- **`DOCKER_EXPLICACION.md`** ⭐ - **¿Qué es Docker? ¿Necesito instalar PostgreSQL? (Para principiantes)**
- **`SETUP_COMPLETO.md`** - Guía completa desde git clone hasta funcionando
- **`INSTALACION_DOCKER.md`** - Cómo instalar Docker Desktop
- **`QUICK_START.md`** - Inicio rápido para demo
- **`COMANDOS_RAPIDOS.md`** - Referencia de comandos útiles
- **`DOCKER.md`** - Documentación técnica completa

---

## 🔧 Comandos Esenciales

```powershell
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart
```

---

## ✅ Ventajas de Usar Docker

✓ **Sin instalar dependencias** - Solo Docker necesario
✓ **Reproducible** - Funciona igual en cualquier máquina
✓ **Aislado** - No afecta tu sistema
✓ **Profesional** - Estándar de la industria
✓ **Fácil despliegue** - Mismo setup para desarrollo y producción

---

## 🆘 Problemas Comunes

**Docker no inicia:**
- Verificar que Virtualización esté habilitada en BIOS
- Ver `INSTALACION_DOCKER.md` - Sección "Solución de Problemas"

**Puertos ocupados:**
```powershell
netstat -ano | findstr :3000
# Si hay procesos, detenerlos o cambiar puertos en docker-compose.yml
```

**Servicios no inician:**
```powershell
docker-compose logs -f
# Ver logs para identificar el problema
```

---

**¡Todo listo para la demo! 🚀**

