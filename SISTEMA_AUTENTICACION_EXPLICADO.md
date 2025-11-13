# 🔐 Sistema de Autenticación - Explicación Completa

**Fecha:** 2025-01-12  
**Estado:** ✅ Implementado y Corregido

---

## 📋 **CÓMO FUNCIONA LA AUTENTICACIÓN**

### **1. Login (Inicio de Sesión)**

**Flujo:**
1. Usuario ingresa email y contraseña en `/auth/login`
2. Frontend envía `POST /api/v1/login/` al backend
3. Backend valida credenciales con `AuthService.login()`
4. Si son válidas, backend genera tokens JWT:
   - **Access Token**: Válido por 15 minutos (configurable)
   - **Refresh Token**: Válido por 7 días (configurable)
5. Frontend guarda tokens en `sessionStorage` (NO localStorage)
6. Frontend guarda datos del usuario en `sessionStorage`
7. Usuario queda autenticado

**Archivos involucrados:**
- Frontend: `frontend/src/shared/hooks/useAuth.tsx` → `login()`
- Backend: `backend/presentation/views/auth_views.py` → `login()`
- Backend: `backend/infrastructure/services/auth_service.py` → `AuthService.login()`

---

### **2. Almacenamiento de Tokens**

**¿Dónde se guardan?**
- ✅ **sessionStorage** (NO localStorage)
- Razón: Más seguro, se limpia al cerrar la pestaña

**¿Qué se guarda?**
- `access_token`: Token JWT de acceso
- `refresh_token`: Token JWT para refrescar
- `user`: Datos del usuario (JSON)
- `token_expiry`: Timestamp de expiración

**Archivo:** `frontend/src/shared/utils/tokenStorage.ts`

---

### **3. Al Recargar la Página (F5)**

**ANTES (Problema):**
- ❌ Solo leía tokens de `sessionStorage`
- ❌ No validaba si el token era válido
- ❌ Si el token expiró, se perdía la sesión

**AHORA (Solucionado):**
- ✅ Lee tokens de `sessionStorage`
- ✅ **Valida token con backend** llamando a `GET /api/v1/auth/me/`
- ✅ Si el token es válido, restaura el usuario
- ✅ Si el token expiró o es inválido, limpia tokens y redirige a login

**Flujo al recargar:**
1. `AuthProvider` se monta
2. `useEffect` se ejecuta
3. Lee `access_token` de `sessionStorage`
4. Si existe, llama a `GET /api/v1/auth/me/` con el token
5. Backend valida el token JWT
6. Si es válido, retorna datos del usuario
7. Frontend restaura el usuario en el estado
8. Si es inválido, limpia tokens y muestra login

**Archivos involucrados:**
- Frontend: `frontend/src/shared/hooks/useAuth.tsx` → `useEffect`
- Backend: `backend/presentation/views/auth_views.py` → `get_current_user()`

---

### **4. Refresh Token Automático**

**¿Cuándo se refresca?**
- Cuando el access token está próximo a expirar (< 5 minutos)
- Cuando una petición retorna 401 (token expirado)

**Flujo:**
1. Frontend detecta que el token expirará pronto
2. Llama a `POST /api/token/refresh/` con el refresh token
3. Backend valida el refresh token
4. Si es válido, retorna nuevo access token
5. Frontend actualiza el access token (mantiene refresh token)
6. Reintenta la petición original con el nuevo token

**Archivo:** `frontend/src/shared/services/api.ts` → `refreshAccessToken()`

---

### **5. Logout (Cerrar Sesión)**

**Flujo:**
1. Usuario hace click en "Cerrar Sesión"
2. Frontend llama a `POST /api/v1/logout/` con refresh token
3. Backend invalida el refresh token (lo agrega a blacklist)
4. Frontend limpia tokens de `sessionStorage`
5. Frontend limpia estado del usuario
6. Redirige a `/auth/login`

**Archivos involucrados:**
- Frontend: `frontend/src/shared/hooks/useAuth.tsx` → `logout()`
- Backend: `backend/presentation/views/auth_views.py` → `logout()`

---

## 🔒 **SEGURIDAD IMPLEMENTADA**

### **1. Tokens en sessionStorage (NO localStorage)**
- ✅ Se limpian al cerrar la pestaña
- ✅ Más seguro contra XSS
- ✅ No persisten entre sesiones

### **2. Validación de Token al Recargar**
- ✅ Valida con backend que el token sea válido
- ✅ Si expiró, limpia automáticamente
- ✅ Previene usar tokens inválidos

### **3. Refresh Token Automático**
- ✅ Renueva tokens antes de expirar
- ✅ Transparente para el usuario
- ✅ Mantiene sesión activa

### **4. Token Blacklist**
- ✅ Al hacer logout, el token se invalida
- ✅ No se puede reutilizar un token invalidado
- ✅ Usa `djangorestframework-simplejwt[blacklist]`

### **5. Rate Limiting**
- ✅ `django-axes` limita intentos de login
- ✅ Bloquea IP después de 10 intentos fallidos
- ✅ Bloqueo por 30 minutos

---

## 🐛 **PROBLEMA RESUELTO**

### **Problema Original:**
- Al recargar la página (F5), se perdía la sesión
- El usuario tenía que volver a hacer login

### **Causa:**
- El frontend solo leía tokens de `sessionStorage`
- No validaba si el token era válido con el backend
- Si el token expiró o era inválido, se perdía la sesión

### **Solución:**
1. ✅ Creado endpoint `GET /api/v1/auth/me/` en backend
2. ✅ Agregado `getCurrentUser()` al servicio de API
3. ✅ Actualizado `useAuth` para validar token al recargar
4. ✅ Si el token es válido, restaura el usuario
5. ✅ Si el token es inválido, limpia tokens y redirige a login

---

## 📊 **FLUJO COMPLETO DE AUTENTICACIÓN**

```
1. LOGIN
   Usuario → Frontend → POST /api/v1/login/ → Backend
   Backend valida credenciales → Genera tokens JWT
   Frontend guarda tokens en sessionStorage
   Usuario autenticado ✅

2. USO DE LA APLICACIÓN
   Frontend envía requests con header: Authorization: Bearer <token>
   Backend valida token en cada request
   Si token válido → Procesa request
   Si token expirado → Retorna 401

3. REFRESH AUTOMÁTICO
   Frontend detecta token próximo a expirar
   Llama a POST /api/token/refresh/ con refresh token
   Backend valida refresh token → Genera nuevo access token
   Frontend actualiza access token
   Continúa usando la aplicación ✅

4. RECARGAR PÁGINA (F5)
   AuthProvider se monta
   Lee access_token de sessionStorage
   Llama a GET /api/v1/auth/me/ para validar
   Si válido → Restaura usuario ✅
   Si inválido → Limpia tokens → Redirige a login

5. LOGOUT
   Usuario hace click en "Cerrar Sesión"
   Frontend llama a POST /api/v1/logout/ con refresh token
   Backend invalida refresh token (blacklist)
   Frontend limpia sessionStorage
   Redirige a /auth/login ✅
```

---

## 🧪 **CÓMO PROBAR**

### **1. Probar Login:**
1. Ir a `http://localhost:3000/auth/login`
2. Ingresar credenciales
3. Verificar que redirige al dashboard
4. Verificar en DevTools → Application → Session Storage que hay tokens

### **2. Probar Recarga (F5):**
1. Después de login, estar en `/dashboard` o `/admin/courses`
2. Presionar F5 (recargar página)
3. ✅ **Debería mantener la sesión** (no redirigir a login)
4. Verificar en Network tab que se llama a `/api/v1/auth/me/`

### **3. Probar Token Expirado:**
1. Esperar 15 minutos (o modificar expiración en settings)
2. Recargar página
3. ✅ **Debería redirigir a login** (token expirado)
4. Verificar que se limpian tokens de sessionStorage

### **4. Probar Logout:**
1. Hacer click en "Cerrar Sesión"
2. ✅ **Debería redirigir a login**
3. Verificar que se limpian tokens de sessionStorage
4. Intentar acceder a `/dashboard` → Debería redirigir a login

---

## 📝 **NOTAS IMPORTANTES**

1. **sessionStorage vs localStorage:**
   - Usamos `sessionStorage` por seguridad
   - Se limpia al cerrar la pestaña
   - Más seguro contra XSS

2. **Validación al Recargar:**
   - Ahora valida con backend
   - Si el token es válido, mantiene sesión
   - Si el token expiró, limpia y redirige

3. **Refresh Token:**
   - Se renueva automáticamente
   - Transparente para el usuario
   - Mantiene sesión activa

4. **Token Blacklist:**
   - Al hacer logout, el token se invalida
   - No se puede reutilizar
   - Más seguro

---

## ✅ **ESTADO ACTUAL**

- ✅ Login funciona correctamente
- ✅ Tokens se guardan en sessionStorage
- ✅ **Validación al recargar implementada**
- ✅ Refresh token automático
- ✅ Logout invalida tokens
- ✅ Rate limiting activo

**¡El problema de perder sesión al recargar está resuelto!** 🎉

