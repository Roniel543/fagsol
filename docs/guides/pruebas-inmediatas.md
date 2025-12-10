# 🧪 Guía de Pruebas Inmediatas - BroadcastChannel

**Fecha:** 2025-01-27  
**Estado:** Listo para probar

---

## 🎯 Pruebas Prioritarias (Orden de Ejecución)

### 🔴 **PRUEBA CRÍTICA 1: Instructor Ve Su Propio Curso desde Dashboard**

**Esta es la prueba MÁS IMPORTANTE** porque acabamos de corregir el problema de `target="_blank"`.

#### Pasos:
1. ✅ Iniciar el servidor de desarrollo (frontend y backend)
2. ✅ Login como instructor con credenciales válidas
3. ✅ Ir a `/dashboard`
4. ✅ Verificar que aparecen cursos en "Cursos Más Populares"
5. ✅ Hacer clic en "Ver" para un curso propio que esté **publicado** (status: 'published')
6. ✅ Verificar que la navegación ocurre en la **misma pestaña** (no se abre nueva pestaña)

#### ✅ Resultado Esperado:
- ✅ Navega a `/academy/course/{slug}` en la **misma pestaña**
- ✅ La página del curso se carga correctamente
- ✅ Muestra botones "Ver Contenido del Curso" + "Editar Curso" (NO "Agregar al carrito")
- ✅ Header muestra usuario autenticado (NO "Iniciar Sesión" / "Registrarse")
- ✅ La sesión se mantiene activa (no se pierde autenticación)

#### ❌ Si falla:
- Verificar que el curso tiene `status: 'published'` y `slug` no es null
- Verificar en consola del navegador si hay errores
- Verificar que `sessionStorage` tiene el token después de navegar

---

### 🟡 **PRUEBA 2: Login Sincroniza entre Pestañas**

**Verifica que las correcciones de BroadcastChannel funcionan correctamente.**

#### Pasos:
1. ✅ Abrir aplicación en **Pestaña 1** (`http://localhost:3000`)
2. ✅ Abrir aplicación en **Pestaña 2** (mismo dominio, misma URL)
3. ✅ En **Pestaña 1**, hacer login con credenciales válidas
4. ✅ **NO recargar** Pestaña 2 manualmente
5. ✅ Observar Pestaña 2

#### ✅ Resultado Esperado:
- ✅ Pestaña 1 muestra dashboard después de login
- ✅ Pestaña 2 **automáticamente** detecta el login (sin recargar)
- ✅ Pestaña 2 muestra usuario autenticado
- ✅ No hay errores en consola del navegador
- ✅ No hay loops infinitos de revalidación

#### 🔍 Verificaciones Adicionales:
- Abrir DevTools → Console en ambas pestañas
- No debería haber errores relacionados con BroadcastChannel
- No debería haber múltiples llamadas a `/api/auth/me` en rápida sucesión

---

### ✅ **PRUEBA 3: Logout Sincroniza entre Pestañas** ✅ COMPLETADA

**Verifica que el logout también sincroniza correctamente.**

#### Pasos:
1. ✅ Tener dos pestañas abiertas con usuario autenticado
2. ✅ En **Pestaña 1**, hacer clic en "Cerrar Sesión" / "Logout"
3. ✅ **NO recargar** Pestaña 2 manualmente
4. ✅ Observar Pestaña 2

#### ✅ Resultado Esperado:
- ✅ Pestaña 1 redirige a `/auth/login`
- ✅ Pestaña 2 **automáticamente** cierra sesión (sin recargar)
- ✅ Pestaña 2 muestra formulario de login
- ✅ No hay errores en consola

#### ✅ Estado: **FUNCIONA CORRECTAMENTE** ✅

---

### ✅ **PRUEBA 4: Register Sincroniza entre Pestañas** ✅ COMPLETADA

**Esta es una prueba nueva** porque acabamos de agregar sincronización en `register()`.

#### Pasos:
1. ✅ Abrir aplicación en **Pestaña 1**
2. ✅ Abrir aplicación en **Pestaña 2**
3. ✅ En **Pestaña 1**, ir a `/auth/register`
4. ✅ Completar formulario de registro con datos válidos
5. ✅ Hacer clic en "Registrarse"
6. ✅ **NO recargar** Pestaña 2 manualmente
7. ✅ Observar Pestaña 2

#### ✅ Resultado Esperado:
- ✅ Pestaña 1 muestra que el registro fue exitoso y redirige
- ✅ Pestaña 2 **automáticamente** detecta el nuevo usuario autenticado
- ✅ Pestaña 2 muestra usuario autenticado
- ✅ No hay errores en consola

#### ✅ Estado: **FUNCIONA CORRECTAMENTE** ✅

---

## 🔧 Herramientas de Debugging

### Consola del Navegador
Abre DevTools (F12) y revisa:
- **Console**: Busca errores de TypeScript, BroadcastChannel, o autenticación
- **Network**: Verifica llamadas a `/api/auth/me`, `/api/auth/login`, etc.
- **Application → Session Storage**: Verifica que los tokens se guardan correctamente

### Comandos Útiles en Consola
```javascript
// Verificar si hay token en sessionStorage
sessionStorage.getItem('access_token')

// Verificar datos del usuario
sessionStorage.getItem('user')

// Verificar si BroadcastChannel está disponible
typeof BroadcastChannel !== 'undefined'
```

---

## 📋 Checklist Rápido

Antes de probar, verifica:

- [ ] Servidor backend está corriendo
- [ ] Servidor frontend está corriendo
- [ ] Tienes credenciales de instructor válidas
- [ ] Tienes al menos un curso publicado como instructor
- [ ] El curso publicado tiene un `slug` válido
- [ ] DevTools abierto para ver errores

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "No se sincroniza entre pestañas"
**Solución:**
- Verificar que ambas pestañas están en el mismo dominio (`localhost:3000`)
- Verificar que BroadcastChannel está disponible: `typeof BroadcastChannel !== 'undefined'`
- Verificar en consola si hay errores de JavaScript

### Problema: "Se abre nueva pestaña al hacer clic en Ver"
**Solución:**
- Verificar que el cambio de `target="_blank"` se aplicó correctamente
- Verificar que estás probando en la sección correcta del dashboard
- Recargar la página para asegurar que el código actualizado se cargó

### Problema: "Muestra 'Agregar al carrito' en lugar de 'Ver Contenido'"
**Solución:**
- Verificar que el usuario está autenticado (check sessionStorage)
- Verificar que el curso pertenece al instructor autenticado
- Verificar que el curso tiene `status: 'published'`

### Problema: "Errores de TypeScript sobre 'slug'"
**Solución:**
- Ya debería estar resuelto, pero si persiste:
  - Reiniciar servidor de TypeScript en VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
  - Verificar que `dashboard.ts` tiene `slug?: string` en el tipo

---

## ✅ Criterios de Éxito

La implementación se considera **exitosa** si:

1. ✅ **Prueba Crítica 1** pasa completamente ✅
2. ✅ **Prueba 2** (Login sincroniza) funciona ✅
3. ✅ **Prueba 3** (Logout sincroniza) funciona ✅
4. ✅ **Prueba 4** (Register sincroniza) funciona ✅
5. ✅ No hay errores en consola
6. ✅ No hay loops infinitos
7. ✅ La experiencia de usuario es fluida

### 🎉 **¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!** 🎉

---

## 🚀 Siguiente Paso

Una vez que todas las pruebas pasen, puedes:
- Probar las otras pruebas del documento original (Pruebas 4-7)
- Considerar agregar tests automatizados
- Documentar cualquier comportamiento inesperado encontrado

---

**¡Buena suerte con las pruebas!** 🎉

