# 📊 Análisis del Modelo de Negocio - Contexto Perú

**Fecha:** 6 de Diciembre, 2025  
**Contexto:** Negocio peruano con cuenta Mercado Pago en PEN, expandiéndose internacionalmente

---

## 🎯 Contexto del Negocio

### **Situación Actual:**
- ✅ **Moneda base del negocio:** PEN (Soles)
- ✅ **Cuenta Mercado Pago:** En PEN (Soles)
- ✅ **Ubicación:** Perú
- ✅ **Expansión:** Internacional (Colombia, Chile, México, etc.)

### **Restricciones:**
- ⚠️ **Pagos deben procesarse en PEN** (Mercado Pago)
- ⚠️ **Admin piensa en PEN** (moneda local)
- ⚠️ **Usuarios internacionales** necesitan ver precios en su moneda

---

## 💡 Opciones de Modelo de Negocio

### **Opción A: PEN como Base + Conversión a USD para Visualización**

**Concepto:**
- Admin ingresa precios en **PEN** (moneda base del negocio)
- Sistema calcula `price_usd` usando tasa real de la API
- Usuarios ven precios convertidos a su moneda local
- **Pagos siempre en PEN** (Mercado Pago)

**Flujo:**
```
1. Admin ingresa: S/ 260 PEN
   └─> Sistema calcula: price_usd = 260 / 3.36 = 77.38 USD
   └─> Guarda: price = 260, price_usd = 77.38

2. Usuario en Perú ve:
   └─> Muestra: S/ 260.00 (directo, sin conversión)
   └─> Referencia: ≈ $ 77.38 USD

3. Usuario en Colombia ve:
   └─> Convierte: 77.38 USD * 3,900 = 301,782 COP
   └─> Muestra: $ 301,782 COP
   └─> Referencia: ≈ $ 77.38 USD

4. Usuario paga:
   └─> Siempre procesa en PEN: S/ 260.00
   └─> Mercado Pago recibe: 260 PEN
```

**Ventajas:**
- ✅ Admin piensa en PEN (familiar)
- ✅ Precios en PEN siempre fijos (no varían)
- ✅ Pagos directos en PEN (sin conversión)
- ✅ Fácil de entender para el negocio peruano

**Desventajas:**
- ⚠️ `price_usd` puede variar si se recalcula (tasa cambia)
- ⚠️ Requiere calcular `price_usd` cada vez que se guarda/actualiza
- ⚠️ Si tasa cambia mucho, precios internacionales pueden variar

**Viabilidad:** ⭐⭐⭐⭐ (4/5) - **RECOMENDADO para tu contexto**

---

### **Opción B: USD como Base + Conversión a PEN para Pagos**

**Concepto:**
- Admin ingresa precios en **USD** (moneda base internacional)
- Sistema calcula `price` (PEN) usando tasa real de la API
- Usuarios ven precios convertidos a su moneda local
- **Pagos se convierten a PEN** antes de procesar

**Flujo:**
```
1. Admin ingresa: $77.38 USD
   └─> Sistema calcula: price = 77.38 * 3.36 = 260 PEN
   └─> Guarda: price_usd = 77.38, price = 260

2. Usuario en Perú ve:
   └─> Convierte: 77.38 USD * 3.36 = 260 PEN
   └─> Muestra: S/ 260.00
   └─> Referencia: ≈ $ 77.38 USD

3. Usuario en Colombia ve:
   └─> Convierte: 77.38 USD * 3,900 = 301,782 COP
   └─> Muestra: $ 301,782 COP
   └─> Referencia: ≈ $ 77.38 USD

4. Usuario paga:
   └─> Convierte a PEN: 77.38 USD * 3.36 = 260 PEN
   └─> Mercado Pago recibe: 260 PEN
```

**Ventajas:**
- ✅ Precios consistentes internacionalmente
- ✅ No depende de tasas fijas desactualizadas
- ✅ Fácil escalar a más países

**Desventajas:**
- ❌ Admin debe pensar en USD (no familiar)
- ❌ Precio en PEN puede variar según tasa actual
- ❌ Requiere conversión al momento del pago
- ❌ Más complejo para un negocio peruano

**Viabilidad:** ⭐⭐⭐ (3/5) - **No recomendado para tu contexto**

---

### **Opción C: PEN como Base + USD Fijo (Híbrido Mejorado)**

**Concepto:**
- Admin ingresa precios en **PEN** (moneda base)
- Sistema calcula `price_usd` **una sola vez** al crear/actualizar
- `price_usd` se guarda y **NO se recalcula** (fijo)
- Usuarios ven precios convertidos desde `price_usd` guardado

**Flujo:**
```
1. Admin ingresa: S/ 260 PEN
   └─> Sistema consulta API: tasa = 3.36
   └─> Calcula: price_usd = 260 / 3.36 = 77.38 USD
   └─> Guarda: price = 260, price_usd = 77.38 (FIJO)

2. Usuario en Perú ve:
   └─> Muestra: S/ 260.00 (directo desde price)
   └─> Referencia: ≈ $ 77.38 USD (desde price_usd guardado)

3. Usuario en Colombia ve:
   └─> Convierte: 77.38 USD * 3,900 = 301,782 COP
   └─> Muestra: $ 301,782 COP
   └─> Referencia: ≈ $ 77.38 USD

4. Usuario paga:
   └─> Siempre procesa en PEN: S/ 260.00
   └─> Mercado Pago recibe: 260 PEN
```

**Ventajas:**
- ✅ Admin piensa en PEN (familiar)
- ✅ Precio en PEN siempre fijo (no varía)
- ✅ `price_usd` fijo (no se recalcula automáticamente)
- ✅ Precios internacionales consistentes (basados en `price_usd` fijo)
- ✅ Pagos directos en PEN

**Desventajas:**
- ⚠️ Si tasa cambia mucho, `price_usd` puede quedar desactualizado
- ⚠️ Requiere actualizar manualmente si se quiere recalcular

**Viabilidad:** ⭐⭐⭐⭐⭐ (5/5) - **MÁS RECOMENDADO para tu contexto**

---

## 🎯 Recomendación Final: Opción C (Híbrido Mejorado)

### **¿Por qué esta opción?**

1. **Respeto al contexto peruano:**
   - Admin piensa en PEN (familiar)
   - Pagos en PEN (Mercado Pago)
   - Precio en PEN siempre fijo

2. **Expansión internacional:**
   - `price_usd` fijo permite precios consistentes
   - Usuarios internacionales ven precios en su moneda
   - Conversión basada en `price_usd` guardado

3. **Simplicidad operativa:**
   - No requiere pensar en USD
   - No requiere conversión al momento del pago
   - Precios predecibles

### **Cómo Funciona:**

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN (Perú)                          │
│  Ingresa: S/ 260 PEN                                    │
│  └─> Piensa en soles (familiar)                        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  SISTEMA (Backend)                       │
│  1. Consulta API: tasa USD→PEN = 3.36                  │
│  2. Calcula: price_usd = 260 / 3.36 = 77.38 USD        │
│  3. Guarda:                                             │
│     - price = 260 (PEN, fijo)                           │
│     - price_usd = 77.38 (USD, fijo)                     │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Usuario Perú │ │ Usuario Col. │ │ Usuario USA  │
│              │ │              │ │              │
│ Ve: S/ 260   │ │ Ve: $301,782 │ │ Ve: $77.38   │
│ ≈ $77.38 USD │ │ ≈ $77.38 USD │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                       ▼
            ┌──────────────────────┐
            │   PAGO (Mercado Pago)│
            │   Siempre: S/ 260 PEN │
            └──────────────────────┘
```

---

## 📋 Comparación Detallada

| Aspecto | Opción A (PEN Base) | Opción B (USD Base) | Opción C (Híbrido) ⭐ |
|---------|---------------------|---------------------|----------------------|
| **Admin piensa en** | PEN ✅ | USD ❌ | PEN ✅ |
| **Precio PEN** | Fijo ✅ | Variable ❌ | Fijo ✅ |
| **Precio USD** | Variable ⚠️ | Fijo ✅ | Fijo ✅ |
| **Pagos** | Directo PEN ✅ | Conversión ⚠️ | Directo PEN ✅ |
| **Precios internacionales** | Variables ⚠️ | Consistentes ✅ | Consistentes ✅ |
| **Complejidad** | Media ⚠️ | Alta ❌ | Baja ✅ |
| **Viabilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔧 Implementación de Opción C

### **1. Al Crear/Actualizar Curso:**

```python
# Admin ingresa: 260 PEN
price_pen = 260

# Sistema consulta API (una vez)
tasa_usd_to_pen = currency_service.get_exchange_rate('USD', 'PEN')  # 3.36

# Calcula price_usd (una vez)
price_usd = price_pen / tasa_usd_to_pen  # 260 / 3.36 = 77.38

# Guarda AMBOS (fijos)
course.price = 260        # PEN (fijo)
course.price_usd = 77.38  # USD (fijo, no se recalcula)
```

### **2. Al Mostrar Precio:**

```python
# Usuario en Perú
if country == 'PE':
    mostrar = course.price  # S/ 260.00 (directo)
    referencia = course.price_usd  # ≈ $ 77.38 USD

# Usuario en Colombia
if country == 'CO':
    tasa_usd_to_cop = currency_service.get_exchange_rate('USD', 'COP')  # 3,900
    mostrar = course.price_usd * tasa_usd_to_cop  # 77.38 * 3,900 = 301,782 COP
    referencia = course.price_usd  # ≈ $ 77.38 USD
```

### **3. Al Procesar Pago:**

```python
# Siempre procesa en PEN (directo)
payment_amount = course.price  # 260 PEN
# Envía a Mercado Pago: 260 PEN
```

---

## ⚠️ Consideraciones Importantes

### **1. ¿Qué pasa si la tasa cambia mucho?**

**Escenario:** Admin crea curso con 260 PEN cuando tasa = 3.36
- `price_usd` guardado = 77.38 USD

**6 meses después:** Tasa cambia a 3.50
- Precio en PEN sigue siendo 260 (fijo) ✅
- Precio en USD sigue siendo 77.38 (fijo) ✅
- Precios internacionales siguen consistentes ✅

**Solución:** Si necesitas actualizar, puedes:
- Recalcular manualmente `price_usd` de cursos específicos
- O crear un job que actualice periódicamente (opcional)

### **2. ¿Cuándo recalcular `price_usd`?**

**Opciones:**
- **Nunca automáticamente** (recomendado) - Mantiene precios fijos
- **Solo al actualizar el precio** - Admin cambia precio, se recalcula
- **Job periódico** - Actualiza todos los cursos (no recomendado, puede causar confusión)

**Recomendación:** Solo recalcular cuando el admin actualiza el precio manualmente.

---

## 🎯 Decisión Final

### **Modelo Recomendado: Opción C (Híbrido Mejorado)**

**Razones:**
1. ✅ Respeta el contexto peruano (PEN como base)
2. ✅ Admin piensa en PEN (familiar)
3. ✅ Pagos directos en PEN (Mercado Pago)
4. ✅ Precios internacionales consistentes (basados en USD fijo)
5. ✅ Simplicidad operativa

**Implementación:**
- Admin ingresa precio en PEN
- Sistema calcula `price_usd` una vez usando tasa real de la API
- Guarda ambos valores (fijos)
- Usuarios ven precios convertidos desde `price_usd`
- Pagos siempre en PEN

---

## 📊 Resumen Ejecutivo

**Modelo de Negocio:** PEN como base + USD fijo para conversión internacional

**Flujo:**
```
Admin (PEN) → Sistema calcula USD → Guarda ambos → Usuarios ven convertido → Pagos en PEN
```

**Ventajas clave:**
- Familiar para admin peruano
- Precios fijos y predecibles
- Expansión internacional fácil
- Pagos directos sin conversión

**Próximo paso:** Implementar Opción C

---

**Última actualización:** 6 de Diciembre, 2025

