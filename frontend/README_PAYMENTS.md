# 💳 Guía de Pagos - Frontend

## 📋 Resumen

Este proyecto usa **Mercado Pago CardPayment Brick** para tokenización client-side segura. Los datos de tarjeta NUNCA tocan nuestro servidor.

## 🔧 Configuración

### Variables de Entorno

Agrega a tu archivo `.env.local`:

```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**IMPORTANTE:**
- Usa `TEST-` para desarrollo/testing
- Usa tu Public Key de producción para producción
- NUNCA expongas tu Access Token en el frontend

## 🚀 Uso

### Componente CheckoutPage

El componente `CheckoutPage.tsx` ya está configurado para usar CardPayment Brick:

1. **Carga automática del SDK**: El SDK de Mercado Pago se carga automáticamente
2. **Inicialización del Brick**: Se inicializa cuando el payment intent está listo
3. **Tokenización**: El Brick tokeniza la tarjeta automáticamente
4. **Procesamiento**: Envía solo `token`, `payment_method_id`, `installments`, `amount` al backend

### Flujo Completo

```typescript
// 1. Crear payment intent
const response = await createPaymentIntent(courseIds);

// 2. CardPayment Brick se inicializa automáticamente
// 3. Usuario completa el formulario en el Brick
// 4. Al submit, el Brick llama a onSubmit con:
//    - token: Token de Mercado Pago
//    - payment_method_id: "visa", "master", etc.
//    - installments: Número de cuotas

// 5. Procesar pago
await processPayment(
    paymentIntentId,
    token,
    paymentMethodId,
    installments,
    amount,
    idempotencyKey
);
```

## 🧪 Pruebas con Tarjetas de Test

### Tarjetas Aprobadas

**IMPORTANTE**: Para que las tarjetas de prueba funcionen correctamente, el **nombre del titular** debe ser exactamente **"APRO"** (en mayúsculas).

| Tarjeta | Número | CVV | Vencimiento | Nombre del Titular |
|---------|-------|-----|-------------|-------------------|
| Visa | 5031 7557 3453 0604 | 123 | 11/25 | **APRO** |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | **APRO** |
| Amex | 3753 651535 56885 | 1234 | 11/25 | **APRO** |

### Tarjetas Rechazadas (para probar flujo de rechazo)

| Tarjeta | Número | CVV | Vencimiento | Nombre del Titular | Motivo |
|---------|-------|-----|-------------|-------------------|--------|
| Visa | 5031 7557 3453 0604 | 123 | 11/25 | **OTHE** | Rechazada genérica |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | **OTHE** | Rechazada genérica |

**Nota**: Si usas una tarjeta con nombre diferente a "APRO" o "OTHE", Mercado Pago puede rechazarla con el código `cc_rejected_other_reason`. Asegúrate de usar exactamente "APRO" para pagos aprobados.

### Instrucciones

1. **Abrir CheckoutPage**: Navega a `/academy/checkout`
2. **Completar datos de contacto**: Nombre y email
3. **Completar formulario de tarjeta**: Usa una tarjeta de test
4. **Verificar resultado**: 
   - Aprobada → Redirige a `/academy/checkout/success`
   - Rechazada → Muestra mensaje de error

## 🔒 Seguridad

### ✅ Implementado

- ✅ Tokenización client-side con CardPayment Brick
- ✅ NO se envían datos de tarjeta al backend
- ✅ Solo se envía token, payment_method_id, installments, amount
- ✅ Idempotency key para evitar cobros duplicados
- ✅ Validación de amount en backend (NO confiar en frontend)

### ⚠️ Importante

- ❌ NUNCA almacenes datos de tarjeta en localStorage, sessionStorage, o cookies
- ❌ NUNCA envíes card_number, expiration_month, expiration_year, security_code al backend
- ❌ NUNCA loguees tokens completos (solo primeros/last caracteres para debugging)

## 🐛 Troubleshooting

### Error: "SDK de Mercado Pago no disponible"

**Causa**: El script del SDK no se cargó correctamente.

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` esté configurada
3. Revisa la consola del navegador para errores de CORS

### Error: "Token inválido"

**Causa**: El token no se generó correctamente.

**Solución**:
1. Verifica que el formulario del Brick esté completo
2. Verifica que estés usando una tarjeta de test válida
3. Revisa los logs del backend para más detalles

### Error: "El monto enviado no coincide"

**Causa**: El amount del frontend no coincide con el calculado en backend.

**Solución**:
- Este es un error de seguridad esperado
- El backend siempre calcula el monto desde la DB
- Verifica que el payment intent esté actualizado

## 📚 Referencias

- [Mercado Pago Bricks Documentation](https://www.mercadopago.com/developers/es/docs/checkout-bricks/card-payment-brick)
- [Mercado Pago Test Cards](https://www.mercadopago.com/developers/es/docs/checkout-api/testing)

