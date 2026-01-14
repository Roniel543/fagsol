# 📦 Guía: Configurar Azure Blob Storage para FagSol

**Guía paso a paso para configurar Azure Blob Storage y almacenar imágenes de cursos**

---

## 📋 ÍNDICE

1. [Crear Storage Account](#1-crear-storage-account)
2. [Crear Container](#2-crear-container)
3. [Obtener Credenciales](#3-obtener-credenciales)
4. [Configurar Variables de Entorno](#4-configurar-variables-de-entorno)
5. [Configurar CORS (Opcional)](#5-configurar-cors-opcional)
6. [Verificar Configuración](#6-verificar-configuración)

---

## 1. CREAR STORAGE ACCOUNT

### Paso 1.1: Ir a Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com)
2. Inicia sesión con tu cuenta empresarial

### Paso 1.2: Crear Storage Account

1. En el portal, busca **"Cuentas de almacenamiento"** (Storage accounts)
2. Haz clic en **"+ Crear"** (+ Create)
3. Completa el formulario:

#### **Pestaña "Básico":**

- **Suscripción:** Tu suscripción (`Azure subscription 1`)
- **Grupo de recursos:** `fagsol-rs` (el mismo que usas para los App Services)
- **Nombre de la cuenta de almacenamiento:** `fagsolmedia2026` 
  - ⚠️ **IMPORTANTE:** Debe ser único globalmente (solo letras minúsculas y números, sin guiones)
  - Si no está disponible, prueba: `fagsolstorage2025`, `fagsolmedia2025`, `fagsolmedia2026`, etc.
- **Región:** `Central US` (misma que tus otros recursos)
- **Rendimiento:** **Estándar** (suficiente para imágenes)
- **Redundancia:** **LRS** (Local Redundant Storage) - más económico
  - Para producción crítica: **GRS** (Geo-Redundant Storage)

#### **Pestaña "Avanzado":**

- **Seguridad de transferencia requerida:** ✅ **Habilitado** (HTTPS obligatorio)
- **Versión mínima de TLS:** **Versión 1.2**
- **Acceso de blob público:** ✅ **Habilitado** (para servir imágenes públicamente)
- **Nivel de acceso:** **Hot** (acceso frecuente)

#### **Pestaña "Redes":**

- **Conectividad de red:** **Punto de conexión público (todas las redes)**
  - O si prefieres más seguridad: **Punto de conexión público (redes seleccionadas)**
    - Agrega la IP de tu App Service después de crearlo

#### **Pestaña "Protección de datos":**

- Puedes dejar los valores por defecto

#### **Pestaña "Etiquetas" (Opcional):**

- **Nombre:** `Environment`
- **Valor:** `Production`
- **Nombre:** `Project`
- **Valor:** `FagSol`

#### **Pestaña "Revisar + crear":**

1. Revisa toda la configuración
2. Haz clic en **"Crear"**

⏳ **Tiempo estimado:** 2-3 minutos

✅ **Resultado:** Verás "Implementación completada"

---

## 2. CREAR CONTAINER

### Paso 2.1: Ir al Storage Account

1. Una vez creado el Storage Account, haz clic en él para abrirlo
2. O busca `fagsolmedia2026` en el portal

### Paso 2.2: Crear Container

1. En el menú lateral del Storage Account, busca **"Contenedores"** (Containers)
2. Haz clic en **"+ Contenedor"** (+ Container)
3. Completa:
   - **Nombre:** `fagsol-media`
   - **Nivel de acceso público:** **Blob (acceso de lectura anónimo para blobs solamente)**
     - Esto permite que las imágenes sean accesibles públicamente vía URL
4. Haz clic en **"Crear"**

✅ **Resultado:** Container `fagsol-media` creado

---

## 3. OBTENER CREDENCIALES

### Paso 3.1: Obtener Clave de Acceso

1. En el Storage Account, ve a **"Claves de acceso"** (Access keys) en el menú lateral
2. Verás dos claves (Key1 y Key2)
3. **Copia estos valores (los necesitarás después):**
   - **Nombre de la cuenta de almacenamiento:** `fagsolmedia2026` (o el que elegiste)
   - **Clave 1** o **Clave 2** (cualquiera funciona)
   - **Cadena de conexión** (opcional, pero útil)

⚠️ **IMPORTANTE:** Guarda estas credenciales en un lugar seguro. Las usarás en las variables de entorno.

---

## 4. CONFIGURAR VARIABLES DE ENTORNO

### Paso 4.1: Ir al App Service del Backend

1. Ve a Azure Portal → App Services → `fagsol-back`
2. En el menú lateral, ve a **"Configuración"** → **"Configuración de la aplicación"**

### Paso 4.2: Agregar Variables de Entorno

Haz clic en **"+ Nueva configuración de aplicación"** y agrega estas variables:

#### **Variable 1:**
- **Nombre:** `USE_AZURE_STORAGE`
- **Valor:** `True`
- Haz clic en **"Aceptar"**

#### **Variable 2:**
- **Nombre:** `AZURE_STORAGE_ACCOUNT_NAME`
   - **Valor:** `fagsolmedia2026` (o el nombre que elegiste)
- Haz clic en **"Aceptar"**

#### **Variable 3:**
- **Nombre:** `AZURE_STORAGE_ACCOUNT_KEY`
- **Valor:** [La clave que copiaste en el paso 3.1]
- Haz clic en **"Aceptar"**

#### **Variable 4:**
- **Nombre:** `AZURE_STORAGE_CONTAINER_NAME`
- **Valor:** `fagsol-media`
- Haz clic en **"Aceptar"**

### Paso 4.3: Guardar Cambios

1. Una vez agregadas todas las variables, haz clic en **"Guardar"** en la parte superior
2. Azure te preguntará si quieres reiniciar la aplicación
3. Haz clic en **"Continuar"** para reiniciar

⏳ **Tiempo estimado:** 1-2 minutos para reiniciar

---

## 5. CONFIGURAR CORS (Opcional pero Recomendado)

Si tu frontend está en un dominio diferente, configura CORS:

### Paso 5.1: Ir a CORS en Storage Account

1. En el Storage Account, ve a **"CORS"** en el menú lateral
2. Selecciona **"Blob service"**

### Paso 5.2: Configurar CORS

- **Orígenes permitidos:** `https://fagsol-front-e2gsa9ekhwc2cae5.centralus-01.azurewebsites.net`
  - O `*` (para desarrollo, menos seguro)
- **Métodos permitidos:** `GET, HEAD`
- **Encabezados permitidos:** `*`
- **Encabezados expuestos:** `*`
- **Edad máxima:** `3600`

3. Haz clic en **"Guardar"**

---

## 6. VERIFICAR CONFIGURACIÓN

### Paso 6.1: Verificar Variables de Entorno

1. Ve al App Service `fagsol-back` → **"Configuración"** → **"Configuración de la aplicación"**
2. Verifica que estas 4 variables estén presentes:
   - ✅ `USE_AZURE_STORAGE` = `True`
   - ✅ `AZURE_STORAGE_ACCOUNT_NAME` = `fagsolmedia2026`
   - ✅ `AZURE_STORAGE_ACCOUNT_KEY` = [tu clave]
   - ✅ `AZURE_STORAGE_CONTAINER_NAME` = `fagsol-media`

### Paso 6.2: Verificar Container

1. Ve al Storage Account → **"Contenedores"**
2. Verifica que `fagsol-media` existe y tiene acceso público "Blob"

### Paso 6.3: Probar Subida de Imagen

1. Inicia sesión en tu aplicación
2. Ve al admin o al panel de instructor
3. Intenta subir una imagen de curso (thumbnail o banner)
4. Si funciona, deberías ver la URL de Azure Blob Storage en la respuesta

### Paso 6.4: Verificar URL de Imagen

1. Copia la URL de la imagen subida
2. Ábrela en el navegador
3. Debería mostrarse la imagen correctamente

**Formato de URL esperado:**
```
https://fagsolmedia2026.blob.core.windows.net/fagsol-media/courses/images/thumbnail/2025/01/thumbnail_abc123def456.jpg
```

---

## 🔧 TROUBLESHOOTING

### Error: "Azure Storage credentials no configuradas"

**Solución:**
- Verifica que todas las variables de entorno estén configuradas en el App Service
- Verifica que los nombres de las variables sean exactos (case-sensitive)
- Reinicia el App Service después de agregar las variables

### Error: "Container no existe"

**Solución:**
- Verifica que el container `fagsol-media` existe en el Storage Account
- Verifica que el nombre del container coincida con `AZURE_STORAGE_CONTAINER_NAME`

### Error: "Access denied" al subir imagen

**Solución:**
- Verifica que el container tenga acceso público "Blob"
- Verifica que la clave de acceso sea correcta
- Verifica que el Storage Account permita acceso público

### Las imágenes no se muestran

**Solución:**
- Verifica que el container tenga acceso público "Blob"
- Verifica la configuración de CORS
- Verifica que la URL de la imagen sea correcta
- Verifica que el frontend tenga permisos para acceder a las URLs de Azure

---

## 📝 RESUMEN DE VARIABLES DE ENTORNO

```env
USE_AZURE_STORAGE=True
AZURE_STORAGE_ACCOUNT_NAME=fagsolmedia2026
AZURE_STORAGE_ACCOUNT_KEY=[TU_CLAVE_DE_ACCESO]
AZURE_STORAGE_CONTAINER_NAME=fagsol-media
```

---

## ✅ CHECKLIST FINAL

Antes de considerar la configuración completa, verifica:

- [ ] Storage Account creado y funcionando
- [ ] Container `fagsol-media` creado con acceso público "Blob"
- [ ] Variables de entorno configuradas en el App Service
- [ ] App Service reiniciado después de agregar variables
- [ ] CORS configurado (opcional pero recomendado)
- [ ] Prueba de subida de imagen exitosa
- [ ] URL de imagen accesible públicamente

---

## 🎯 PRÓXIMOS PASOS

Una vez configurado Azure Blob Storage:

1. **Probar subida de imágenes:**
   - Sube una imagen desde el admin o panel de instructor
   - Verifica que la URL sea de Azure Blob Storage

2. **Verificar rendimiento:**
   - Las imágenes deberían cargar rápidamente
   - Las URLs deberían ser accesibles públicamente

3. **Monitorear uso:**
   - Revisa el uso de almacenamiento en Azure Portal
   - Configura alertas si es necesario

---

**¡Felicitaciones! 🎉 Azure Blob Storage está configurado y listo para almacenar imágenes de cursos.**

