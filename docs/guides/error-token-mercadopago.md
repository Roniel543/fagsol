# 🔧 Solución: Error "Card Token not found" en Mercado Pago

**Error:** `Card Token not found` (Código 2006)

---

## 🔍 Diagnóstico

El error indica que el token de la tarjeta no es válido o expiró. Esto puede ocurrir por:

1. **Token expirado** (más común)
2. **Token no generado correctamente**
3. **Clave pública incorrecta** (test vs production)
4. **Demora entre generación y envío**

---

## ✅ Soluciones

### **Solución 1: Verificar Clave Pública de Mercado Pago**

**Verificar en `.env` del frontend:**
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx-xxxxx-xxxxx
```

**Importante:**
- ✅ Usar clave de **TEST** para desarrollo
- ✅ Usar clave de **PRODUCTION** para producción
- ⚠️ No mezclar claves de test y production

**Verificar en consola del navegador:**
```javascript
console.log('MP Public Key:', process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
```

---

### **Solución 2: Verificar que el Token se Genera Correctamente**

**En el callback `onSubmit` del CardPayment Brick:**

El token debe generarse automáticamente cuando el usuario completa el formulario. Verificar en consola:

```javascript
// En CheckoutPage.tsx, línea 171
const { token, payment_method_id, installments } = formData;
console.log('Token recibido:', token);
console.log('Payment method ID:', payment_method_id);
```

**Si el token es `null` o `undefined`:**
- El CardPayment Brick no se inicializó correctamente
- Verificar que el SDK de Mercado Pago está cargado
- Verificar que la clave pública es válida

---

### **Solución 3: Verificar Ambiente de Mercado Pago**

**En el backend (`.env`):**
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
```

**Importante:**
- ✅ Clave pública (frontend) y access token (backend) deben ser del **mismo ambiente**
- ⚠️ Si usas TEST en frontend, usa TEST en backend
- ⚠️ Si usas PRODUCTION en frontend, usa PRODUCTION en backend

---

### **Solución 4: Reducir Tiempo entre Generación y Envío**

Los tokens de Mercado Pago expiran rápidamente. Asegúrate de:

1. **Enviar el token inmediatamente** después de generarlo
2. **No hacer pausas** entre generar el token y enviarlo al backend
3. **Verificar conexión a internet** estable

**Código actual (correcto):**
```typescript
onSubmit: async (formData: any) => {
    const { token, payment_method_id, installments } = formData;
    
    // Enviar inmediatamente (sin delays)
    const response = await processPayment(
        paymentIntent.id,
        token,  // ✅ Usar token inmediatamente
        payment_method_id || 'visa',
        installments || 1,
        paymentIntent.total,
        idempotencyKey
    );
}
```

---

### **Solución 5: Verificar Tarjeta de Prueba**

**Tarjetas de prueba válidas para TEST:**

**Visa (Aprobada):**
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: Cualquier fecha futura (ej: 11/26)
Nombre: Cualquier nombre
```

**Mastercard (Aprobada):**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: Cualquier fecha futura (ej: 11/26)
Nombre: Cualquier nombre
```

**⚠️ IMPORTANTE:**
- La fecha debe estar **al menos un año en el futuro**
- Si estamos en diciembre 2025, usar fecha como `11/26` (noviembre 2026)
- No usar fechas muy cercanas como `01/26` si estamos en diciembre 2025

---

## 🔍 Verificación Paso a Paso

### **1. Verificar Clave Pública:**

```bash
# En frontend/.env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx-xxxxx-xxxxx
```

**Verificar en consola del navegador:**
```javascript
console.log('MP Key:', process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
// Debe mostrar: TEST-xxxxx-xxxxx-xxxxx
```

### **2. Verificar Access Token:**

```bash
# En backend/.env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
```

**Verificar en logs del backend:**
```
INFO: Mercado Pago Access Token configurado
```

### **3. Verificar que el SDK se Carga:**

**En consola del navegador:**
```javascript
console.log('MercadoPago SDK:', window.MercadoPago);
// Debe mostrar: [object Object]
```

### **4. Verificar Token Generado:**

**En el callback `onSubmit`:**
```javascript
console.log('Token:', token);
console.log('Token length:', token?.length);
// Debe mostrar un string largo (ej: "a6f6575958760c378c6f...")
```

---

## 🧪 Prueba Rápida

### **1. Limpiar Caché del Navegador:**
- Presionar `Ctrl+Shift+Delete`
- Limpiar caché y cookies
- Recargar página

### **2. Verificar en Consola:**
- Abrir DevTools (F12)
- Ir a la pestaña "Console"
- Buscar errores relacionados con Mercado Pago

### **3. Probar con Tarjeta de Prueba:**
- Usar tarjeta Visa de prueba: `4509 9535 6623 3704`
- CVV: `123`
- Fecha: `11/26` (noviembre 2026)
- Completar formulario rápidamente

### **4. Verificar Logs del Backend:**
```
INFO: Token recibido: a6f6575958760c378c6f...
INFO: Payment method ID usado: visa
INFO: Enviando pago a Mercado Pago usando SDK...
```

---

## ⚠️ Errores Comunes

### **Error 1: "Card Token not found"**

**Causa:** Token expirado o no válido

**Solución:**
1. Verificar que el token se genera correctamente
2. Enviar token inmediatamente después de generarlo
3. Verificar que la clave pública es correcta

### **Error 2: "Invalid public key"**

**Causa:** Clave pública incorrecta o de otro ambiente

**Solución:**
1. Verificar `.env` del frontend
2. Asegurar que la clave es del ambiente correcto (TEST/PRODUCTION)
3. Reiniciar servidor de desarrollo

### **Error 3: "Token expired"**

**Causa:** Demora entre generación y envío

**Solución:**
1. Reducir tiempo entre generación y envío
2. Verificar conexión a internet
3. No hacer pausas en el proceso

---

## 📋 Checklist de Verificación

- [ ] Clave pública configurada en `.env` del frontend
- [ ] Access token configurado en `.env` del backend
- [ ] Claves son del mismo ambiente (TEST o PRODUCTION)
- [ ] SDK de Mercado Pago se carga correctamente
- [ ] CardPayment Brick se inicializa correctamente
- [ ] Token se genera cuando se completa el formulario
- [ ] Token se envía inmediatamente al backend
- [ ] Tarjeta de prueba es válida
- [ ] Fecha de vencimiento es futura (al menos 1 año)

---

## 🎯 Próximos Pasos

1. **Verificar configuración** de claves
2. **Probar con tarjeta de prueba** válida
3. **Verificar logs** del backend
4. **Verificar consola** del navegador
5. **Si persiste el error**, contactar soporte de Mercado Pago

---

**Última actualización:** 6 de Diciembre, 2025

