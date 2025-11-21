# ⚡ Inicio Rápido - FagSol Escuela Virtual

**Tiempo estimado:** 5-10 minutos

---

## 🎯 **PARA EL CLIENTE - VER AVANCES**

### **Opción 1: Script Automático (Recomendado)**

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### **Opción 2: Manual (3 Comandos)**

```bash
# 1. Configurar
cp .env.example .env

# 2. Levantar todo
docker-compose up -d

# 3. Crear admin (solo primera vez)
docker-compose exec backend python manage.py createsuperuser
```

---

## ✅ **VERIFICAR QUE FUNCIONA**

```bash
# Ver estado
docker-compose ps

# Todos deben estar "Up"
```

Luego abrir en el navegador:
- **Frontend:** http://localhost:3000
- **Swagger:** http://localhost:8000/swagger/
- **Admin:** http://localhost:8000/admin/

---

## 🎬 **DEMO RÁPIDA**

1. **Registrarse:** http://localhost:3000/auth/register
2. **Iniciar Sesión:** http://localhost:3000/auth/login
3. **Ver Dashboard:** Se muestra automáticamente
4. **Solicitar Instructor:** Click en "Solicita Ser Instructor"
5. **Como Admin:** Ir a http://localhost:3000/admin/instructor-applications y aprobar
6. **Como Instructor:** Ver nuevo dashboard y crear curso

---

## 🛑 **DETENER TODO**

```bash
docker-compose down
```

---

**📖 Para más detalles:** Ver [GUIA_CLIENTE.md](./GUIA_CLIENTE.md) o [DOCKER_SETUP.md](./DOCKER_SETUP.md)

