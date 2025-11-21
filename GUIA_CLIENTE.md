# 👥 Guía para el Cliente - FagSol Escuela Virtual

**Fecha:** 2025-01-12  
**Versión:** 1.0

---

## 🎯 **BIENVENIDA**

Esta guía está diseñada para que puedas ver y probar los avances del proyecto **FagSol Escuela Virtual** de manera sencilla usando Docker.

---

## 🚀 **INICIO RÁPIDO (3 PASOS)**

### **Paso 1: Instalar Docker Desktop**

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Instala Docker Desktop
3. Inicia Docker Desktop y espera a que esté corriendo (icono de ballena en la barra de tareas)

### **Paso 2: Configurar el Proyecto**

**Windows:**
```powershell
# Abrir PowerShell en la carpeta del proyecto
.\setup.ps1
```

**Linux/Mac:**
```bash
# Abrir terminal en la carpeta del proyecto
chmod +x setup.sh
./setup.sh
```

**O manualmente:**
```bash
# 1. Copiar archivo de configuración
cp .env.example .env

# 2. Levantar servicios
docker-compose up -d

# 3. Aplicar migraciones
docker-compose exec backend python manage.py migrate

# 4. Crear usuario administrador
docker-compose exec backend python manage.py createsuperuser
```

### **Paso 3: Acceder a la Aplicación**

Una vez que los servicios estén corriendo, accede a:

- **🌐 Frontend (Aplicación Principal):** http://localhost:3000
- **📚 API Documentation (Swagger):** http://localhost:8000/swagger/
- **⚙️ Panel de Administración:** http://localhost:8000/admin/

---

## 📱 **FUNCIONALIDADES DISPONIBLES**

### **Para Probar como Estudiante:**

1. **Registro:**
   - Ir a http://localhost:3000/auth/register
   - Completar formulario (solo se registra como estudiante)
   - Iniciar sesión

2. **Dashboard:**
   - Ver estadísticas de cursos inscritos
   - Ver progreso de aprendizaje
   - Explorar catálogo de cursos

3. **Solicitar Ser Instructor:**
   - Desde el dashboard o footer
   - Ir a "Solicita Ser Instructor"
   - Completar formulario de solicitud

### **Para Probar como Instructor:**

1. **Solicitar Ser Instructor:**
   - Como estudiante, solicitar ser instructor
   - Esperar aprobación de admin

2. **Dashboard de Instructor:**
   - Ver estadísticas de cursos creados
   - Ver estudiantes e inscripciones
   - Crear nuevos cursos

3. **Gestionar Cursos:**
   - Crear cursos en estado "draft"
   - Editar cursos propios
   - Ver lista de cursos creados

### **Para Probar como Administrador:**

1. **Acceder al Admin:**
   - Ir a http://localhost:8000/admin/
   - Usar credenciales del superusuario creado

2. **Gestionar Solicitudes de Instructor:**
   - Ir a http://localhost:3000/admin/instructor-applications
   - Revisar solicitudes pendientes
   - Aprobar o rechazar solicitudes

3. **Gestionar Cursos:**
   - Ver todos los cursos
   - Aprobar/rechazar cursos de instructores
   - Gestionar contenido

---

## 🎬 **DEMO SUGERIDA PARA EL CLIENTE**

### **Escenario 1: Flujo Completo de Estudiante a Instructor**

```
1. Registrarse como Estudiante
   → http://localhost:3000/auth/register
   → Completar formulario
   → Iniciar sesión

2. Explorar Dashboard
   → Ver estadísticas (inicialmente en 0)
   → Explorar catálogo de cursos

3. Solicitar Ser Instructor
   → Click en "Solicita Ser Instructor"
   → Completar formulario con:
     - Título Profesional
     - Años de Experiencia
     - Especialidad
     - Motivación (requerido)
   → Enviar solicitud

4. (Como Admin) Aprobar Solicitud
   → Ir a /admin/instructor-applications
   → Ver solicitud pendiente
   → Revisar detalles
   → Aprobar solicitud

5. (Como Instructor) Ver Dashboard
   → Recargar página
   → Ver nuevo dashboard de instructor
   → Ver opción "Crear Nuevo Curso"

6. Crear Curso
   → Click en "Crear Nuevo Curso"
   → Completar formulario
   → Curso se crea en estado "draft"
   → Ver en "Mis Cursos"
```

---

## 🔍 **VERIFICAR QUE TODO FUNCIONA**

### **Checklist de Verificación:**

- [ ] Docker Desktop está corriendo
- [ ] Todos los servicios están "Up" (`docker-compose ps`)
- [ ] Frontend carga en http://localhost:3000
- [ ] Backend responde en http://localhost:8000/api/v1/auth/health/
- [ ] Swagger funciona en http://localhost:8000/swagger/
- [ ] Admin funciona en http://localhost:8000/admin/
- [ ] Se puede registrar un usuario
- [ ] Se puede iniciar sesión
- [ ] Dashboard carga correctamente
- [ ] Se puede solicitar ser instructor
- [ ] Admin puede ver solicitudes

---

## 🛠️ **COMANDOS ÚTILES**

### **Ver Estado:**
```bash
docker-compose ps
```

### **Ver Logs:**
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### **Reiniciar Servicios:**
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend
```

### **Detener Servicios:**
```bash
docker-compose down
```

### **Detener y Eliminar Datos (⚠️ CUIDADO):**
```bash
docker-compose down -v
```

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **"Port already in use"**
- Alguno de los puertos (3000, 8000, 5432) está en uso
- **Solución:** Cambiar puertos en `.env` o detener el proceso que usa el puerto

### **"Cannot connect to database"**
- La base de datos aún no está lista
- **Solución:** Esperar unos segundos y verificar con `docker-compose ps db`

### **"Frontend no carga"**
- Verificar que el contenedor esté corriendo: `docker-compose ps frontend`
- Ver logs: `docker-compose logs frontend`

### **"Error 500 en backend"**
- Verificar logs: `docker-compose logs backend`
- Aplicar migraciones: `docker-compose exec backend python manage.py migrate`

---

## 📊 **ESTADÍSTICAS Y MÉTRICAS**

### **Servicios Corriendo:**
- ✅ PostgreSQL (Base de datos)
- ✅ Redis (Caché)
- ✅ Django Backend (API)
- ✅ Next.js Frontend (Aplicación web)
- ✅ Celery Worker (Tareas asíncronas)

### **Puertos Utilizados:**
- **3000** - Frontend
- **8000** - Backend API
- **5432** - PostgreSQL
- **6379** - Redis

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **[README.md](./README.md)** - Documentación principal del proyecto
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Guía completa de Docker
- **[CONTEXTO_PROYECTO.md](./CONTEXTO_PROYECTO.md)** - Contexto técnico completo

---

## ✅ **PRÓXIMOS PASOS**

Después de verificar que todo funciona:

1. **Explorar la aplicación** navegando por todas las secciones
2. **Probar el flujo completo** de estudiante a instructor
3. **Revisar el panel admin** y sus funcionalidades
4. **Probar la creación de cursos** como instructor
5. **Revisar la documentación API** en Swagger

---

## 📞 **SOPORTE**

Si encuentras algún problema:

1. Revisar los logs: `docker-compose logs -f`
2. Verificar el estado: `docker-compose ps`
3. Consultar la documentación en `DOCKER_SETUP.md`
4. Contactar al equipo de desarrollo

---

**¡Disfruta explorando FagSol Escuela Virtual! 🚀**

**Última actualización:** 2025-01-12

