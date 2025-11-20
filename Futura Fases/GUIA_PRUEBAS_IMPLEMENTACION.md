# 🧪 Guía de Pruebas - Funcionalidades Implementadas

Esta guía te ayudará a probar las nuevas funcionalidades implementadas:
1. **Notificaciones por email** tras pago exitoso
2. **Dashboard de pagos** con historial
3. **Manejo de errores mejorado** en frontend

---

## 📋 Pre-requisitos

1. **Backend corriendo** en `http://localhost:8000`
2. **Frontend corriendo** en `http://localhost:3000`
3. **Base de datos** con al menos:
   - Un usuario estudiante
   - Al menos un curso publicado
4. **Variables de entorno** configuradas (ver más abajo)

---

## 🔧 Configuración Inicial

### 1. Configurar Email (Backend)

El email está configurado para **desarrollo** usando el backend de consola (los emails se muestran en la terminal del backend).

**Para ver emails en la terminal:**
- No necesitas hacer nada, ya está configurado por defecto
- Los emails aparecerán en la consola donde corre el servidor Django

**Para usar SMTP real (opcional):**
Agrega estas variables a tu `.env` en `backend/`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
DEFAULT_FROM_EMAIL=noreply@fagsol.edu.pe
```

---

## 🧪 Prueba 1: Notificaciones por Email

### Objetivo
Verificar que se envía un email cuando un pago se completa exitosamente.

### Pasos:

1. **Inicia sesión** como estudiante en el frontend
2. **Agrega cursos al carrito** (al menos uno)
3. **Ve al checkout** (`/academy/checkout`)
4. **Completa el pago** usando una tarjeta de prueba de Mercado Pago:
   - **Tarjeta aprobada**: `5031 7557 3453 0604`
   - **CVV**: `123`
   - **Vencimiento**: `11/25`
   - **Nombre del titular**: `APRO` (importante: debe ser exactamente "APRO")
5. **Revisa la terminal del backend** donde corre Django
   - Deberías ver un email HTML con los detalles del pago
   - El email incluye: ID de pago, monto, cursos comprados

### Resultado Esperado:
```
✅ Email enviado a {email_usuario}
✅ Email contiene:
   - ID de pago
   - Monto pagado
   - Lista de cursos comprados
   - Botón para ir al dashboard
```

### Si no ves el email:
- Verifica que el backend esté corriendo
- Revisa los logs del backend para errores
- Verifica que el usuario tenga un email válido en la base de datos

---

## 🧪 Prueba 2: Dashboard de Pagos

### Objetivo
Verificar que el usuario puede ver su historial de pagos en el dashboard.

### Pasos:

1. **Inicia sesión** como estudiante
2. **Ve al dashboard** (`/dashboard`)
3. **Haz clic en la pestaña "Historial de Pagos"**
4. **Verifica que se muestre:**
   - Lista de pagos realizados
   - Detalles de cada pago:
     - ID de pago
     - Fecha
     - Monto
     - Estado (Aprobado, Rechazado, Pendiente)
     - Cursos comprados
     - Número de cuotas (si aplica)
5. **Prueba los filtros:**
   - Filtra por estado (Aprobados, Rechazados, etc.)
6. **Prueba la paginación** (si hay más de 10 pagos):
   - Navega entre páginas
   - Verifica que los datos se carguen correctamente

### Resultado Esperado:
```
✅ Se muestra el historial de pagos
✅ Cada pago muestra:
   - Estado con icono y color
   - Monto formateado (S/ 150.00)
   - Fecha formateada
   - Lista de cursos comprados
✅ Los filtros funcionan correctamente
✅ La paginación funciona
```

### Si no ves pagos:
- Verifica que hayas realizado al menos un pago
- Revisa la consola del navegador para errores
- Verifica que el endpoint `/api/v1/payments/history/` esté funcionando

---

## 🧪 Prueba 3: Manejo de Errores Mejorado

### Objetivo
Verificar que los mensajes de error son más amigables y claros.

### Pasos:

#### 3.1. Error de Pago Rechazado

1. **Ve al checkout** con cursos en el carrito
2. **Usa una tarjeta de prueba que sea rechazada**:
   - **Tarjeta rechazada**: `5031 7557 3453 0604`
   - **CVV**: `123`
   - **Vencimiento**: `11/25`
   - **Nombre del titular**: `OTHE` (para rechazo genérico)
3. **Intenta procesar el pago**
4. **Verifica el mensaje de error**:
   - Debe ser claro y amigable
   - No debe mostrar detalles técnicos internos
   - Debe sugerir qué hacer (verificar datos, intentar otra tarjeta)

#### 3.2. Error de Conexión

1. **Detén el servidor backend** temporalmente
2. **Intenta crear un payment intent** (agregar cursos al carrito y ir a checkout)
3. **Verifica el mensaje de error**:
   - Debe indicar que hay un problema de conexión
   - Debe sugerir intentar más tarde

#### 3.3. Error de Sesión Expirada

1. **Espera a que expire el token** (o elimínalo manualmente del sessionStorage)
2. **Intenta realizar una acción** (ej: ver historial de pagos)
3. **Verifica que:**
   - Se intente refrescar el token automáticamente
   - Si falla, se muestre un mensaje claro
   - Se redirija al login si es necesario

### Resultado Esperado:
```
✅ Mensajes de error son claros y amigables
✅ No se exponen detalles técnicos internos
✅ Los mensajes sugieren acciones al usuario
✅ Los errores se loguean correctamente en consola (para debugging)
```

---

## 🧪 Prueba 4: Protección IDOR (Insecure Direct Object Reference)

### Objetivo
Verificar que los usuarios solo pueden ver sus propios pagos.

### Pasos:

1. **Crea dos usuarios estudiantes** diferentes
2. **Usuario 1**: Realiza un pago
3. **Usuario 2**: Inicia sesión
4. **Intenta acceder al historial de pagos del Usuario 2**
5. **Verifica que:**
   - Solo se muestran los pagos del Usuario 2
   - No se muestran los pagos del Usuario 1

### Resultado Esperado:
```
✅ Cada usuario solo ve sus propios pagos
✅ No hay forma de acceder a pagos de otros usuarios
✅ El backend valida la propiedad del recurso
```

---

## 🔍 Verificación Técnica

### Backend - Endpoints

Puedes probar los endpoints directamente con curl o Postman:

#### 1. Obtener historial de pagos:
```bash
curl -X GET "http://localhost:8000/api/v1/payments/history/" \
  -H "Authorization: Bearer {tu_token_jwt}" \
  -H "Content-Type: application/json"
```

#### 2. Obtener historial con filtros:
```bash
curl -X GET "http://localhost:8000/api/v1/payments/history/?status=approved&page=1&page_size=10" \
  -H "Authorization: Bearer {tu_token_jwt}" \
  -H "Content-Type: application/json"
```

### Frontend - Consola del Navegador

Abre las **DevTools** (F12) y revisa:

1. **Network tab**: Verifica que las peticiones a `/api/v1/payments/history/` se hagan correctamente
2. **Console tab**: Verifica que no haya errores de JavaScript
3. **Application tab > Session Storage**: Verifica que los tokens JWT estén almacenados

---

## 🐛 Troubleshooting

### Problema: No se envía el email

**Solución:**
1. Verifica que `EMAIL_BACKEND` esté configurado en `settings.py`
2. Revisa los logs del backend para errores
3. Verifica que el usuario tenga un email válido
4. En desarrollo, los emails aparecen en la terminal del backend

### Problema: No se muestra el historial de pagos

**Solución:**
1. Verifica que el endpoint esté registrado en `urls.py`
2. Revisa la consola del navegador para errores
3. Verifica que el usuario esté autenticado
4. Prueba el endpoint directamente con curl/Postman

### Problema: Los mensajes de error no son claros

**Solución:**
1. Verifica que `errorMapper.ts` esté importado en `CheckoutPage.tsx`
2. Revisa la consola del navegador para ver los errores originales
3. Verifica que los mapeos de error estén correctos

---

## ✅ Checklist de Pruebas

- [ ] Email se envía tras pago exitoso
- [ ] Email contiene información correcta
- [ ] Dashboard muestra historial de pagos
- [ ] Filtros funcionan correctamente
- [ ] Paginación funciona
- [ ] Mensajes de error son amigables
- [ ] Protección IDOR funciona
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

---

## 📝 Notas Adicionales

- **En desarrollo**, los emails se muestran en la terminal del backend (no se envían realmente)
- **En producción**, configura SMTP real para enviar emails
- Los **mensajes de error** se loguean en consola para debugging, pero no se muestran al usuario
- El **historial de pagos** está paginado (10 por página por defecto)

---

¡Listo para probar! 🚀

