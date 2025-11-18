# 🧪 FLUJO COMPLETO DE PRUEBA: Crear Curso y Probar Pago

## 📋 **PASO A PASO COMPLETO**

### **FASE 1: Crear Curso como Admin**

#### **Opción A: Usando Swagger (Recomendado)**

1. **Abre Swagger:**
   - Ve a `http://localhost:8000/swagger/`
   - Inicia sesión con un usuario admin (usa "Authorize" arriba a la derecha)

2. **Crear el curso:**
   - Busca el endpoint `POST /api/v1/courses/create/`
   - Haz clic en "Try it out"
   - Usa este JSON de ejemplo:

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

#### **Opción B: Usando curl o Postman**

```bash
curl -X POST http://localhost:8000/api/v1/courses/create/ \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso de Python para Principiantes",
    "description": "Aprende Python desde cero...",
    "price": 99.99,
    "currency": "PEN",
    "status": "published",
    "category": "Tecnología",
    "level": "beginner"
  }'
```

---

### **FASE 2: Agregar Módulos y Lecciones**

#### **2.1 Crear Módulo (desde Django Admin o API)**

**Opción más fácil: Django Admin**
1. Ve a `http://localhost:8000/admin/`
2. Inicia sesión como admin
3. Ve a "Courses" → "Modules"
4. Crea un módulo:
   - **Course:** Selecciona el curso que creaste
   - **ID:** `m-python-001` (o déjalo en blanco para auto-generar)
   - **Title:** "Introducción a Python"
   - **Description:** "Fundamentos básicos de Python"
   - **Order:** 1
   - **Is active:** ✅

#### **2.2 Crear Lecciones**

En el mismo Django Admin:
1. Ve a "Lessons"
2. Crea lecciones para el módulo:

**Lección 1:**
- **ID:** `l-python-001`
- **Module:** Selecciona el módulo creado
- **Title:** "¿Qué es Python?"
- **Description:** "Introducción al lenguaje Python"
- **Lesson type:** Text
- **Content text:** "Python es un lenguaje de programación..."
- **Order:** 1
- **Is active:** ✅

**Lección 2:**
- **ID:** `l-python-002`
- **Module:** Mismo módulo
- **Title:** "Instalación de Python"
- **Description:** "Cómo instalar Python en tu computadora"
- **Lesson type:** Video
- **Content URL:** `https://www.youtube.com/embed/VIDEO_ID`
- **Duration minutes:** 15
- **Order:** 2
- **Is active:** ✅

**Lección 3:**
- **ID:** `l-python-003`
- **Module:** Mismo módulo
- **Title:** "Tu Primer Programa"
- **Description:** "Escribe tu primer 'Hola Mundo'"
- **Lesson type:** Text
- **Content text:** "Vamos a crear nuestro primer programa..."
- **Order:** 3
- **Is active:** ✅

---

### **FASE 3: Verificar el Curso**

1. **Ve al frontend:**
   - `http://localhost:3000/academy`
   - Busca tu curso o ve directamente a `/academy/course/[slug]`

2. **Verifica que:**
   - ✅ El curso aparece en el catálogo
   - ✅ Tiene precio: S/ 99.99
   - ✅ Muestra los módulos y lecciones
   - ✅ El botón "Agregar al carrito" funciona

---

### **FASE 4: Probar Pago como Estudiante**

#### **4.1 Iniciar sesión como Estudiante**

1. **Crea una cuenta de estudiante** (si no tienes):
   - Ve a `/auth/register`
   - Regístrate con rol "student"

2. **O usa un estudiante existente:**
   - Inicia sesión en `/auth/login`

#### **4.2 Agregar al Carrito**

1. Ve al curso que creaste
2. Haz clic en "Agregar al carrito"
3. Verifica que aparece en el carrito (ícono del carrito con número)

#### **4.3 Ir a Checkout**

1. Haz clic en el carrito
2. Haz clic en "Proceder al pago"
3. Deberías ver:
   - ✅ Formulario de datos de contacto
   - ✅ Resumen del pedido con el curso
   - ✅ Formulario de tarjeta de Mercado Pago

#### **4.4 Probar el Payment Intent**

1. **Verifica en la consola del navegador:**
   - Debería aparecer: `🔗 API Request: http://localhost:8000/api/v1/payments/intent/`
   - No debería haber errores

2. **Verifica en el backend (logs):**
   - Debería aparecer: `Payment intent creado: pi_xxxxx para usuario X`

3. **Si hay error:**
   - Revisa que las credenciales de Mercado Pago estén en `.env`
   - Revisa la consola del navegador para ver el error exacto

#### **4.5 Probar Pago con Tarjeta de Prueba**

1. **Completa el formulario de tarjeta:**
   - **Tarjeta aprobada:** `5031 7557 3453 0604`
   - **CVV:** `123`
   - **Fecha:** Cualquier fecha futura (ej:     )
   - **Nombre:** Cualquier nombre

2. **Haz clic en "Pagar"**

3. **Deberías ver:**
   - ✅ El token se genera
   - ✅ Se envía al backend
   - ✅ El pago se procesa
   - ✅ Se crea el enrollment automáticamente
   - ✅ Redirección a página de éxito

#### **4.6 Verificar Enrollment**

1. **Ve a "Mis Cursos":**
   - Deberías ver el curso en tu lista

2. **Accede al curso:**
   - Haz clic en "Acceder al Curso"
   - Deberías poder ver el contenido

3. **Prueba el progreso:**
   - Marca una lección como completada
   - Verifica que el progreso se actualiza

---

## 🔍 **VERIFICACIONES DE SEGURIDAD**

### **Backend:**
- ✅ Precio validado desde BD (no del frontend)
- ✅ Payment intent pertenece al usuario
- ✅ Enrollment solo se crea si pago exitoso
- ✅ Token de tarjeta no se almacena

### **Frontend:**
- ✅ No se envían datos de tarjeta al backend
- ✅ Solo se envía el token de Mercado Pago
- ✅ Precios mostrados son solo para UI

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

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

### **Error: "No se pudo cargar el resumen del pedido"**

**Causa:** El payment intent no se creó correctamente

**Solución:**
- Revisa los logs del backend
- Verifica la respuesta en la consola del navegador
- Asegúrate de que el parsing de respuesta esté correcto

### **Error al procesar pago**

**Causas posibles:**
1. Token de Mercado Pago inválido
2. Credenciales incorrectas
3. Tarjeta de prueba incorrecta

**Solución:**
- Usa las tarjetas de prueba correctas
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté correcto
- Revisa los logs del backend para el error exacto

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] Curso creado y publicado
- [ ] Módulos y lecciones agregados
- [ ] Curso visible en el catálogo
- [ ] Payment intent se crea correctamente
- [ ] Formulario de tarjeta carga
- [ ] Token se genera correctamente
- [ ] Pago se procesa con tarjeta de prueba
- [ ] Enrollment se crea automáticamente
- [ ] Usuario puede acceder al curso
- [ ] Progreso de lecciones funciona

---

## 🎯 **PRÓXIMOS PASOS DESPUÉS DE PROBAR**

1. **Configurar webhooks** de Mercado Pago
2. **Agregar rate limiting** en endpoints de pago
3. **Mejorar logs** de auditoría
4. **Probar con tarjetas rechazadas** y pendientes
5. **Verificar idempotencia** (intentar pagar dos veces)

---

**¿Listo para probar? Empecemos con la Fase 1! 🚀**

