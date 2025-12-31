# 🚀 Guía de Despliegue en Azure - Frontend

Esta guía explica cómo configurar el frontend de FagSol para producción en Azure App Service.

## 📋 Requisitos Previos

- ✅ App Service `fagsol-frontend` creado en Azure
- ✅ Stack: Node.js 20 LTS
- ✅ Sistema operativo: Linux
- ✅ Plan de App Service configurado

## 🔧 Configuración en Azure Portal

### 1. Variables de Entorno (Configuración de aplicación)

Ve a **Configuración** → **Variables de entorno** en tu App Service y configura las siguientes variables:

#### Variables Requeridas:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://fagsol-backend-e5ghbzhyhnd2f7bn.centralus-01.azurewebsites.net/api/v1
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-2742c5af-4c5d-4ea6-9924-da7ba403fd7a
PORT=8080
```

#### Variables Opcionales (ya configuradas por Azure):

```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=<tu-connection-string>
ApplicationInsightsAgent_EXTENSION_VERSION=~3
ENABLE_ORYX_BUILD=false
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

### 2. Comando de Inicio

En **Configuración** → **Configuración general** → **Comando de inicio**:

```bash
npm start
```

O directamente:

```bash
node server.js
```

**Nota:** El workflow de GitHub Actions ya prepara el paquete con el comando correcto en `package.json`.

### 3. Configuración de Build

El archivo `.deployment` ya está configurado para desactivar el build automático de Oryx, ya que el build se hace en GitHub Actions.

## 🔄 Proceso de Despliegue

El despliegue se realiza automáticamente mediante GitHub Actions cuando se hace push a la rama `master`.

### Flujo del Despliegue:

1. **Build en GitHub Actions:**
   - Instala dependencias con `npm ci`
   - Ejecuta `npm run build` (crea `.next/standalone`)
   - Prepara el paquete de despliegue optimizado

2. **Paquete de Despliegue:**
   - Contiene solo los archivos necesarios (standalone build)
   - Incluye `server.js` y `node_modules` mínimos
   - Incluye `.next/static` para assets estáticos
   - Incluye carpeta `public` para archivos públicos

3. **Despliegue a Azure:**
   - Se sube el paquete preparado
   - Azure ejecuta `npm start` que ejecuta `node server.js`
   - La aplicación inicia en el puerto 8080

## ✅ Verificación Post-Despliegue

1. **Verificar que la aplicación está corriendo:**
   - Ve a: `https://fagsol-frontend-a2awgdejacgvcrex.centralus-01.azurewebsites.net`
   - Deberías ver la aplicación funcionando

2. **Verificar logs:**
   - En Azure Portal → **Registros** → **Log stream**
   - Deberías ver: `Node.js Version: v20.x.x`
   - Deberías ver: `Server running on port 8080`

3. **Verificar variables de entorno:**
   - En **Configuración** → **Variables de entorno**
   - Todas las variables `NEXT_PUBLIC_*` deben estar configuradas

## 🐛 Solución de Problemas

### Problema: "Cannot find module" o errores de dependencias

**Solución:** Verifica que el build standalone se haya creado correctamente. El workflow debería mostrar `✓ server.js encontrado` en los logs.

### Problema: La aplicación no inicia

**Solución:** 
1. Verifica el comando de inicio en **Configuración general**
2. Revisa los logs en **Log stream**
3. Verifica que el puerto sea 8080 (Azure lo configura automáticamente)

### Problema: Assets estáticos no cargan (404)

**Solución:** Verifica que la carpeta `.next/static` esté presente en el despliegue. El workflow debería copiarla automáticamente.

### Problema: Variables de entorno no se cargan

**Solución:**
1. Verifica que las variables `NEXT_PUBLIC_*` estén configuradas en Azure
2. Reinicia la aplicación después de cambiar variables
3. Las variables `NEXT_PUBLIC_*` se inyectan en tiempo de build, no en runtime

## 📝 Notas Importantes

1. **Build Standalone:** Next.js crea una versión optimizada que incluye solo las dependencias necesarias. Esto reduce el tamaño del despliegue y mejora el tiempo de inicio.

2. **Variables NEXT_PUBLIC_*:** Estas variables se inyectan en tiempo de build. Si cambias estas variables en Azure, necesitas hacer un nuevo despliegue.

3. **Puerto:** Azure App Service configura automáticamente la variable `PORT`. El servidor de Next.js la detecta automáticamente.

4. **No usar node_modules.tar.gz:** El build standalone no requiere extraer node_modules desde un archivo tar.gz. Esto es más eficiente y escalable.

## 🔗 Enlaces Útiles

- [Documentación de Next.js Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Azure App Service para Node.js](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [GitHub Actions para Azure](https://github.com/Azure/actions)

