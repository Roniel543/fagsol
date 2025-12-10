# 🧪 Guía de Prueba - Flujo de Conversión de Precios (Opción C)

**Fecha:** 6 de Diciembre, 2025  
**Configuración:** `DEFAULT_USD_TO_PEN_RATE=4.00`

---

## 🎯 Objetivo

Probar el flujo completo de conversión de precios con la Opción C (Híbrido Mejorado) usando `DEFAULT_USD_TO_PEN_RATE=4.00` como fallback.

---

## 📋 Preparación

### **1. Configurar `.env`:**

```env
# Tasa por defecto (fallback si API falla)
DEFAULT_USD_TO_PEN_RATE=4.00

# APIs (opcional, para probar con API real)
EXCHANGE_RATE_API_KEY=
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
GEOIP_SERVICE_URL=https://ipapi.co
GEOIP_SERVICE_API_KEY=
```

### **2. Ejecutar Comando de Prueba:**

```bash
# Desde el directorio backend/
python manage.py test_price_conversion --price 260

# Para probar con API real (requiere conexión a internet)
python manage.py test_price_conversion --price 260 --test-api
```

---

## 🔍 Escenarios de Prueba

### **Escenario 1: API Funciona Correctamente**

**Configuración:**
- API disponible y respondiendo
- Tasa real: ~3.36

**Resultado Esperado:**
```
1. Admin ingresa: S/ 260 PEN
2. Sistema consulta API: tasa = 3.36
3. Sistema calcula: price_usd = 260 / 3.36 = 77.38 USD
4. Sistema guarda:
   - price = 260 PEN (fijo)
   - price_usd = 77.38 USD (fijo)
```

**Verificación:**
- ✅ `price_usd` debe ser ~77.38 USD
- ✅ Usa tasa real de la API (3.36)
- ✅ NO usa fallback (4.00)

---

### **Escenario 2: API Falla (Usa Fallback)**

**Configuración:**
- API no disponible o error
- `DEFAULT_USD_TO_PEN_RATE=4.00`

**Resultado Esperado:**
```
1. Admin ingresa: S/ 260 PEN
2. Sistema intenta consultar API: ❌ Falla
3. Sistema usa fallback: tasa = 4.00
4. Sistema calcula: price_usd = 260 / 4.00 = 65.00 USD
5. Sistema guarda:
   - price = 260 PEN (fijo)
   - price_usd = 65.00 USD (fijo)
```

**Verificación:**
- ✅ `price_usd` debe ser 65.00 USD
- ✅ Usa fallback (4.00)
- ✅ Sistema continúa funcionando sin errores

---

### **Escenario 3: Comparación API vs Fallback**

**Con API (tasa 3.36):**
- 260 PEN → 77.38 USD

**Con Fallback (tasa 4.00):**
- 260 PEN → 65.00 USD

**Diferencia:**
- 12.38 USD (16% menos)
- ⚠️ **Significativa** - Considera actualizar fallback a 3.36

---

## 📊 Resultados Esperados

### **Con `DEFAULT_USD_TO_PEN_RATE=4.00`:**

| Precio PEN | Con API (3.36) | Con Fallback (4.00) | Diferencia |
|------------|----------------|---------------------|------------|
| 100 PEN | $29.76 USD | $25.00 USD | -$4.76 (16%) |
| 260 PEN | $77.38 USD | $65.00 USD | -$12.38 (16%) |
| 500 PEN | $148.81 USD | $125.00 USD | -$23.81 (16%) |

**Observación:** ⚠️ El fallback de 4.00 está desactualizado (tasa real ~3.36)

---

## ✅ Checklist de Prueba

### **1. Prueba con Comando:**

```bash
# Prueba básica (solo fallback)
python manage.py test_price_conversion --price 260

# Prueba con API real
python manage.py test_price_conversion --price 260 --test-api
```

**Verificar:**
- [ ] Comando ejecuta sin errores
- [ ] Muestra cálculo correcto
- [ ] Muestra verificación inversa
- [ ] Compara API vs Fallback (si --test-api)

---

### **2. Prueba Creando Curso Real:**

**Pasos:**
1. Ir a `/admin/courses/create` o usar API
2. Crear curso con precio: 260 PEN
3. Verificar en base de datos:
   ```sql
   SELECT price, price_usd FROM courses_course WHERE id = 'c-xxx';
   ```

**Resultado Esperado:**
- `price = 260.00`
- `price_usd = 77.38` (si API funciona) o `65.00` (si usa fallback)

---

### **3. Prueba en Frontend:**

**Pasos:**
1. Crear/ver curso con precio 260 PEN
2. Usuario en Perú debe ver: `S/ 260.00`
3. Usuario en Colombia debe ver: precio convertido desde `price_usd`

**Verificar:**
- [ ] Usuario en Perú ve precio correcto (260 PEN)
- [ ] Usuario en otro país ve precio convertido
- [ ] Referencia USD se muestra correctamente

---

### **4. Prueba de Pago:**

**Pasos:**
1. Agregar curso al carrito
2. Proceder al checkout
3. Verificar que el pago se procesa en PEN

**Verificar:**
- [ ] Pago se procesa en PEN (260 PEN)
- [ ] NO se convierte al momento del pago
- [ ] Mercado Pago recibe 260 PEN

---

## 🔧 Comandos Útiles

### **Ver Tasa Actual de la API:**

```python
# En Django shell
python manage.py shell

from infrastructure.services.currency_service import CurrencyService
service = CurrencyService()
tasa = service.get_exchange_rate('USD', 'PEN')
print(f"Tasa actual: 1 USD = {tasa} PEN")
```

### **Probar Conversión Manual:**

```python
# En Django shell
from infrastructure.services.course_service import CourseService
from decimal import Decimal

service = CourseService()
price_pen = Decimal('260')
price_usd = service._calculate_price_usd_from_pen(price_pen)
print(f"{price_pen} PEN = {price_usd} USD")
```

---

## ⚠️ Observaciones Importantes

### **1. Fallback Desactualizado:**

Con `DEFAULT_USD_TO_PEN_RATE=4.00`:
- ⚠️ Tasa está desactualizada (real ~3.36)
- ⚠️ Diferencia del 16% si API falla
- ✅ Sistema funciona correctamente (no rompe nada)
- ✅ Solo afecta si API falla

### **2. Recomendación:**

**Actualizar fallback a tasa más cercana:**
```env
DEFAULT_USD_TO_PEN_RATE=3.36  # Tasa actual aproximada
```

**O mantener 4.00 si:**
- Prefieres tasa conservadora (precios más bajos en USD)
- API rara vez falla
- Quieres margen de seguridad

---

## 📋 Resumen del Flujo

```
┌─────────────────────────────────────────────────────────┐
│ 1. Admin ingresa: S/ 260 PEN                            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Sistema intenta obtener tasa de API                  │
│    └─> Si éxito: tasa = 3.36 (real)                    │
│    └─> Si falla: tasa = 4.00 (fallback)                │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────────┐         ┌──────────────────┐
│ Con API (3.36)   │         │ Con Fallback(4.00)│
│ 260 ÷ 3.36       │         │ 260 ÷ 4.00       │
│ = 77.38 USD      │         │ = 65.00 USD      │
└──────────────────┘         └──────────────────┘
        │                               │
        └───────────────┬───────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Sistema guarda:                                       │
│    - price = 260 PEN (fijo)                             │
│    - price_usd = 77.38 o 65.00 USD (fijo)              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Usuario en Perú ve: S/ 260.00                        │
│ 5. Usuario en otro país ve: precio convertido           │
│ 6. Usuario paga: S/ 260.00 PEN (directo)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusión

**Con `DEFAULT_USD_TO_PEN_RATE=4.00`:**
- ✅ Sistema funciona correctamente
- ✅ Si API falla, usa fallback (4.00)
- ⚠️ Fallback está desactualizado (diferencia 16%)
- ✅ No rompe nada, solo afecta si API falla

**Recomendación:**
- Mantener 4.00 si prefieres tasa conservadora
- O actualizar a 3.36 para mayor precisión

---

**Última actualización:** 6 de Diciembre, 2025

