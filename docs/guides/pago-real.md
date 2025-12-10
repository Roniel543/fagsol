# 💳 Guía de Prueba - Pago Real

**Curso:** "Introducción a la Programación Web"  
**Precio:** 10 PEN

---

## ✅ Verificación Pre-Pago

### **1. Curso Creado/Actualizado:**

**Datos del curso:**
- Título: "Introducción a la Programación Web"
- Precio: **10 PEN**
- Estado: Publicado ✅
- `price_usd`: Se calculará automáticamente (aproximadamente **$2.97 USD** con tasa 3.36)

### **2. Sistema Calcula Automáticamente:**

```
1. Admin ingresa: 10 PEN
2. Sistema consulta API: tasa = 3.36 (real)
3. Calcula: price_usd = 10 / 3.36 = 2.97 USD
4. Guarda:
   - price = 10 PEN ✅
   - price_usd = 2.97 USD ✅
```

---

## 🔄 Flujo de Pago Real

### **Paso 1: Usuario Agrega al Carrito**

**Usuario en Perú verá:**
```
S/ 10.00
≈ $ 2.97 USD
```

**Usuario en Colombia verá:**
```
$ 11,250 COP (aproximadamente)
≈ $ 2.97 USD
```

### **Paso 2: Crear PaymentIntent**

**Backend crea:**
```json
{
  "id": "pi_xxx",
  "total": 10.00,
  "currency": "PEN",
  "status": "pending",
  "course_ids": ["c-xxx"]
}
```

### **Paso 3: Procesar Pago con Mercado Pago**

**Datos enviados a Mercado Pago:**
```json
{
  "transaction_amount": 10.00,
  "currency": "PEN",
  "token": "token_de_tarjeta",
  "payment_method_id": "visa|master|amex",
  "installments": 1,
  "description": "Pago de cursos: c-xxx"
}
```

### **Paso 4: Mercado Pago Procesa**

- ✅ Valida tarjeta
- ✅ Procesa pago de 10 PEN
- ✅ Envía webhook al backend

### **Paso 5: Webhook Confirma**

**Backend recibe:**
```json
{
  "action": "payment.updated",
  "data": {
    "id": "mp_payment_id",
    "status": "approved",
    "transaction_amount": 10.00,
    "currency_id": "PEN"
  }
}
```

**Backend:**
1. ✅ Valida webhook (firma)
2. ✅ Actualiza PaymentIntent a "completed"
3. ✅ Crea Payment
4. ✅ Crea Enrollment automáticamente

---

## 🧪 Pasos para Probar

### **1. Verificar Curso Creado:**

```bash
# Verificar en BD que el curso tiene:
# - price = 10.00
# - price_usd = 2.97 (aproximadamente)
```

### **2. Iniciar Sesión como Estudiante:**

- Usar cuenta de estudiante (no admin)
- O crear cuenta de prueba

### **3. Agregar Curso al Carrito:**

- Visitar página del curso
- Hacer clic en "Agregar al carrito"
- Verificar que muestra precio correcto

### **4. Proceder al Pago:**

- Ir al carrito
- Hacer clic en "Pagar"
- Verificar PaymentIntent creado

### **5. Completar Pago:**

- Usar tarjeta de prueba de Mercado Pago
- O tarjeta real (pequeño monto: 10 PEN)
- Completar formulario de pago

### **6. Verificar Resultado:**

- ✅ Webhook recibido
- ✅ Payment creado
- ✅ Enrollment creado
- ✅ Usuario puede acceder al curso

---

## 💳 Tarjetas de Prueba de Mercado Pago

### **Tarjetas Aprobadas:**

**Visa:**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

**Mastercard:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

### **Tarjetas Rechazadas (para probar errores):**

**Tarjeta Rechazada:**
- Número: `4013 5406 8274 6260`
- CVV: `123`

**Tarjeta Insuficiente:**
- Número: `5031 4332 1540 6351`
- CVV: `123`

---

## ✅ Checklist de Verificación

### **Antes del Pago:**
- [ ] Curso creado con precio 10 PEN
- [ ] `price_usd` calculado correctamente (~2.97 USD)
- [ ] Curso está publicado
- [ ] Usuario estudiante logueado
- [ ] Carrito muestra precio correcto

### **Durante el Pago:**
- [ ] PaymentIntent creado (10 PEN)
- [ ] Formulario de pago carga correctamente
- [ ] Tarjeta aceptada
- [ ] Pago procesado

### **Después del Pago:**
- [ ] Webhook recibido
- [ ] Payment creado en BD
- [ ] Enrollment creado
- [ ] Usuario puede acceder al curso
- [ ] Email de confirmación enviado (si está configurado)

---

## 🔍 Verificar en Logs

### **Backend (Django):**

```python
# Buscar en logs:
INFO: Payment intent creado: pi_xxx para usuario xxx
INFO: Transaction amount formateado: 10.0 (original: 10.00)
INFO: Payment procesado exitosamente: payment_id
INFO: Enrollment creado para usuario xxx en curso c-xxx
```

### **Mercado Pago:**

- Verificar en panel de Mercado Pago
- Ver pago procesado
- Ver webhook enviado

---

## ⚠️ Consideraciones Importantes

### **1. Monto Mínimo:**

- Mercado Pago requiere mínimo 1 PEN
- 10 PEN es válido ✅

### **2. Tarjetas Internacionales:**

- Si pruebas desde otro país, el banco convertirá PEN → moneda de la tarjeta
- Puede haber pequeña diferencia por tasa de cambio del banco

### **3. Webhook:**

- Asegúrate de que el webhook esté configurado
- URL debe ser accesible (ngrok en desarrollo)
- Verificar firma del webhook

### **4. Ambiente:**

- **Desarrollo:** Usar tarjetas de prueba
- **Producción:** Usar tarjetas reales (con cuidado)

---

## 🎯 Resultado Esperado

**Si todo funciona correctamente:**

1. ✅ Usuario ve precio: **S/ 10.00**
2. ✅ Usuario agrega al carrito
3. ✅ PaymentIntent creado: **10 PEN**
4. ✅ Usuario completa pago
5. ✅ Mercado Pago procesa: **10 PEN**
6. ✅ Webhook confirma pago
7. ✅ Enrollment creado automáticamente
8. ✅ Usuario puede acceder al curso

---

## 📊 Verificación Post-Pago

### **En Base de Datos:**

```sql
-- Verificar PaymentIntent
SELECT id, total, currency, status 
FROM payments_paymentintent 
WHERE id = 'pi_xxx';
-- Debe mostrar: total=10.00, currency='PEN', status='completed'

-- Verificar Payment
SELECT id, amount, currency, status, mercado_pago_payment_id
FROM payments_payment
WHERE payment_intent_id = 'pi_xxx';
-- Debe mostrar: amount=10.00, currency='PEN', status='completed'

-- Verificar Enrollment
SELECT id, user_id, course_id, status
FROM courses_enrollment
WHERE course_id = 'c-xxx' AND user_id = xxx;
-- Debe existir con status='active'
```

---

## 🚀 ¡Listo para Probar!

**Pasos:**
1. ✅ Curso creado con 10 PEN
2. ✅ Sistema calculará `price_usd` automáticamente
3. ✅ Usuario puede agregar al carrito
4. ✅ Procesar pago con tarjeta
5. ✅ Verificar que todo funciona

**¡Buena suerte con la prueba!** 🎉

---

**Última actualización:** 6 de Diciembre, 2025

