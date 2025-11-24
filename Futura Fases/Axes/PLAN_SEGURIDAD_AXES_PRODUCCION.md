# 🔒 Plan de Seguridad AXES para Producción - FagSol

## 📋 Resumen Ejecutivo

Este documento describe el plan de seguridad implementado con Django-AXES para proteger el acceso a cuentas de usuario en una aplicación que maneja pagos reales. El sistema implementa bloqueos temporales progresivos con feedback claro al usuario.

---

## 🎯 Objetivos de Seguridad

1. **Prevenir ataques de fuerza bruta** contra cuentas de usuario
2. **Proteger información financiera** y datos sensibles
3. **Balancear seguridad y usabilidad** - no frustrar usuarios legítimos
4. **Proporcionar feedback claro** sobre el estado de seguridad de la cuenta
5. **Implementar bloqueos temporales** (no permanentes) para permitir recuperación

---

## ⚙️ Configuración Implementada

### Límites por Ambiente

#### Desarrollo (DEBUG=True)
- **Intentos permitidos**: 10 fallos
- **Tiempo de bloqueo**: 30 minutos (0.5 horas)
- **Razón**: Permitir testing sin bloqueos frecuentes

#### Producción (DEBUG=False)
- **Intentos permitidos**: 5 fallos
- **Tiempo de bloqueo**: 1 hora
- **Razón**: Estándar de seguridad para aplicaciones con pagos reales

### Configuración de Bloqueo

```python
AXES_LOCKOUT_BY_USER = True          # Bloquear solo por usuario
AXES_LOCKOUT_BY_IP = False           # NO bloquear por IP
AXES_RESET_ON_SUCCESS = True        # Resetear contador al login exitoso
```

**Importante**: El bloqueo es **SOLO por usuario**, no por IP. Esto evita que:
- Un usuario malicioso bloquee a todos los usuarios de una IP compartida
- Usuarios legítimos se vean afectados por ataques dirigidos a otros

---

## 🔄 Flujo de Seguridad

### 1. Intento de Login Normal

```
Usuario intenta login
    ↓
¿Credenciales correctas?
    ├─ SÍ → Login exitoso ✅
    └─ NO → Incrementar contador de fallos
```

### 2. Feedback Progresivo al Usuario

#### Primeros 4 Intentos Fallidos
**Mensaje**: 
```
"Credenciales incorrectas. Te quedan X intentos antes del bloqueo temporal."
```

**Ejemplo**:
- Intento 1 fallido: "Te quedan 4 intentos..."
- Intento 2 fallido: "Te quedan 3 intentos..."
- Intento 3 fallido: "Te quedan 2 intentos..."
- Intento 4 fallido: "Te quedan 1 intento..."

#### 5to Intento Fallido (Límite Alcanzado)
**Mensaje**:
```
"Cuenta bloqueada temporalmente por múltiples intentos fallidos. 
Intenta nuevamente en X horas y Y minutos."
```

**Acción**: Bloqueo temporal activado por 1 hora

### 3. Durante el Bloqueo

- **Todos los intentos de login son rechazados** automáticamente
- **No se incrementa el contador** (ya está en el máximo)
- **Mensaje claro** con tiempo restante hasta desbloqueo

### 4. Después del Bloqueo

- **El bloqueo se levanta automáticamente** después del tiempo configurado
- **El contador se mantiene** en 5 fallos
- **Si el usuario falla nuevamente**, el bloqueo se reactiva inmediatamente
- **Si el usuario tiene éxito**, el contador se resetea a 0

---

## 📊 Estados del Sistema

### Estado: Normal
- **Fallos**: 0-4
- **Acción**: Permitir login, mostrar advertencia progresiva
- **Mensaje**: "Credenciales incorrectas. Te quedan X intentos..."

### Estado: Advertencia Final
- **Fallos**: 4 (1 intento restante)
- **Acción**: Permitir login, advertencia fuerte
- **Mensaje**: "Te queda 1 intento antes del bloqueo temporal."

### Estado: Bloqueado Temporalmente
- **Fallos**: 5+ (límite alcanzado)
- **Acción**: Rechazar todos los intentos
- **Mensaje**: "Cuenta bloqueada temporalmente. Intenta en X horas y Y minutos."
- **Duración**: 1 hora (producción) / 30 minutos (desarrollo)

---

## 🛡️ Características de Seguridad

### ✅ Implementado

1. **Bloqueo Temporal (No Permanente)**
   - Permite recuperación automática
   - No requiere intervención del administrador
   - Tiempo razonable para disuadir ataques

2. **Feedback Progresivo**
   - Usuario sabe cuántos intentos le quedan
   - Mensajes claros y específicos
   - Información sobre tiempo de desbloqueo

3. **Bloqueo por Usuario (No por IP)**
   - Evita bloqueos masivos
   - Protege usuarios legítimos
   - Permite múltiples usuarios desde la misma IP

4. **Reset Automático al Éxito**
   - Si el usuario logra hacer login, el contador se resetea
   - No mantiene bloqueos innecesarios

5. **Detección Proactiva**
   - Verifica bloqueo ANTES de intentar autenticar
   - Ahorra recursos y proporciona feedback inmediato

### ⚠️ No Implementado (Consideraciones Futuras)

1. **Notificaciones por Email**
   - Enviar email cuando se detecte bloqueo
   - Alertar sobre actividad sospechosa
   - Opción de "¿Fuiste tú?" con enlace de desbloqueo

2. **Recuperación de Cuenta**
   - Enlace "Olvidé mi contraseña" visible durante bloqueo
   - Proceso de recuperación que también desbloquea la cuenta

3. **Bloqueo Permanente**
   - Después de X bloqueos temporales, considerar bloqueo permanente
   - Requiere intervención del administrador

4. **Análisis de Patrones**
   - Detectar intentos desde múltiples IPs
   - Detectar intentos en horarios inusuales
   - Alertas de seguridad avanzadas

---

## 🔧 Comandos de Administración

### Desbloquear Usuario Específico
```bash
python manage.py fix_user_auth usuario@email.com
```

### Desbloquear Todos los Usuarios
```bash
python manage.py unlock_all_users
```

### Limpiar Todos los Bloqueos (Útil en emergencias)
```bash
python manage.py unlock_all_users --clear-all
```

### Desbloquear por IP (si es necesario)
```bash
python manage.py unlock_all_users --by-ip 127.0.0.1
```

---

## 📱 Experiencia del Usuario

### Escenario 1: Usuario Legítimo con Contraseña Incorrecta

1. **Intento 1-4**: 
   - Ve mensaje: "Credenciales incorrectas. Te quedan X intentos..."
   - Puede intentar nuevamente inmediatamente
   - Feedback claro y no alarmante

2. **Intento 5**:
   - Ve mensaje: "Cuenta bloqueada temporalmente..."
   - Debe esperar 1 hora
   - Puede usar "Olvidé mi contraseña" si está disponible

3. **Después de 1 hora**:
   - Puede intentar nuevamente
   - Si falla otra vez, se bloquea inmediatamente
   - Si tiene éxito, el contador se resetea

### Escenario 2: Ataque de Fuerza Bruta

1. **Intento 1-5**: 
   - Cada intento fallido incrementa el contador
   - Después del 5to fallo, la cuenta se bloquea

2. **Durante el bloqueo**:
   - Todos los intentos son rechazados automáticamente
   - El atacante debe esperar 1 hora

3. **Después de 1 hora**:
   - Si intenta nuevamente y falla, se bloquea inmediatamente
   - El atacante solo puede hacer 5 intentos por hora
   - Esto hace el ataque inviable

---

## 🔍 Monitoreo y Logs

### Logs Generados

1. **Intento de Login Fallido**
   ```
   WARNING: Intento de login con credenciales inválidas para: usuario@email.com
   ```

2. **Bloqueo Activado**
   ```
   WARNING: AXES: Locking out {username: "...", ip_address: "..."} after repeated login failures.
   ```

3. **Reset de Bloqueo**
   ```
   INFO: AXES: Reset X access attempts from database.
   ```

### Métricas a Monitorear

- Número de bloqueos por día
- Usuarios más frecuentemente bloqueados
- IPs desde donde ocurren más bloqueos
- Tiempo promedio hasta desbloqueo exitoso

---

## 🚨 Respuesta a Incidentes

### Si un Usuario Legítimo Está Bloqueado

1. **Verificar el bloqueo**:
   ```bash
   python manage.py fix_user_auth usuario@email.com
   ```

2. **Si el problema persiste**:
   ```bash
   python manage.py unlock_all_users --clear-all
   ```

3. **Recomendar al usuario**:
   - Usar "Olvidé mi contraseña" si está disponible
   - Verificar que está usando el email correcto
   - Esperar el tiempo de desbloqueo automático

### Si Hay un Ataque Activo

1. **Monitorear logs** para identificar el patrón
2. **Considerar bloqueo por IP** temporalmente (si es necesario)
3. **Notificar al usuario afectado** si es posible
4. **Documentar el incidente** para análisis posterior

---

## 📈 Mejoras Futuras Recomendadas

### Corto Plazo
1. ✅ Implementar feedback progresivo (COMPLETADO)
2. ⏳ Agregar enlace "Olvidé mi contraseña" visible durante bloqueo
3. ⏳ Mejorar mensajes de error en frontend

### Mediano Plazo
1. ⏳ Notificaciones por email cuando se detecte bloqueo
2. ⏳ Dashboard de administración para ver bloqueos activos
3. ⏳ Métricas y reportes de seguridad

### Largo Plazo
1. ⏳ Análisis de patrones de ataque
2. ⏳ Integración con sistemas de detección de fraude
3. ⏳ Bloqueo permanente después de múltiples bloqueos temporales
4. ⏳ Autenticación de dos factores (2FA)

---

## ✅ Checklist de Implementación

- [x] Configurar AXES con límites apropiados para producción
- [x] Implementar bloqueo temporal (no permanente)
- [x] Agregar feedback progresivo al usuario
- [x] Detectar bloqueos antes de intentar autenticar
- [x] Mostrar mensajes claros con tiempo de desbloqueo
- [x] Implementar comandos de administración
- [x] Documentar el plan de seguridad
- [ ] Agregar notificaciones por email (futuro)
- [ ] Implementar recuperación de cuenta (futuro)
- [ ] Crear dashboard de monitoreo (futuro)

---

## 📚 Referencias

- [Django-AXES Documentation](https://django-axes.readthedocs.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Guidelines on Authentication](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Última actualización**: 2025-11-23
**Versión**: 1.0
**Autor**: Sistema de Seguridad FagSol

