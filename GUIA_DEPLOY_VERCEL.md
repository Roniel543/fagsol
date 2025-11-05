# 🚀 Guía de Despliegue a Vercel - FagSol

## 📋 ¿POR QUÉ VERCEL?

**Vercel es la mejor opción para Next.js porque:**
- ✅ **Optimizado para Next.js** - Creado por el mismo equipo que hizo Next.js
- ✅ **Deployment automático** - Cada push a GitHub = nuevo deploy
- ✅ **CDN global** - Tu app se carga rápido en todo el mundo
- ✅ **SSL gratis** - HTTPS automático
- ✅ **Preview deployments** - Cada PR tiene su propia URL
- ✅ **Serverless Functions** - Escalado automático
- ✅ **Free tier generoso** - Perfecto para empezar

---

## 🔧 CONFIGURACIÓN PASO A PASO

### 1️⃣ Preparar el Proyecto

**Archivos que ya creamos:**
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `next.config.js` - Actualizado para producción
- ✅ `.vercelignore` - Archivos que NO se suben

### 2️⃣ Variables de Entorno

**En Vercel necesitas configurar estas variables:**

```
NEXT_PUBLIC_API_URL=https://tu-backend.render.com/api
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
```

**¿Por qué NEXT_PUBLIC_?**
- Las variables que empiezan con `NEXT_PUBLIC_` son accesibles en el cliente (browser)
- Las que NO tienen ese prefijo solo están en el servidor (más seguro)

---

## 📦 DESPLIEGUE DESDE VERCEL DASHBOARD

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Regístrate con GitHub (recomendado) o email
3. Conecta tu repositorio de GitHub

### Paso 2: Importar Proyecto
1. Click en "Add New Project"
2. Selecciona tu repositorio `fagsol`
3. Vercel detectará automáticamente que es Next.js

### Paso 3: Configurar Build Settings
**Vercel detecta automáticamente, pero verifica:**
- **Framework Preset:** Next.js
- **Root Directory:** `frontend` (si tu repo tiene frontend/ y backend/)
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

### Paso 4: Configurar Variables de Entorno
En la sección "Environment Variables", agrega:

```
NEXT_PUBLIC_API_URL = https://tu-backend-url.com/api
NEXT_PUBLIC_SITE_URL = https://tu-app.vercel.app
```

**IMPORTANTE:**
- Agrega estas variables para **Production, Preview y Development**
- El `NEXT_PUBLIC_SITE_URL` cambia según el entorno (puedes usar diferentes valores)

### Paso 5: Deploy
1. Click en "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en `https://tu-app.vercel.app`

---

## 🔄 DESPLIEGUE DESDE CLI (Terminal)

### Instalar Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Desde la carpeta frontend
```bash
cd frontend
vercel
```

**Te preguntará:**
- Set up and deploy? → **Y**
- Which scope? → Selecciona tu cuenta
- Link to existing project? → **N** (primera vez)
- Project name? → `fagsol-frontend` (o el que quieras)
- Directory? → `./` (porque ya estás en frontend/)
- Override settings? → **N**

### Variables de entorno desde CLI
```bash
vercel env add NEXT_PUBLIC_API_URL
# Te pedirá el valor, ingresa: https://tu-backend-url.com/api
# Selecciona: Production, Preview, Development

vercel env add NEXT_PUBLIC_SITE_URL
# Te pedirá el valor, ingresa: https://tu-app.vercel.app
```

### Deploy a producción
```bash
vercel --prod
```

---

## 🌍 CONFIGURACIÓN DE DOMINIO PERSONALIZADO

### En Vercel Dashboard:
1. Ve a tu proyecto → Settings → Domains
2. Agrega tu dominio: `fagsol.com` o `www.fagsol.com`
3. Vercel te dará registros DNS para configurar:
   - **CNAME:** `cname.vercel-dns.com`
   - O **A record:** IPs de Vercel

### En tu proveedor de dominio (GoDaddy, Namecheap, etc.):
- Agrega el CNAME o A record que Vercel te dio
- Espera 24-48 horas para propagación DNS

---

## 🔐 CONFIGURACIÓN DE CORS EN BACKEND

**Tu backend Django necesita permitir requests desde Vercel:**

```python
# backend/config/settings.py

CORS_ALLOWED_ORIGINS = [
    'https://tu-app.vercel.app',
    'https://www.fagsol.com',
    'http://localhost:3000',  # Para desarrollo local
]

# O si prefieres permitir todos los subdominios de Vercel:
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
```

---

## 📊 MONITOREO Y LOGS

### Ver logs en tiempo real:
```bash
vercel logs
```

### Ver logs en dashboard:
1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Selecciona un deployment
4. Click en "Functions" para ver logs de serverless

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Build failed"
**Causa:** Errores en el código o dependencias faltantes
**Solución:**
```bash
# Prueba build local primero
cd frontend
npm run build
# Arregla los errores que aparezcan
```

### Error: "Module not found"
**Causa:** Dependencias no instaladas
**Solución:**
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que `npm install` funciona localmente

### Error: "API URL not defined"
**Causa:** Variables de entorno no configuradas
**Solución:**
- Verifica que las variables estén en Vercel Dashboard
- Usa `NEXT_PUBLIC_` para variables accesibles en cliente

### Error: CORS
**Causa:** Backend no permite requests desde Vercel
**Solución:**
- Agrega la URL de Vercel a `CORS_ALLOWED_ORIGINS` en Django

### Build lento
**Causa:** Muchas dependencias o código pesado
**Solución:**
- Optimiza imágenes
- Usa dynamic imports para código pesado
- Revisa bundle size con `npm run build`

---

## 🎯 CHECKLIST PRE-DEPLOY

Antes de desplegar, verifica:

- [ ] `npm run build` funciona localmente sin errores
- [ ] Variables de entorno configuradas en Vercel
- [ ] Backend desplegado y accesible
- [ ] CORS configurado en backend para permitir Vercel
- [ ] No hay errores de TypeScript (`npm run lint`)
- [ ] Imágenes optimizadas
- [ ] `.env` local no tiene valores de producción hardcodeados

---

## 🔄 DEPLOYMENT AUTOMÁTICO CON GIT

**Vercel hace esto automáticamente:**
- Cada push a `main` → Deploy a producción
- Cada PR → Deploy de preview con URL única
- Puedes configurar branches en Settings → Git

---

## 📈 OPTIMIZACIONES PARA PRODUCCIÓN

### 1. Optimizar imágenes
```javascript
// next.config.js ya tiene configuración de imágenes
// Usa el componente Image de Next.js:
import Image from 'next/image'
<Image src="/logo.png" width={200} height={200} alt="Logo" />
```

### 2. Lazy loading de componentes
```javascript
import dynamic from 'next/dynamic'

const ComponentePesado = dynamic(() => import('./ComponentePesado'), {
  loading: () => <p>Cargando...</p>,
})
```

### 3. Analizar bundle size
```bash
npm install @next/bundle-analyzer
```

---

## 🎉 ¡LISTO!

Después de seguir estos pasos, tu app estará en producción en Vercel.

**URLs que tendrás:**
- Producción: `https://tu-app.vercel.app`
- Preview (cada PR): `https://tu-app-git-branch.vercel.app`
- Si configuraste dominio: `https://fagsol.com`

---

## 📚 RECURSOS ÚTILES

- [Documentación Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## 💡 TIPS PRO

1. **Usa Preview Deployments** para probar antes de producción
2. **Monitorea performance** con Vercel Analytics (gratis)
3. **Configura webhooks** para notificaciones de deploy
4. **Usa Edge Functions** para lógica serverless
5. **Configura redirects** en `vercel.json` para SEO

¡Éxito con tu despliegue! 🚀

