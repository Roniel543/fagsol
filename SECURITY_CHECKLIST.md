# 🔒 Security Checklist - Pagos con Mercado Pago Bricks

## ✅ Pre-Merge Checklist

### Frontend

- [ ] ✅ CardPayment Brick implementado (NO tokenización manual)
- [ ] ✅ NO se envían datos de tarjeta al backend (card_number, expiration_month, expiration_year, security_code)
- [ ] ✅ Solo se envía token, payment_method_id, installments, amount
- [ ] ✅ Idempotency key generado (uuid o crypto.randomUUID)
- [ ] ✅ NO almacenar tokens en localStorage/sessionStorage
- [ ] ✅ NO loguear tokens completos
- [ ] ✅ Variables de entorno configuradas (NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)
- [ ] ✅ Tests unitarios pasando
- [ ] ✅ Tests e2e pasando

### Backend

- [ ] ✅ Serializer valida solo token, payment_method_id, installments, amount
- [ ] ✅ NO acepta card_number, expiration_month, expiration_year, security_code
- [ ] ✅ Validación de amount contra payment_intent.total desde DB
- [ ] ✅ Idempotency con unique constraint en DB
- [ ] ✅ Transacciones atómicas para Payment + Enrollment
- [ ] ✅ Webhook signature verification (HMAC SHA256)
- [ ] ✅ Rate limiting en endpoints de pagos
- [ ] ✅ Logging con request-id
- [ ] ✅ NO almacenar datos de tarjeta
- [ ] ✅ NO loguear tokens completos
- [ ] ✅ Variables de entorno configuradas (MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET)
- [ ] ✅ Migrations aplicadas
- [ ] ✅ Tests unitarios pasando
- [ ] ✅ Tests de integración pasando

### Seguridad General

- [ ] ✅ HTTPS requerido en producción
- [ ] ✅ HSTS headers configurados
- [ ] ✅ CSP headers configurados
- [ ] ✅ Secure cookies configurados
- [ ] ✅ X-Frame-Options: DENY
- [ ] ✅ X-Content-Type-Options: nosniff
- [ ] ✅ Password hashing con Argon2
- [ ] ✅ Rate limiting configurado
- [ ] ✅ CORS configurado correctamente

## 🔍 SAST (Static Application Security Testing)

### Backend

```bash
# Bandit (Python security linter)
bandit -r backend/ -f json -o bandit-report.json

# Verificar que no hay vulnerabilidades críticas
bandit -r backend/ -ll
```

**Checklist:**
- [ ] ✅ No hardcoded secrets
- [ ] ✅ No SQL injection vulnerabilities
- [ ] ✅ No XSS vulnerabilities
- [ ] ✅ No insecure deserialization
- [ ] ✅ No weak cryptography

### Frontend

```bash
# ESLint security plugin
npm run lint

# npm audit
npm audit
```

**Checklist:**
- [ ] ✅ No vulnerabilidades en dependencias (npm audit)
- [ ] ✅ No XSS vulnerabilities
- [ ] ✅ No CSRF vulnerabilities
- [ ] ✅ No insecure dependencies

## 🔍 DAST (Dynamic Application Security Testing)

### OWASP ZAP Scan

```bash
# Ejecutar OWASP ZAP scan (stub)
# En producción, usar OWASP ZAP completo
```

**Checklist:**
- [ ] ✅ No SQL injection
- [ ] ✅ No XSS
- [ ] ✅ No CSRF
- [ ] ✅ No authentication bypass
- [ ] ✅ No sensitive data exposure

## 📋 Revisión de Código

### Frontend

- [ ] ✅ Revisar CheckoutPage.tsx
- [ ] ✅ Revisar payments.ts service
- [ ] ✅ Verificar que NO se envían datos de tarjeta
- [ ] ✅ Verificar manejo de errores
- [ ] ✅ Verificar idempotency

### Backend

- [ ] ✅ Revisar ProcessPaymentSerializer
- [ ] ✅ Revisar process_payment view
- [ ] ✅ Revisar PaymentService.process_payment
- [ ] ✅ Verificar validación de amount
- [ ] ✅ Verificar idempotency
- [ ] ✅ Verificar webhook signature verification
- [ ] ✅ Verificar transacciones atómicas

## 🧪 Tests

### Frontend

```bash
# Tests unitarios
npm test

# Tests e2e
npm run test:e2e
```

**Checklist:**
- [ ] ✅ Tests de CheckoutPage pasando
- [ ] ✅ Tests de payments service pasando
- [ ] ✅ Tests e2e de flujo completo pasando

### Backend

```bash
# Tests unitarios
pytest backend/apps/payments/tests/test_process_payment.py -v

# Tests de integración
pytest backend/presentation/views/tests/test_payments_integration.py -v
```

**Checklist:**
- [ ] ✅ Tests de serializer pasando
- [ ] ✅ Tests de process_payment pasando
- [ ] ✅ Tests de webhook pasando
- [ ] ✅ Tests de idempotency pasando
- [ ] ✅ Tests de validación de amount pasando

## 🚀 Deployment

### Pre-Deployment

- [ ] ✅ Variables de entorno configuradas en staging/production
- [ ] ✅ MERCADOPAGO_ACCESS_TOKEN configurado
- [ ] ✅ MERCADOPAGO_PUBLIC_KEY configurado
- [ ] ✅ MERCADOPAGO_WEBHOOK_SECRET configurado
- [ ] ✅ Migrations aplicadas
- [ ] ✅ Tests pasando en staging

### Post-Deployment

- [ ] ✅ Verificar que endpoints responden correctamente
- [ ] ✅ Verificar que webhooks funcionan
- [ ] ✅ Verificar logs para errores
- [ ] ✅ Monitorear métricas de pagos

## 📝 Documentación

- [ ] ✅ README_PAYMENTS.md actualizado (frontend)
- [ ] ✅ README_PAYMENTS.md actualizado (backend)
- [ ] ✅ SECURITY_CHECKLIST.md completo
- [ ] ✅ OpenAPI documentation actualizada
- [ ] ✅ Instrucciones de prueba documentadas

## ⚠️ Notas Importantes

1. **NUNCA** commitees variables de entorno con valores reales
2. **NUNCA** almacenes datos de tarjeta en logs o DB
3. **SIEMPRE** valida amount contra DB (NO confiar en frontend)
4. **SIEMPRE** verifica firma de webhooks
5. **SIEMPRE** usa idempotency keys para evitar cobros duplicados

## 🔗 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mercado Pago Security Best Practices](https://www.mercadopago.com/developers/es/docs/security)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)

