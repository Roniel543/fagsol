# 🔌 Endpoints Backend Requeridos para Seguridad

## ⚠️ Endpoints Faltantes

Para que la implementación de seguridad del frontend funcione completamente, el backend necesita implementar los siguientes endpoints:

---

## 1. 🔐 Logout Endpoint

### **Endpoint Requerido**
```
POST /api/v1/logout/
```

### **Descripción**
Invalida el token JWT del usuario en el servidor. Esto es crítico para seguridad porque:
- Previene que tokens robados sigan siendo válidos después del logout
- Permite "cerrar sesión en todos los dispositivos"
- Cumple con mejores prácticas de seguridad

### **Implementación Sugerida**

**Ubicación**: `backend/presentation/views/auth_views.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Endpoint de logout
    POST /api/v1/logout/
    Invalida el refresh token del usuario
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Requiere django-rest-framework-simplejwt[blacklist]
        
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Si falla, igual retornar éxito (tokens expirarán naturalmente)
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
```

### **Agregar a URLs**

**Ubicación**: `backend/presentation/api/v1/auth_urls.py`

```python
from presentation.views.auth_views import login, register, auth_health, logout

urlpatterns = [
    path('login/', login, name='auth_login'),
    path('register/', register, name='auth_register'),
    path('health/', auth_health, name='auth_health'),
    path('logout/', logout, name='auth_logout'),  # ← Agregar esta línea
]
```

### **Dependencia Opcional**

Para blacklist de tokens (recomendado):
```bash
pip install djangorestframework-simplejwt[blacklist]
```

Agregar a `INSTALLED_APPS` en `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',
]
```

Ejecutar migraciones:
```bash
python manage.py migrate
```

---

## 2. 📜 Certificados Endpoint (Futuro)

### **Endpoint Requerido**
```
GET /api/v1/certificates/{course_id}/download/
```

### **Descripción**
Genera URL firmada para descargar certificado. Ver `SECURITY_README_FRONTEND.md` para detalles.

---

## 3. 📚 Contenido de Cursos Endpoint (Futuro)

### **Endpoint Requerido**
```
GET /api/v1/courses/{course_id}/content/
```

### **Descripción**
Retorna contenido del curso solo si el usuario tiene acceso. Ver `SECURITY_README_FRONTEND.md` para detalles.

---

## ✅ Estado Actual

- ✅ `POST /api/v1/login/` - Implementado
- ✅ `POST /api/v1/register/` - Implementado
- ✅ `GET /api/v1/health/` - Implementado
- ❌ `POST /api/v1/logout/` - **FALTA IMPLEMENTAR** (Crítico para seguridad)

---

## 🚨 Prioridad

**ALTA**: El endpoint de logout es crítico para seguridad. Sin él:
- Los tokens robados siguen siendo válidos después del logout
- No se puede invalidar tokens server-side
- Vulnerabilidad de seguridad

**Recomendación**: Implementar antes de lanzar a producción.

