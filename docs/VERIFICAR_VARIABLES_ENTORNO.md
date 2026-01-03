# ✅ Guía: Verificar Variables de Entorno en App Service

## 🔍 Problema
El firewall está configurado correctamente, pero el backend aún no se conecta. El problema probablemente está en las **variables de entorno**.

## 📋 Checklist de Variables de Entorno

Ve a **App Service > fagsol-backend > Configuración > Variables de entorno** y verifica:

### Variables OBLIGATORIAS para la Base de Datos:

| Variable | Valor Esperado | Ejemplo |
|----------|---------------|---------|
| `DB_HOST` | Hostname completo de PostgreSQL | `fagsol-postgres-new.postgres.database.azure.com` |
| `DB_NAME` | Nombre de la base de datos | `fagsol-db` o `fagsol_db` |
| `DB_USER` | Usuario de PostgreSQL | `postgresadmin` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `TuContraseña123` |
| `DB_PORT` | Puerto (generalmente 5432) | `5432` |
| `DB_ENGINE` | Motor de base de datos | `django.db.backends.postgresql` |

### ⚠️ ERRORES COMUNES:

#### ❌ Error 1: Nombre de base de datos incorrecto
- **Mal**: `DB_NAME=fagsol_db` (con guión bajo)
- **Bien**: `DB_NAME=fagsol-db` (con guión, como lo creaste en Azure)
- **O viceversa**: Verifica el nombre EXACTO en Azure Portal

#### ❌ Error 2: Hostname incompleto
- **Mal**: `DB_HOST=fagsol-postgres-new`
- **Bien**: `DB_HOST=fagsol-postgres-new.postgres.database.azure.com`

#### ❌ Error 3: Usuario incorrecto
- **Mal**: `DB_USER=postgres` (usuario por defecto)
- **Bien**: `DB_USER=postgresadmin` (el que creaste en Azure)

#### ❌ Error 4: Contraseña con caracteres especiales
- Si tu contraseña tiene caracteres especiales, asegúrate de que esté entre comillas o escapada correctamente

## 🔧 Cómo Verificar y Corregir

### Paso 1: Verificar en Azure Portal

1. Ve a **App Service > fagsol-backend**
2. Menú lateral: **Configuración > Variables de entorno**
3. Busca cada variable de la lista de arriba
4. Haz clic en **"Mostrar valor"** para ver el valor actual

### Paso 2: Verificar el Nombre de la Base de Datos

1. Ve a **PostgreSQL > fagsol-postgres-new**
2. Menú lateral: **Bases de datos**
3. Verifica el nombre EXACTO de tu base de datos
4. Debe coincidir EXACTAMENTE con `DB_NAME` (incluyendo guiones/guiones bajos)

### Paso 3: Verificar el Hostname

1. Ve a **PostgreSQL > fagsol-postgres-new > Información general**
2. Busca **"Punto de conexión"** o **"Endpoint"**
3. Debe ser: `fagsol-postgres-new.postgres.database.azure.com`
4. Este valor debe estar en `DB_HOST`

### Paso 4: Verificar el Usuario

1. Ve a **PostgreSQL > fagsol-postgres-new > Información general**
2. Busca **"Inicio de sesión del administrador"** o **"Administrator login"**
3. Este valor debe estar en `DB_USER`

## 🧪 Probar la Conexión

### Opción 1: Desde los Logs del App Service

1. Ve a **App Service > fagsol-backend > Registros**
2. Busca los mensajes que muestran:
   ```
   Host: fagsol-postgres-new.postgres.database.azure.com
   Database: fagsol-db
   User: postgresadmin
   ```
3. Si alguno dice "no configurado", esa variable falta

### Opción 2: Reiniciar el App Service

Después de cambiar variables de entorno:

1. Ve a **App Service > fagsol-backend > Información general**
2. Haz clic en **"Reiniciar"** o **"Restart"**
3. Espera 2-3 minutos
4. Revisa los logs nuevamente

## 📝 Valores Correctos (Basado en tu Configuración)

Según lo que veo en tus capturas:

```bash
DB_HOST=fagsol-postgres-new.postgres.database.azure.com
DB_NAME=fagsol-db  # ⚠️ Verifica el nombre exacto en Azure
DB_USER=postgresadmin
DB_PASSWORD=Nghtmre123  # ⚠️ Tu contraseña real
DB_PORT=5432
DB_ENGINE=django.db.backends.postgresql
```

## 🚨 Si Aún No Funciona

### Verificar SSL

Azure PostgreSQL requiere SSL. El código ya está configurado para esto, pero verifica:

1. Las variables de entorno están correctas
2. El App Service se reinició después de cambiar variables
3. Los logs muestran el error específico

### Verificar Estado de la Base de Datos

1. Ve a **PostgreSQL > fagsol-postgres-new > Información general**
2. Verifica que **"Estado"** = **"Ready"**
3. Si está en otro estado, espera a que esté "Ready"

### Verificar que la Base de Datos Existe

1. Ve a **PostgreSQL > fagsol-postgres-new > Bases de datos**
2. Verifica que existe una base de datos con el nombre que pusiste en `DB_NAME`
3. Si no existe, créala:
   - Haz clic en **"+ Agregar"** o **"+ Add"**
   - Nombre: `fagsol-db` (o el que prefieras)
   - Haz clic en **"Guardar"**

## 🎯 Siguiente Paso

Una vez que todas las variables estén correctas:

1. **Guarda** los cambios en Variables de entorno
2. **Reinicia** el App Service
3. **Espera 2-3 minutos**
4. **Revisa los logs** - deberías ver:
   ```
   ✓ Base de datos disponible.
   ✓ Migraciones aplicadas correctamente.
   Iniciando Gunicorn en puerto 8000
   ```

¡Tu backend debería estar vivo! 🚀

