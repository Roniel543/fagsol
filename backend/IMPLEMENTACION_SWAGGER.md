# Implementación de OpenAPI/Swagger - FagSol Escuela Virtual

## 📋 Resumen

Se ha configurado **OpenAPI/Swagger** para documentar automáticamente la API REST de FagSol Escuela Virtual. La documentación es interactiva y permite probar endpoints directamente desde el navegador.

## ✅ Cambios Realizados

### 1. Configuración en `backend/config/settings.py`

- **SWAGGER_SETTINGS**: Configuración de Swagger con:
  - Autenticación Bearer JWT
  - Descripción de la API
  - Configuración de seguridad (no exponer información sensible)
  - Tags y ordenamiento alfabético

```python
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'JWT Authorization header usando el esquema Bearer. Ejemplo: "Authorization: Bearer {token}"'
        }
    },
    'USE_SESSION_AUTH': False,
    'HIDE_SENSITIVE_SCHEMAS': True,
    # ... más configuraciones
}
```

### 2. URLs en `backend/config/urls.py`

Se agregaron las siguientes rutas:

- **`/swagger/`**: Interfaz interactiva de Swagger UI
- **`/redoc/`**: Documentación en formato ReDoc
- **`/swagger<format>/`**: Schema JSON/YAML

```python
# OpenAPI/Swagger Documentation
path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
```

### 3. Documentación de Endpoints

Se agregaron decoradores `@swagger_auto_schema` a los siguientes endpoints:

#### Autenticación (`backend/presentation/views/auth_views.py`)

- ✅ `POST /api/v1/login/` - Login con JWT
- ✅ `POST /api/v1/register/` - Registro de usuarios
- ✅ `GET /api/v1/health/` - Health check
- ✅ `POST /api/v1/logout/` - Logout con revocación de tokens

#### Cursos (`backend/presentation/views/course_views.py`)

- ✅ `GET /api/v1/courses/` - Lista de cursos (con filtros)
- ✅ `GET /api/v1/courses/{course_id}/content/` - Contenido protegido

#### Pagos (`backend/presentation/views/payment_views.py`)

- ✅ `POST /api/v1/payments/intent/` - Crear payment intent
- ✅ `POST /api/v1/payments/process/` - Procesar pago con Mercado Pago

## 🔒 Seguridad

### Medidas Implementadas

1. **No exponer información sensible**:
   - `HIDE_SENSITIVE_SCHEMAS: True` en configuración
   - No se muestran tokens reales en ejemplos
   - No se exponen secretos o claves

2. **Autenticación Bearer JWT**:
   - Documentación clara de cómo usar tokens
   - Botón "Authorize" en Swagger UI para agregar tokens

3. **Documentación de permisos**:
   - Cada endpoint documenta qué roles pueden acceder
   - Ejemplos de respuestas 403 (Forbidden) cuando aplica

## 📖 Cómo Usar

### 1. Acceder a la Documentación

Una vez que el servidor esté corriendo:

```bash
# Swagger UI (interactivo)
http://localhost:8000/swagger/

# ReDoc (documentación alternativa)
http://localhost:8000/redoc/

# Schema JSON
http://localhost:8000/swagger.json

# Schema YAML
http://localhost:8000/swagger.yaml
```

### 2. Probar Endpoints desde Swagger

1. Abre `http://localhost:8000/swagger/`
2. Haz clic en el botón **"Authorize"** (🔓) en la parte superior
3. Ingresa tu token JWT: `Bearer {tu_token}`
4. Haz clic en **"Try it out"** en cualquier endpoint
5. Completa los parámetros requeridos
6. Haz clic en **"Execute"** para probar

### 3. Ejemplo de Uso

**Login:**
1. Ve a `POST /api/v1/login/`
2. Haz clic en "Try it out"
3. Ingresa:
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
4. Haz clic en "Execute"
5. Copia el `access` token de la respuesta
6. Haz clic en "Authorize" y pega: `Bearer {access_token}`
7. Ahora puedes probar endpoints protegidos

## 📝 Estructura de Documentación

Cada endpoint documentado incluye:

- **Descripción**: Qué hace el endpoint
- **Parámetros**: Query params, path params, body
- **Respuestas**: Ejemplos de éxito y errores
- **Seguridad**: Si requiere autenticación
- **Tags**: Categorización (Autenticación, Cursos, Pagos, etc.)

## 🎯 Próximos Pasos

### Endpoints Pendientes de Documentar

- [ ] `GET /api/v1/courses/{course_id}/` - Detalle de curso
- [ ] `GET /api/v1/enrollments/` - Lista de enrollments
- [ ] `GET /api/v1/enrollments/{enrollment_id}/` - Detalle de enrollment
- [ ] `GET /api/v1/certificates/{course_id}/download/` - Descarga de certificado
- [ ] `GET /api/v1/certificates/{course_id}/verify/` - Verificación de certificado
- [ ] `POST /api/v1/payments/webhook/` - Webhook de Mercado Pago

### Mejoras Futuras

1. **Ejemplos más completos**: Agregar más ejemplos de requests/responses
2. **Validaciones**: Documentar reglas de validación de campos
3. **Códigos de error**: Documentar todos los códigos HTTP posibles
4. **Rate limiting**: Documentar límites de rate limiting
5. **Webhooks**: Documentar formato de webhooks de Mercado Pago

## 🔍 Verificación

Para verificar que todo funciona:

```bash
# 1. Verificar configuración
python manage.py check

# 2. Iniciar servidor
python manage.py runserver

# 3. Abrir en navegador
# http://localhost:8000/swagger/
```

## 📚 Referencias

- [drf-yasg Documentation](https://drf-yasg.readthedocs.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Fecha de implementación**: 2025-11-12  
**Estado**: ✅ Completado y funcional

