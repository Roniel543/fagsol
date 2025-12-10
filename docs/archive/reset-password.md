# 🔍 Análisis: Sistema de Restablecimiento de Contraseña

**Fecha:** 6 de Diciembre, 2025  
**Estado:** ❌ **NO IMPLEMENTADO**

---

## 📋 Resumen Ejecutivo

**Conclusión:** El sistema de restablecimiento de contraseña **NO está implementado** en el proyecto actual.

### **Lo que SÍ existe:**
- ✅ Sistema de autenticación completo (login, register, logout)
- ✅ Servicio de email (`DjangoEmailService`) funcionando
- ✅ Envío de emails de confirmación de pago
- ✅ Configuración de email (SMTP) en settings

### **Lo que NO existe:**
- ❌ Endpoint para solicitar reset de contraseña
- ❌ Endpoint para confirmar reset de contraseña
- ❌ Tokens de reset de contraseña
- ❌ Página frontend para "Olvidé mi contraseña"
- ❌ Página frontend para "Restablecer contraseña"
- ❌ Email template para reset de contraseña

---

## 🔍 Análisis del Código Actual

### **Backend - Endpoints de Autenticación**

**Archivo:** `backend/presentation/views/auth_views.py`

**Endpoints existentes:**
- ✅ `POST /api/v1/auth/login/` - Login
- ✅ `POST /api/v1/auth/register/` - Registro
- ✅ `POST /api/v1/auth/logout/` - Logout
- ✅ `GET /api/v1/auth/me/` - Usuario actual
- ✅ `POST /api/v1/auth/apply-instructor/` - Solicitar instructor

**Endpoints faltantes:**
- ❌ `POST /api/v1/auth/forgot-password/` - Solicitar reset
- ❌ `POST /api/v1/auth/reset-password/` - Confirmar reset

**URLs configuradas:** `backend/presentation/api/v1/auth_urls.py`
- No incluye rutas de reset password

---

### **Frontend - Páginas de Autenticación**

**Archivos existentes:**
- ✅ `frontend/src/features/auth/pages/LoginPage.tsx`
- ✅ `frontend/src/features/auth/pages/RegisterPage.tsx`
- ✅ `frontend/src/features/auth/components/LoginForm.tsx`
- ✅ `frontend/src/features/auth/components/RegisterForm.tsx`

**Archivos faltantes:**
- ❌ `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
- ❌ `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
- ❌ `frontend/src/features/auth/components/ForgotPasswordForm.tsx`
- ❌ `frontend/src/features/auth/components/ResetPasswordForm.tsx`

**LoginForm actual:**
- No tiene link a "Olvidé mi contraseña"
- Solo tiene link a registro

---

### **Servicio de Email**

**Archivo:** `backend/infrastructure/external_services/__init__.py`

**Métodos existentes:**
- ✅ `send_email()` - Email genérico
- ✅ `send_welcome_email()` - Email de bienvenida
- ✅ `send_course_enrollment_email()` - Email de inscripción
- ✅ `send_payment_success_email()` - Email de confirmación de pago

**Métodos faltantes:**
- ❌ `send_password_reset_email()` - Email de reset de contraseña

**Configuración de Email:**
- ✅ SMTP configurado en `settings.py`
- ✅ `EMAIL_BACKEND` configurado (consola en dev, SMTP en prod)
- ✅ `DEFAULT_FROM_EMAIL` configurado

---

## 📝 Plan de Implementación

### **Fase 1: Backend - Modelo y Tokens**

#### **1.1 Crear modelo para tokens de reset (Opcional - Django ya tiene)**

**Opción A: Usar Django Password Reset (Recomendado)**
- Django ya tiene `django.contrib.auth.tokens.PasswordResetTokenGenerator`
- No requiere modelo adicional
- Tokens seguros y expirables

**Opción B: Modelo personalizado**
- Más control sobre expiración y uso
- Requiere migración

**Recomendación:** Usar Opción A (Django nativo)

---

#### **1.2 Crear servicio de reset password**

**Archivo:** `backend/infrastructure/services/password_reset_service.py`

**Métodos necesarios:**
```python
class PasswordResetService:
    def request_password_reset(self, email: str) -> Tuple[bool, str]:
        """
        Solicita reset de contraseña
        - Valida que el email exista
        - Genera token seguro
        - Envía email con link
        - Retorna éxito/error
        """
    
    def reset_password(self, token: str, new_password: str) -> Tuple[bool, str]:
        """
        Restablece la contraseña
        - Valida token
        - Verifica expiración
        - Actualiza contraseña
        - Invalida token usado
        - Retorna éxito/error
        """
    
    def validate_token(self, token: str) -> Tuple[bool, Optional[User]]:
        """
        Valida si un token es válido
        - Verifica formato
        - Verifica expiración
        - Retorna (válido, usuario)
        """
```

---

#### **1.3 Extender servicio de email**

**Archivo:** `backend/infrastructure/external_services/__init__.py`

**Agregar método:**
```python
def send_password_reset_email(
    self,
    user_email: str,
    user_name: str,
    reset_token: str,
    reset_url: str
) -> bool:
    """
    Envía email de reset de contraseña
    - Template HTML
    - Link con token
    - Información de seguridad
    """
```

---

#### **1.4 Crear endpoints**

**Archivo:** `backend/presentation/views/auth_views.py`

**Endpoints a agregar:**

**1. Solicitar Reset:**
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    POST /api/v1/auth/forgot-password/
    
    Body:
    {
        "email": "user@example.com"
    }
    
    Response:
    {
        "success": true,
        "message": "Si el email existe, se enviará un link de reset"
    }
    """
```

**2. Confirmar Reset:**
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    POST /api/v1/auth/reset-password/
    
    Body:
    {
        "token": "abc123...",
        "new_password": "nuevaPassword123",
        "confirm_password": "nuevaPassword123"
    }
    
    Response:
    {
        "success": true,
        "message": "Contraseña restablecida exitosamente"
    }
    """
```

**3. Validar Token (Opcional):**
```python
@api_view(['GET'])
@permission_classes([AllowAny])
def validate_reset_token(request, token):
    """
    GET /api/v1/auth/reset-password/validate/{token}/
    
    Response:
    {
        "success": true,
        "valid": true,
        "message": "Token válido"
    }
    """
```

---

#### **1.5 Agregar URLs**

**Archivo:** `backend/presentation/api/v1/auth_urls.py`

```python
from presentation.views.auth_views import (
    login, register, auth_health, logout, get_current_user,
    apply_to_be_instructor, get_my_instructor_application,
    forgot_password, reset_password, validate_reset_token  # Nuevos
)

urlpatterns = [
    # ... existentes ...
    path('forgot-password/', forgot_password, name='auth_forgot_password'),
    path('reset-password/', reset_password, name='auth_reset_password'),
    path('reset-password/validate/<str:token>/', validate_reset_token, name='auth_validate_reset_token'),
]
```

---

### **Fase 2: Frontend - Páginas y Componentes**

#### **2.1 Crear servicio de API**

**Archivo:** `frontend/src/shared/services/auth.ts`

**Agregar funciones:**
```typescript
export async function forgotPassword(email: string): Promise<ApiResponse> {
    // POST /api/v1/auth/forgot-password/
}

export async function resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
): Promise<ApiResponse> {
    // POST /api/v1/auth/reset-password/
}

export async function validateResetToken(token: string): Promise<ApiResponse> {
    // GET /api/v1/auth/reset-password/validate/{token}/
}
```

---

#### **2.2 Crear componente ForgotPasswordForm**

**Archivo:** `frontend/src/features/auth/components/ForgotPasswordForm.tsx`

**Características:**
- Campo de email
- Validación de email
- Botón "Enviar link de reset"
- Mensaje de éxito/error
- Link de vuelta a login

---

#### **2.3 Crear componente ResetPasswordForm**

**Archivo:** `frontend/src/features/auth/components/ResetPasswordForm.tsx`

**Características:**
- Campo de nueva contraseña
- Campo de confirmar contraseña
- Validación de coincidencia
- Validación de fortaleza (mínimo 8 caracteres)
- Botón "Restablecer contraseña"
- Validación de token antes de mostrar formulario

---

#### **2.4 Crear páginas**

**Archivo:** `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
```typescript
export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
```

**Archivo:** `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
```typescript
export default function ResetPasswordPage({ params }: { params: { token: string } }) {
    // Validar token al cargar
    // Mostrar formulario si token válido
    // Mostrar error si token inválido
}
```

---

#### **2.5 Agregar rutas**

**Archivo:** `frontend/src/app/auth/forgot-password/page.tsx`
```typescript
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
export default ForgotPasswordPage;
```

**Archivo:** `frontend/src/app/auth/reset-password/[token]/page.tsx`
```typescript
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
export default ResetPasswordPage;
```

---

#### **2.6 Actualizar LoginForm**

**Archivo:** `frontend/src/features/auth/components/LoginForm.tsx`

**Agregar link:**
```tsx
<div className="text-center">
    <Link href="/auth/forgot-password" className="text-sm text-primary-orange">
        ¿Olvidaste tu contraseña?
    </Link>
</div>
```

---

### **Fase 3: Seguridad y Validaciones**

#### **3.1 Seguridad del Token**

- ✅ Token único y no predecible
- ✅ Expiración (ej: 1 hora)
- ✅ Un solo uso (invalidar después de usar)
- ✅ Rate limiting (máx. 3 intentos por hora por email)

#### **3.2 Validaciones**

**Backend:**
- ✅ Email existe en el sistema
- ✅ Token válido y no expirado
- ✅ Contraseña cumple requisitos (mínimo 8 caracteres)
- ✅ Contraseñas coinciden

**Frontend:**
- ✅ Validación de formato de email
- ✅ Validación de fortaleza de contraseña
- ✅ Validación de coincidencia de contraseñas
- ✅ Feedback visual de errores

---

### **Fase 4: Email Template**

#### **4.1 Template HTML**

**Características:**
- ✅ Diseño responsive
- ✅ Branding de FagSol
- ✅ Link de reset prominente
- ✅ Información de seguridad
- ✅ Expiración del link visible
- ✅ Instrucciones claras

**Ejemplo de estructura:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Restablecer Contraseña - FagSol</title>
</head>
<body>
    <h1>Restablecer Contraseña</h1>
    <p>Hola {user_name},</p>
    <p>Has solicitado restablecer tu contraseña.</p>
    <a href="{reset_url}">Restablecer Contraseña</a>
    <p>Este link expira en 1 hora.</p>
    <p>Si no solicitaste esto, ignora este email.</p>
</body>
</html>
```

---

## 📊 Resumen de Archivos a Crear/Modificar

### **Backend:**

**Nuevos archivos:**
- `backend/infrastructure/services/password_reset_service.py`
- `backend/infrastructure/services/tests/test_password_reset_service.py`

**Archivos a modificar:**
- `backend/presentation/views/auth_views.py` - Agregar endpoints
- `backend/presentation/api/v1/auth_urls.py` - Agregar rutas
- `backend/infrastructure/external_services/__init__.py` - Agregar método de email

---

### **Frontend:**

**Nuevos archivos:**
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
- `frontend/src/features/auth/components/ForgotPasswordForm.tsx`
- `frontend/src/features/auth/components/ResetPasswordForm.tsx`
- `frontend/src/app/auth/forgot-password/page.tsx`
- `frontend/src/app/auth/reset-password/[token]/page.tsx`

**Archivos a modificar:**
- `frontend/src/shared/services/auth.ts` - Agregar funciones
- `frontend/src/features/auth/components/LoginForm.tsx` - Agregar link

---

## ⏱️ Estimación de Tiempo

- **Backend:** 3-4 horas
  - Servicio: 1.5 horas
  - Endpoints: 1 hora
  - Tests: 0.5 horas
  - Email template: 1 hora

- **Frontend:** 3-4 horas
  - Componentes: 2 horas
  - Páginas: 1 hora
  - Integración: 1 hora

- **Total:** 6-8 horas

---

## ✅ Checklist de Implementación

### **Backend:**
- [ ] Crear `PasswordResetService`
- [ ] Agregar método `send_password_reset_email` a `DjangoEmailService`
- [ ] Crear endpoint `forgot_password`
- [ ] Crear endpoint `reset_password`
- [ ] Crear endpoint `validate_reset_token` (opcional)
- [ ] Agregar URLs
- [ ] Crear tests unitarios
- [ ] Crear template de email HTML

### **Frontend:**
- [ ] Agregar funciones a `auth.ts`
- [ ] Crear `ForgotPasswordForm`
- [ ] Crear `ResetPasswordForm`
- [ ] Crear `ForgotPasswordPage`
- [ ] Crear `ResetPasswordPage`
- [ ] Agregar rutas en Next.js
- [ ] Agregar link en `LoginForm`
- [ ] Probar flujo completo

### **Seguridad:**
- [ ] Rate limiting en solicitud de reset
- [ ] Validación de token
- [ ] Expiración de token
- [ ] Invalidación después de uso
- [ ] Validación de contraseña

---

## 🎯 Próximos Pasos

1. **Revisar este plan** y aprobar enfoque
2. **Implementar Backend** (Fase 1)
3. **Implementar Frontend** (Fase 2)
4. **Probar flujo completo**
5. **Documentar** en README/CHANGELOG

---

**¿Procedemos con la implementación?**

