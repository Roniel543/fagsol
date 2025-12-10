# ⚡ Inicio Rápido - FagSol Escuela Virtual

**Tiempo estimado:** 5-10 minutos

---

## 🎯 **PARA DESARROLLO LOCAL**

### **Opción 1: Docker (Recomendado)**

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# 2. Levantar todos los servicios
docker-compose up -d

# 3. Crear superusuario (solo primera vez)
docker-compose exec backend python manage.py createsuperuser

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Swagger: http://localhost:8000/swagger/
# Admin: http://localhost:8000/admin/
```

### **Opción 2: Instalación Manual**

#### **Backend:**
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

#### **Frontend:**
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Iniciar servidor de desarrollo
npm run dev
```

---

## ✅ **VERIFICAR QUE FUNCIONA**

### **Verificar Servicios:**
```bash
# Docker
docker-compose ps
# Todos deben estar "Up"

# Manual
# Backend: http://localhost:8000/api/v1/auth/health/
# Frontend: http://localhost:3000
```

### **Acceder a:**
- **Frontend:** http://localhost:3000
- **Swagger:** http://localhost:8000/swagger/
- **Admin:** http://localhost:8000/admin/

---

## 🎬 **DEMO RÁPIDA**

1. **Registrarse:** http://localhost:3000/auth/register
2. **Iniciar Sesión:** http://localhost:3000/auth/login
3. **Explorar Cursos:** http://localhost:3000/academy
4. **Agregar al Carrito:** Click en "Agregar al carrito"
5. **Probar Pago:** Ir a checkout (usar tarjetas de prueba)
6. **Panel Admin:** http://localhost:3000/admin/courses

---

## ⚙️ **VARIABLES DE ENTORNO IMPORTANTES**

### **Backend (`backend/.env`):**
```env
# Base de datos
DB_NAME=fagsol_db
DB_USER=postgres
DB_PASSWORD=postgres

# Mercado Pago (TEST para desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx-xxxxx-xxxxx

# Tasa de cambio
DEFAULT_USD_TO_PEN_RATE=3.36
```

### **Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx-xxxxx-xxxxx
```

---

## 🧪 **PROBAR PAGOS (Desarrollo)**

### **Tarjetas de Prueba de Mercado Pago:**

**Visa (Aprobada):**
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/26 (cualquier fecha futura)
```

**Mastercard (Aprobada):**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/26
```

---

## 🛑 **DETENER TODO**

```bash
# Docker
docker-compose down

# Manual
# Ctrl+C en ambas terminales (backend y frontend)
```

-