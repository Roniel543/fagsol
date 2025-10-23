# 🤖 Prompt para Cursor AI (Copiar y Pegar)

---

## 📋 CONTEXTO RESUMIDO PARA CURSOR AI

Copia y pega esto cuando abras el proyecto en casa:

---

```
Estoy desarrollando "FagSol Escuela Virtual", una plataforma educativa web para venta de cursos modulares en Perú.

TECNOLOGÍAS:
- Backend: Django 5.0 + Django REST Framework + PostgreSQL
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- DevOps: Docker Compose (6 servicios), Celery + Redis
- Auth: JWT (SimpleJWT)
- Pagos: MercadoPago (Checkout Pro)

ARQUITECTURA:
- Tipo: Django pragmático modular (no Clean Architecture pura)
- Apps Django: core, users, courses, payments, evaluations, certificates
- Frontend: App Router de Next.js 14

MODELO DE NEGOCIO:
- Cursos divididos en módulos comprables individualmente
- Descuento al comprar curso completo (ej: módulos S/480 → curso S/400)
- Sistema de tracking de progreso por lección
- Evaluaciones por módulo + examen final
- Certificados individuales y del curso completo

MODELOS PRINCIPALES:
- User (custom con roles: student, teacher, admin, superadmin)
- Course → Module (1:N) → Lesson (1:N)
- Enrollment (User-Module, con progress_percentage)
- LessonProgress (tracking detallado)
- Payment (integración MercadoPago)

ESTADO ACTUAL:
✅ Estructura completa (60+ archivos)
✅ Modelos implementados y configurados
✅ Sistema de autenticación completo (JWT)
✅ Views de usuarios completas
✅ Docker Compose configurado (6 servicios)
✅ Frontend base con TypeScript types
⏳ Docker instalándose

PENDIENTE:
- Serializers y Views de courses (alta prioridad)
- Views de payments + webhook MercadoPago
- Frontend: landing, catálogo, detalle de curso, login
- Sistema de evaluaciones
- Generación de certificados PDF
- Tareas Celery para emails

ARCHIVOS CLAVE:
- backend/apps/courses/models.py (modelos con lógica de negocio)
- backend/apps/users/views.py (ejemplo de views completo)
- backend/config/settings.py (configuración completa)
- frontend/src/lib/api.ts (cliente API con JWT interceptors)
- frontend/src/types/index.ts (types completos)
- docker-compose.yml (6 servicios)

COMANDOS DOCKER:
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

DECISIONES TÉCNICAS:
1. Django pragmático (no Clean puro) para velocidad en piloto
2. Módulos comprables individualmente (flexibilidad)
3. Contenido vía enlaces externos (YouTube/Drive)
4. Celery para emails asíncronos
5. Evaluación obligatoria por módulo

PRÓXIMOS PASOS:
1. Completar serializers de Course, Module, Lesson
2. Implementar ViewSets con permisos
3. Integrar webhook de MercadoPago
4. Crear landing page y catálogo en Next.js
5. Implementar sistema de evaluaciones

PRESUPUESTO: S/ 3,200.00
FASE: Piloto (MVP)
CRONOGRAMA: 7 semanas
```

---

## 🎯 PROMPT ESPECÍFICO SEGÚN TAREA

### **Para completar Backend de Courses:**
```
Necesito completar el backend de courses. Ya tengo los modelos 
(Course, Module, Lesson, Enrollment, LessonProgress) en 
backend/apps/courses/models.py.

Necesito crear:
1. backend/apps/courses/serializers.py con:
   - CourseSerializer (con módulos nested)
   - ModuleSerializer (con lecciones nested)
   - LessonSerializer
   - EnrollmentSerializer
   - LessonProgressSerializer

2. backend/apps/courses/views.py con:
   - CourseViewSet (CRUD completo)
   - ModuleViewSet
   - LessonViewSet
   - EnrollmentViewSet (solo lectura/actualización para estudiantes)
   - Permisos: IsAuthenticated + custom permissions de apps/core/permissions.py

Referencia: backend/apps/users/views.py para el estilo de código.
```

### **Para integrar MercadoPago:**
```
Necesito implementar la integración de MercadoPago para pagos.

Ya tengo:
- Model Payment en backend/apps/payments/models.py
- Variables de entorno: MERCADOPAGO_PUBLIC_KEY, MERCADOPAGO_ACCESS_TOKEN

Necesito crear:
1. backend/apps/payments/services.py con clase MercadoPagoService:
   - create_preference(items, payer_email) → preference_id
   - process_payment(payment_id) → payment_data

2. backend/apps/payments/views.py:
   - CreatePaymentPreferenceView (POST con módulos a comprar)
   - MercadoPagoWebhookView (recibe notificaciones, crea Enrollments)

3. backend/apps/payments/serializers.py:
   - PaymentSerializer
   - CreatePreferenceSerializer

Debe crear Enrollment automáticamente cuando el pago es approved.
```

### **Para crear Frontend:**
```
Necesito crear las páginas principales del frontend en Next.js 14.

Ya tengo:
- Layout base en src/app/layout.tsx
- API client en src/lib/api.ts
- Types en src/types/index.ts
- Tailwind CSS configurado

Necesito crear:
1. src/app/page.tsx - Landing page institucional moderna
2. src/app/cursos/page.tsx - Catálogo de cursos con grid
3. src/app/cursos/[slug]/page.tsx - Detalle de curso
4. src/app/login/page.tsx - Login con JWT
5. src/app/register/page.tsx - Registro de usuario

Usa componentes con Tailwind CSS, diseño moderno y responsive.
Consume la API de http://localhost:8000/api
```

---

## 📁 ARCHIVOS IMPORTANTES PARA LEER PRIMERO

```
1. CONTEXTO_PROYECTO_FAGSOL.md (este contexto completo)
2. backend/apps/courses/models.py (modelos principales)
3. backend/apps/users/views.py (ejemplo de implementación)
4. backend/config/settings.py (configuración)
5. frontend/src/types/index.ts (types TypeScript)
6. docker-compose.yml (arquitectura de servicios)
```

---

## 🔥 INICIO RÁPIDO EN CASA

```bash
# 1. Abrir proyecto
cd C:\Users\deadmau5\Documents\fagsol

# 2. Verificar Docker
docker --version

# 3. Levantar servicios
docker-compose up -d --build

# 4. Migraciones
docker-compose exec backend python manage.py migrate

# 5. Crear admin
docker-compose exec backend python manage.py createsuperuser

# 6. Acceder
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
# API: http://localhost:8000/api
```

---

**¡Copia el prompt de arriba y pégalo en Cursor AI cuando llegues a casa!** 🚀

