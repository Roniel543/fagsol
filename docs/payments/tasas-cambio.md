# 💰 Estrategias de Tasas de Cambio en Plataformas Reales

**Fecha:** 6 de Diciembre, 2025  
**Pregunta:** ¿Cómo manejan las tasas de cambio las plataformas que manejan dinero real?

---

## 🔍 Análisis de Plataformas Reales

### **1. Plataformas de Cursos Online (Udemy, Coursera, etc.)**

**Estrategia:** **Precios Fijos por Período**

```
- Precio en USD se fija al crear el curso
- Precio en moneda local se calcula UNA VEZ usando tasa del momento
- Precio queda FIJO hasta que el admin lo actualiza manualmente
- NO se recalcula automáticamente aunque la tasa cambie
```

**Ejemplo Udemy:**
- Curso creado: $99 USD
- Tasa del momento: 1 USD = 3.36 PEN
- Precio en Perú: S/ 332.64 (fijo)
- Si tasa cambia a 3.50: Precio sigue siendo S/ 332.64 (NO cambia)

**Ventajas:**
- ✅ Precios predecibles
- ✅ No confunde a los usuarios
- ✅ Fácil de gestionar

**Desventajas:**
- ⚠️ Precio puede quedar desactualizado si tasa cambia mucho
- ⚠️ Requiere actualización manual periódica

---

### **2. E-commerce Internacional (Amazon, eBay, etc.)**

**Estrategia:** **Tasa Bloqueada al Checkout**

```
- Precio base en USD (o moneda del vendedor)
- Al agregar al carrito: Muestra precio convertido (referencia)
- Al hacer checkout: Bloquea tasa del momento
- Usuario paga con tasa bloqueada (válida por X minutos)
```

**Ejemplo Amazon:**
- Producto: $100 USD
- Usuario en Perú ve: S/ 336.00 (tasa 3.36)
- Al hacer checkout: Tasa se bloquea por 15 minutos
- Si tasa cambia durante checkout: Usa tasa bloqueada

**Ventajas:**
- ✅ Precio justo al momento del pago
- ✅ Protege al usuario de cambios de tasa

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Requiere sistema de bloqueo de tasas

---

### **3. Plataformas de Suscripción (Netflix, Spotify, etc.)**

**Estrategia:** **Tasa Fija por Región + Actualización Periódica**

```
- Precio base en USD
- Precio en cada región se fija por mes/trimestre
- Se actualiza periódicamente (ej: cada 3 meses)
- Usuarios ven precio fijo durante el período
```

**Ejemplo Netflix:**
- Plan: $15.99 USD/mes
- Precio en Perú: S/ 49.99 (fijo por 3 meses)
- Cada 3 meses: Se recalcula según tasa actual

**Ventajas:**
- ✅ Precios estables por período
- ✅ Actualización controlada

**Desventajas:**
- ⚠️ Requiere sistema de actualización programada
- ⚠️ Puede generar confusión al actualizar

---

### **4. Plataformas Fintech (Wise, Remitly, etc.)**

**Estrategia:** **Tasa en Tiempo Real + Margen**

```
- Tasa en tiempo real de mercado
- Agregan margen (spread) para ganancia
- Tasa se actualiza constantemente
- Usuario ve tasa actual al momento de la transacción
```

**Ejemplo Wise:**
- Tasa de mercado: 3.36
- Tasa Wise: 3.40 (agregan 0.04 de margen)
- Usuario paga con tasa actualizada

**Ventajas:**
- ✅ Siempre actualizado
- ✅ Transparente

**Desventajas:**
- ⚠️ Precios pueden cambiar constantemente
- ⚠️ No es ideal para productos con precio fijo

---

## 🎯 Estrategia Recomendada para FagSol (Opción C)

### **Modelo: Precios Fijos + Actualización Manual**

**Cómo Funciona:**
```
1. Admin crea curso: 260 PEN
   └─> Sistema consulta API: tasa = 3.36
   └─> Calcula: price_usd = 260 / 3.36 = 77.38 USD
   └─> Guarda: price = 260 (fijo), price_usd = 77.38 (fijo)

2. Tasa cambia a 3.50 (6 meses después)
   └─> Precio en PEN sigue siendo: 260 (NO cambia) ✅
   └─> Precio en USD sigue siendo: 77.38 (NO cambia) ✅
   └─> Precios internacionales siguen consistentes ✅

3. Si admin quiere actualizar:
   └─> Cambia precio a 280 PEN
   └─> Sistema recalcula: price_usd = 280 / 3.50 = 80.00 USD
   └─> Nuevos valores quedan fijos
```

**Ventajas:**
- ✅ Precios predecibles y estables
- ✅ No confunde a los usuarios
- ✅ Fácil de gestionar
- ✅ Similar a Udemy/Coursera (estándar de la industria)

**Desventajas:**
- ⚠️ Precio puede quedar desactualizado si tasa cambia mucho
- ⚠️ Requiere actualización manual (pero esto es una ventaja, no desventaja)

---

## 📊 Comparación de Estrategias

| Estrategia | Plataforma Ejemplo | Complejidad | Precios Estables | Actualización |
|------------|-------------------|-------------|------------------|---------------|
| **Fijos por Período** | Udemy, Coursera | ⭐⭐ Baja | ✅ Sí | Manual |
| **Bloqueo al Checkout** | Amazon, eBay | ⭐⭐⭐⭐ Alta | ⚠️ Parcial | Automática |
| **Fijos + Periódica** | Netflix, Spotify | ⭐⭐⭐ Media | ✅ Sí | Programada |
| **Tiempo Real** | Wise, Remitly | ⭐⭐⭐⭐ Alta | ❌ No | Constante |
| **Opción C (FagSol)** | Similar a Udemy | ⭐⭐ Baja | ✅ Sí | Manual |

---

## 🔧 ¿Qué Hacer si la Tasa Cambia Mucho?

### **Escenario 1: Tasa Cambia Poco (3.36 → 3.40)**

**Acción:** ✅ **NO hacer nada**
- Precios siguen siendo razonables
- No genera confusión
- Mantiene estabilidad

### **Escenario 2: Tasa Cambia Moderadamente (3.36 → 3.50)**

**Acción:** ⚠️ **Opcional - Actualizar cursos importantes**
- Si tienes cursos muy vendidos, considera actualizar precio
- O esperar a actualización natural cuando admin edite curso

### **Escenario 3: Tasa Cambia Mucho (3.36 → 4.00)**

**Acción:** 🔄 **Actualizar precios manualmente**
- Opción A: Admin actualiza precio de cada curso manualmente
- Opción B: Crear script/job que recalcule `price_usd` de todos los cursos
- Opción C: Actualizar `DEFAULT_USD_TO_PEN_RATE` en `.env` para nuevos cursos

---

## 💡 Recomendaciones para FagSol

### **1. Estrategia Actual (Opción C) - ✅ MANTENER**

**Razones:**
- ✅ Estándar de la industria (similar a Udemy/Coursera)
- ✅ Precios predecibles y estables
- ✅ No confunde a los usuarios
- ✅ Fácil de gestionar

### **2. Actualizar Tasa por Defecto Periódicamente**

**Frecuencia recomendada:** Cada 1-3 meses

**Proceso:**
```env
# Revisar tasa actual en Google/API
# Actualizar en .env
DEFAULT_USD_TO_PEN_RATE=3.36  # Actualizar según tasa actual
```

**Cuándo actualizar:**
- Si la tasa cambia más de 5% (ej: 3.36 → 3.53)
- Antes de crear muchos cursos nuevos
- Periódicamente (cada mes/trimestre)

### **3. Monitoreo Opcional**

**Herramientas:**
- Google: "1 USD a PEN"
- API de tasas: Verificar tasa actual
- Alertas: Si tasa cambia más de X%

**Acción:**
- Si tasa cambia mucho, considerar actualizar precios de cursos importantes

### **4. Script de Actualización Masiva (Opcional)**

**Cuándo usar:**
- Si tasa cambia mucho (ej: 3.36 → 4.00)
- Si quieres actualizar todos los cursos de una vez

**Cómo:**
```python
# Script opcional para recalcular price_usd de todos los cursos
# Solo ejecutar si realmente es necesario
```

---

## 🎯 Conclusión

### **Tu Estrategia Actual (Opción C) es CORRECTA ✅**

**Razones:**
1. ✅ Similar a plataformas exitosas (Udemy, Coursera)
2. ✅ Precios estables y predecibles
3. ✅ No confunde a los usuarios
4. ✅ Fácil de gestionar

### **Recomendaciones:**

1. **Mantener estrategia actual** (precios fijos)
2. **Actualizar tasa por defecto** cada 1-3 meses en `.env`
3. **Monitorear tasa** periódicamente (opcional)
4. **Actualizar precios manualmente** solo si tasa cambia mucho

### **NO necesitas:**
- ❌ Tasa en tiempo real (muy complejo, no necesario)
- ❌ Bloqueo de tasa al checkout (no aplica para cursos)
- ❌ Actualización automática constante (genera confusión)

---

## 📋 Checklist de Mantenimiento

### **Mensual (Recomendado):**
- [ ] Revisar tasa actual (Google/API)
- [ ] Actualizar `DEFAULT_USD_TO_PEN_RATE` en `.env` si cambió más de 5%
- [ ] Verificar que nuevos cursos usen tasa actualizada

### **Trimestral (Opcional):**
- [ ] Revisar precios de cursos más vendidos
- [ ] Considerar actualizar precios si tasa cambió mucho
- [ ] Documentar cambios de tasa

### **Anual (Opcional):**
- [ ] Revisar estrategia general
- [ ] Considerar mejoras si es necesario

---

**Última actualización:** 6 de Diciembre, 2025

