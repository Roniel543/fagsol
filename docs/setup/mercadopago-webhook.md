# 🔧 Configurar Webhook de Mercado Pago - Guía Paso a Paso

**Fecha:** 2025-01-27  
**URL de ngrok actual:** `https://ce5ee9eac587.ngrok-free.app`  
**Clave secreta:** `e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b`

---

## 📋 Paso 1: Actualizar URL del Webhook

### **En el Panel de Mercado Pago:**

1. **En "URL de producción"**, reemplaza la URL antigua:
   ```
   https://840946ec5adb.ngrok-free.app/api/v1/payments/webhook/
   ```
   
   **Por la nueva URL:**
   ```
   https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/
   ```

2. **⚠️ IMPORTANTE:**
   - La URL debe terminar en `/api/v1/payments/webhook/`
   - Debe ser HTTPS (ngrok lo proporciona automáticamente)
   - No debe tener espacios ni caracteres especiales

---

## 📋 Paso 2: Seleccionar Eventos

### **Eventos Recomendados para CheckoutAPI:**

En la sección "Eventos recomendados para integraciones con CheckoutAPI", selecciona:

**✅ Eventos Mínimos (Recomendados):**
- ✅ **Pagos** → `payment`
- ✅ **Pagos** → `payment.created`
- ✅ **Pagos** → `payment.updated`

**📌 Eventos Adicionales (Opcionales pero útiles):**
- ⚠️ **Alertas de fraude** → `fraud_review`
- ⚠️ **Contracargos** → `chargeback`
- ⚠️ **Reclamos** → `dispute`

**⚠️ NOTA:** Para empezar, con `payment`, `payment.created` y `payment.updated` es suficiente.

---

## 📋 Paso 3: Guardar Configuración

1. Haz clic en **"Guardar configuración"**
2. Mercado Pago enviará un webhook de prueba automáticamente
3. Verifica en los logs del backend que se recibió correctamente

---

## 📋 Paso 4: Verificar Clave Secreta en Backend

### **Backend (`backend/.env`)**

Verifica que la clave secreta esté configurada:

```env
MERCADOPAGO_WEBHOOK_SECRET=e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b
```

**⚠️ IMPORTANTE:**
- La clave secreta debe coincidir exactamente
- No debe tener espacios al inicio o final
- Debe estar en el archivo `.env` del backend

---

## 🧪 Paso 5: Probar el Webhook

### **Opción 1: Simular Notificación (Recomendado)**

En el panel de Mercado Pago:

1. Ve a la sección **"Simular notificaciones"**
2. **URL:** `https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/`
3. **Tipo de evento:** Selecciona `payment`
4. **Data ID:** Puedes usar `123456` o cualquier número
5. Haz clic en **"Enviar prueba"**

**Verifica en los logs del backend:**
```bash
# Deberías ver algo como:
INFO ... Webhook recibido de Mercado Pago
INFO ... Evento: payment
INFO ... Data ID: 123456
```

### **Opción 2: Verificar en ngrok Dashboard**

1. Abre: `http://127.0.0.1:4040` (web interface de ngrok)
2. Deberías ver la petición POST a `/api/v1/payments/webhook/`
3. Verifica el status code (debería ser 200 OK)

---

## 🔍 Solución de Problemas

### **Error: Webhook no se recibe**

**Causas posibles:**
1. ❌ ngrok no está corriendo
2. ❌ Backend no está corriendo en `localhost:8000`
3. ❌ URL incorrecta en Mercado Pago
4. ❌ `ALLOWED_HOSTS` no incluye el dominio de ngrok

**Solución:**
1. Verifica que ngrok esté corriendo: `ngrok http 8000`
2. Verifica que el backend esté corriendo: `python manage.py runserver`
3. Verifica la URL en Mercado Pago (debe terminar en `/api/v1/payments/webhook/`)
4. Verifica `ALLOWED_HOSTS` en `backend/.env`

### **Error: 400 Bad Request**

**Causa:** El backend no reconoce el dominio de ngrok.

**Solución:**
1. Actualiza `ALLOWED_HOSTS` en `backend/.env`:
   ```env
   ALLOWED_HOSTS=localhost,127.0.0.1,ce5ee9eac587.ngrok-free.app
   ```
2. Reinicia el backend después de cambiar `.env`

### **Error: 404 Not Found**

**Causa:** La ruta del webhook no existe o está incorrecta.

**Solución:**
1. Verifica que la URL sea exactamente: `https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/`
2. Verifica que el backend tenga la ruta configurada en `backend/config/urls.py`
3. Prueba acceder directamente a `http://localhost:8000/api/v1/payments/webhook/` (debería dar 405 Method Not Allowed, no 404)

### **Error: Validación de Firma Fallida**

**Causa:** La clave secreta no coincide.

**Solución:**
1. Verifica que `MERCADOPAGO_WEBHOOK_SECRET` en `backend/.env` sea exactamente:
   ```
   e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b
   ```
2. No debe tener espacios al inicio o final
3. Reinicia el backend después de cambiar `.env`

---

## 📋 Checklist Final

Antes de probar pagos reales, verifica:

- [ ] ✅ ngrok corriendo y exponiendo `localhost:8000`
- [ ] ✅ URL del webhook actualizada en Mercado Pago: `https://ce5ee9eac587.ngrok-free.app/api/v1/payments/webhook/`
- [ ] ✅ Eventos seleccionados: `payment`, `payment.created`, `payment.updated`
- [ ] ✅ `ALLOWED_HOSTS` actualizado con `ce5ee9eac587.ngrok-free.app`
- [ ] ✅ `MERCADOPAGO_WEBHOOK_SECRET` configurado en `backend/.env`
- [ ] ✅ Backend reiniciado después de cambios
- [ ] ✅ Webhook de prueba enviado y recibido correctamente
- [ ] ✅ Logs del backend muestran el webhook recibido

---

## 🎯 Próximos Pasos

Después de configurar el webhook:

1. **Probar crear un payment intent** desde el frontend
2. **Probar procesar un pago** con tarjeta real
3. **Verificar que el webhook se recibe** cuando Mercado Pago notifica
4. **Monitorear los logs** para ver el flujo completo

---

## 📝 Notas Importantes

1. **URL de ngrok cambia:**
   - Si reinicias ngrok, la URL cambiará
   - Tendrás que actualizar la URL en Mercado Pago cada vez
   - Considera usar ngrok con dominio fijo (requiere cuenta paga)

2. **Modo de Prueba vs Producción:**
   - El webhook funciona igual en ambos modos
   - Asegúrate de usar las credenciales correctas según el modo

3. **Seguridad:**
   - La clave secreta debe estar en `.env`, nunca en el código
   - No compartas la URL de ngrok públicamente
   - Usa HTTPS siempre (ngrok lo proporciona automáticamente)

---

**Última actualización:** 2025-01-27  
**URL de ngrok:** `https://ce5ee9eac587.ngrok-free.app`  
**Clave secreta:** `e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b`

