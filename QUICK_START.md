# 🚀 Inicio Rápido - Demo para el Jefe

## ⚡ Pasos Rápidos (5 minutos)

### 1️⃣ Instalar Docker (Único Requisito Previo)

**⚠️ IMPORTANTE:** En una máquina limpia, **Docker es lo único que necesitas instalar**. 
Todo lo demás (Node.js, Python, PostgreSQL, Redis) corre dentro de contenedores Docker.

#### Verificar si ya está instalado:
```bash
docker --version
docker-compose --version
```

#### Si NO está instalado:

1. **Descargar Docker Desktop:**
   - https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Ejecutar instalador

2. **Instalar y reiniciar** si lo solicita

3. **Abrir Docker Desktop** desde el menú inicio
   - Esperar a que el ícono en la bandeja muestre "Docker Desktop is running"

4. **Verificar:**
   ```bash
   docker --version
   ```

**📖 Guía detallada:** Ver `INSTALACION_DOCKER.md`

### 2️⃣ Clonar el Repositorio (Máquina Nueva)

Si es la primera vez en esta máquina:

```bash
# Navegar a donde quieras el proyecto
cd C:\Users\[TU_USUARIO]\Documents

# Clonar repositorio
git clone [URL_DEL_REPOSITORIO]

# Entrar al directorio
cd fagsol
```

**O si ya tienes el código:**

```bash
cd ruta\donde\tengas\fagsol
```

### 3️⃣ Configurar Variables (Solo primera vez)
```bash
# Si no existe .env, copia el ejemplo
copy .env.example .env
```

### 3️⃣ Configurar Variables de Entorno
```bash
Copy-Item .env.example .env
```

### 4️⃣ Iniciar Todo
```bash
# Construir imágenes (primera vez - 5-10 min)
docker-compose build

# Iniciar servicios
docker-compose up -d
```

O todo en uno:
```bash
docker-compose up -d --build
```

⏳ Espera 1-2 minutos mientras inician todos los servicios

### 5️⃣ Inicializar Base de Datos (Primera vez)
```bash
# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python create_superuser.py
```

### 6️⃣ Verificar que Todo Funciona

**Verificar servicios:**
```bash
docker-compose ps
```
Todos deben mostrar estado "Up"

**Abrir en el navegador:**
- ✅ Frontend: http://localhost:3000
- ✅ Backend Admin: http://localhost:8000/admin (admin/admin123)

### 7️⃣ Mostrar la Demo

**Flujo a mostrar:**
1. Ir a `/academy/catalog` - Ver catálogo
2. Agregar cursos al carrito
3. Ir al carrito `/academy/cart`
4. Checkout `/academy/checkout`
5. Completar formulario
6. "Pagar con Mercado Pago (demo)" → Redirige a success
7. Mostrar inscripciones mock funcionando

## 🔧 Si Algo Falla

### Ver qué está corriendo:
```bash
docker-compose ps
```

### Ver logs:
```bash
docker-compose logs -f
```

### Reiniciar todo:
```bash
docker-compose restart
```

### Si no inicia, reconstruir:
```bash
docker-compose down
docker-compose up -d --build
```

## 📋 Checklist Pre-Demo

Antes de mostrar al jefe:
- [ ] Docker Desktop está corriendo (ícono en la barra de tareas)
- [ ] Ejecutaste `docker-compose up -d`
- [ ] Esperaste 2-3 minutos a que todos los servicios inicien
- [ ] Verificaste que http://localhost:3000 carga
- [ ] Verificaste que http://localhost:8000/admin carga
- [ ] Tienes el flujo de demo preparado mentalmente

## 💡 Puntos Clave para Explicar

1. **"Todo funciona en Docker"** - Aislado, reproducible, fácil de desplegar
2. **"Listo para producción"** - Solo falta conectar APIs reales de pago
3. **"Arquitectura profesional"** - Frontend/Backend separados, base de datos, cache, tareas asíncronas
4. **"Escalable"** - Puede crecer fácilmente

## ⏱️ Tiempo Total
- Instalación Docker (si no está): 5 min
- Setup proyecto: 2 min
- Inicio servicios: 3 min
- **Total: ~10 minutos máximo**

---

**¡Éxito en la demo! 🎉**

