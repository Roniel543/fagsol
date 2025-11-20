# 💳 Guía de Pagos - Backend

## 📋 Resumen

El backend procesa pagos usando **Mercado Pago** con tokens obtenidos de **CardPayment Brick** en el frontend. Solo acepta `token`, `payment_method_id`, `installments`, `amount`. NO acepta datos de tarjeta.

## 🔧 Configuración

### Variables de Entorno

Agrega a tu archivo `.env` o vault:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

**IMPORTANTE:**
- Usa `TEST-` para desarrollo/testing
- Usa tus credenciales de producción para producción
- NUNCA commitees estas variables

## 🚀 Endpoints

### POST /api/v1/payments/intent/

Crea un payment intent (intención de pago).

**Request:**
```json
{
  "course_ids": ["course-1", "course-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pi_abc123",
    "total": 300.00,
    "currency": "PEN",
    "items": [
      {
        "course_id": "course-1",
        "course_title": "Curso 1",
        "price": 100.00
      }
    ],
    "status": "pending"
  }
}
```

### POST /api/v1/payments/process/

Procesa un pago con Mercado Pago.

**Request:**
```json
{
  "token": "token_mercadopago_123",
  "payment_method_id": "visa",
  "installments": 1,
  "amount": 150.0,
  "payment_intent_id": "pi_abc123",
  "idempotency_key": "optional_key"
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
X-Idempotency-Key: <optional_idempotency_key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc123",
    "status": "approved",
    "enrollment_ids": ["enr_1", "enr_2"],
    "amount": 150.0,
    "currency": "PEN"
  }
}
```

**Validaciones:**
- ✅ Usuario autenticado
- ✅ Usuario es estudiante
- ✅ Payment intent pertenece al usuario
- ✅ Payment intent está en estado `pending`
- ✅ Payment intent no expirado
- ✅ **Amount coincide con payment_intent.total desde DB** (NO confiar en frontend)
- ✅ Idempotency key única

### POST /api/v1/payments/webhook/

Recibe webhooks de Mercado Pago.

**Headers:**
```
X-Signature: ts=<timestamp>,v1=<hash>
X-Request-Id: <request_id>
```

**Request:**
```json
{
  "id": "webhook_id",
  "type": "payment",
  "data": {
    "id": "payment_id"
  }
}
```

**Validaciones:**
- ✅ Firma HMAC SHA256 verificada
- ✅ Webhook no procesado previamente (idempotencia)

## 🔒 Seguridad

### ✅ Implementado

- ✅ Validación de amount contra DB (NO confiar en frontend)
- ✅ Idempotency con unique constraint en DB
- ✅ Verificación de firma HMAC SHA256 en webhooks
- ✅ Transacciones atómicas para Payment + Enrollment
- ✅ Rate limiting en endpoints críticos
- ✅ Logging con request-id
- ✅ NO almacenar datos de tarjeta

### ⚠️ Importante

- ❌ NUNCA aceptes `card_number`, `expiration_month`, `expiration_year`, `security_code`
- ❌ NUNCA confíes en el `amount` del frontend (siempre validar contra DB)
- ❌ NUNCA loguees tokens completos
- ❌ NUNCA proceses webhooks sin verificar firma

## 🧪 Pruebas

### Con curl

```bash
# 1. Crear payment intent
curl -X POST http://localhost:8000/api/v1/payments/intent/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"course_ids": ["course-1"]}'

# 2. Procesar pago (necesitas un token real de CardPayment Brick)
curl -X POST http://localhost:8000/api/v1/payments/process/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-key-123" \
  -d '{
    "token": "token_from_brick",
    "payment_method_id": "visa",
    "installments": 1,
    "amount": 150.0,
    "payment_intent_id": "pi_abc123"
  }'
```

### Tests Unitarios

```bash
pytest backend/apps/payments/tests/test_process_payment.py
pytest backend/apps/payments/tests/test_webhook.py
```

## 📊 Modelos

### PaymentIntent

- `id`: ID único del payment intent
- `user`: Usuario que creó el payment intent
- `total`: Total calculado desde DB (NO del frontend)
- `currency`: Moneda (default: PEN)
- `status`: Estado (pending, processing, succeeded, failed, cancelled)
- `course_ids`: Lista de IDs de cursos
- `expires_at`: Fecha de expiración

### Payment

- `id`: ID único del pago
- `payment_intent`: Payment intent relacionado
- `user`: Usuario que pagó
- `amount`: Monto (validado contra payment_intent.total)
- `currency`: Moneda
- `status`: Estado (pending, approved, rejected, refunded, cancelled)
- `payment_token`: Token de Mercado Pago (NO datos de tarjeta)
- `installments`: Número de cuotas
- `idempotency_key`: Clave de idempotencia (unique)
- `mercado_pago_payment_id`: ID del pago en Mercado Pago
- `mercado_pago_status`: Estado en Mercado Pago

## 🔄 Flujo de Pago

1. **Frontend**: Crea payment intent → Backend calcula total desde DB
2. **Frontend**: Usuario completa CardPayment Brick → Obtiene token
3. **Frontend**: Envía token, payment_method_id, installments, amount
4. **Backend**: Valida amount contra payment_intent.total desde DB
5. **Backend**: Verifica idempotency
6. **Backend**: Crea pago en Mercado Pago
7. **Backend**: Si approved → Crea enrollments
8. **Backend**: Retorna resultado

## 🐛 Troubleshooting

### Error: "El monto enviado no coincide"

**Causa**: El amount del frontend no coincide con payment_intent.total.

**Solución**:
- Verifica que el payment intent esté actualizado
- Verifica que no haya cambios en precios de cursos
- Revisa logs para ver amounts comparados

### Error: "Este pago ya fue procesado"

**Causa**: Idempotency key duplicada.

**Solución**:
- Genera un nuevo idempotency key
- Verifica que no estés reenviando el mismo request

### Error: "Firma inválida" en webhook

**Causa**: La firma del webhook no coincide.

**Solución**:
- Verifica `MERCADOPAGO_WEBHOOK_SECRET`
- Verifica que el algoritmo HMAC SHA256 sea correcto
- Revisa logs para ver detalles de la verificación

## 📚 Referencias

- [Mercado Pago API Documentation](https://www.mercadopago.com/developers/es/reference)
- [Mercado Pago Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)

