# ⚡ Pruebas Rápidas - Cookies HTTP-Only

**Guía rápida para probar la implementación manualmente**

---

## 🚀 Iniciar Servidores

### **Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```
✅ Debe mostrar: `Starting development server at http://127.0.0.1:8000/`

### **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Debe mostrar: `Ready on http://localhost:3000`

---

## ✅ Checklist Rápido

### **1. Login con Cookies** (2 minutos)
- [ ] Abrir `http://localhost:3000`
- [ ] Abrir DevTools (F12) → **Application** → **Cookies**
- [ ] Hacer login
- [ ] Verificar que aparecen `access_token` y `refresh_token` en cookies
- [ ] Verificar que tienen `HttpOnly` ✅ y `SameSite: Strict`

### **2. Verificar que NO hay tokens en JSON** (1 minuto)
- [ ] En DevTools → **Network** → Buscar request a `/api/v1/auth/login/`
- [ ] Abrir la respuesta
- [ ] Verificar que **NO** hay campo `tokens` en el JSON
- [ ] Verificar que solo hay `user` en el JSON

### **3. Sincronización entre Pestañas** (2 minutos)
- [ ] Abrir segunda pestaña en `http://localhost:3000`
- [ ] En primera pestaña: hacer login
- [ ] Verificar que segunda pestaña detecta el login automáticamente
- [ ] Verificar en Console de segunda pestaña: `[BroadcastChannel] Otra pestaña hizo login...`

### **4. Logout Limpia Cookies** (1 minuto)
- [ ] Estar autenticado
- [ ] Verificar cookies en DevTools
- [ ] Hacer logout
- [ ] Verificar que cookies desaparecen o tienen `max-age=0`

### **5. Endpoints Protegidos Funcionan** (1 minuto)
- [ ] Estar autenticado
- [ ] Navegar a dashboard o cualquier página protegida
- [ ] Verificar en Network que requests a `/api/v1/auth/me/` retornan `200 OK`
- [ ] Verificar que NO hay header `Authorization: Bearer ...` (las cookies se envían automáticamente)

---

## 🔍 Verificación Rápida en DevTools

### **Chrome/Edge:**
1. `F12` → **Application** → **Cookies** → `http://localhost:3000`
2. Verificar cookies `access_token` y `refresh_token`
3. Verificar que tienen:
   - ✅ `HttpOnly` (checked)
   - `SameSite: Strict`
   - `Path: /`

### **Network Tab:**
1. `F12` → **Network** → Filtrar por `XHR`
2. Buscar requests a `/api/v1/auth/*`
3. Verificar:
   - ✅ Response NO tiene `tokens` en JSON
   - ✅ Requests funcionan (200 OK)
   - ✅ No hay errores 401

---

## ⚠️ Si Algo No Funciona

### **Cookies no aparecen:**
- Verificar que backend está corriendo en `http://localhost:8000`
- Verificar que frontend está en `http://localhost:3000`
- Verificar CORS en backend (`CORS_ALLOW_CREDENTIALS = True`)

### **401 Unauthorized:**
- Verificar que cookies están establecidas
- Verificar que `CookieJWTAuthentication` está en settings
- Revisar logs del backend

### **Sincronización no funciona:**
- Verificar que ambas pestañas están en el mismo origen
- Verificar Console para errores
- Verificar que BroadcastChannel está disponible

---

## 📚 Documentación Completa

Para más detalles, ver:
- `docs/migration/GUIA_PRUEBAS_MANUALES.md` - Guía completa
- `docs/security/SECURITY_COOKIES_HTTPONLY.md` - Seguridad
- `docs/migration/RESUMEN_MIGRACION.md` - Resumen de cambios

---

**Tiempo estimado:** 5-10 minutos  
**Estado:** ✅ Listo para probar

