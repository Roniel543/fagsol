# ✅ Configuración de Variables de Entorno - COMPLETA

## 📁 Estructura Final

**✅ Un solo archivo `.env` en la raíz del proyecto**

Todos los servicios (Backend, Frontend, Database) leen las variables desde el `.env` de la raíz.

---

## 🔧 Cambios Realizados

### 1. **docker-compose.yml** ✅
- ✅ Agregada `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` al frontend
- ✅ Corregida URL de API: `/api/v1` (antes era `/api`)
- ✅ Agregadas variables al backend:
  - `CORS_ALLOWED_ORIGINS`
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET`
  - `JWT_SECRET_KEY`

### 2. **ENVIRONMENT_VARIABLES.txt** ✅
- ✅ Corregida URL de API: `/api/v1`
- ✅ Agregada `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` en sección FRONTEND
- ✅ Eliminada `MERCADOPAGO_PUBLIC_KEY` (duplicada)
- ✅ Agregada `FRONTEND_URL` para backend
- ✅ Organizadas las variables por secciones

---

## 📋 Variables Requeridas en `.env` (Raíz)

### **Backend - Django**
```bash
SECRET_KEY=tu-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=fagsol_db
DB_USER=fagsol_user
DB_PASSWORD=tu-password
DB_HOST=db
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
JWT_SECRET_KEY=tu-jwt-secret
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret
```

### **Frontend - Next.js**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key
```

---

## 🚀 Cómo Usar

### **1. Crear el archivo `.env`**
```bash
# En la raíz del proyecto
cp ENVIRONMENT_VARIABLES.txt .env
```

### **2. Editar `.env`**
Agrega tus credenciales reales (especialmente Mercado Pago).

### **3. Eliminar `.env` de frontend (si existe)**
```bash
# Si tienes frontend/.env.local, elimínalo
rm frontend/.env.local
rm frontend/.env
```

### **4. Reiniciar Docker**
```bash
docker-compose down
docker-compose up -d
```

---

## ✅ Verificación

### **Frontend**
- ✅ `NEXT_PUBLIC_API_URL` apunta a `/api/v1`
- ✅ `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` configurada
- ✅ Variables pasadas desde Docker Compose

### **Backend**
- ✅ `MERCADOPAGO_ACCESS_TOKEN` configurado
- ✅ `CORS_ALLOWED_ORIGINS` configurado
- ✅ `JWT_SECRET_KEY` configurado
- ✅ `FRONTEND_URL` configurado

---

## 🔒 Seguridad

- ✅ `.env` está en `.gitignore` (no se sube al repositorio)
- ✅ `NEXT_PUBLIC_*` son seguras para frontend (públicas)
- ✅ `MERCADOPAGO_ACCESS_TOKEN` solo en backend (secreto)
- ✅ `SECRET_KEY` y `JWT_SECRET_KEY` son secretos

---

## 📝 Notas

- **Docker Compose** lee automáticamente el `.env` de la raíz
- **Django** (python-decouple) busca `.env` en la raíz
- **Next.js** recibe variables desde Docker Compose (no necesita `.env.local`)
- Si ejecutas Next.js **sin Docker**, necesitarías `frontend/.env.local`

---

**✅ Configuración lista para usar con Docker Compose**

