# ✅ Guía Rápida - Prueba desde Panel Admin

**Configuración:** `DEFAULT_USD_TO_PEN_RATE=3.36` ✅

---

## 🎯 Pasos para Probar

### **1. Crear/Editar Curso en Panel Admin**

**URL:** `http://localhost:3000/admin/courses/create` o `/admin/courses/{id}/edit`

**Datos a ingresar:**
- Título: "Curso de Prueba"
- Descripción: "Descripción de prueba"
- **Precio (PEN):** `260`
- Estado: Publicado
- Guardar

---

### **2. Qué Debería Pasar**

#### **A. Si la API funciona (normal):**

```
1. Admin ingresa: 260 PEN
2. Sistema consulta API: tasa = 3.36 (real)
3. Sistema calcula: price_usd = 260 / 3.36 = 77.38 USD
4. Sistema guarda:
   - price = 260 PEN ✅
   - price_usd = 77.38 USD ✅
```

**Verificar en logs del backend:**
```
INFO: Calculado price_usd usando tasa REAL de API: 260 PEN -> 77.38 USD (tasa: 3.36)
```

#### **B. Si la API falla (fallback):**

```
1. Admin ingresa: 260 PEN
2. Sistema intenta consultar API: ❌ Falla
3. Sistema usa fallback: tasa = 3.36 (del .env)
4. Sistema calcula: price_usd = 260 / 3.36 = 77.38 USD
5. Sistema guarda:
   - price = 260 PEN ✅
   - price_usd = 77.38 USD ✅
```

**Verificar en logs del backend:**
```
WARNING: Error al obtener tasa real de API, usando tasa por defecto: ...
INFO: Calculado price_usd usando tasa por defecto: 260 PEN -> 77.38 USD (tasa: 3.36)
```

**Nota:** Con tasa 3.36, el resultado es el mismo si API funciona o falla ✅

---

### **3. Verificar en Base de Datos**

**Opción A: Django Admin**
- Ir a: `http://localhost:8000/admin/courses/course/`
- Buscar el curso creado
- Verificar campos: `price` y `price_usd`

**Opción B: SQL**
```sql
SELECT id, title, price, price_usd, currency 
FROM courses_course 
WHERE title LIKE '%Prueba%';
```

**Resultado esperado:**
- `price = 260.00`
- `price_usd = 77.38` (aproximadamente)
- `currency = 'PEN'`

---

### **4. Verificar en Frontend**

**URL:** `http://localhost:3000/academy/course/{slug}`

**Usuario en Perú debe ver:**
```
S/ 260.00
≈ $ 77.38 USD
```

**Usuario en Colombia debe ver:**
```
$ 301,782 COP  (convertido desde 77.38 USD)
≈ $ 77.38 USD
```

---

## ✅ Checklist de Verificación

- [ ] Curso se crea sin errores
- [ ] `price = 260` en base de datos
- [ ] `price_usd ≈ 77.38` en base de datos
- [ ] Logs muestran cálculo correcto
- [ ] Frontend muestra precio correcto en Perú
- [ ] Frontend muestra precio convertido en otros países
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

---

## 🔍 Qué Buscar en los Logs

### **Si API funciona:**
```
INFO: Calculado price_usd usando tasa REAL de API: 260 PEN -> 77.38 USD (tasa: 3.36)
```

### **Si API falla:**
```
WARNING: Error al obtener tasa real de API, usando tasa por defecto: ...
INFO: Calculado price_usd usando tasa por defecto: 260 PEN -> 77.38 USD (tasa: 3.36)
```

**Ambos casos dan el mismo resultado** porque el fallback (3.36) coincide con la tasa real ✅

---

## 🎯 Resultado Esperado

Con `DEFAULT_USD_TO_PEN_RATE=3.36`:

| Precio PEN | price_usd (esperado) |
|------------|---------------------|
| 100 PEN | $29.76 USD |
| 260 PEN | $77.38 USD |
| 500 PEN | $148.81 USD |

**Verificación:**
- 260 PEN ÷ 3.36 = 77.38 USD ✅
- 77.38 USD × 3.36 = 260 PEN ✅

---

## ⚠️ Si Algo No Funciona

### **Problema: `price_usd` es None**

**Causa:** Error en cálculo o API
**Solución:** Revisar logs del backend

### **Problema: `price_usd` es incorrecto**

**Causa:** Tasa incorrecta o error en cálculo
**Solución:** 
1. Verificar tasa en logs
2. Verificar cálculo manual: `260 / 3.36 = 77.38`

### **Problema: Frontend no muestra precio**

**Causa:** `price_usd` es None o error en componente
**Solución:** 
1. Verificar que `price_usd` existe en BD
2. Revisar consola del navegador

---

## 🎉 Todo Debería Funcionar Bien

Con `DEFAULT_USD_TO_PEN_RATE=3.36`:
- ✅ Tasa actualizada (coincide con tasa real)
- ✅ Fallback preciso si API falla
- ✅ Precios correctos en todos los escenarios
- ✅ Sistema robusto y confiable

**¡Prueba y confirma que todo funciona!** 🚀

---

**Última actualización:** 6 de Diciembre, 2025

