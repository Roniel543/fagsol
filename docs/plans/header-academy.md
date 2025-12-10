# 🎯 Plan: Header Academy con Autenticación

**Fecha:** 2025-01-12  
**Objetivo:** Implementar header de Academy que detecte sesión y muestre opciones según estado de autenticación

---

## 📊 **ESTADO ACTUAL**

### ✅ **Lo que ya existe:**
- `AcademyHeader` con navegación básica
- Sistema de autenticación (`useAuth`)
- Rutas de Academy (`/academy`, `/academy/catalog`, etc.)
- Enlaces a: Explorar, Mis Cursos, Mi Progreso, Mi Perfil

### ❌ **Lo que falta:**
- Detección de sesión en `AcademyHeader`
- Mostrar diferentes opciones según autenticación
- Páginas para: `/academy/mis-cursos`, `/academy/progreso`, `/academy/perfil`
- Flujo de redirección después de login/registro desde Academy
- Botones de Login/Registro cuando NO hay sesión

---

## 🎯 **FLUJO DE NAVEGACIÓN**

### **1. Usuario SIN sesión (No autenticado)**

**Header muestra:**
- Logo y búsqueda (siempre visible)
- Botones: **"Iniciar Sesión"** y **"Registrarse"**
- Enlaces protegidos ocultos o redirigen a login

**Enlaces que requieren autenticación:**
- "Mis Cursos" → Redirige a `/auth/login?redirect=/academy/mis-cursos`
- "Mi Progreso" → Redirige a `/auth/login?redirect=/academy/progreso`
- "Mi Perfil" → Redirige a `/auth/login?redirect=/academy/perfil`
- "Mi Carrito" → Puede funcionar sin sesión (usando localStorage)

---

### **2. Usuario CON sesión (Autenticado)**

**Header muestra:**
- Logo y búsqueda
- Enlaces: **Explorar**, **Mis Cursos**, **Mi Progreso**
- **Mi Carrito** (con badge de cantidad)
- **Mi Perfil** (botón destacado con avatar/icono)
- Menú desplegable con opciones:
  - Ver perfil
  - Ir al Dashboard
  - Cerrar Sesión

**Enlaces funcionales:**
- `/academy/catalog` → Catálogo de cursos
- `/academy/mis-cursos` → Cursos inscritos del usuario
- `/academy/progreso` → Progreso y estadísticas
- `/academy/perfil` → Perfil del usuario
- `/academy/cart` → Carrito de compras

---

### **3. Flujo de Login/Registro desde Academy**

#### **Opción A: Login desde Academy**
1. Usuario hace clic en "Iniciar Sesión"
2. Redirige a `/auth/login?redirect=/academy` (o página actual)
3. Usuario ingresa credenciales
4. **Después de login exitoso:**
   - Si hay `redirect` → Redirige a esa URL
   - Si no hay `redirect` → Redirige a `/academy` (home de Academy)
   - Actualiza header para mostrar opciones autenticadas

#### **Opción B: Registro desde Academy**
1. Usuario hace clic en "Registrarse"
2. Redirige a `/auth/register?redirect=/academy`
3. Usuario completa formulario
4. **Después de registro exitoso:**
   - Si hay `redirect` → Redirige a esa URL
   - Si no hay `redirect` → Redirige a `/academy` (home de Academy)
   - Usuario queda autenticado automáticamente
   - Header muestra opciones autenticadas

---

## 🚀 **IMPLEMENTACIÓN**

### **FASE 1: Actualizar AcademyHeader** ⭐⭐⭐

#### **1.1 Integrar useAuth**
- Importar `useAuth` en `AcademyHeader`
- Detectar `isAuthenticated` y `user`*9+-
- Mostrar diferentes opciones según estado

#### **1.2 Botones según autenticación**

**Sin sesión:**
```tsx
<Button href="/auth/login?redirect=/academy">Iniciar Sesión</Button>
<Button href="/auth/register?redirect=/academy" variant="primary">Registrarse</Button>
```

**Con sesión:**
```tsx
<nav>
  <Link href="/academy/catalog">Explorar</Link>
  <Link href="/academy/mis-cursos">Mis Cursos</Link>
  <Link href="/academy/progreso">Mi Progreso</Link>
</nav>
<MiniCart />
<ProfileDropdown user={user} />
```

#### **1.3 Menú de perfil desplegable**
- Avatar/icono del usuario
- Nombre y email
- Opciones:
  - Ver Perfil → `/academy/perfil`
  - Dashboard → `/dashboard` (según rol)
  - Cerrar Sesión

**Archivos a modificar:**
- `frontend/src/features/academy/components/AcademyHeader.tsx`

---

### **FASE 2: Crear páginas faltantes** ⭐⭐

#### **2.1 Página "Mis Cursos"** (`/academy/mis-cursos`)
- Lista de cursos en los que el usuario está inscrito
- Mostrar progreso de cada curso
- Acceso rápido a continuar aprendiendo
- Filtros: Todos, En Progreso, Completados

**Archivos a crear:**
- `frontend/src/app/academy/mis-cursos/page.tsx`
- `frontend/src/features/academy/pages/MyCoursesPage.tsx`

#### **2.2 Página "Mi Progreso"** (`/academy/progreso`)
- Estadísticas generales:
  - Cursos completados
  - Cursos en progreso
  - Horas estudiadas
  - Certificados obtenidos
- Gráficos de progreso
- Timeline de actividad

**Archivos a crear:**
- `frontend/src/app/academy/progreso/page.tsx`
- `frontend/src/features/academy/pages/MyProgressPage.tsx`

#### **2.3 Página "Mi Perfil"** (`/academy/perfil`)
- Información del usuario
- Editar perfil (nombre, email, foto)
- Cambiar contraseña
- Preferencias
- Historial de compras
- Certificados

**Archivos a crear:**
- `frontend/src/app/academy/perfil/page.tsx`
- `frontend/src/features/academy/pages/ProfilePage.tsx`

---

### **FASE 3: Actualizar flujo de Login/Registro** ⭐

#### **3.1 Soporte de redirect en LoginForm**
- Leer parámetro `redirect` de la URL
- Después de login exitoso, redirigir a esa URL
- Si no hay redirect, usar default (`/dashboard` o `/academy`)

**Archivos a modificar:**
- `frontend/src/features/auth/components/LoginForm.tsx`

#### **3.2 Soporte de redirect en RegisterForm**
- Leer parámetro `redirect` de la URL
- Después de registro exitoso, redirigir a esa URL
- Si no hay redirect, usar default (`/academy`)

**Archivos a modificar:**
- `frontend/src/features/auth/components/RegisterForm.tsx`

---

## 📋 **ESTRUCTURA DE ARCHIVOS**

```
frontend/src/
├── app/
│   └── academy/
│       ├── mis-cursos/
│       │   └── page.tsx          (nuevo)
│       ├── progreso/
│       │   └── page.tsx          (nuevo)
│       └── perfil/
│           └── page.tsx          (nuevo)
│
└── features/
    ├── academy/
    │   ├── components/
    │   │   ├── AcademyHeader.tsx (modificar)
    │   │   └── ProfileDropdown.tsx (nuevo)
    │   └── pages/
    │       ├── MyCoursesPage.tsx (nuevo)
    │       ├── MyProgressPage.tsx (nuevo)
    │       └── ProfilePage.tsx   (nuevo)
    │
    └── auth/
        └── components/
            ├── LoginForm.tsx     (modificar)
            └── RegisterForm.tsx  (modificar)
```

---

## 🎨 **DISEÑO DEL HEADER**

### **Desktop (≥ 1024px)**

**Sin sesión:**
```
[Logo] [Búsqueda]                    [Iniciar Sesión] [Registrarse]
```

**Con sesión:**
```
[Logo] [Búsqueda] [Explorar] [Mis Cursos] [Mi Progreso] [Carrito] [Avatar ▼]
```

### **Mobile (< 1024px)**

**Sin sesión:**
```
[Logo]                                    [☰]
  └─ Menú: [Iniciar Sesión] [Registrarse]
```

**Con sesión:**
```
[Logo]                                    [Avatar]
  └─ Menú: [Explorar] [Mis Cursos] [Mi Progreso] [Carrito] [Perfil] [Cerrar Sesión]
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Fase 1: Header con Autenticación**
- [ ] Integrar `useAuth` en `AcademyHeader`
- [ ] Mostrar botones Login/Registro cuando NO hay sesión
- [ ] Mostrar enlaces autenticados cuando HAY sesión
- [ ] Crear componente `ProfileDropdown`
- [ ] Implementar menú móvil con opciones según autenticación
- [ ] Proteger enlaces que requieren autenticación

### **Fase 2: Páginas**
- [ ] Crear página "Mis Cursos" (`/academy/mis-cursos`)
- [ ] Crear página "Mi Progreso" (`/academy/progreso`)
- [ ] Crear página "Mi Perfil" (`/academy/perfil`)
- [ ] Implementar ProtectedRoute en páginas que requieren autenticación

### **Fase 3: Flujo de Login/Registro**
- [ ] Agregar soporte de `redirect` en `LoginForm`
- [ ] Agregar soporte de `redirect` en `RegisterForm`
- [ ] Probar flujo completo de login desde Academy
- [ ] Probar flujo completo de registro desde Academy

---

## 🔄 **FLUJO COMPLETO**

### **Escenario 1: Usuario nuevo visita Academy**
1. Usuario entra a `/academy`
2. Ve header con botones "Iniciar Sesión" y "Registrarse"
3. Hace clic en "Registrarse"
4. Completa formulario en `/auth/register?redirect=/academy`
5. Después de registro → Redirige a `/academy`
6. Header ahora muestra opciones autenticadas
7. Puede navegar a "Mis Cursos", "Mi Progreso", etc.

### **Escenario 2: Usuario existente visita Academy**
1. Usuario entra a `/academy`
2. Si tiene sesión activa → Header muestra opciones autenticadas
3. Si NO tiene sesión → Ve botones de login/registro
4. Hace clic en "Iniciar Sesión"
5. Ingresa credenciales en `/auth/login?redirect=/academy`
6. Después de login → Redirige a `/academy`
7. Header actualizado con opciones autenticadas

### **Escenario 3: Usuario autenticado navega**
1. Usuario está en `/academy` (autenticado)
2. Hace clic en "Mis Cursos" → Va a `/academy/mis-cursos`
3. Ve lista de cursos inscritos
4. Hace clic en "Mi Progreso" → Va a `/academy/progreso`
5. Ve estadísticas y gráficos
6. Hace clic en avatar → Menú desplegable
7. Selecciona "Cerrar Sesión" → Vuelve a `/academy` sin sesión

---

## 🎯 **PRIORIDADES**

1. **ALTA:** Integrar autenticación en AcademyHeader
2. **ALTA:** Crear páginas básicas (Mis Cursos, Progreso, Perfil)
3. **MEDIA:** Implementar redirect en Login/Register
4. **BAJA:** Mejoras de UI y animaciones

---

## 📝 **NOTAS**

- Todas las páginas de Academy deben usar `AcademyHeader`
- Las páginas protegidas deben usar `ProtectedRoute`
- El redirect debe preservar la URL completa (incluyendo query params)
- Considerar usar `useRouter` de Next.js para navegación

---

## ✅ **SIGUIENTE PASO**

¿Empezamos con la Fase 1? Recomiendo comenzar integrando `useAuth` en `AcademyHeader` y mostrando diferentes opciones según el estado de autenticación.

