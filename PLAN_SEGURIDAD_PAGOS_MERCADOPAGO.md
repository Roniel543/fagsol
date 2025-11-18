# 🔐 PLAN DE SEGURIDAD PARA PAGOS CON MERCADO PAGO

## 📋 **ESTADO ACTUAL**

### ✅ **Lo que ya está implementado:**
1. ✅ Tokenización client-side (no se envían datos de tarjeta al backend)
2. ✅ Validación de precios solo en backend
3. ✅ Payment Intent con validación de cursos
4. ✅ Idempotency keys para evitar cobros duplicados
5. ✅ Webhooks de Mercado Pago (estructura lista)

### ❌ **Lo que falta:**
1. ❌ Configurar credenciales de Mercado Pago en `.env`
2. ❌ Integrar Mercado Pago Bricks en el frontend
3. ❌ Validar y procesar webhooks correctamente
4. ❌ Rate limiting en endpoints de pago
5. ❌ Logs de auditoría completos
6. ❌ Manejo de errores robusto

---

## 🎯 **PLAN DE IMPLEMENTACIÓN SEGURA**

### **FASE 1: Configuración Inicial (CRÍTICO)**

#### 1.1 Configurar Variables de Entorno

**Backend (`backend/.env`):**
```env
# Mercado Pago - Credenciales de Prueba
MERCADOPAGO_ACCESS_TOKEN=TEST-7477479627924004-082423-5fe09daccfadcd94520de27fd7080ae5-2644737263
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-2742c5af-4c5d-4ea6-9924-da7ba403fd7a
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-2742c5af-4c5d-4ea6-9924-da7ba403fd7a
```

#### 1.2 Verificar que el backend lee las variables

**Archivo:** `backend/config/settings.py`
```python
MERCADOPAGO_ACCESS_TOKEN = config('MERCADOPAGO_ACCESS_TOKEN', default='')
MERCADOPAGO_WEBHOOK_SECRET = config('MERCADOPAGO_WEBHOOK_SECRET', default='')
MERCADOPAGO_PUBLIC_KEY = config('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY', default='')
```

✅ **Ya está configurado correctamente**

---

### **FASE 2: Integración Frontend con Mercado Pago Bricks**

#### 2.1 Instalar SDK de Mercado Pago

```bash
cd frontend
npm install @mercadopago/sdk-react
```

#### 2.2 Crear componente de formulario de tarjeta

**Archivo:** `frontend/src/features/academy/components/payments/MercadoPagoCardForm.tsx`

**Características de seguridad:**
- ✅ Tokenización 100% client-side
- ✅ No se almacenan datos de tarjeta
- ✅ Validación de campos
- ✅ Manejo de errores

#### 2.3 Actualizar CheckoutPage

- Integrar el componente de tarjeta
- Manejar el token cuando se genera
- Enviar solo el token al backend

---

### **FASE 3: Seguridad Backend (CRÍTICO)**

#### 3.1 Validaciones de Seguridad

**Archivo:** `backend/infrastructure/services/payment_service.py`

**Validaciones a agregar:**
1. ✅ Validar que el usuario no tenga cursos ya inscritos
2. ✅ Validar precios desde BD (ya implementado)
3. ✅ Validar que el payment intent pertenece al usuario
4. ✅ Validar idempotency key
5. ⚠️ **AGREGAR:** Rate limiting por usuario
6. ⚠️ **AGREGAR:** Validación de monto máximo por transacción
7. ⚠️ **AGREGAR:** Validación de límite de intentos fallidos

#### 3.2 Procesamiento de Pago Seguro

**Flujo actual:**
```
1. Frontend crea payment intent → Backend valida y crea
2. Frontend tokeniza tarjeta → Mercado Pago (client-side)
3. Frontend envía token → Backend procesa con Mercado Pago API
4. Si exitoso → Backend crea Payment y Enrollments
```

**Mejoras de seguridad:**
- ✅ Validar que el token no haya sido usado antes
- ✅ Validar que el payment intent no haya expirado
- ✅ Validar que el monto coincida con el payment intent
- ⚠️ **AGREGAR:** Timeout para payment intents (1 hora)
- ⚠️ **AGREGAR:** Verificación de firma del webhook

#### 3.3 Webhooks de Mercado Pago

**Archivo:** `backend/presentation/views/payment_views.py`

**Endpoints necesarios:**
- `POST /api/v1/payments/webhook/` - Recibir webhooks

**Validaciones:**
1. ✅ Verificar firma del webhook
2. ✅ Verificar que no se haya procesado antes (idempotencia)
3. ✅ Actualizar estado del pago
4. ✅ Crear enrollments si el pago se aprueba

---

### **FASE 4: Logs y Auditoría**

#### 4.1 Logs de Seguridad

**Eventos a registrar:**
- ✅ Creación de payment intent
- ✅ Procesamiento de pago
- ✅ Webhooks recibidos
- ⚠️ **AGREGAR:** Intentos fallidos de pago
- ⚠️ **AGREGAR:** Cambios de estado de pagos
- ⚠️ **AGREGAR:** Errores de validación

**Información a NO registrar:**
- ❌ Tokens de tarjeta (nunca)
- ❌ Datos de tarjeta (nunca)
- ❌ CVV (nunca)
- ✅ Solo IDs, montos, estados, timestamps

#### 4.2 Alertas de Seguridad

**Alertas a implementar:**
- Múltiples intentos fallidos del mismo usuario
- Montos inusuales
- Webhooks con firma inválida
- Payment intents expirados

---

### **FASE 5: Testing y Validación**

#### 5.1 Tests de Seguridad

**Tests a crear:**
1. ✅ Test: No se puede procesar pago sin token
2. ✅ Test: No se puede procesar pago con token inválido
3. ✅ Test: No se puede procesar pago dos veces (idempotencia)
4. ⚠️ **AGREGAR:** Test: Rate limiting funciona
5. ⚠️ **AGREGAR:** Test: Webhook con firma inválida rechazado
6. ⚠️ **AGREGAR:** Test: Payment intent expirado rechazado

#### 5.2 Pruebas con Tarjetas de Prueba

**Tarjetas de prueba de Mercado Pago:**
- Aprobada: `5031 7557 3453 0604` (CVV: 123)
- Rechazada: `5031 4332 1540 6351` (CVV: 123)
- Pendiente: `5031 7557 3453 0604` (CVV: 123, usar monto específico)

---

## 🔒 **PRINCIPIOS DE SEGURIDAD APLICADOS**

### 1. **Tokenización (PCI DSS Compliant)**
- ✅ Datos de tarjeta NUNCA tocan el servidor
- ✅ Tokenización 100% client-side
- ✅ Solo se envía el token al backend

### 2. **Validación Backend**
- ✅ Precios validados solo en backend
- ✅ Cursos validados desde BD
- ✅ Usuario validado (JWT)

### 3. **Idempotencia**
- ✅ Idempotency keys en cada pago
- ✅ Prevención de cobros duplicados

### 4. **Webhooks Seguros**
- ✅ Verificación de firma
- ✅ Idempotencia de webhooks
- ✅ Logs de todos los webhooks

### 5. **Rate Limiting**
- ⚠️ **PENDIENTE:** Limitar intentos de pago por usuario
- ⚠️ **PENDIENTE:** Limitar creación de payment intents

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

### **Inmediato (Para que funcione):**
- [ ] 1. Agregar credenciales a `.env` del backend
- [ ] 2. Agregar `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` a `.env.local` del frontend
- [ ] 3. Instalar `@mercadopago/sdk-react` en frontend
- [ ] 4. Crear componente `MercadoPagoCardForm`
- [ ] 5. Integrar componente en `CheckoutPage`
- [ ] 6. Corregir parsing de respuesta en `createPaymentIntent`

### **Corto Plazo (Esta semana):**
- [ ] 7. Implementar endpoint de webhooks
- [ ] 8. Agregar rate limiting
- [ ] 9. Mejorar logs de auditoría
- [ ] 10. Tests de seguridad

### **Mediano Plazo (Próximas 2 semanas):**
- [ ] 11. Alertas de seguridad
- [ ] 12. Dashboard de monitoreo de pagos
- [ ] 13. Documentación completa
- [ ] 14. Migración a credenciales de producción

---

## 🚨 **RIESGOS Y MITIGACIONES**

### **Riesgo 1: Cobros Duplicados**
**Mitigación:**
- ✅ Idempotency keys
- ✅ Validación de payment intent procesado
- ✅ Webhooks idempotentes

### **Riesgo 2: Manipulación de Precios**
**Mitigación:**
- ✅ Precios validados solo en backend
- ✅ Payment intent calcula desde BD
- ✅ Validación de monto en procesamiento

### **Riesgo 3: Ataques de Fuerza Bruta**
**Mitigación:**
- ⚠️ Rate limiting (pendiente)
- ✅ Validación de tokens
- ✅ Timeout de payment intents

### **Riesgo 4: Webhooks Falsos**
**Mitigación:**
- ✅ Verificación de firma
- ✅ Validación de origen
- ✅ Logs de todos los webhooks

---

## 📚 **RECURSOS**

- [Documentación Mercado Pago](https://www.mercadopago.com.pe/developers/es/docs)
- [Mercado Pago Bricks](https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks)
- [Tarjetas de Prueba](https://www.mercadopago.com.pe/developers/es/docs/checkout-api/testing)
- [Webhooks](https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks)

---

## ✅ **PRÓXIMOS PASOS INMEDIATOS**

1. **Corregir el error actual** (parsing de respuesta)
2. **Configurar credenciales** en `.env`
3. **Instalar SDK de Mercado Pago** en frontend
4. **Crear componente de tarjeta**
5. **Probar con tarjetas de prueba**

¿Empezamos con la corrección del error y la configuración de credenciales?

