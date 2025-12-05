# 🔧 Configuración Multi-Moneda - Fase 1

**Fecha:** 2025-01-27  
**Estado:** ✅ Listo para Configurar

---

## 📝 Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env` del backend:

```env
# ==================================
# CURRENCY & GEOIP CONFIGURATION
# ==================================
# Fase 1 Multi-Moneda - FagSol Escuela Virtual

# Exchange Rate API (para conversión de monedas)
# Opcional: Si tienes API key, úsala para más requests
# Gratis hasta 1,500 requests/mes sin API key
EXCHANGE_RATE_API_KEY=tu_api_key_opcional

# URL de la API de tasas de cambio
# Por defecto usa ExchangeRate API (gratis)
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD

# GeoIP Service (para detección de país por IP)
# Por defecto usa ipapi.co (gratis hasta 1,000 requests/día)
GEOIP_SERVICE_URL=https://ipapi.co

# API Key opcional para servicios premium de GeoIP
# Dejar vacío si usas servicio gratuito
GEOIP_SERVICE_API_KEY=opcional_para_servicios_premium

# Tasa de cambio USD -> PEN por defecto (fallback si API falla)
# Actualizar según tasa actual del mercado
DEFAULT_USD_TO_PEN_RATE=3.75
```

---

## 🔍 Servicios Utilizados

### **1. ExchangeRate API**

**URL:** `https://api.exchangerate-api.com/v4/latest/USD`

**Límites Gratuitos:**
- ✅ 1,500 requests/mes sin API key
- ✅ Sin registro necesario
- ✅ Actualización diaria de tasas

**Obtener API Key (Opcional):**
1. Visita: https://www.exchangerate-api.com/
2. Crea cuenta gratuita
3. Obtén tu API key
4. Agrega a `EXCHANGE_RATE_API_KEY`

**Uso:** Conversión de USD a monedas locales (COP, CLP, BOB, etc.)

---

### **2. ipapi.co**

**URL:** `https://ipapi.co`

**Límites Gratuitos:**
- ✅ 1,000 requests/día sin API key
- ✅ Sin registro necesario
- ✅ Detección precisa de país

**Obtener API Key (Opcional):**
1. Visita: https://ipapi.co/
2. Crea cuenta gratuita
3. Obtén tu API key
4. Agrega a `GEOIP_SERVICE_API_KEY`

**Uso:** Detección de país del usuario desde su IP

---

## ⚙️ Configuración por Defecto

Si NO agregas estas variables al `.env`, el sistema usará:

```python
EXCHANGE_RATE_API_KEY = ''  # Sin API key (usa límite gratuito)
EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'
GEOIP_SERVICE_URL = 'https://ipapi.co'
GEOIP_SERVICE_API_KEY = ''  # Sin API key (usa límite gratuito)
DEFAULT_USD_TO_PEN_RATE = 3.75  # Tasa por defecto
```

**✅ El sistema funcionará sin configuración adicional** (usando servicios gratuitos).

---

## 🚀 Configuración Recomendada para Producción

### **Opción 1: Servicios Gratuitos (MVP)**

```env
# Sin API keys - usar límites gratuitos
EXCHANGE_RATE_API_KEY=
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
GEOIP_SERVICE_URL=https://ipapi.co
GEOIP_SERVICE_API_KEY=
DEFAULT_USD_TO_PEN_RATE=3.75
```

**Ventajas:**
- ✅ Sin costo
- ✅ Funciona inmediatamente
- ✅ Suficiente para MVP

**Desventajas:**
- ⚠️ Límites de requests (1,500/mes ExchangeRate, 1,000/día ipapi.co)
- ⚠️ Puede requerir actualización manual de tasa USD→PEN

---

### **Opción 2: Con API Keys (Recomendado para Producción)**

```env
# Con API keys para más requests
EXCHANGE_RATE_API_KEY=tu_api_key_aqui
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
GEOIP_SERVICE_URL=https://ipapi.co
GEOIP_SERVICE_API_KEY=tu_api_key_aqui
DEFAULT_USD_TO_PEN_RATE=3.75
```

**Ventajas:**
- ✅ Más requests disponibles
- ✅ Mejor para producción
- ✅ Tasas más actualizadas

**Desventajas:**
- ⚠️ Requiere registro en servicios externos

---

## 📊 Caché y Optimización

El sistema implementa caché automático:

- **Tasas de cambio:** Caché de 1 hora (Redis)
- **Detección de país:** Caché de 24 horas (Redis)

**Beneficios:**
- ✅ Reduce requests a APIs externas
- ✅ Mejora rendimiento
- ✅ Respeta límites gratuitos

---

## 🔄 Actualización de Tasa USD → PEN

La tasa `DEFAULT_USD_TO_PEN_RATE` se usa como fallback si la API falla.

**Para actualizarla:**
1. Consulta tasa actual: https://www.xe.com/es/currencyconverter/convert/?Amount=1&From=USD&To=PEN
2. Actualiza `DEFAULT_USD_TO_PEN_RATE` en `.env`
3. Reinicia el servidor Django

**Recomendación:** Actualizar mensualmente o cuando haya cambios significativos.

---

## ✅ Verificación de Configuración

Después de agregar las variables al `.env`:

1. **Reinicia el servidor Django:**
   ```bash
   python manage.py runserver
   ```

2. **Verifica que las variables se carguen:**
   ```python
   # En Django shell
   python manage.py shell
   >>> from django.conf import settings
   >>> print(settings.EXCHANGE_RATE_API_URL)
   >>> print(settings.GEOIP_SERVICE_URL)
   ```

3. **Prueba los endpoints:**
   - `GET /api/v1/currency/detect/` - Debe retornar país detectado
   - `GET /api/v1/currency/convert/?amount=20&to_currency=COP` - Debe convertir precio

---

## 📚 Referencias

- [ExchangeRate API](https://www.exchangerate-api.com/)
- [ipapi.co](https://ipapi.co/)
- [Tasa USD → PEN](https://www.xe.com/es/currencyconverter/convert/?Amount=1&From=USD&To=PEN)

---

**Última actualización:** 2025-01-27  
**Estado:** ✅ Listo para usar

