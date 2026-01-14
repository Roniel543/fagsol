# 🚀 GUÍA COMPLETA: Configuración Azure Producción - Cuenta Empresa

**Guía paso a paso para configurar FagSol en Azure desde cero con cuenta empresarial**

**Tiempo estimado:** 2-3 horas  
**Nivel:** Intermedio-Avanzado

---

## ⚡ INFORMACIÓN ACTUAL DE PRODUCCIÓN

**Valores actuales configurados:**

| Recurso | Valor |
|---------|-------|
| **App Service name** | `fagsol-back` |
| **Resource Group** | `fagsol-rs` |
| **Subscription ID** | `759b41e8-9b8e-4340-b885-e05e7ec853f7` |
| **Runtime** | Python 3.12 |
| **OS** | Linux |

⚠️ **Nota:** Si estás configurando desde cero, puedes usar estos nombres o elegir otros. Si ya tienes recursos creados, usa los nombres existentes.

---

## 📋 ÍNDICE

1. [Preparación Inicial](#1-preparación-inicial)
2. [Crear Recursos en Azure Portal](#2-crear-recursos-en-azure-portal)
3. [Configurar Azure Blob Storage](#3-configurar-azure-blob-storage)
4. [Configurar App Services](#4-configurar-app-services)
5. [Configurar Base de Datos PostgreSQL](#5-configurar-base-de-datos-postgresql)
6. [Configurar GitHub Actions](#6-configurar-github-actions)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Verificación y Pruebas](#8-verificación-y-pruebas)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. PREPARACIÓN INICIAL

### 1.1. Requisitos Previos

- ✅ Cuenta de Azure empresarial activa
- ✅ Permisos de **Propietario** o **Colaborador** en la suscripción
- ✅ Acceso a GitHub con permisos de administrador del repositorio
- ✅ Azure CLI instalado (opcional pero recomendado)
- ✅ Conocimiento básico de Azure Portal

### 1.2. Información Necesaria

Antes de empezar, ten a mano:

- **Nombre de la empresa:** FagSol
- **Nombre del proyecto:** `fagsol-rs` (Resource Group) - **Valor actual en producción**
- **Región preferida:** `Central US` o `East US` (para Perú)
- **Dominio personalizado (opcional):** Si tienes uno
- **Credenciales de Mercado Pago:** Access Token y Public Key de producción

### 1.3. Instalar Azure CLI (Opcional)

```bash
# Windows (PowerShell como Administrador)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# Verificar instalación
az --version

# Login
az login
```

---

## 2. CREAR RECURSOS EN AZURE PORTAL

### 2.1. Acceder al Portal

1. Ve a [https://portal.azure.com](https://portal.azure.com)
2. Inicia sesión con la **cuenta empresarial**
3. Verifica que estás en la suscripción correcta (selector en la parte superior)

### 2.2. Crear Resource Group

1. Busca **"Grupos de recursos"** en la barra de búsqueda
2. Click en **"Crear"**
3. Configuración:
   - **Suscripción:** Selecciona la suscripción empresarial
   - **Grupo de recursos:** `fagsol-rs` (o el que ya tengas creado)
   - **Región:** `Central US` (o la más cercana)
4. Click en **"Revisar + crear"** → **"Crear"**

✅ **Resultado:** Grupo de recursos creado

---

## 3. CONFIGURAR AZURE BLOB STORAGE

> 📖 **Guía detallada:** Para una guía paso a paso completa con capturas y troubleshooting, consulta [`CONFIGURAR_AZURE_BLOB_STORAGE.md`](./CONFIGURAR_AZURE_BLOB_STORAGE.md)

### 3.1. Crear Storage Account

1. En el portal, busca **"Cuentas de almacenamiento"**
2. Click en **"Crear"**
3. **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción empresarial
   - **Grupo de recursos:** `fagsol-rs` (o el que ya tengas creado)
   - **Nombre de la cuenta de almacenamiento:** `fagsolmedia2026` (debe ser único globalmente)
     - ⚠️ Solo letras minúsculas y números, sin guiones
     - Si no está disponible: `fagsolstorage2025`, `fagsolmedia2025`, `fagsolmedia2026`, etc.
   - **Región:** Misma que el Resource Group
   - **Rendimiento:** **Estándar** (suficiente para imágenes)
   - **Redundancia:** **LRS** (Local Redundant Storage) - más económico
     - Para producción crítica: **GRS** (Geo-Redundant Storage)

4. **Pestaña "Avanzado":**
   - **Seguridad de transferencia requerida:** ✅ **Habilitado** (HTTPS obligatorio)
   - **Versión mínima de TLS:** **Versión 1.2**
   - **Acceso de blob público:** ✅ **Habilitado** (para servir imágenes)
   - **Nivel de acceso:** **Hot** (acceso frecuente)

5. **Pestaña "Redes":**
   - **Conectividad de red:** **Punto de conexión público (todas las redes)**
   - O si prefieres más seguridad: **Punto de conexión público (redes seleccionadas)**
     - Agrega la IP de tu App Service después de crearlo

6. **Pestaña "Protección de datos":**
   - Puedes dejar los valores por defecto

7. **Pestaña "Etiquetas":**
   - **Nombre:** `Environment`
   - **Valor:** `Production`
   - **Nombre:** `Project`
   - **Valor:** `FagSol`

8. Click en **"Revisar + crear"** → **"Crear"**

⏳ **Tiempo estimado:** 2-3 minutos

### 3.2. Crear Container en Blob Storage

1. Una vez creado el Storage Account, ve a **"Contenedores"** en el menú lateral
2. Click en **"+ Contenedor"**
3. Configuración:
   - **Nombre:** `fagsol-media`
   - **Nivel de acceso público:** **Blob (acceso de lectura anónimo para blobs solamente)**
     - Esto permite que las imágenes sean accesibles públicamente vía URL
4. Click en **"Crear"**

✅ **Resultado:** Container `fagsol-media` creado

### 3.3. Obtener Credenciales de Storage

1. En el Storage Account, ve a **"Claves de acceso"** en el menú lateral
2. Verás dos claves (Key1 y Key2)
3. **Copia estos valores (los necesitarás después):**
   - **Nombre de la cuenta de almacenamiento:** `fagsolmedia2026` (o el que elegiste)
   - **Clave 1** o **Clave 2** (cualquiera funciona)
   - **Cadena de conexión** (opcional, pero útil)

⚠️ **IMPORTANTE:** Guarda estas credenciales en un lugar seguro. Las usarás en las variables de entorno.

### 3.4. Configurar CORS (Opcional pero Recomendado)

Si tu frontend está en un dominio diferente, configura CORS:

1. En el Storage Account, ve a **"CORS"** en el menú lateral
2. **Blob service:**
   - **Orígenes permitidos:** `https://tu-dominio.com` o `*` (para desarrollo)
   - **Métodos permitidos:** `GET, HEAD`
   - **Encabezados permitidos:** `*`
   - **Encabezados expuestos:** `*`
   - **Edad máxima:** `3600`
3. Click en **"Guardar"**

---

## 4. CONFIGURAR APP SERVICES

### 4.1. Crear App Service para Backend (Django)

1. Busca **"App Services"** en el portal
2. Click en **"Crear"**
3. **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción
   - **Grupo de recursos:** `fagsol-rs` (o el que ya tengas creado)
   - **Nombre:** `fagsol-back` (debe ser único globalmente) - **Valor actual en producción**
     - Si no está disponible: `fagsol-back-2025`, `fagsol-api-2025`, etc.
   - **Publicar:** **Código**
   - **Pila en tiempo de ejecución:** **Python 3.12**
   - **Sistema operativo:** **Linux**
   - **Región:** Misma que el Resource Group
   - **Plan de App Service:** 
     - Si no existe, crea uno nuevo:
       - **Nombre:** `fagsol-plan`
       - **Plan de tarifa:** **Básico B1** (para empezar, ~$13/mes)
         - Para producción: **Estándar S1** o superior (~$70/mes)
       - **Región:** Misma que el Resource Group

4. **Pestaña "Implementación":**
   - **Continuidad de entrega:** ✅ **Habilitar** (para GitHub Actions)
   - **Origen:** **GitHub** (si quieres configurar CI/CD ahora)
     - O puedes configurarlo después desde GitHub Actions

5. **Pestaña "Redes":**
   - Puedes dejar los valores por defecto
   - O configurar **Red virtual** si necesitas conectividad privada

6. **Pestaña "Supervisión":**
   - **Application Insights:** ✅ **Habilitar** (recomendado)
     - **Nuevo recurso:** `fagsol-backend-insights`
     - **Región:** Misma que el Resource Group

7. Click en **"Revisar + crear"** → **"Crear"**

⏳ **Tiempo estimado:** 3-5 minutos

### 4.2. Crear App Service para Frontend (Next.js)

1. Repite el proceso anterior pero con:
   - **Nombre:** `fagsol-frontend`
   - **Pila en tiempo de ejecución:** **Node.js 20 LTS**
   - **Plan de App Service:** Usa el mismo `fagsol-plan` (compartido)

⏳ **Tiempo estimado:** 3-5 minutos

### 4.3. Configurar Backend App Service

Una vez creado el App Service del backend:

1. Ve al App Service `fagsol-back`
2. **Configuración → Configuración general:**
   - **Stack:** Python 3.12
   - **Comando de inicio:** `bash startup.sh`
   - **Always On:** ✅ **Activado** (evita que se apague por inactividad)
   - **ARR Affinity:** ✅ **Activado** (mantiene sesión en el mismo servidor)

3. **Configuración → Configuración de la aplicación:**
   - Aquí configurarás las variables de entorno (ver sección 7)

4. **Configuración → Configuración general → Límites de tiempo:**
   - **SCM_COMMAND_IDLE_TIMEOUT:** `600` (10 minutos)
   - **WEBSITES_CONTAINER_START_TIME_LIMIT:** `1800` (30 minutos)

### 4.4. Configurar Frontend App Service

1. Ve al App Service `fagsol-frontend`
2. **Configuración → Configuración general:**
   - **Stack:** Node.js 20 LTS
   - **Comando de inicio:** `npm start`
   - **Always On:** ✅ **Activado**

3. **Configuración → Configuración de la aplicación:**
   - Aquí configurarás las variables de entorno (ver sección 7)

---

## 5. CONFIGURAR BASE DE DATOS POSTGRESQL

### 5.1. Crear PostgreSQL Flexible Server

1. Busca **"Azure Database for PostgreSQL"**
2. Click en **"Crear"** → **"Servidor flexible"**
3. **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción
   - **Grupo de recursos:** `fagsol-rs` (o el que ya tengas creado)
   - **Nombre del servidor:** `fagsol-postgres` (debe ser único)
     - Si no está disponible: `fagsol-postgres-2025`, `fagsol-db-2025`, etc.
   - **Región:** Misma que el Resource Group
   - **Versión de PostgreSQL:** **15** (recomendado)
   - **Tipo de carga de trabajo:** **Desarrollo** (para empezar)
     - Para producción: **Producción** (más recursos)
   - **Zona de disponibilidad:** Dejar en blanco (o elegir para HA)

4. **Pestaña "Redes":**
   - **Método de conectividad:** **Punto de conexión público**
   - **Reglas de firewall:**
     - ✅ **Permitir acceso público desde servicios y recursos de Azure dentro de Azure**
     - ✅ Click en **"Agregar dirección IP del cliente actual"**
     - ✅ Click en **"Agregar regla de firewall":**
       - **Nombre:** `AllowAllAzureServices`
       - **IP inicial:** `0.0.0.0`
       - **IP final:** `0.0.0.0`
       - **Descripción:** "Permitir todos los servicios de Azure"

5. **Pestaña "Seguridad + redes":**
   - **Autenticación:** **Autenticación de contraseña**
   - **Nombre de usuario del administrador:** `fagsoladmin`
   - **Contraseña:** 
     - ⚠️ **CRÍTICO:** Genera una contraseña segura
     - Mínimo 8 caracteres, mayúsculas, minúsculas, números, símbolos
     - Ejemplo: `Fagsol2025!Secure#Pass`
     - **GUARDA ESTA CONTRASEÑA EN UN LUGAR SEGURO**

6. **Pestaña "Administración":**
   - Puedes dejar los valores por defecto

7. Click en **"Revisar + crear"** → **"Crear"**

⏳ **Tiempo estimado:** 5-10 minutos

### 5.2. Crear Base de Datos

1. Una vez creado el servidor, ve a **"Bases de datos"** en el menú lateral
2. Click en **"+ Agregar"**
3. **Nombre de la base de datos:** `fagsol_db`
4. **Collation:** `en_US.utf8` (o dejar por defecto)
5. Click en **"Aceptar"**

✅ **Resultado:** Base de datos `fagsol_db` creada

### 5.3. Obtener Cadena de Conexión

1. En el servidor PostgreSQL, ve a **"Cadenas de conexión"** en el menú lateral
2. Selecciona **"psycopg2"** (para Python/Django)
3. **Copia la cadena de conexión** (la necesitarás después)

Ejemplo:
```
host=fagsol-postgres.postgres.database.azure.com port=5432 dbname=fagsol_db user=fagsoladmin password=TU_PASSWORD sslmode=require
```

⚠️ **IMPORTANTE:** Reemplaza `TU_PASSWORD` con la contraseña real que configuraste.

---

## 6. CONFIGURAR GITHUB ACTIONS

### 6.1. Crear Service Principal en Azure

Necesitas crear un Service Principal para que GitHub Actions pueda desplegar a Azure.

#### Opción A: Desde Azure Portal (Más Fácil)

1. Ve a **"Azure Active Directory"** en el portal
2. Click en **"Registros de aplicaciones"** → **"Nuevo registro"**
3. Configuración:
   - **Nombre:** `fagsol-github-actions`
   - **Tipos de cuenta admitidos:** **Solo cuentas de este directorio organizativo**
   - **URI de redirección:** Dejar en blanco
4. Click en **"Registrar"**
5. **Copia estos valores:**
   - **Application (client) ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

6. Ve a **"Certificados y secretos"** → **"Nuevo secreto de cliente"**
7. Configuración:
   - **Descripción:** `GitHub Actions Secret`
   - **Expira:** **24 meses** (o el tiempo que prefieras)
8. Click en **"Agregar"**
9. **Copia el valor del secreto** (solo se muestra una vez)

10. Ve a **"Suscripciones"** en el portal
11. Selecciona tu suscripción
12. Click en **"Control de acceso (IAM)"** → **"Agregar"** → **"Agregar asignación de roles"**
13. Configuración:
    - **Rol:** **Colaborador** (o **Propietario** si tienes permisos)
    - **Asignar acceso a:** **Usuario, grupo o entidad de servicio**
    - **Seleccionar:** Busca `fagsol-github-actions` y selecciónalo
14. Click en **"Guardar"**

#### Opción B: Desde Azure CLI (Más Rápido)

```bash
# Login
az login

# Crear Service Principal
az ad sp create-for-rbac \
  --name "fagsol-github-actions" \
  --role contributor \
  --scopes /subscriptions/SUBSCRIPTION_ID \
  --sdk-auth

# Esto te dará un JSON con todas las credenciales necesarias
```

### 6.2. Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click en **"New repository secret"**

#### Secrets para Backend:

Agrega estos secrets (reemplaza los valores con los tuyos):

```
AZUREAPPSERVICE_CLIENTID_CEE14BBB8DEE4611B42DC7D5719AB4CE
Valor: [Application (client) ID del Service Principal]

AZUREAPPSERVICE_TENANTID_6C82FA05A127426E8E34B7E0673E74E9
Valor: [Directory (tenant) ID del Service Principal]

AZUREAPPSERVICE_SUBSCRIPTIONID_41FB12A187CD40539F6433521BF34E7F
Valor: 759b41e8-9b8e-4340-b885-e05e7ec853f7
```

#### Secrets para Frontend:

```
AZUREAPPSERVICE_CLIENTID_105BBE8F84F949B3882B33709BC89CAC
Valor: [Application (client) ID del Service Principal] (puede ser el mismo)

AZUREAPPSERVICE_TENANTID_98FCEBD4DC7841DCAB92A5D7FB37677E
Valor: [Directory (tenant) ID del Service Principal] (puede ser el mismo)

AZUREAPPSERVICE_SUBSCRIPTIONID_17BC8AF7D9BA44A3B1223EB76D1D181A
Valor: 759b41e8-9b8e-4340-b885-e05e7ec853f7 (puede ser el mismo)
```

⚠️ **NOTA:** Los nombres de los secrets incluyen IDs únicos. Si estás configurando desde cero, puedes usar nombres más simples y actualizar los workflows de GitHub Actions.

⚠️ **IMPORTANTE - ACTUALIZAR EN GITHUB:**
1. Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Actualiza el secret `AZUREAPPSERVICE_SUBSCRIPTIONID_41FB12A187CD40539F6433521BF34E7F` con el valor: `759b41e8-9b8e-4340-b885-e05e7ec853f7`
3. Si el secret no existe, créalo con ese nombre y valor

### 6.3. Actualizar Workflows de GitHub Actions

Los workflows ya están configurados en:
- `.github/workflows/master_fagsol-backend.yml`
- `.github/workflows/master_fagsol-frontend.yml`

Solo necesitas verificar que los nombres de los secrets coincidan con los que agregaste en GitHub.

Si usaste nombres diferentes, actualiza los workflows:

```yaml
# En master_fagsol-backend.yml
- name: Login to Azure
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZUREAPPSERVICE_CLIENTID_CEE14BBB8DEE4611B42DC7D5719AB4CE }}
    tenant-id: ${{ secrets.AZUREAPPSERVICE_TENANTID_6C82FA05A127426E8E34B7E0673E74E9 }}
    subscription-id: ${{ secrets.AZUREAPPSERVICE_SUBSCRIPTIONID_41FB12A187CD40539F6433521BF34E7F }}
```

---

## 7. VARIABLES DE ENTORNO

### 7.1. Variables de Entorno del Backend

Ve al App Service `fagsol-back` → **Configuración** → **Configuración de la aplicación**

Agrega estas variables (click en **"+ Nueva configuración de aplicación"**):

#### Base de Datos:
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=fagsol_db
DB_USER=fagsoladmin
DB_PASSWORD=[TU_PASSWORD_POSTGRESQL]
DB_HOST=[TU_HOST_POSTGRESQL].postgres.database.azure.com
DB_PORT=5432
```

#### Azure Blob Storage:
```env
USE_AZURE_STORAGE=True
AZURE_STORAGE_ACCOUNT_NAME=fagsolmedia2026
AZURE_STORAGE_ACCOUNT_KEY=[TU_CLAVE_DE_STORAGE]
AZURE_STORAGE_CONTAINER_NAME=fagsol-media
```

#### Django Settings:
```env
DEBUG=False
SECRET_KEY=[GENERA_UNA_CLAVE_SECRETA_SEGURA]
ALLOWED_HOSTS=fagsol-back-[ID].azurewebsites.net,tu-dominio.com
CORS_ALLOWED_ORIGINS=https://fagsol-frontend-[ID].azurewebsites.net,https://tu-dominio.com
```

#### Mercado Pago (Producción):
```env
MERCADOPAGO_ACCESS_TOKEN=[TU_ACCESS_TOKEN_PRODUCCION]
MERCADOPAGO_PUBLIC_KEY=[TU_PUBLIC_KEY_PRODUCCION]
```

#### Otros:
```env
DEFAULT_USD_TO_PEN_RATE=3.75
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password-app
```

### 7.2. Variables de Entorno del Frontend

Ve al App Service `fagsol-frontend` → **Configuración** → **Configuración de la aplicación**

Agrega estas variables:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://fagsol-back-[ID].azurewebsites.net/api/v1
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=[TU_PUBLIC_KEY_PRODUCCION]
PORT=8080
```

⚠️ **IMPORTANTE:** 
- Reemplaza `[ID]` con el ID real de tu App Service
- Las variables `NEXT_PUBLIC_*` se inyectan en tiempo de BUILD, no runtime
- Por eso también están en el workflow de GitHub Actions

### 7.3. Generar SECRET_KEY de Django

```bash
# En tu terminal local
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia el resultado y úsalo en `SECRET_KEY` del backend.

---

## 8. VERIFICACIÓN Y PRUEBAS

### 8.1. Verificar Backend

1. Ve a `https://fagsol-back-[ID].azurewebsites.net/api/v1/auth/health/`
2. Deberías ver una respuesta JSON con `{"status": "ok"}`

3. Verifica Swagger:
   - `https://fagsol-back-[ID].azurewebsites.net/swagger/`

4. Verifica Admin:
   - `https://fagsol-back-[ID].azurewebsites.net/admin/`

### 8.2. Verificar Frontend

1. Ve a `https://fagsol-frontend-[ID].azurewebsites.net`
2. Deberías ver la página de inicio

3. Verifica que el frontend se conecta al backend:
   - Abre la consola del navegador (F12)
   - No debería haber errores de CORS o conexión

### 8.3. Verificar Azure Blob Storage

1. Sube una imagen desde el admin de Django
2. Verifica que la imagen se sube correctamente:
   - Ve al Storage Account → **Contenedores** → `fagsol-media`
   - Deberías ver la imagen subida

3. Verifica que la URL funciona:
   - Copia la URL de la imagen
   - Ábrela en el navegador
   - Debería mostrarse la imagen

### 8.4. Verificar Base de Datos

1. Desde el admin de Django, crea un superusuario:
   ```bash
   # Conecta al App Service via SSH o Kudu
   # O ejecuta desde Azure Portal → Console
   python manage.py createsuperuser
   ```

2. Inicia sesión en el admin
3. Verifica que puedes crear/editar cursos

### 8.5. Verificar Logs

1. **Backend:**
   - App Service → **Registros** → **Stream de registros**
   - Deberías ver logs de Gunicorn y Django

2. **Frontend:**
   - App Service → **Registros** → **Stream de registros**
   - Deberías ver logs de Next.js

---

## 9. TROUBLESHOOTING

### 9.1. Backend no inicia

**Síntoma:** App Service muestra error 500 o no responde

**Soluciones:**
1. Verifica los logs:
   - App Service → **Registros** → **Stream de registros**
   - Busca errores de Python o Django

2. Verifica variables de entorno:
   - Todas las variables deben estar configuradas
   - Especialmente `DB_HOST`, `DB_PASSWORD`, `SECRET_KEY`

3. Verifica conexión a base de datos:
   - App Service → **Console** (Kudu)
   - Ejecuta: `python manage.py check --database default`

4. Verifica que `startup.sh` existe:
   - App Service → **Console** (Kudu)
   - Verifica: `ls -la startup.sh`

### 9.2. Frontend no se conecta al backend

**Síntoma:** Errores de CORS o 404 en el frontend

**Soluciones:**
1. Verifica `NEXT_PUBLIC_API_URL`:
   - Debe ser la URL completa del backend
   - Ejemplo: `https://fagsol-back-[ID].azurewebsites.net/api/v1`

2. Verifica CORS en el backend:
   - `CORS_ALLOWED_ORIGINS` debe incluir la URL del frontend

3. Verifica que el backend está funcionando:
   - Abre la URL del backend directamente en el navegador

### 9.3. Imágenes no se suben a Azure Blob Storage

**Síntoma:** Error al subir imágenes desde el admin

**Soluciones:**
1. Verifica variables de entorno:
   - `USE_AZURE_STORAGE=True`
   - `AZURE_STORAGE_ACCOUNT_NAME` correcto
   - `AZURE_STORAGE_ACCOUNT_KEY` correcto

2. Verifica que el container existe:
   - Storage Account → **Contenedores** → Debe existir `fagsol-media`

3. Verifica permisos:
   - El container debe tener acceso público (Blob)

4. Verifica logs del backend:
   - Busca errores relacionados con Azure Storage

### 9.4. GitHub Actions falla en el despliegue

**Síntoma:** El workflow de GitHub Actions falla

**Soluciones:**
1. Verifica los secrets:
   - Todos los secrets deben estar configurados
   - Los nombres deben coincidir con los del workflow

2. Verifica permisos del Service Principal:
   - Debe tener rol **Colaborador** en la suscripción

3. Verifica los logs del workflow:
   - GitHub → **Actions** → Click en el workflow fallido
   - Revisa los logs para ver el error específico

### 9.5. Base de datos no se conecta

**Síntoma:** Error de conexión a PostgreSQL

**Soluciones:**
1. Verifica firewall:
   - PostgreSQL → **Redes**
   - Debe permitir servicios de Azure
   - Debe permitir tu IP actual

2. Verifica credenciales:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD` correctos

3. Verifica que la base de datos existe:
   - PostgreSQL → **Bases de datos** → Debe existir `fagsol_db`

### 9.6. App Service se reinicia constantemente

**Síntoma:** El App Service se reinicia cada pocos minutos

**Soluciones:**
1. Verifica los logs:
   - Busca errores que causen crash

2. Verifica recursos:
   - El plan de App Service puede ser muy pequeño
   - Considera escalar a un plan superior

3. Verifica `startup.sh`:
   - El script puede estar fallando
   - Revisa los logs de inicio

---

## 10. CHECKLIST FINAL

Antes de considerar la configuración completa, verifica:

### Backend:
- [ ] App Service creado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Azure Blob Storage configurado
- [ ] Migraciones aplicadas
- [ ] Superusuario creado
- [ ] Swagger accesible
- [ ] Admin accesible

### Frontend:
- [ ] App Service creado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Se conecta al backend correctamente
- [ ] No hay errores en la consola
- [ ] Páginas cargan correctamente

### Azure Blob Storage:
- [ ] Storage Account creado
- [ ] Container `fagsol-media` creado
- [ ] Acceso público configurado
- [ ] Imágenes se suben correctamente
- [ ] URLs de imágenes funcionan

### GitHub Actions:
- [ ] Service Principal creado
- [ ] Secrets configurados
- [ ] Workflows funcionan correctamente
- [ ] Despliegues automáticos funcionan

### Seguridad:
- [ ] `DEBUG=False` en producción
- [ ] `SECRET_KEY` seguro y único
- [ ] `ALLOWED_HOSTS` configurado
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado
- [ ] Credenciales guardadas de forma segura

---

## 11. PRÓXIMOS PASOS

Una vez que todo esté funcionando:

1. **Configurar dominio personalizado:**
   - App Service → **Dominios personalizados**
   - Agregar tu dominio
   - Configurar DNS

2. **Configurar SSL/TLS:**
   - App Service → **TLS/SSL settings**
   - Configurar certificado

3. **Configurar monitoreo:**
   - Application Insights ya está configurado
   - Revisa métricas y alertas

4. **Configurar backups:**
   - PostgreSQL → **Backups**
   - Configurar backups automáticos

5. **Optimizar rendimiento:**
   - Revisa métricas de App Service
   - Considera escalar si es necesario

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa los logs en Azure Portal
2. Revisa los logs de GitHub Actions
3. Consulta la documentación de Azure
4. Contacta al equipo de desarrollo

---

**¡Felicitaciones! 🎉 Tu aplicación FagSol está ahora en producción en Azure.**

