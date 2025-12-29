# 🚀 Configurar ngrok y Webhook de Mercado Pago - Guía Paso a Paso

**Objetivo:** Exponer el backend en puerto 8000 con ngrok y conectar el webhook de Mercado Pago

---

## 📋 Paso 1: Instalar ngrok (si no lo tienes)

### **Windows:**

1. Descargar ngrok desde: https://ngrok.com/download
2. Extraezzr el archivo `ngrok.exe`
3. Agregar a PATH o usar desde la carpeta donde está
    
### **Verificar instalación:**

```bash
ngrok version
# Debe mostrar: ngrok version X.X.X
```

---

## 📋 Paso 2: Iniciar ngrok

### **Abrir nueva terminal y ejecutar:**

```bash
ngrok http 8000
```

### **Resultado esperado:**

```
ngrok                                                                               

Session Status                online
Account                       tu-email@ejemplo.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### **⚠️ IMPORTANTE:**

- **Copia la URL de "Forwarding"**: `https://xxxx-xxxx-xxxx.ngrok-free.app`
- Esta URL cambiará cada vez que reinicies ngrok (a menos que uses cuenta paga)
- Mantén esta terminal abierta mientras trabajas

---

## 📋 Paso 3: Actualizar ALLOWED_HOSTS en Django

### **Backend (`backend/.env`):**

Agregar el dominio de ngrok a `ALLOWED_HOSTS`:

```env
ALLOWED_HOSTS=localhost,127.0.0.1,xxxx-xxxx-xxxx.ngrok-free.app
```

**Ejemplo:**
```env
ALLOWED_HOSTS=localhost,127.0.0.1,abc123def456.ngrok-free.app
```

### **⚠️ IMPORTANTE:**

- Reemplaza `xxxx-xxxx-xxxx` con tu URL real de ngrok
- No incluyas `https://` ni `/` al final
- Separa múltiples hosts con comas
- Reinicia el servidor Django después de cambiar `.env`

---

## 📋 Paso 4: Reiniciar Backend

### **Detener el servidor actual:**

En la terminal donde corre Django, presiona `Ctrl+C`

### **Reiniciar:**

```bash
python manage.py runserver
```

### **Verificar que funciona:**

Abre en el navegador:
```
https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/auth/health/
```

Deberías ver una respuesta JSON (no error 400).

---

## 📋 Paso 5: Obtener Clave Secreta del Webhook

### **En el Panel de Mercado Pago:**

1. Ve a: **Desarrolladores** → **Webhooks**
2. Haz clic en **"Crear webhook"** o edita uno existente
3. Copia la **"Clave secreta"** (se muestra solo una vez)

**Ejemplo:**
```
e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b
```

---

## 📋 Paso 6: Configurar Clave Secreta en Backend

### **Backend (`backend/.env`):**

```env
MERCADOPAGO_WEBHOOK_SECRET=e254876e649e9e25fb5096c64cd508243e2ff5c3bc21a983ac514f5215ab4a2b
```

**⚠️ IMPORTANTE:**
- Copia la clave exactamente (sin espacios)
- No debe tener comillas
- Reinicia el backend después de cambiar

---

## 📋 Paso 7: Configurar Webhook en Mercado Pago

### **En el Panel de Mercado Pago:**

1. Ve a: **Desarrolladores** → **Webhooks**
2. Haz clic en **"Crear webhook"** o edita uno existente
3. **URL de producción:**
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/payments/webhook/
   ```
   **Reemplaza `xxxx-xxxx-xxxx` con tu URL real de ngrok**

4. **Eventos a recibir:**
   - ✅ **Pagos** → `payment`
   - ✅ **Pagos** → `payment.created`
   - ✅ **Pagos** → `payment.updated`

5. Haz clic en **"Guardar configuración"**

---

## 📋 Paso 8: Verificar que el Webhook Funciona

### **Opción 1: Simular Notificación (Recomendado)**

En el panel de Mercado Pago:

1. Ve a: **Desarrolladores** → **Webhooks**
2. Haz clic en **"Simular notificaciones"**
3. **URL:** `https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/payments/webhook/`
4. **Tipo de evento:** Selecciona `payment`
5. **Data ID:** Usa `123456` o cualquier número
6. Haz clic en **"Enviar prueba"**

### **Verificar en logs del backend:**

Deberías ver:
```
INFO ... Webhook recibido de Mercado Pago
INFO ... Evento: payment
INFO ... Data ID: 123456
INFO ... Webhook validado correctamente
```

### **Opción 2: Verificar en ngrok Dashboard**

1. Abre: `http://127.0.0.1:4040` (web interface de ngrok)
2. Deberías ver la petición POST a `/api/v1/payments/webhook/`
3. Verifica el status code (debería ser 200 OK)

---

## 📋 Paso 9: Probar con Pago Real

### **Flujo completo:**

1. **Usuario completa pago** en el frontend
2. **Mercado Pago procesa** el pago
3. **Mercado Pago envía webhook** a tu URL de ngrok
4. **Backend recibe webhook** y actualiza el estado del pago
5. **Enrollment se crea** automáticamente (si no se creó antes)

### **Verificar en logs:**

```
INFO ... Payment procesado exitosamente
INFO ... Webhook recibido de Mercado Pago
INFO ... Payment status actualizado: approved
INFO ... Enrollment creado para usuario X
```

---

## 🔍 Solución de Problemas

### **Error: 400 Bad Request al acceder a ngrok**

**Causa:** `ALLOWED_HOSTS` no incluye el dominio de ngrok.

**Solución:**
1. Verifica que `ALLOWED_HOSTS` en `.env` incluya tu dominio de ngrok
2. Reinicia el backend
3. Prueba de nuevo

### **Error: 404 Not Found en webhook**

**Causa:** URL incorrecta o ruta no existe.

**Solución:**
1. Verifica que la URL sea exactamente: `https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/payments/webhook/`
2. Verifica que el backend esté corriendo
3. Prueba acceder a `http://localhost:8000/api/v1/payments/webhook/` (debería dar 405, no 404)

### **Error: Validación de Firma Fallida**

**Causa:** Clave secreta incorrecta.

**Solución:**
1. Verifica que `MERCADOPAGO_WEBHOOK_SECRET` en `.env` sea correcta
2. Copia la clave exactamente desde Mercado Pago
3. Reinicia el backend

### **Error: Webhook no se recibe**

**Causa:** ngrok no está corriendo o URL incorrecta.

**Solución:**
1. Verifica que ngrok esté corriendo: `ngrok http 8000`
2. Verifica que el backend esté corriendo: `python manage.py runserver`
3. Verifica la URL en Mercado Pago
4. Revisa el dashboard de ngrok: `http://127.0.0.1:4040`

---

## 📋 Checklist Final

Antes de probar pagos reales, verifica:

- [ ] ✅ ngrok corriendo y exponiendo `localhost:8000`
- [ ] ✅ URL de ngrok copiada: `https://xxxx-xxxx-xxxx.ngrok-free.app`
- [ ] ✅ `ALLOWED_HOSTS` actualizado con dominio de ngrok
- [ ] ✅ Backend reiniciado después de cambiar `.env`
- [ ] ✅ `MERCADOPAGO_WEBHOOK_SECRET` configurado en `.env`
- [ ] ✅ URL del webhook configurada en Mercado Pago
- [ ] ✅ Eventos seleccionados: `payment`, `payment.created`, `payment.updated`
- [ ] ✅ Webhook de prueba enviado y recibido correctamente
- [ ] ✅ Logs del backend muestran el webhook recibido

---

## 🎯 Comandos Rápidos

### **Iniciar ngrok:**
```bash
ngrok http 8000
```

### **Ver dashboard de ngrok:**
```
http://127.0.0.1:4040
```

### **Probar webhook manualmente:**
```bash
curl -X POST https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/payments/webhook/ \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123456"}}'
```

---

## ⚠️ Notas Importantes

### **1. URL de ngrok cambia:**

- Si reinicias ngrok, la URL cambiará
- Tendrás que actualizar la URL en Mercado Pago cada vez
- Considera usar ngrok con dominio fijo (requiere cuenta paga)

### **2. Mantener ngrok corriendo:**

- No cierres la terminal de ngrok mientras trabajas
- Si se cierra, reinicia y actualiza la URL en Mercado Pago

### **3. Seguridad:**

- La clave secreta debe estar en `.env`, nunca en el código
- No compartas la URL de ngrok públicamente
- Usa HTTPS siempre (ngrok lo proporciona automáticamente)

---

## 🎉 ¡Listo!

Una vez configurado:

1. ✅ ngrok expone tu backend públicamente
2. ✅ Mercado Pago puede enviar webhooks
3. ✅ Los pagos se procesan automáticamente
4. ✅ Los enrollments se crean automáticamente

**¡Prueba hacer un pago y verifica que el webhook se recibe!** 🚀

---

**Última actualización:** 6 de Diciembre, 2025

