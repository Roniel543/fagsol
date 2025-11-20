# 🧪 GUÍA PASO A PASO: PRUEBA DEL FLUJO DE COMPRA

**Fecha:** 2025-11-18  
**Objetivo:** Verificar que el flujo completo de compra funciona correctamente

---

## ✅ PREPARACIÓN

### 1. Verificar que los Servidores Estén Corriendo

**Backend (Django):**
```bash
# Verificar que esté corriendo en http://localhost:8000
curl http://localhost:8000/api/v1/health/
# O abrir en navegador: http://localhost:8000/swagger/
```

**Frontend (Next.js):**
```bash
# Verificar que esté corriendo en http://localhost:3000
# O abrir en navegador: http://localhost:3000
```

**Si no están corriendo:**

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📋 PASOS DE PRUEBA

### **PASO 1: Verificar Credenciales de Mercado Pago**

Verifica que las credenciales estén en `.env` del backend:
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_PUBLIC_KEY=TEST-...
```

---

### **PASO 2: Crear Usuario Admin (si no existe)**

1. Ve a `http://localhost:8000/admin/`
2. Si no tienes usuario, crea uno:
```bash
cd backend
python manage.py createsuperuser
```

---

### **PASO 3: Crear Curso como Admin**

#### **Opción A: Usando Swagger (Recomendado)**

1. **Abre Swagger:**
   - Ve a `http://localhost:8000/swagger/`
   - Haz clic en "Authorize" (arriba a la derecha)
   - Ingresa tu token JWT de admin

2. **Crear el curso:**
   - Busca el endpoint `POST /api/v1/courses/create/`
   - Haz clic en "Try it out"
   - Usa este JSON:

```json
{
  "title": "Curso de Python para Principiantes",
  "description": "Aprende Python desde cero. Este curso te enseñará los fundamentos de programación con Python, incluyendo variables, funciones, estructuras de datos y más.",
  "short_description": "Aprende Python desde cero",
  "price": 99.99,
  "currency": "PEN",
  "status": "published",
  "category": "Tecnología",
  "level": "beginner",
  "hours": 10,
  "thumbnail_url": "https://via.placeholder.com/400x300",
  "tags": ["python", "programación", "principiante"]
}
```

3. **Ejecuta** y copia el `id` del curso creado (ej: `c-abc123`)

#### **Opción B: Usando Django Admin**

1. Ve a `http://localhost:8000/admin/`
2. Ve a "Courses" → "Courses"
3. Haz clic en "Add Course"
4. Llena los campos y guarda
5. Copia el `id` del curso

---

### **PASO 4: Agregar Módulos y Lecciones**

#### **4.1 Crear Módulo**

1. Ve a `http://localhost:8000/admin/`
2. Ve a "Courses" → "Modules"
3. Haz clic en "Add Module"
4. Llena:
   - **Course:** Selecciona el curso que creaste
   - **ID:** Déjalo en blanco (se auto-generará)
   - **Title:** "Introducción a Python"
   - **Description:** "Fundamentos básicos de Python"
   - **Order:** 1
   - **Is active:** ✅
5. Guarda

#### **4.2 Crear Lecciones**

1. Ve a "Lessons"
2. Crea al menos 3 lecciones:

**Lección 1:**
- **ID:** Déjalo en blanco (se auto-generará)
- **Module:** Selecciona el módulo creado
- **Title:** "¿Qué es Python?"
- **Description:** "Introducción al lenguaje Python"
- **Lesson type:** Text
- **Content text:** "Python es un lenguaje de programación..."
- **Order:** 1
- **Is active:** ✅

**Lección 2:**
- **Module:** Mismo módulo
- **Title:** "Instalación de Python"
- **Description:** "Cómo instalar Python en tu computadora"
- **Lesson type:** Video
- **Content URL:** `https://www.youtube.com/embed/dQw4w9WgXcQ`
- **Duration minutes:** 15
- **Order:** 2
- **Is active:** ✅

**Lección 3:**
- **Module:** Mismo módulo
- **Title:** "Tu Primer Programa"
- **Description:** "Escribe tu primer 'Hola Mundo'"
- **Lesson type:** Text
- **Content text:** "Vamos a crear nuestro primer programa..."
- **Order:** 3
- **Is active:** ✅

---

### **PASO 5: Verificar Curso en Frontend**

1. **Ve al frontend:**
   - `http://localhost:3000/academy`
   - O busca tu curso directamente

2. **Verifica que:**
   - ✅ El curso aparece en el catálogo
   - ✅ Tiene precio: S/ 99.99
   - ✅ Muestra los módulos y lecciones
   - ✅ El botón "Agregar al carrito" funciona

---

### **PASO 6: Crear Usuario Estudiante**

1. **Ve a:** `http://localhost:3000/auth/register`
2. **Regístrate con:**
   - Email: `estudiante@test.com`
   - Password: `test123456`
   - Rol: **student**
3. **O inicia sesión** si ya existe: `http://localhost:3000/auth/login`

---

### **PASO 7: Agregar Curso al Carrito**

1. Ve al curso que creaste
2. Haz clic en "Agregar al carrito"
3. Verifica que aparece en el carrito (ícono del carrito con número)

---

### **PASO 8: Ir a Checkout**

1. Haz clic en el carrito
2. Haz clic en "Proceder al pago"
3. Deberías ver:
   - ✅ Formulario de datos de contacto
   - ✅ Resumen del pedido con el curso
   - ✅ Formulario de tarjeta de Mercado Pago

---

### **PASO 9: Verificar Payment Intent**

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña "Network"**
3. **Busca la petición a:** `http://localhost:8000/api/v1/payments/intent/`
4. **Verifica que:**
   - ✅ La petición se hace correctamente
   - ✅ No hay errores en la consola
   - ✅ Se recibe un `payment_intent_id`

5. **Verifica en el backend (logs):**
   - Debería aparecer: `Payment intent creado: pi_xxxxx para usuario X`

**Si hay error:**
- Revisa que las credenciales de Mercado Pago estén en `.env`
- Revisa la consola del navegador para ver el error exacto
- Verifica que el usuario sea "student"

---

### **PASO 10: Probar Pago con Tarjeta de Prueba**

1. **Completa el formulario de tarjeta:**
   - **Tarjeta aprobada:** `5031 7557 3453 0604`
   - **CVV:** `123`
   - **Fecha:** Cualquier fecha futura (ej: 12/25)
   - **Nombre:** Cualquier nombre

2. **Haz clic en "Pagar"**

3. **Deberías ver:**
   - ✅ El token se genera
   - ✅ Se envía al backend
   - ✅ El pago se procesa
   - ✅ Se crea el enrollment automáticamente
   - ✅ Redirección a página de éxito

**Si hay error:**
- Revisa la consola del navegador
- Revisa los logs del backend
- Verifica que las credenciales de Mercado Pago sean correctas

---

### **PASO 11: Verificar Enrollment**

1. **Ve a "Mis Cursos" o Dashboard:**
   - Deberías ver el curso en tu lista

2. **Accede al curso:**
   - Haz clic en "Acceder al Curso"
   - Deberías poder ver el contenido

3. **Prueba el progreso:**
   - Marca una lección como completada
   - Verifica que el progreso se actualiza

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### **Error: "Error al crear la intención de pago"**

**Causas posibles:**
1. Credenciales de Mercado Pago no configuradas
2. Usuario no es estudiante
3. Cursos no existen o no están activos
4. Usuario ya tiene los cursos inscritos

**Solución:**
- Verifica `.env` del backend
- Verifica que el usuario sea "student"
- Verifica que los cursos existan y estén "published"

---

### **Error: "No se pudo cargar el resumen del pedido"**

**Causa:** El payment intent no se creó correctamente

**Solución:**
- Revisa los logs del backend
- Verifica la respuesta en la consola del navegador
- Asegúrate de que el parsing de respuesta esté correcto

---

### **Error al procesar pago**

**Causas posibles:**
1. Token de Mercado Pago inválido
2. Credenciales incorrectas
3. Tarjeta de prueba incorrecta

**Solución:**
- Usa las tarjetas de prueba correctas:
  - Aprobada: `5031 7557 3453 0604`
  - Rechazada: `5031 4332 1540 6351`
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté correcto
- Revisa los logs del backend para el error exacto

---

### **Error: CORS o CSP**

**Solución:**
- Verifica que `CORS_ALLOWED_ORIGINS` incluya `http://localhost:3000`
- Verifica que `next.config.js` tenga los dominios de Mercado Pago permitidos

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada paso conforme lo completes:

- [ ] Servidores corriendo (backend y frontend)
- [ ] Credenciales de Mercado Pago configuradas
- [ ] Usuario admin creado
- [ ] Curso creado y publicado
- [ ] Módulos y lecciones agregados
- [ ] Curso visible en el catálogo
- [ ] Usuario estudiante creado/iniciado sesión
- [ ] Curso agregado al carrito
- [ ] Payment intent se crea correctamente
- [ ] Formulario de tarjeta carga
- [ ] Token se genera correctamente
- [ ] Pago se procesa con tarjeta de prueba
- [ ] Enrollment se crea automáticamente
- [ ] Usuario puede acceder al curso
- [ ] Progreso de lecciones funciona

---

## 📝 NOTAS DE PRUEBA

**Fecha de prueba:** _______________

**Resultado:** 
- [ ] ✅ Todo funciona correctamente
- [ ] ⚠️ Funciona con algunos problemas menores
- [ ] ❌ Hay errores críticos

**Problemas encontrados:**

1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Logs importantes:**
- Payment Intent ID: _______________
- Payment ID: _______________
- Enrollment ID: _______________

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE PROBAR

1. **Probar con tarjeta rechazada** - Verificar manejo de errores
2. **Probar idempotencia** - Intentar pagar dos veces
3. **Probar con múltiples cursos** - Verificar que funciona con varios cursos
4. **Probar webhooks** - Verificar que los webhooks funcionan

---

**¡Listo para probar! 🚀**

