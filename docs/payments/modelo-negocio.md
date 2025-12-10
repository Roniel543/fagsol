# 📊 Análisis del Modelo de Negocio - Sistema de Precios Multi-Moneda

**Fecha:** 6 de Diciembre, 2025  
**Problema Identificado:** Discrepancia entre tasas de cambio fijas vs. tasas reales del mercado

---

## 🔍 Problema Actual Identificado

### **Situación Real:**
- **Google:** 260 PEN = **77.35 USD** (tasa actual: ~3.36 PEN/USD)
- **FagSol:** 260 PEN = **69.33 USD** (tasa fija: 3.75 PEN/USD)
- **Diferencia:** ~8 USD de diferencia (10% menos)

### **Causa Raíz:**
1. El sistema usa una **tasa fija** (`DEFAULT_USD_TO_PEN_RATE = 3.75`) para calcular `price_usd`
2. Esta tasa está **desactualizada** (la tasa real es ~3.36)
3. Cuando el admin ingresa precio en PEN, se calcula `price_usd` con tasa incorrecta
4. Los usuarios internacionales ven precios incorrectos

---

## 💡 Modelos de Negocio Posibles

### **Opción 1: Precios Fijos en USD (Recomendado) ✅**

**Concepto:**
- El admin ingresa precios en **USD** (moneda base)
- El sistema convierte automáticamente a moneda local del usuario
- Los precios se mantienen consistentes internacionalmente

**Ventajas:**
- ✅ Precios consistentes en todos los países
- ✅ No depende de tasas de cambio fijas
- ✅ Fácil de entender para el admin
- ✅ Los usuarios ven precios en su moneda local

**Desventajas:**
- ⚠️ Requiere que el admin piense en USD
- ⚠️ Los precios en PEN pueden variar según la tasa actual

**Implementación:**
```
Admin ingresa: $77.35 USD
Sistema guarda: price_usd = 77.35
Usuario en Perú ve: S/ 260.00 (convertido desde USD)
Usuario en Colombia ve: $ 300,000 COP (convertido desde USD)
```

---

### **Opción 2: Precios Fijos en PEN (Actual - Problemático) ❌**

**Concepto:**
- El admin ingresa precios en **PEN** (moneda local)
- El sistema calcula `price_usd` usando tasa fija
- Los usuarios internacionales ven precios convertidos

**Problemas:**
- ❌ Tasa fija se desactualiza rápidamente
- ❌ Precios incorrectos para usuarios internacionales
- ❌ Requiere actualización manual constante de la tasa

**Implementación Actual:**
```
Admin ingresa: S/ 260 PEN
Sistema calcula: price_usd = 260 / 3.75 = 69.33 USD (INCORRECTO)
Usuario en Perú ve: S/ 260.00 ✅
Usuario en Colombia ve: precio basado en 69.33 USD (INCORRECTO)
```

---

### **Opción 3: Precios Fijos en PEN con Tasa Real en Tiempo Real (Híbrido) ⚠️**

**Concepto:**
- El admin ingresa precios en **PEN**
- El sistema calcula `price_usd` usando **tasa real** de la API
- Los usuarios ven precios convertidos con tasa actual

**Ventajas:**
- ✅ Precios en PEN siempre correctos
- ✅ Conversión a USD usa tasa real
- ✅ Admin piensa en moneda local

**Desventajas:**
- ⚠️ `price_usd` puede variar si se recalcula
- ⚠️ Requiere llamada a API al guardar curso
- ⚠️ Más complejo de implementar

**Implementación:**
```
Admin ingresa: S/ 260 PEN
Sistema consulta API: tasa actual = 3.36
Sistema calcula: price_usd = 260 / 3.36 = 77.38 USD ✅
Usuario en Perú ve: S/ 260.00 ✅
Usuario en Colombia ve: precio basado en 77.38 USD ✅
```

---

## 🎯 Recomendación: Modelo de Negocio Óptimo

### **Modelo Recomendado: Precios Fijos en USD + Conversión Automática**

**Razones:**
1. **Consistencia Internacional:** Todos los usuarios ven el mismo precio base (en USD)
2. **Simplicidad:** El admin solo piensa en USD, el sistema maneja conversiones
3. **Precisión:** No depende de tasas fijas desactualizadas
4. **Escalabilidad:** Fácil agregar nuevos países sin cambiar lógica

**Flujo Propuesto:**

```
1. Admin ingresa precio en USD (ej: $77.35)
   └─> Sistema guarda: price_usd = 77.35, price = null (o calculado para referencia)

2. Usuario en Perú visita el curso
   └─> Sistema detecta país: PE
   └─> Convierte: 77.35 USD * 3.36 = 260 PEN
   └─> Muestra: S/ 260.00

3. Usuario en Colombia visita el curso
   └─> Sistema detecta país: CO
   └─> Convierte: 77.35 USD * 3,900 = 301,665 COP
   └─> Muestra: $ 301,665 COP

4. Usuario en USA visita el curso
   └─> Sistema detecta país: US
   └─> Muestra: $ 77.35 USD
```

---

## 🔧 Cambios Necesarios para Implementar el Modelo Recomendado

### **1. Cambiar Formulario de Admin**

**Antes:**
```
Precio (PEN)*: [260]
```

**Después:**
```
Precio (USD)*: [77.35]
Precio de Referencia (PEN): [260.00] (calculado automáticamente, solo lectura)
```

### **2. Modificar Backend**

- ✅ Cambiar `CourseService` para aceptar `price_usd` como campo principal
- ✅ Calcular `price` (PEN) automáticamente desde `price_usd` usando tasa real
- ✅ Guardar `price` solo como referencia (no como campo principal)

### **3. Actualizar Frontend**

- ✅ Cambiar formulario para ingresar precio en USD
- ✅ Mostrar precio de referencia en PEN (calculado)
- ✅ Mantener `MultiCurrencyPrice` para mostrar precios convertidos

---

## 📋 Alternativa: Mejorar Modelo Actual (Si se mantiene PEN como base)

Si se decide mantener PEN como moneda base, se debe:

1. **Usar tasa real al calcular `price_usd`:**
   - Consultar API de tasas al guardar curso
   - Calcular `price_usd` con tasa actual
   - Guardar ambos valores

2. **Actualizar tasa por defecto:**
   - Cambiar `DEFAULT_USD_TO_PEN_RATE` de 3.75 a 3.36 (o usar API)

3. **Sistema de actualización automática:**
   - Job periódico que actualiza `price_usd` de cursos existentes
   - O recalcular al mostrar (más lento pero más preciso)

---

## 🎯 Decisión Requerida

**Pregunta clave:** ¿Cuál es la moneda base del negocio?

### **Si la respuesta es USD:**
- ✅ Implementar modelo recomendado (precios en USD)
- ✅ Admin ingresa en USD
- ✅ Sistema convierte automáticamente

### **Si la respuesta es PEN:**
- ⚠️ Mejorar modelo actual
- ⚠️ Usar tasa real al calcular `price_usd`
- ⚠️ Actualizar tasa por defecto regularmente

---

## 📊 Comparación de Opciones

| Aspecto | Opción 1 (USD Base) | Opción 2 (PEN Base - Actual) | Opción 3 (PEN + Tasa Real) |
|---------|---------------------|------------------------------|----------------------------|
| **Consistencia Internacional** | ✅ Alta | ❌ Baja | ⚠️ Media |
| **Precisión** | ✅ Alta | ❌ Baja | ✅ Alta |
| **Simplicidad** | ✅ Alta | ⚠️ Media | ❌ Baja |
| **Mantenimiento** | ✅ Bajo | ❌ Alto | ⚠️ Medio |
| **Experiencia Admin** | ⚠️ Piensa en USD | ✅ Piensa en PEN | ✅ Piensa en PEN |

---

## 🚀 Próximos Pasos

1. **Decidir modelo de negocio** (USD base vs. PEN base)
2. **Si USD base:** Implementar cambios en formulario y backend
3. **Si PEN base:** Actualizar tasa y usar API para calcular `price_usd`
4. **Probar con diferentes países**
5. **Documentar decisión y proceso**

---

**Última actualización:** 6 de Diciembre, 2025

