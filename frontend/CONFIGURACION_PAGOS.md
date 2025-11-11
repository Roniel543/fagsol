# 💳 Configuración de Pagos - Frontend

## 🔧 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local` o `.env`:

```bash
# Mercado Pago - Clave Pública (Frontend)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Obtener Clave Pública de Mercado Pago

1. Ve a: https://www.mercadopago.com.pe/developers/panel
2. Crea una aplicación o usa una existente
3. Copia la **Public Key** (no la Access Token)
4. Agrégala a `.env.local` como `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

**⚠️ IMPORTANTE:**
- La **Public Key** es segura para usar en el frontend
- La **Access Token** (secret key) NUNCA debe estar en el frontend
- La Access Token solo va en el backend

---

## 📋 Endpoints Backend Requeridos

El frontend espera estos endpoints en el backend:

### 1. Crear Payment Intent
```
POST /api/v1/payments/intent/
Body: { "course_ids": ["c-001", "c-002"] }
Response: {
  "success": true,
  "data": {
    "id": "pi_123",
    "total": 149.00,
    "currency": "PEN",
    "items": [
      {
        "course_id": "c-001",
        "course_title": "Curso 1",
        "price": 99.00
      }
    ],
    "status": "pending"
  }
}
```

### 2. Procesar Pago
```
POST /api/v1/payments/process/
Body: {
  "payment_intent_id": "pi_123",
  "payment_token": "token_de_mercadopago"
}
Response: {
  "success": true,
  "data": {
    "payment_id": "pay_123",
    "status": "approved",
    "enrollment_ids": ["enr_1", "enr_2"]
  }
}
```

---

## 🔒 Seguridad Implementada

### ✅ Lo que SÍ está seguro:

1. **Tokenización Client-Side**
   - Las tarjetas se tokenizan en el navegador
   - Solo se envía el token al backend (NO datos de tarjeta)

2. **Validación Server-Side**
   - Precios calculados por backend (NO manipulables)
   - Cursos validados por backend
   - Usuario autenticado verificado

3. **No Exposición de Datos Sensibles**
   - No se almacenan datos de tarjeta
   - No se envían datos de tarjeta al backend
   - Solo tokens de Mercado Pago

### ⚠️ Mejoras Pendientes para Producción:

1. **Usar Mercado Pago Bricks/Elements**
   - El componente actual es funcional pero básico
   - Para producción, usar Bricks para cumplir PCI DSS completamente
   - Ver: https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks

2. **Validación de Tarjeta Mejorada**
   - Validar formato de tarjeta (Luhn algorithm)
   - Validar fecha de expiración
   - Validar CVV según tipo de tarjeta

---

## 🧪 Testing

### Modo de Pruebas (Sandbox)

Mercado Pago proporciona tarjetas de prueba:

**Tarjetas de Prueba:**
- Visa: 4509 9535 6623 3704
- Mastercard: 5031 7557 3453 0604
- CVV: 123
- Fecha: Cualquier fecha futura (ej: 12/25)
- Nombre: Cualquier nombre

**Ver más:** https://www.mercadopago.com.pe/developers/es/docs/checkout-api/testing

---

## 📝 Notas de Implementación

### Flujo Actual:

1. Usuario agrega cursos al carrito
2. Usuario va a checkout
3. Frontend solicita payment intent al backend (solo course_ids)
4. Backend valida y calcula total → retorna payment intent
5. Frontend muestra formulario de tarjeta
6. Usuario completa tarjeta
7. Frontend tokeniza tarjeta (client-side)
8. Frontend envía token al backend
9. Backend procesa pago con Mercado Pago
10. Si exitoso → Backend crea enrollments
11. Frontend redirige a success

### Archivos Modificados:

- ✅ `frontend/src/shared/services/payments.ts` - Servicio de pagos
- ✅ `frontend/src/features/academy/pages/CheckoutPage.tsx` - Página de checkout
- ✅ `frontend/src/features/academy/components/payments/MercadoPagoCardForm.tsx` - Formulario de tarjeta
- ✅ `frontend/src/shared/services/api.ts` - Endpoints agregados

---

## 🚀 Próximos Pasos

1. **Backend:** Implementar endpoints `/payments/intent/` y `/payments/process/`
2. **Frontend:** Mejorar validación de formulario de tarjeta
3. **Frontend:** Integrar Mercado Pago Bricks (opcional, recomendado)
4. **Tests:** Tests de integración de pagos

---

**Última actualización:** 2024

