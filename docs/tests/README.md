# 🧪 Guía de Tests - FagSol Escuela Virtual

Esta guía explica cómo ejecutar todos los tests implementados para las nuevas funcionalidades.

---

## 📋 Índice

1. [Tests Backend](#tests-backend)
2. [Tests Frontend](#tests-frontend)
3. [Tests E2E](#tests-e2e)
4. [Ejecutar Todos los Tests](#ejecutar-todos-los-tests)

---

## 🔧 Tests Backend

### Tests Unitarios

#### 1. Tests de Email Service

```bash
cd backend
python manage.py test infrastructure.services.tests.test_email_service
```

**Cubre:**
- ✅ Envío de emails de texto plano
- ✅ Envío de emails HTML
- ✅ Email de bienvenida
- ✅ Email de confirmación de inscripción
- ✅ Email de confirmación de pago (un curso)
- ✅ Email de confirmación de pago (múltiples cursos)
- ✅ Diferentes monedas (PEN, USD, EUR)

#### 2. Tests de Payment Service con Email

```bash
python manage.py test infrastructure.services.tests.test_payment_service_email
```

**Cubre:**
- ✅ Envío de email cuando pago es aprobado
- ✅ NO envía email cuando pago es rechazado
- ✅ Email incluye todos los cursos comprados
- ✅ Pago se procesa aunque el email falle

### Tests de Integración

#### 3. Tests de Payment History Endpoint

```bash
python manage.py test presentation.views.tests.test_payments_integration.PaymentsIntegrationTestCase.test_payment_history_success
```

**Todos los tests de payment history:**

```bash
python manage.py test presentation.views.tests.test_payments_integration.PaymentsIntegrationTestCase.test_payment_history
```

**Cubre:**
- ✅ Obtener historial de pagos del usuario
- ✅ Filtrar por estado (approved, rejected, etc.)
- ✅ Paginación
- ✅ Protección IDOR (usuario solo ve sus pagos)
- ✅ Requiere autenticación
- ✅ Incluye nombres de cursos

**Ejecutar todos los tests de pagos:**

```bash
python manage.py test presentation.views.tests.test_payments_integration
```

---

## 🎨 Tests Frontend

### Tests Unitarios

#### 1. Tests de Payments Service

```bash
cd frontend
npm test -- src/shared/services/__tests__/payments.test.ts
```

**Cubre:**
- ✅ Obtener historial de pagos
- ✅ Manejo de errores
- ✅ Filtros de estado
- ✅ Límite de paginación
- ✅ Crear payment intent
- ✅ Procesar pago
- ✅ Validaciones

#### 2. Tests de PaymentsDashboard Component

```bash
npm test -- src/features/dashboard/components/__tests__/PaymentsDashboard.test.tsx
```

**Cubre:**
- ✅ Estado de loading
- ✅ Manejo de errores
- ✅ Mensaje cuando no hay pagos
- ✅ Lista de pagos
- ✅ Nombres de cursos
- ✅ Filtros
- ✅ Paginación
- ✅ Formateo de monedas
- ✅ Manejo de amount como string

**Ejecutar todos los tests unitarios:**

```bash
npm test
```

**Con cobertura:**

```bash
npm run test:coverage
```

---

## 🚀 Tests E2E (Playwright)

### Instalación

Primero, instala Playwright y los navegadores:

```bash
cd frontend
npm install
npx playwright install
```

### Configuración

Asegúrate de que:
1. **Backend** esté corriendo en `http://localhost:8000`
2. **Frontend** esté corriendo en `http://localhost:3000`
3. **Base de datos** tenga datos de prueba:
   - Usuario: `student@test.com` / `testpass123`
   - Al menos un curso publicado
   - Al menos un pago en el historial (opcional)

### Ejecutar Tests E2E

#### Modo Normal

```bash
cd frontend
npm run test:e2e
```

#### Modo Interactivo (UI)

```bash
npm run test:e2e:ui
```

#### Modo Headed (ver el navegador)

```bash
npm run test:e2e:headed
```

#### Ejecutar un test específico

```bash
npx playwright test e2e/payment-dashboard.spec.ts
```

### Tests E2E Implementados

#### 1. `checkout-flow.spec.ts`

**Cubre:**
- ✅ Flujo completo de compra
- ✅ Validaciones de checkout
- ✅ Requiere autenticación
- ✅ Manejo de carrito vacío

#### 2. `payment-dashboard.spec.ts`

**Cubre:**
- ✅ Mostrar historial de pagos
- ✅ Filtrar por estado
- ✅ Detalles de cada pago
- ✅ Paginación
- ✅ Cursos comprados
- ✅ Manejo de errores

---

## 🎯 Ejecutar Todos los Tests

### Backend (Django)

```bash
cd backend

# Todos los tests
python manage.py test

# Solo tests de pagos y email
python manage.py test infrastructure.services.tests.test_email_service infrastructure.services.tests.test_payment_service_email presentation.views.tests.test_payments_integration

# Con verbosidad
python manage.py test --verbosity=2
```

### Frontend (Jest)

```bash
cd frontend

# Todos los tests unitarios
npm test

# Con watch mode
npm run test:watch

# Con cobertura
npm run test:coverage
```

### E2E (Playwright)

```bash
cd frontend

# Todos los tests E2E
npm run test:e2e

# Con UI interactivo
npm run test:e2e:ui
```

---

## 📊 Cobertura de Tests

### Backend

Para ver la cobertura de tests del backend:

```bash
cd backend
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Genera reporte HTML en htmlcov/
```

### Frontend

```bash
cd frontend
npm run test:coverage
```

El reporte se genera en `coverage/`.

---

## 🐛 Troubleshooting

### Error: "Module not found" en tests de frontend

```bash
# Asegúrate de que todas las dependencias estén instaladas
cd frontend
npm install
```

### Error: Playwright no encuentra navegadores

```bash
npx playwright install
```

### Error: Backend no responde en tests E2E

- Verifica que el backend esté corriendo en `http://localhost:8000`
- Verifica que CORS esté configurado correctamente
- Revisa los logs del backend

### Error: Usuario no encontrado en tests E2E

- Crea el usuario de prueba en la base de datos:
  ```bash
  cd backend
  python manage.py shell
  ```
  ```python
  from django.contrib.auth.models import User
  from apps.core.models import UserProfile
  from apps.users.permissions import ROLE_STUDENT
  
  user = User.objects.create_user(
      username='student@test.com',
      email='student@test.com',
      password='testpass123'
  )
  UserProfile.objects.create(user=user, role=ROLE_STUDENT)
  ```

---

## ✅ Checklist de Tests

### Backend
- [x] Tests unitarios para `DjangoEmailService`
- [x] Tests de integración para `payment_history` endpoint
- [x] Tests de integración de email en `PaymentService`
- [x] Tests de protección IDOR
- [x] Tests de paginación
- [x] Tests de filtros

### Frontend
- [x] Tests unitarios para `payments.ts`
- [x] Tests unitarios para `PaymentsDashboard` component
- [x] Tests de manejo de errores
- [x] Tests de formateo de datos

### E2E
- [x] Tests E2E para flujo de checkout
- [x] Tests E2E para dashboard de pagos
- [x] Tests de validaciones
- [x] Tests de autenticación

---

## 📝 Notas

- Los tests E2E requieren que tanto el backend como el frontend estén corriendo
- Los tests unitarios del frontend usan mocks y no requieren servidores
- Los tests del backend usan una base de datos de prueba (se crea y destruye automáticamente)
- Para producción, considera agregar tests de carga y seguridad adicionales

---

¡Listo para probar! 🚀

