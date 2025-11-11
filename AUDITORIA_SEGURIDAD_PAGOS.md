# 🔒 Auditoría de Seguridad - Frontend para Pagos Reales

**Fecha:** 2024  
**Estado:** ⚠️ **NO LISTO PARA PAGOS REALES**

---

## ✅ **Lo que SÍ está seguro (FASE 1)**

### **1. Autenticación y Tokens** ✅
- ✅ Tokens JWT en `sessionStorage` (no localStorage)
- ✅ Refresh token automático
- ✅ Logout server-side (frontend listo)
- ✅ Headers de seguridad (CSP, X-Frame-Options, etc.)
- ✅ Sanitización HTML (DOMPurify)

**Estado:** ✅ **SEGURO**

---

## 🔴 **VULNERABILIDADES CRÍTICAS para Pagos Reales**

### **1. Manipulación de Precios** 🔴 **CRÍTICO**

**Problema:**
```typescript
// frontend/src/features/academy/pages/CheckoutPage.tsx
const total = useMemo(() => {
    return cartItemsWithDetails.reduce((sum, item) => {
        const price = item.course.discountPrice || item.course.price;
        return sum + price * item.qty;  // ❌ Calculado en frontend
    }, 0);
}, [cartItemsWithDetails]);

// ❌ NO se valida en backend
// ❌ Un atacante puede modificar precios antes de enviar
```

**Ataque posible:**
```javascript
// Atacante modifica el precio en el navegador
const course = cartItemsWithDetails[0].course;
course.price = 0.01;  // Cambiar precio de $149 a $0.01
// Luego procede con el checkout
```

**Impacto:** 💰 **Pérdida financiera masiva**

**Solución requerida:**
- ✅ Backend DEBE validar precios
- ✅ Frontend solo envía `course_id`, NO precio
- ✅ Backend calcula total desde base de datos

---

### **2. No hay Integración Real de Mercado Pago** 🔴 **CRÍTICO**

**Problema actual:**
```typescript
// frontend/src/features/academy/pages/CheckoutPage.tsx
const onConfirm = async () => {
    // ❌ Mock de pago - NO procesa pagos reales
    addEnrollments(cartItemsWithDetails.map((i) => i.course.id));
    clearCart();
    router.push('/academy/checkout/success');
};
```

**Estado:** ❌ **NO FUNCIONAL para pagos reales**

**Solución requerida:**
1. Integrar Mercado Pago SDK (Bricks/Elements)
2. Tokenización client-side
3. Enviar token a backend (NO datos de tarjeta)
4. Backend procesa pago con Mercado Pago API

---

### **3. Datos de Tarjeta en Frontend** 🔴 **CRÍTICO**

**Problema:**
```typescript
// frontend/src/features/academy/components/payments/CardForm.tsx
// ❌ Formulario mock - NO usa tokenización real
// ❌ Si fuera real, violaría PCI DSS
```

**Estado:** ⚠️ **Es solo mock, pero si fuera real sería VULNERABLE**

**Solución requerida:**
- ✅ Usar Mercado Pago Hosted Fields (Bricks)
- ✅ Tokenización client-side
- ✅ NUNCA enviar datos de tarjeta al backend
- ✅ Solo enviar token de Mercado Pago

---

### **4. No hay Validación Server-Side** 🔴 **CRÍTICO**

**Problema:**
- ❌ No hay endpoint de pagos en backend
- ❌ No hay validación de cursos
- ❌ No hay validación de usuario autenticado
- ❌ No hay validación de precios

**Estado:** ❌ **FALTA IMPLEMENTAR**

---

### **5. No hay Protección contra Replay Attacks** 🟡 **MEDIO**

**Problema:**
- ❌ No hay nonces o request IDs
- ❌ Un atacante puede repetir requests de pago

**Estado:** ⚠️ **MEJORABLE**

---

## 📋 **Checklist de Seguridad para Pagos Reales**

### **Frontend** ⚠️ **FALTA IMPLEMENTAR**

- [ ] ❌ Integración Mercado Pago SDK (Bricks/Elements)
- [ ] ❌ Tokenización client-side de tarjetas
- [ ] ❌ NO enviar precios al backend (solo course_ids)
- [ ] ❌ NO enviar datos de tarjeta (solo token)
- [ ] ❌ Validación de formularios mejorada
- [ ] ❌ Manejo de errores de pago
- [ ] ❌ Loading states durante pago
- [ ] ❌ Prevención de doble submit

### **Backend** ⚠️ **FALTA IMPLEMENTAR**

- [ ] ❌ Endpoint `POST /api/v1/payments/`
- [ ] ❌ Validación de usuario autenticado
- [ ] ❌ Validación de cursos existen
- [ ] ❌ Validación de precios (desde BD, NO del request)
- [ ] ❌ Validación de usuario no tiene cursos ya
- [ ] ❌ Integración con Mercado Pago API
- [ ] ❌ Procesar pago con token de Mercado Pago
- [ ] ❌ Crear enrollment solo si pago exitoso
- [ ] ❌ Webhooks de Mercado Pago
- [ ] ❌ Rate limiting en endpoint de pagos
- [ ] ❌ Logs de transacciones (sin datos sensibles)

---

## 🎯 **Flujo Seguro Requerido**

### **Flujo Actual (INSEGURO):**
```
1. Usuario agrega cursos al carrito
2. Frontend calcula total ❌
3. Usuario hace checkout
4. Frontend simula pago ❌
5. Frontend crea enrollment ❌
```

### **Flujo Seguro Requerido:**
```
1. Usuario agrega cursos al carrito
   ↓
2. Usuario hace checkout
   ↓
3. Frontend solicita "payment intent" al backend
   Backend valida:
   - Usuario autenticado ✅
   - Cursos existen ✅
   - Precios correctos (desde BD) ✅
   - Usuario no tiene cursos ✅
   Backend retorna: { payment_intent_id, total, items }
   ↓
4. Frontend muestra total (solo para UI)
   ↓
5. Usuario completa tarjeta en Mercado Pago Bricks
   ↓
6. Mercado Pago tokeniza tarjeta (client-side) ✅
   ↓
7. Frontend envía token a backend:
   POST /api/v1/payments/
   {
     payment_intent_id: "...",
     payment_token: "token_de_mercadopago",  // ✅ Solo token
     // ❌ NO: card_number, cvv, etc.
   }
   ↓
8. Backend valida:
   - payment_intent_id válido ✅
   - Precio coincide con payment_intent ✅
   - Token de Mercado Pago válido ✅
   ↓
9. Backend procesa pago con Mercado Pago API
   ↓
10. Si pago exitoso:
    - Backend crea Payment record ✅
    - Backend crea Enrollment ✅
    - Backend retorna success
    ↓
11. Frontend redirige a success page
```

---

## 🔧 **Implementación Requerida**

### **1. Frontend - Integración Mercado Pago**

**Archivo a crear:** `frontend/src/shared/services/payments.ts`

```typescript
// Integración con Mercado Pago
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Tokenizar tarjeta (client-side)
export async function tokenizeCard(cardData: CardData): Promise<string> {
    // Usar Mercado Pago SDK
    // Retornar solo el token
}

// Crear payment intent
export async function createPaymentIntent(courseIds: string[]): Promise<PaymentIntent> {
    // Backend valida y retorna payment_intent_id + total
}

// Procesar pago
export async function processPayment(
    paymentIntentId: string,
    paymentToken: string
): Promise<PaymentResult> {
    // Backend procesa con Mercado Pago
}
```

**Archivo a modificar:** `frontend/src/features/academy/pages/CheckoutPage.tsx`

```typescript
// ❌ ELIMINAR cálculo de total en frontend
// ✅ Usar total del backend (payment intent)
// ✅ Integrar Mercado Pago Bricks
// ✅ Tokenizar tarjeta client-side
// ✅ Enviar solo token al backend
```

### **2. Backend - Endpoints de Pago**

**Archivo a crear:** `backend/presentation/views/payment_views.py`

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Crea un payment intent con validación server-side
    """
    course_ids = request.data.get('course_ids', [])
    
    # Validar cursos existen
    courses = Course.objects.filter(id__in=course_ids)
    if courses.count() != len(course_ids):
        return Response({'error': 'Invalid courses'}, status=400)
    
    # Calcular total desde BD (NO confiar en frontend)
    total = sum(course.price for course in courses)
    
    # Validar usuario no tiene cursos
    existing = Enrollment.objects.filter(
        user=request.user,
        course_id__in=course_ids
    )
    if existing.exists():
        return Response({'error': 'Already enrolled'}, status=400)
    
    # Crear payment intent
    payment_intent = PaymentIntent.objects.create(
        user=request.user,
        total=total,
        status='pending'
    )
    
    return Response({
        'payment_intent_id': payment_intent.id,
        'total': total,
        'items': [...]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """
    Procesa pago con Mercado Pago
    """
    payment_intent_id = request.data.get('payment_intent_id')
    payment_token = request.data.get('payment_token')
    
    # Validar payment intent
    payment_intent = PaymentIntent.objects.get(
        id=payment_intent_id,
        user=request.user,
        status='pending'
    )
    
    # Procesar con Mercado Pago
    result = mercadopago_api.process_payment(
        token=payment_token,
        amount=payment_intent.total
    )
    
    if result.success:
        # Crear payment record
        Payment.objects.create(...)
        
        # Crear enrollments
        for course_id in payment_intent.course_ids:
            Enrollment.objects.create(
                user=request.user,
                course_id=course_id
            )
        
        payment_intent.status = 'completed'
        payment_intent.save()
    
    return Response(result)
```

---

## ⚠️ **RESUMEN: ¿Estamos Seguros para Pagos Reales?**

### **Respuesta: ❌ NO**

**Razones:**
1. ❌ No hay integración real de Mercado Pago
2. ❌ Los precios se calculan en frontend (manipulables)
3. ❌ No hay validación server-side
4. ❌ No hay endpoints de pago en backend
5. ❌ Checkout es completamente MOCK

**Lo que SÍ está seguro:**
- ✅ Autenticación (tokens, refresh)
- ✅ Sanitización HTML
- ✅ CSP headers
- ✅ Estructura base

**Lo que FALTA para pagos reales:**
- ❌ Integración Mercado Pago (6-8 horas)
- ❌ Endpoints backend de pagos (4-6 horas)
- ❌ Validación server-side (2-4 horas)
- ❌ Tests de integración (2-4 horas)

**Total estimado:** 14-22 horas de desarrollo

---

## 🎯 **Recomendación**

### **NO lanzar a producción con pagos reales hasta:**
1. ✅ Implementar integración Mercado Pago
2. ✅ Implementar endpoints backend de pagos
3. ✅ Validación server-side de precios
4. ✅ Tests de integración
5. ✅ Revisión de seguridad

### **Orden de implementación:**
1. **Backend:** Endpoints de pago + validación (4-6 horas)
2. **Frontend:** Integración Mercado Pago (6-8 horas)
3. **Tests:** Integración y seguridad (2-4 horas)
4. **Revisión:** Auditoría final (2 horas)

---

## 📚 **Referencias**

- `frontend/SECURITY_README_FRONTEND.md` - Guía de seguridad
- `RIESGOS_SEGURIDAD_PAGOS.md` - Análisis de riesgos
- `ESTADO_PROYECTO_Y_PROXIMOS_PASOS.md` - Estado del proyecto

---

**Última actualización:** 2024

