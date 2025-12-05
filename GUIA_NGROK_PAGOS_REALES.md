# 🚀 Guía: Configurar ngrok para Pagos Reales con Mercado Pago

## 📋 Objetivo

Exponer tu backend local con ngrok para poder probar pagos reales con Mercado Pago y mostrarle al cliente que funciona.

---

## 📦 Paso 1: Instalar ngrok

### Opción A: Descargar desde el sitio web (Recomendado)

1. Ve a: https://ngrok.com/download
2. Descarga la versión para tu sistema operativo (Windows/Mac/Linux)
3. Extrae el archivo `ngrok.exe` (Windows) o `ngrok` (Mac/Linux)
4. Colócalo en una carpeta accesible (ej: `C:\ngrok\` o `~/ngrok/`)

### Opción B: Con npm (si tienes Node.js)

```bash
npm install -g ngrok
```

### Opción C: Con Chocolatey (Windows)

```bash
choco install ngrok
```

---

## 🔑 Paso 2: Crear cuenta en ngrok (Opcional pero recomendado)

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea una cuenta gratuita
3. Obtén tu **Authtoken** desde: https://dashboard.ngrok.com/get-started/your-authtoken

### Configurar el authtoken:

```bash
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

**Ventajas de tener cuenta:**
- URLs más estables
- Dashboard para ver requests
- Mejor para demostraciones

---

## 🚀 Paso 3: Iniciar tu backend Django

Asegúrate de que tu backend esté corriendo:

```bash
cd backend
python manage.py runserver
```

Deberías ver:
```
Starting development server at http://127.0.0.1:8000/
```

---

## 🌐 Paso 4: Exponer el backend con ngrok

Abre una **nueva terminal** y ejecuta:

```bash
ngrok http 8000
```

**Salida esperada:**
```
ngrok                                                                              
                                                                                   
Session Status                online                                               
Account                       Tu Email (Plan: Free)                                
Version                       3.x.x                                                
Region                        United States (us)                                   
Latency                       -                                                    
Web Interface                 http://127.0.0.1:4040                                
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000
                                                                                   
Connections                   ttl     opn     rt1     rt5     p50     p90          
                              0       0       0.00    0.00    0.00    0.00         
```

**⚠️ IMPORTANTE:** Copia la URL de `Forwarding` (ej: `https://abc123.ngrok-free.app`)

---

## 🔧 Paso 5: Configurar Mercado Pago

### 5.1 Obtener credenciales de producción

1. Ve a: https://www.mercadopago.com.pe/developers/panel
2. Cambia de **"Test"** a **"Producción"**
3. Copia tus credenciales:
   - **Access Token** (empieza con `APP_USR-`)
   - **Public Key** (empieza con `APP_USR-`)

### 5.2 Actualizar variables de entorno

**Backend (`backend/.env`):**
```env
# Mercado Pago - PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
```

**Frontend (`frontend/.env.local`):**
```env
# Mercado Pago - PRODUCCIÓN
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**⚠️ IMPORTANTE:** 
- El frontend puede seguir usando `localhost:8000` (ngrok solo expone el backend)
- O puedes usar la URL de ngrok también en el frontend si prefieres

### 5.3 Configurar Webhook en Mercado Pago

1. Ve a: https://www.mercadopago.com.pe/developers/panel/app
2. Selecciona tu aplicación
3. Ve a **"Webhooks"** o **"Notificaciones IPN"**
4. Agrega la URL del webhook:

```
https://TU_URL_NGROK.ngrok-free.app/api/v1/payments/webhook/
```

**Ejemplo:**
```
https://abc123.ngrok-free.app/api/v1/payments/webhook/
```

5. Selecciona los eventos:
   - ✅ `payment`
   - ✅ `payment.created`
   - ✅ `payment.updated`

6. Guarda la configuración

---

## ✅ Paso 6: Reiniciar servicios

### Reiniciar Backend:

1. Detén el servidor Django (Ctrl+C)
2. Reinicia:
   ```bash
   cd backend
   python manage.py runserver
   ```

### Reiniciar Frontend:

1. Detén el servidor Next.js (Ctrl+C)
2. Reinicia:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🧪 Paso 7: Probar el webhook

### Verificar que ngrok está recibiendo requests:

1. Abre en tu navegador: http://127.0.0.1:4040
2. Verás el dashboard de ngrok con todos los requests

### Probar el endpoint del webhook:

```bash
curl -X POST https://TU_URL_NGROK.ngrok-free.app/api/v1/payments/webhook/ \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Deberías ver el request en el dashboard de ngrok.

---

## 💳 Paso 8: Probar un pago real

### ⚠️ ADVERTENCIA IMPORTANTE:

**Estás usando dinero real.** Asegúrate de:
- ✅ Probar con montos pequeños primero (ej: S/ 1.00)
- ✅ Tener acceso a tu cuenta de Mercado Pago
- ✅ Verificar que el pago llegue correctamente

### Pasos para probar:

1. **Abre tu aplicación frontend:** http://localhost:3000
2. **Agrega un curso al carrito**
3. **Ve a checkout:** http://localhost:3000/academy/checkout
4. **Completa los datos de contacto**
5. **Usa una tarjeta REAL** (no de test)
6. **Completa el formulario de pago**
7. **Haz clic en "Pagar"**

### Resultado esperado:

- ✅ Pago procesado exitosamente
- ✅ Redirección a página de éxito
- ✅ Email de confirmación enviado
- ✅ Enrollment creado
- ✅ Pago visible en tu cuenta de Mercado Pago

---

## 📊 Paso 9: Monitorear en ngrok

Mientras pruebas, puedes ver todos los requests en:

**Dashboard de ngrok:** http://127.0.0.1:4040

Verás:
- ✅ Requests al backend
- ✅ Requests del webhook de Mercado Pago
- ✅ Respuestas del backend

---

## 🔍 Troubleshooting

### Problema: ngrok no conecta

**Solución:**
- Verifica que el backend esté corriendo en el puerto 8000
- Verifica que no haya firewall bloqueando
- Prueba con: `ngrok http 8000 --region us` (o `sa` para Sudamérica)

### Problema: Webhook no llega

**Solución:**
1. Verifica la URL del webhook en Mercado Pago
2. Verifica que ngrok esté corriendo
3. Revisa los logs del backend
4. Revisa el dashboard de ngrok (http://127.0.0.1:4040)

### Problema: Error 403 en webhook

**Solución:**
- Verifica que `MERCADOPAGO_WEBHOOK_SECRET` esté configurado
- Verifica la firma del webhook en el código

### Problema: URL de ngrok cambia cada vez

**Solución:**
- Crea una cuenta gratuita en ngrok
- O usa un plan de pago para URLs fijas
- O simplemente actualiza la URL del webhook cada vez que reinicies ngrok

---

## 📝 Notas Importantes

### ⚠️ Seguridad:

1. **No compartas la URL de ngrok públicamente**
2. **Solo úsala para demostraciones controladas**
3. **Cierra ngrok cuando termines las pruebas**
4. **No uses esto en producción**

### 💰 Costos:

- **ngrok gratuito:** Funciona perfecto para pruebas
- **Mercado Pago:** Cobra comisiones por cada pago real
- **Recomendación:** Prueba con montos mínimos

### 🔄 Mantener ngrok corriendo:

- **Mientras ngrok esté corriendo:** La URL funciona
- **Si cierras ngrok:** La URL deja de funcionar
- **Si reinicias ngrok:** Obtienes una nueva URL (a menos que tengas plan de pago)

---

## ✅ Checklist Final

Antes de mostrarle al cliente, verifica:

- [ ] ngrok está corriendo y exponiendo el puerto 8000
- [ ] Backend está corriendo en localhost:8000
- [ ] Frontend está corriendo en localhost:3000
- [ ] Credenciales de producción configuradas en `.env`
- [ ] Webhook configurado en Mercado Pago con la URL de ngrok
- [ ] Probaste un pago pequeño y funcionó
- [ ] Verificaste que el pago llegó a tu cuenta de Mercado Pago
- [ ] Dashboard de ngrok muestra los requests correctamente

---

## 🎯 Resultado Esperado

Cuando todo esté configurado:

1. ✅ Cliente puede hacer un pago real desde tu aplicación
2. ✅ El pago se procesa correctamente
3. ✅ El dinero llega a tu cuenta de Mercado Pago
4. ✅ El usuario recibe acceso al curso
5. ✅ Todo funciona como en producción

---

## 📚 Recursos

- **ngrok Docs:** https://ngrok.com/docs
- **Mercado Pago Docs:** https://www.mercadopago.com.pe/developers/es/docs
- **Dashboard ngrok:** http://127.0.0.1:4040 (cuando ngrok está corriendo)

---

**¡Listo! Ahora puedes mostrarle al cliente que los pagos funcionan con dinero real.** 🎉

