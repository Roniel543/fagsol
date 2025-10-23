# 🐳 Guía Rápida de Comandos Docker - FagSol

## 🚀 Comandos Principales

### **Levantar todos los servicios (primera vez)**
```bash
docker-compose up -d --build
```
- `up`: Levanta los contenedores
- `-d`: En modo detached (background)
- `--build`: Construye las imágenes

### **Ver estado de los servicios**
```bash
docker-compose ps
```

### **Ver logs en tiempo real**
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### **Detener todos los servicios**
```bash
docker-compose down
```

### **Reiniciar un servicio específico**
```bash
docker-compose restart backend
docker-compose restart frontend
```

---

## 🗄️ Comandos de Base de Datos

### **Ejecutar migraciones**
```bash
docker-compose exec backend python manage.py migrate
```

### **Crear superusuario**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### **Crear nuevas migraciones**
```bash
docker-compose exec backend python manage.py makemigrations
```

### **Shell de Django**
```bash
docker-compose exec backend python manage.py shell
```

### **Acceder a PostgreSQL**
```bash
docker-compose exec db psql -U fagsol_user -d fagsol_db
```

---

## 🧹 Comandos de Limpieza

### **Eliminar contenedores y volúmenes (CUIDADO: Borra la DB)**
```bash
docker-compose down -v
```

### **Reconstruir todo desde cero**
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### **Ver espacio usado por Docker**
```bash
docker system df
```

### **Limpiar contenedores, imágenes y caché**
```bash
docker system prune -a
```

---

## 🔧 Comandos de Desarrollo

### **Instalar dependencias Python**
```bash
docker-compose exec backend pip install nombre-paquete
docker-compose exec backend pip freeze > requirements.txt
```

### **Instalar dependencias Node.js**
```bash
docker-compose exec frontend npm install nombre-paquete
```

### **Ejecutar tests**
```bash
# Backend
docker-compose exec backend python manage.py test

# Frontend
docker-compose exec frontend npm test
```

### **Recolectar archivos estáticos**
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## 🐛 Troubleshooting

### **Error: Puerto ya en uso**
```bash
# Ver qué usa el puerto 8000
netstat -ano | findstr :8000

# Cambiar puerto en docker-compose.yml o matar el proceso
```

### **Error: Cannot connect to Docker daemon**
```bash
# Asegúrate de que Docker Desktop esté corriendo
# Verifica en la barra de tareas (icono de ballena)
```

### **Contenedor no inicia correctamente**
```bash
# Ver logs detallados
docker-compose logs backend

# Reconstruir el contenedor
docker-compose up -d --build --force-recreate backend
```

### **Base de datos corrupta o problemas de permisos**
```bash
# Eliminar volumen y recrear
docker-compose down
docker volume rm fagsol_postgres_data
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

---

## 📊 Comandos de Monitoreo

### **Ver uso de recursos**
```bash
docker stats
```

### **Inspeccionar un contenedor**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

### **Ver redes de Docker**
```bash
docker network ls
docker network inspect fagsol_default
```

---

## 🔥 Secuencia Completa de Inicio (Copia y Pega)

```bash
# 1. Levantar servicios
docker-compose up -d --build

# 2. Esperar a que PostgreSQL esté listo (30 segundos)
timeout /t 30 /nobreak

# 3. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 4. Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# 5. Verificar que todo esté corriendo
docker-compose ps

# 6. Ver logs
docker-compose logs -f
```

---

## 🌐 URLs de Acceso

Después de levantar:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Django:** http://localhost:8000/admin
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

---

## ✨ Tips Útiles

1. **Siempre usa `-d`** para correr en background
2. **Usa `logs -f`** para debugging en tiempo real
3. **No uses `down -v`** a menos que quieras borrar la DB
4. **Reinicia Docker Desktop** si algo no funciona
5. **Verifica `.env`** si hay problemas de conexión

---

**¡Guarda este archivo para referencia rápida! 🚀**

