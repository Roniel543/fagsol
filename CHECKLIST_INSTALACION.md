# ✅ Checklist de Instalación - FagSol

## 📋 **Estado de la Instalación**

### **COMPLETADO** ✅
- [x] Estructura del proyecto creada
- [x] Backend Django configurado
- [x] Frontend Next.js configurado
- [x] Docker Compose configurado
- [x] Archivo .env creado
- [x] Documentación generada

### **EN PROCESO** ⏳
- [ ] Docker Desktop instalado
- [ ] Docker Desktop corriendo

### **PENDIENTE** 📝
- [ ] Servicios Docker levantados
- [ ] Migraciones ejecutadas
- [ ] Superusuario creado
- [ ] Acceso al proyecto validado

---

## 🎯 **Siguiente: Cuando Docker esté listo**

### **1. Verificar Docker**
Abre PowerShell y ejecuta:
```powershell
docker --version
docker-compose --version
```

**Debes ver algo como:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### **2. Opción A: Script Automático (Recomendado) 🚀**

Ejecuta el script que preparé:
```powershell
.\start-project.ps1
```

Este script hará TODO automáticamente:
- ✅ Verifica Docker
- ✅ Levanta servicios
- ✅ Espera a PostgreSQL
- ✅ Ejecuta migraciones
- ✅ Te muestra las URLs

---

### **3. Opción B: Comandos Manuales 🔧**

Si prefieres hacerlo paso a paso:

```powershell
# Paso 1: Levantar servicios
docker-compose up -d --build

# Paso 2: Ver estado (espera a que todos estén "Up")
docker-compose ps

# Paso 3: Ejecutar migraciones (espera 30 segundos después del paso 1)
docker-compose exec backend python manage.py migrate

# Paso 4: Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Paso 5: Ver logs
docker-compose logs -f
```

---

## 🌐 **Acceder al Proyecto**

Una vez levantado:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación Next.js |
| **API** | http://localhost:8000/api | API REST de Django |
| **Admin** | http://localhost:8000/admin | Panel de administración |

---

## 🐛 **Si algo sale mal...**

### **Docker Desktop no inicia:**
1. Reinicia tu computadora
2. Abre Docker Desktop como Administrador
3. Verifica que la virtualización esté habilitada en BIOS

### **Puerto en uso:**
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Cambiar puerto en docker-compose.yml si es necesario
```

### **Error de permisos:**
```powershell
# Ejecuta PowerShell como Administrador
```

### **Contenedor no inicia:**
```powershell
# Ver logs del contenedor problemático
docker-compose logs backend
docker-compose logs db
```

---

## 📞 **Necesitas Ayuda?**

Si encuentras algún error:
1. Copia el mensaje de error completo
2. Ejecuta: `docker-compose logs [servicio]`
3. Comparte los logs

---

## 🎉 **Cuando Todo Esté Funcionando**

1. ✅ Accede a http://localhost:8000/admin
2. ✅ Ingresa con tu superusuario
3. ✅ Accede a http://localhost:3000
4. ✅ ¡Empieza a desarrollar!

---

**💡 Tip:** Guarda este checklist y márcalo conforme avances.

**📚 Otros recursos:**
- `DOCKER_COMMANDS.md` - Referencia de comandos
- `SETUP.md` - Guía completa de configuración
- `ARQUITECTURA.md` - Arquitectura del proyecto

