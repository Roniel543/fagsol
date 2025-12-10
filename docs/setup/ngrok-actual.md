# 🚀 Configuración Rápida de ngrok para Pagos Reales

**Fecha:** 2025-01-27  
**URL de ngrok actual:** `https://ce5ee9eac587.ngrok-free.app`

---

## ✅ Estado Actual

**ngrok está funcionando:**
```
Forwarding: https://ce5ee9eac587.ngrok-free.app -> http://localhost:8000
```

**⚠️ Errores detectados:** 400 Bad Request en algunas peticiones

---

## 🔧 Paso 1: Actualizar ALLOWED_HOSTS

### **Backend (`backend/.env`)**

Agrega el nuevo dominio de ngrok a `ALLOWED_HOSTS`:

```env
ALLOWED_HOSTS=localhost,127.0.0.1,ce5ee9eac587.ngrok-free.app
```

**⚠️ IMPORTANTE:** Si ya tenías otro dominio de ngrok, reemplázalo o agrégalo separado por comas.

**Ejemplo si tenías otro:**
```env
ALLOWED_HOSTS=localhost,127.0.0.1,840946ec5adb.ngrok-free.app,ce5ee9eac587.ngrok-free.app
```

---

## 🔧 Paso 2: Actualizar CORS (si es necesario)

### **Backend (`backend/.env`)**

Si el frontend va a usar la URL de ngrok directamente, agrega también a CORS:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://ce5ee9eac587.ngrok-free.app
```

**⚠️ NOTA:** Normalmente el frontend sigue usando `localhost:8000` y ngrok solo expone el backend, así que esto puede no ser necesario.

---

## 🔧 Paso 3: Reiniciar el Backend

**Después de actualizar `.env`, reinicia el servidor Django:**

```bash
cd backend
# Detener el servidor (Ctrl+C)
# Reiniciar
python manage.py runserver
```

**Verifica que el servidor esté corriendo:**
```bash
# Deberías ver algo como:
# Starting development server at http://127.0.0.1:8000/
```

---

## 🔧 Paso 4: Verificar que ngrok Funciona

### **Prueba 1: Acceder a la raíz del backend**

Abre en el navegador:
```
https://ce5ee9eac587.ngrok-free.app/
```

**Deberías ver:**
- ✅ Respuesta 200 OK
- ✅ O una página de Django/API

**Si ves 400 Bad Request:**
- ⚠️ Verifica que `ALLOWED_HOSTS` esté actualizado
- ⚠️ Verifica que el backend esté corriendo en `localhost:8000`
- ⚠️ Reinicia el backend después de cambiar `.env`

---

## 🔧 Paso 5: Configurar Webhook en Mercado Pago

### **5.1 Ir al Panel de Mercado Pago**

1. Ve a: https://www.mercadopago.com.pe/developers/panel
2. Selecciona tu aplicación
3. Ve a **"Webhooks"** o **"Notificaciones IPN"**

### **5.2 Agregar URL del Webhook**

**URL del webhook:**
```
https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/
```

**⚠️ IMPORTANTE:**
- La URL debe terminar en `/api/v1/payments/webhook/`
- Debe ser HTTPS (ngrok lo proporciona automáticamente)
- No debe tener espacios ni caracteres especiales

### **5.3 Seleccionar Eventos**

Selecciona estos eventos:
- ✅ `payment`
- ✅ `payment.created`
- ✅ `payment.updated`

### **5.4 Guardar y Verificar**

Después de guardar, Mercado Pago enviará un webhook de prueba. Verifica en los logs del backend que se recibió correctamente.

---

## 🧪 Paso 6: Probar el Flujo Completo

### **6.1 Verificar que el Backend Responde**

**Prueba con curl o Postman:**

```bash
curl https://ce5ee9eac587.ngrok-free.app/api/v1/auth/me/ \
  -H "Authorization: Bearer TU_TOKEN"
```

**O desde el navegador:**
```
https://ce5ee9eac587.ngrok-free.app/api/v1/auth/me/
```

**Deberías recibir:**
- ✅ 200 OK (si estás autenticado)
- ✅ 401 Unauthorized (si no estás autenticado, pero el endpoint funciona)

### **6.2 Probar Crear Payment Intent**

**Desde el frontend o Postman:**

```bash
POST https://ce5ee9eac587.ngrok-free.app/api/v1/payments/intent/
Headers:
  Authorization: Bearer TU_TOKEN
  Content-Type: application/json
Body:
{
  "course_ids": ["c-001"]
}
```

**Deberías recibir:**
```json
{
  "success": true,
  "data": {
    "id": "pi_...",
    "total": 99.00,
    "currency": "PEN",
    "status": "pending"
  }
}
```

### **6.3 Probar Procesar Pago**

**⚠️ IMPORTANTE:** Usa credenciales de **PRODUCCIÓN** para pagos reales.

**Desde el frontend:**
1. Ve a `/academy/checkout`
2. Agrega cursos al carrito
3. Completa el formulario de tarjeta
4. Procesa el pago

**Verifica en los logs del backend:**
- ✅ Payment intent creado
- ✅ Token recibido correctamente
- ✅ Pago enviado a Mercado Pago
- ✅ Status 201 recibido de Mercado Pago

---

## 🔍 Solución de Problemas

### **Error 400 Bad Request**

**Causa:** El backend no reconoce el dominio de ngrok.

**Solución:**
1. Verifica que `ALLOWED_HOSTS` incluya `ce5ee9eac587.ngrok-free.app`
2. Reinicia el backend después de cambiar `.env`
3. Verifica que no haya espacios en `ALLOWED_HOSTS`

### **Error 404 Not Found**

**Causa:** La ruta no existe o ngrok no está redirigiendo correctamente.

**Solución:**
1. Verifica que el backend esté corriendo en `localhost:8000`
2. Verifica que ngrok esté redirigiendo a `http://localhost:8000`
3. Prueba acceder directamente a `http://localhost:8000` para verificar

### **Webhook no se Recibe**

**Causa:** La URL del webhook está incorrecta o ngrok no está funcionando.

**Solución:**
1. Verifica que la URL del webhook sea exactamente: `https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/`
2. Verifica que ngrok esté corriendo
3. Revisa los logs del backend para ver si llegan peticiones
4. Usa el web interface de ngrok (`http://127.0.0.1:4040`) para ver las peticiones

### **Error de CORS**

**Causa:** El frontend está intentando acceder a ngrok y no está en `CORS_ALLOWED_ORIGINS`.

**Solución:**
1. Normalmente el frontend usa `localhost:8000`, no ngrok
2. Si necesitas usar ngrok en el frontend, agrega la URL a `CORS_ALLOWED_ORIGINS`
3. O mejor, mantén el frontend usando `localhost:8000` y solo usa ngrok para el webhook

---

## 📋 Checklist Rápido

- [ ] ✅ ngrok corriendo y exponiendo `localhost:8000`
- [ ] ✅ `ALLOWED_HOSTS` actualizado con `ce5ee9eac587.ngrok-free.app`
- [ ] ✅ Backend reiniciado después de cambiar `.env`
- [ ] ✅ Backend responde en `https://ce5ee9eac587.ngrok-free.app/`
- [ ] ✅ Webhook configurado en Mercado Pago
- [ ] ✅ Credenciales de producción configuradas
- [ ] ✅ Frontend configurado (puede seguir usando `localhost:8000`)

---

## 🎯 Próximos Pasos

1. **Probar crear un payment intent** desde el frontend
2. **Probar procesar un pago** con tarjeta real
3. **Verificar que el webhook se recibe** cuando Mercado Pago notifica
4. **Monitorear los logs** para ver el flujo completo

---

## 📝 Notas Importantes

1. **ngrok Free tiene limitaciones:**
   - La URL cambia cada vez que reinicias ngrok (a menos que uses cuenta paga)
   - Hay un límite de conexiones simultáneas
   - Puede haber latencia adicional

2. **Para producción:**
   - Usa un dominio fijo
   - Configura SSL/TLS correctamente
   - No uses ngrok en producción

3. **Seguridad:**
   - No compartas la URL de ngrok públicamente
   - Usa credenciales de producción solo para pruebas reales
   - Revierte a credenciales de prueba después de las pruebas

---

**Última actualización:** 2025-01-27  
**URL de ngrok:** `https://ce5ee9eac587.ngrok-free.app`

