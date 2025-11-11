# 🔒 Seguridad Frontend - FagSol Academy

## 📋 Índice

1. [Gestión Segura de Tokens JWT](#gestión-segura-de-tokens-jwt)
2. [Sanitización HTML](#sanitización-html)
3. [Content Security Policy (CSP)](#content-security-policy-csp)
4. [Flujo de Pagos Seguro](#flujo-de-pagos-seguro)
5. [Descarga de Certificados](#descarga-de-certificados)
6. [Acceso a Cursos](#acceso-a-cursos)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🔐 Gestión Segura de Tokens JWT

### **Implementación Actual**

Los tokens JWT se almacenan en **sessionStorage** en lugar de localStorage para mayor seguridad:

- ✅ **sessionStorage**: Se elimina al cerrar la pestaña (más seguro)
- ❌ **localStorage**: Persiste hasta ser eliminado manualmente (menos seguro)

### **Ubicación del Código**

```typescript
// frontend/src/shared/utils/tokenStorage.ts
```

### **Funciones Principales**

- `setTokens(accessToken, refreshToken)`: Guarda tokens de forma segura
- `getAccessToken()`: Obtiene el token de acceso
- `getRefreshToken()`: Obtiene el refresh token
- `clearTokens()`: Limpia todos los tokens
- `isTokenExpiringSoon()`: Verifica si el token está próximo a expirar

### **Refresh Token Automático**

El sistema implementa refresh automático de tokens:

1. **Preventivo**: Si el token está próximo a expirar (< 5 minutos), se refresca automáticamente
2. **Reactivo**: Si una petición recibe 401, intenta refrescar y reintentar

**Ubicación**: `frontend/src/shared/services/api.ts`

```typescript
// Verificar si el token está próximo a expirar
if (isTokenExpiringSoon()) {
    await refreshAccessToken();
}

// Si recibe 401, refrescar y reintentar
if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    // Reintentar petición con nuevo token
}
```

### **Logout Server-Side**

El logout invalida tokens tanto en el cliente como en el servidor:

```typescript
// frontend/src/shared/services/api.ts - authAPI.logout()
await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
    method: 'POST',
});
clearTokens(); // Limpiar localmente
```

**Endpoint Backend Requerido**: `POST /api/v1/logout/`

---

## 🛡️ Sanitización HTML

### **Problema**

Renderizar HTML dinámico sin sanitizar permite ataques XSS (Cross-Site Scripting).

### **Solución**

Usamos **DOMPurify** para sanitizar todo HTML dinámico antes de renderizarlo.

### **Componente SafeHTML**

```typescript
// frontend/src/shared/components/SafeHTML.tsx
import { SafeHTML } from '@/shared/components';

<SafeHTML html={course.description} className="mt-2 text-gray-300" />
```

### **Configuración de DOMPurify**

**Ubicación**: `frontend/src/shared/utils/sanitize.ts`

**Etiquetas Permitidas**:
- Texto: `p`, `br`, `strong`, `em`, `u`, `s`, `h1-h6`
- Listas: `ul`, `ol`, `li`
- Enlaces: `a` (solo `https://`, `http://`, `mailto:`)
- Imágenes: `img` (solo URLs seguras)
- Código: `code`, `pre`, `blockquote`

**Etiquetas Bloqueadas**:
- ❌ `script`, `iframe`, `object`, `embed`, `form`
- ❌ Atributos peligrosos: `onerror`, `onload`, `onclick`, etc.

### **Uso en Componentes**

**ANTES (Inseguro)**:
```tsx
<p dangerouslySetInnerHTML={{ __html: course.description }} />
```

**DESPUÉS (Seguro)**:
```tsx
<SafeHTML html={course.description} className="mt-2" />
```

---

## 🔒 Content Security Policy (CSP)

### **Configuración**

**Ubicación**: `frontend/next.config.js`

### **Políticas Implementadas**

```javascript
"default-src 'self'"
"script-src 'self' 'unsafe-eval' 'unsafe-inline'"  // Next.js requiere esto
"style-src 'self' 'unsafe-inline'"  // Tailwind requiere esto
"img-src 'self' data: https: blob:"
"connect-src 'self' https://api.mercadopago.com"
"frame-src 'self' https://www.mercadopago.com"
"object-src 'none'"
"base-uri 'self'"
"form-action 'self'"
"frame-ancestors 'none'"
"upgrade-insecure-requests"
```

### **Headers Adicionales**

- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-XSS-Protection: 1; mode=block` - Protección XSS del navegador
- `Referrer-Policy: strict-origin-when-cross-origin` - Control de referrer
- `Permissions-Policy` - Deshabilita cámaras, micrófonos, geolocalización

---

## 💳 Flujo de Pagos Seguro

### **Principios**

1. **Tokenización Client-Side**: Los datos de tarjeta NUNCA tocan nuestro servidor
2. **Validación Server-Side**: El backend valida precio, curso y usuario
3. **No almacenar datos sensibles**: Solo guardamos tokens de Mercado Pago

### **Flujo Completo**

```
1. Usuario completa formulario de tarjeta
   ↓
2. SDK de Mercado Pago tokeniza tarjeta (CLIENT-SIDE)
   ↓
3. Frontend envía token de Mercado Pago + course_id al backend
   ↓
4. Backend valida:
   - Usuario autenticado
   - Curso existe
   - Precio correcto
   - Token de Mercado Pago válido
   ↓
5. Backend procesa pago con Mercado Pago
   ↓
6. Backend crea enrollment si pago exitoso
   ↓
7. Frontend redirige a página de éxito
```

### **Implementación Frontend**

```typescript
// frontend/src/features/academy/components/payments/CardForm.tsx

// 1. Tokenizar con Mercado Pago SDK (client-side)
const token = await mercadopago.createToken(cardForm);

// 2. Enviar solo el token (NO datos de tarjeta)
await apiRequest('/payments/', {
    method: 'POST',
    body: JSON.stringify({
        course_id: courseId,
        payment_token: token.id, // Token de Mercado Pago
        // ❌ NO enviar: card_number, cvv, expiration_date
    }),
});
```

### **Validaciones Backend Requeridas**

El backend DEBE validar:

1. **Usuario autenticado**: Verificar JWT válido
2. **Curso existe**: Verificar que `course_id` existe
3. **Precio correcto**: Verificar que el precio enviado coincide con el precio del curso
4. **Usuario no tiene el curso**: Verificar que no está ya inscrito
5. **Token de Mercado Pago válido**: Verificar con API de Mercado Pago

**Ejemplo Backend**:
```python
# backend/presentation/views/payment_views.py

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    course_id = request.data.get('course_id')
    payment_token = request.data.get('payment_token')
    
    # Validar curso existe
    course = Course.objects.get(id=course_id)
    
    # Validar precio (NO confiar en el frontend)
    if request.data.get('amount') != course.price:
        return Response({'error': 'Invalid price'}, status=400)
    
    # Validar usuario no tiene el curso
    if Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({'error': 'Already enrolled'}, status=400)
    
    # Procesar pago con Mercado Pago
    # ...
```

---

## 📜 Descarga de Certificados

### **Principios**

1. **URLs Firmadas**: El backend genera URLs firmadas con expiración
2. **Validación Server-Side**: Verificar que el usuario completó el curso
3. **No exponer rutas directas**: Los certificados no deben estar en rutas públicas

### **Flujo**

```
1. Usuario solicita descarga de certificado
   ↓
2. Frontend envía request: GET /api/v1/certificates/{course_id}/download/
   ↓
3. Backend valida:
   - Usuario autenticado
   - Usuario completó el curso
   - Certificado existe
   ↓
4. Backend genera URL firmada (expira en 5 minutos)
   ↓
5. Backend retorna URL firmada
   ↓
6. Frontend redirige a URL firmada
```

### **Implementación Frontend**

```typescript
// frontend/src/shared/services/certificates.ts

export async function downloadCertificate(courseId: string): Promise<string> {
    const response = await apiRequest<{ signed_url: string }>(
        `/certificates/${courseId}/download/`,
        { method: 'GET' }
    );
    
    if (response.data?.signed_url) {
        // Abrir URL firmada (expira en 5 minutos)
        window.location.href = response.data.signed_url;
        return response.data.signed_url;
    }
    
    throw new Error('Failed to get certificate URL');
}
```

### **Validaciones Backend Requeridas**

```python
# backend/presentation/views/certificate_views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_certificate(request, course_id):
    # Validar usuario completó el curso
    enrollment = Enrollment.objects.filter(
        user=request.user,
        course_id=course_id,
        completed=True
    ).first()
    
    if not enrollment:
        return Response({'error': 'Course not completed'}, status=403)
    
    # Generar URL firmada (expira en 5 minutos)
    signed_url = generate_signed_url(
        certificate_path=enrollment.certificate_path,
        expires_in=300  # 5 minutos
    )
    
    return Response({'signed_url': signed_url})
```

---

## 📚 Acceso a Cursos

### **Principios**

1. **Validación Backend**: El backend valida acceso en cada request
2. **No confiar en el frontend**: El frontend solo muestra/oculta UI
3. **Protección de contenido**: Videos y materiales protegidos por backend

### **Flujo de Acceso**

```
1. Usuario intenta acceder a curso
   ↓
2. Frontend verifica enrollment local (solo para UI)
   ↓
3. Frontend solicita contenido: GET /api/v1/courses/{id}/content/
   ↓
4. Backend valida:
   - Usuario autenticado
   - Usuario tiene enrollment activo
   - Enrollment no expiró (si aplica)
   ↓
5. Backend retorna contenido o 403 Forbidden
```

### **Implementación Frontend**

```typescript
// frontend/src/shared/services/courses.ts

export async function getCourseContent(courseId: string) {
    try {
        const response = await apiRequest(`/courses/${courseId}/content/`);
        return response.data;
    } catch (error) {
        if (error.status === 403) {
            // Usuario no tiene acceso
            router.push('/academy/catalog');
        }
        throw error;
    }
}
```

### **Protección de Videos**

Los videos deben servirse desde el backend con autenticación:

```typescript
// El backend genera URL firmada para el video
const videoUrl = await apiRequest(`/courses/${courseId}/videos/${videoId}/url/`);

// URL firmada expira en 1 hora
<video src={videoUrl.data.signed_url} controls />
```

---

## ✅ Mejores Prácticas

### **1. Nunca Confiar en el Frontend**

- ❌ **MAL**: Validar precio solo en frontend
- ✅ **BIEN**: Backend valida precio, curso, usuario

### **2. Sanitizar Todo HTML Dinámico**

- ❌ **MAL**: `dangerouslySetInnerHTML={{ __html: userContent }}`
- ✅ **BIEN**: `<SafeHTML html={userContent} />`

### **3. Usar sessionStorage para Tokens**

- ❌ **MAL**: `localStorage.setItem('token', token)`
- ✅ **BIEN**: `setTokens(accessToken, refreshToken)` (usa sessionStorage)

### **4. Validar en Cada Request**

- ❌ **MAL**: Asumir que el usuario tiene acceso
- ✅ **BIEN**: Backend valida en cada request de contenido

### **5. URLs Firmadas para Recursos**

- ❌ **MAL**: URLs públicas a certificados/videos
- ✅ **BIEN**: URLs firmadas con expiración

### **6. No Exponer Tokens en URLs**

- ❌ **MAL**: `/dashboard?token=abc123`
- ✅ **BIEN**: Token en header `Authorization: Bearer token`

### **7. Logout Server-Side**

- ❌ **MAL**: Solo limpiar tokens localmente
- ✅ **BIEN**: Invalidar en servidor + limpiar localmente

### **8. Refresh Token Automático**

- ❌ **MAL**: Forzar re-login cuando expira token
- ✅ **BIEN**: Refresh automático transparente

---

## 🧪 Testing de Seguridad

### **Tests Unitarios**

```bash
npm test
```

**Tests incluidos**:
- `sanitize.test.ts`: Sanitización HTML
- `tokenStorage.test.ts`: Gestión de tokens
- `useAuth.test.tsx`: Autenticación

### **Tests E2E (Próximamente)**

- Test de login/logout
- Test de acceso no autorizado (403)
- Test de sanitización XSS
- Test de flujo de pago

---

## 📞 Soporte

Para preguntas sobre seguridad, contactar al equipo de desarrollo.

**Última actualización**: 2024

