# 💰 Análisis: Sistema de Precios Multi-Moneda para LATAM

**Fecha:** 2025-01-27  
**Estado:** 📊 **ANÁLISIS EN PROGRESO**

---

## 🎯 Requerimiento del Cliente

**Objetivo:** Permitir que usuarios de diferentes países de LATAM puedan comprar cursos mostrando precios en:
1. **Dólares (USD)** como moneda base (siempre visible)
2. **Moneda local** del país detectado (COP, CLP, BOB, etc.) - visible para el usuario
3. **Detección automática** de ubicación por IP
4. **⚠️ IMPORTANTE:** Todos los pagos se procesan en **PEN (Soles)** por detrás (el usuario NO lo ve)

**Países objetivo:** Perú, Colombia, Chile, Ecuador, Bolivia, y otros países de LATAM.

**Estrategia de Pago:**
- ✅ **Usuario VE:** Precio en USD + Precio en su moneda local (COP, CLP, etc.)
- ✅ **Usuario NO VE:** Que el pago se procesa en PEN
- ✅ **Por detrás:** Sistema convierte USD → PEN, Mercado Pago procesa en PEN
- ✅ **Tarjeta del usuario:** Maneja conversión PEN → moneda de la tarjeta automáticamente
- ✅ Una sola cuenta de Mercado Pago (Perú)

---

## 📊 Análisis de Viabilidad

### ✅ **VIABLE Y SIMPLIFICADO**

**Nivel de Complejidad:** 🟢 **MEDIA** (Simplificado porque todos los pagos son en PEN)

**Ventaja clave:** Al procesar todos los pagos en PEN, no necesitamos:
- ❌ Múltiples cuentas de Mercado Pago
- ❌ Credenciales por país
- ❌ Webhooks por país
- ❌ Validación compleja de monedas múltiples

---

## 🔍 Análisis Técnico

### **1. Mercado Pago y Multi-País**

#### ✅ **Soporte de Mercado Pago**

Mercado Pago **SÍ soporta** múltiples países y monedas:

| País | Moneda | Código Mercado Pago | Disponible |
|------|--------|---------------------|------------|
| Perú | Soles (PEN) | `PE` | ✅ |
| Colombia | Pesos (COP) | `CO` | ✅ |
| Chile | Pesos (CLP) | `CL` | ✅ |
| Ecuador | Dólares (USD) | `EC` | ✅ |
| Bolivia | Bolivianos (BOB) | `BO` | ✅ |
| Argentina | Pesos (ARS) | `AR` | ✅ |
| México | Pesos (MXN) | `MX` | ✅ |
| Brasil | Reales (BRL) | `BR` | ✅ |

**Conclusión:** ✅ Mercado Pago soporta todos los países objetivo.

---

### **2. Detección de Ubicación por IP**

#### ✅ **Viabilidad: ALTA**

**Opciones de implementación:**

**Opción A: Servicio Externo (Recomendado)**
- **ipapi.co** - Gratis hasta 1,000 requests/día
- **ip-api.com** - Gratis hasta 45 requests/minuto
- **MaxMind GeoIP2** - Pago, más preciso
- **Cloudflare** - Si usas Cloudflare, incluye geolocalización

**Opción B: Backend Django**
- Librería `geoip2` con base de datos MaxMind
- Requiere descargar base de datos localmente
- Más control, pero requiere mantenimiento

**Recomendación:** Usar servicio externo para MVP, migrar a solución propia después.

---

### **3. Conversión de Monedas**

#### ✅ **Viabilidad: ALTA**

**Opciones:**

**Opción A: API de Tasa de Cambio (Recomendado)**
- **ExchangeRate API** - Gratis hasta 1,500 requests/mes
- **Fixer.io** - Gratis hasta 100 requests/mes
- **CurrencyLayer** - Gratis hasta 1,000 requests/mes
- **Banco Central de cada país** - Más preciso, pero múltiples APIs

**Opción B: Base de Datos Local**
- Actualizar tasas diariamente
- Más control, pero requiere mantenimiento

**Recomendación:** API externa con caché (Redis) para evitar límites.

---

## 🏗️ Arquitectura Propuesta

### **Flujo Completo**

```
1. Usuario (Colombia) visita página de curso
   ↓
2. Frontend detecta IP → País: Colombia
   ↓
3. Backend calcula:
   - Precio base: $20 USD
   - Precio en COP: $80,000 COP (para mostrar)
   - Precio en PEN: S/ 75 PEN (por detrás, NO se muestra al usuario)
   ↓
4. Frontend muestra al usuario:
   - "$20 USD"
   - "$80,000 COP" (moneda local)
   - ❌ NO muestra PEN
   ↓
5. Usuario agrega al carrito (ve: "$80,000 COP" o "$20 USD")
   ↓
6. Checkout muestra:
   - "$80,000 COP" (moneda local)
   - "$20 USD" (base)
   - ❌ NO muestra PEN
   ↓
7. Usuario confirma pago (ve precio en su moneda local)
   ↓
8. Por detrás (usuario NO ve):
   - Sistema convierte: $20 USD → S/ 75 PEN
   - Mercado Pago procesa pago en PEN (cuenta única Perú)
   ↓
9. Tarjeta del usuario:
   - Recibe cargo en PEN
   - Convierte automáticamente PEN → moneda de la tarjeta
   ↓
10. Curso se desbloquea ✅
```

**⚠️ Nota importante:** 
- ✅ Usuario **SOLO VE** precio en USD y su moneda local
- ✅ Usuario **NO VE** que se procesa en PEN
- ✅ La conversión a PEN es **transparente** (por detrás)
- ✅ La tarjeta del usuario maneja la conversión PEN → moneda de tarjeta
- ✅ No necesitamos múltiples cuentas de Mercado Pago

---

## 📝 Cambios Necesarios

### **Backend**

#### **1. Modelo de Curso - Agregar Precio Base en USD**

```python
# backend/apps/courses/models.py
class Course(models.Model):
    # Precio base en USD (moneda de referencia)
    price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio en USD"
    )
    
    # Precio en PEN (mantener para compatibilidad)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio en PEN",
        help_text="Precio en soles peruanos (calculado desde USD)"
    )
```

#### **2. Servicio de Conversión de Moneda**

```python
# backend/infrastructure/services/currency_service.py
class CurrencyService:
    """
    Servicio para conversión de monedas y detección de país
    """
    
    def __init__(self):
        self.exchange_rate_api_key = settings.EXCHANGE_RATE_API_KEY
        self.geoip_service = settings.GEOIP_SERVICE_URL
    
    def detect_country_from_ip(self, ip_address: str) -> str:
        """
        Detecta el país desde la IP
        Returns: Código de país ISO (PE, CO, CL, etc.)
        """
        # Implementar con servicio externo o MaxMind
        pass
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """
        Obtiene tasa de cambio entre monedas
        """
        # Implementar con API de tasas de cambio
        pass
    
    def convert_price(self, amount_usd: Decimal, target_currency: str) -> Decimal:
        """
        Convierte precio de USD a moneda objetivo
        """
        if target_currency == 'USD':
            return amount_usd
        
        rate = self.get_exchange_rate('USD', target_currency)
        return amount_usd * rate
```

#### **3. Actualizar Payment Service**

```python
# backend/infrastructure/services/payment_service.py
def create_payment_intent(
    self,
    user,
    course_ids: List[str],
    country_code: str = 'PE',  # País detectado (solo para mostrar precio)
    metadata: Optional[Dict] = None
) -> Tuple[bool, Optional[PaymentIntent], str]:
    """
    Crea payment intent - SIEMPRE en PEN (soles) por detrás
    El país solo se usa para mostrar precio convertido en frontend
    El usuario NO ve que se procesa en PEN
    """
    # 1. Obtener cursos
    courses = Course.objects.filter(id__in=course_ids, is_active=True, status='published')
    
    # 2. Calcular total en USD (precio base - siempre visible)
    total_usd = Decimal('0.00')
    for course in courses:
        total_usd += course.price_usd  # Usar precio en USD
    
    # 3. Convertir USD a PEN (moneda de pago única - por detrás)
    currency_service = CurrencyService()
    total_pen = currency_service.convert_price(total_usd, 'PEN')
    
    # 4. Calcular precio en moneda local (solo para mostrar en frontend)
    currency_map = {
        'PE': 'PEN',
        'CO': 'COP',
        'CL': 'CLP',
        'EC': 'USD',
        'BO': 'BOB',
        'AR': 'ARS',
        'MX': 'MXN',
        'BR': 'BRL',
    }
    local_currency = currency_map.get(country_code, 'USD')
    total_local_display = currency_service.convert_price(total_usd, local_currency)
    
    # 5. Crear payment intent SIEMPRE en PEN (por detrás)
    payment_intent = PaymentIntent.objects.create(
        user=user,
        total=total_pen,  # ⚠️ SIEMPRE en PEN (moneda de pago - usuario NO lo ve)
        currency='PEN',  # ⚠️ SIEMPRE PEN (por detrás)
        course_ids=course_ids,
        metadata={
            **(metadata or {}),
            'total_usd': str(total_usd),  # Precio base en USD (visible)
            'total_local_display': str(total_local_display),  # Precio en moneda local (visible)
            'local_currency': local_currency,  # Moneda local del usuario (visible)
            'country_code': country_code,  # País detectado
            # total_pen NO se incluye en metadata porque usuario NO lo ve
        },
        expires_at=timezone.now() + timedelta(hours=1)
    )
    
    return True, payment_intent, ""
```

**⚠️ IMPORTANTE:** 
- El `total` y `currency` del PaymentIntent SIEMPRE son en PEN (por detrás)
- Los precios convertidos (USD y moneda local) se guardan en `metadata` para mostrar en frontend
- El usuario **SOLO VE** USD y su moneda local
- El usuario **NO VE** que se procesa en PEN
- El pago real siempre se procesa en PEN (transparente)

#### **4. Endpoint para Detección de País**

```python
# backend/presentation/views/currency_views.py
@api_view(['GET'])
@permission_classes([AllowAny])
def detect_country(request):
    """
    Detecta el país del usuario desde su IP
    """
    ip_address = get_client_ip(request)
    currency_service = CurrencyService()
    country_code = currency_service.detect_country_from_ip(ip_address)
    
    return Response({
        'country_code': country_code,
        'currency': get_currency_for_country(country_code),
    })
```

---

### **Frontend**

#### **1. Hook para Detección de País**

```typescript
// frontend/src/shared/hooks/useCountryDetection.tsx
export function useCountryDetection() {
    const [country, setCountry] = useState<CountryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Detectar país al cargar
        detectCountry().then(setCountry).finally(() => setLoading(false));
    }, []);
    
    return { country, loading };
}
```

#### **2. Servicio de Conversión de Moneda**

```typescript
// frontend/src/shared/services/currency.ts
export interface CountryInfo {
    code: string;  // PE, CO, CL, etc.
    currency: string;  // PEN, COP, CLP, etc.
    currencySymbol: string;  // S/, $, etc.
    name: string;  // Perú, Colombia, etc.
}

export async function detectCountry(): Promise<CountryInfo> {
    // Llamar al backend para detectar país
    const response = await api.get('/currency/detect/');
    return response.data;
}

export function formatPrice(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
        'USD': '$',
        'PEN': 'S/',
        'COP': '$',
        'CLP': '$',
        'BOB': 'Bs.',
        'ARS': '$',
        'MXN': '$',
        'BRL': 'R$',
    };
    
    const symbol = symbols[currency] || '$';
    return `${symbol} ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
```

#### **3. Componente de Precio Multi-Moneda**

```typescript
// frontend/src/shared/components/MultiCurrencyPrice.tsx
export function MultiCurrencyPrice({ priceUsd }: { priceUsd: number }) {
    const { country, loading } = useCountryDetection();
    const [localPrice, setLocalPrice] = useState<number | null>(null);
    
    useEffect(() => {
        if (country) {
            // Convertir precio a moneda local
            convertPrice(priceUsd, country.currency).then(setLocalPrice);
        }
    }, [country, priceUsd]);
    
    if (loading) {
        return <div>Calculando precio...</div>;
    }
    
    return (
        <div>
            <div className="text-2xl font-bold text-primary-orange">
                {formatPrice(localPrice || priceUsd, country?.currency || 'USD')}
            </div>
            <div className="text-sm text-gray-400">
                ≈ {formatPrice(priceUsd, 'USD')} USD
            </div>
        </div>
    );
}
```

---

## ⚠️ Consideraciones Importantes

### **1. Seguridad en Conversión de Precios**

**Problema:** Un atacante podría manipular el país para obtener precios más baratos.

**Solución (SIMPLIFICADA):**
- ✅ Backend **siempre** calcula precio desde USD base
- ✅ Backend **siempre** convierte a PEN (moneda única de pago)
- ✅ Backend **valida** país desde IP del servidor (no confiar en frontend)
- ✅ Backend **valida** monto final en PEN (no importa qué moneda muestre el frontend)
- ✅ La conversión a moneda local es SOLO para mostrar (no afecta el pago)

**Ventaja:** Al procesar siempre en PEN, la validación es más simple y segura.

**Código de validación:**
```python
# En process_payment
# 1. Recalcular precio desde USD base
total_usd = sum(course.price_usd for course in courses)
expected_local = currency_service.convert_price(total_usd, payment_intent.currency)

# 2. Validar que el monto coincide (con tolerancia de 0.01 por redondeo)
if abs(payment_intent.total - expected_local) > Decimal('0.01'):
    return False, None, "El monto no coincide con el precio calculado"
```

---

### **2. Mercado Pago - Procesamiento en PEN**

**✅ SOLUCIÓN SIMPLIFICADA:**

**Estrategia:** Procesar TODOS los pagos en PEN (Soles) desde la cuenta única de Perú.

**Ventajas:**
- ✅ Una sola cuenta de Mercado Pago (Perú)
- ✅ Una sola configuración de webhooks
- ✅ Una sola moneda en backend (PEN)
- ✅ Mercado Pago acepta tarjetas internacionales en PEN
- ✅ Sin necesidad de credenciales múltiples

**Consideraciones:**
- ✅ Usuarios de otros países **NO ven** precio en PEN (solo ven su moneda local + USD)
- ✅ El procesamiento en PEN es **transparente** (por detrás)
- ⚠️ Sus tarjetas pueden tener comisiones de conversión (manejado por el banco automáticamente)
- ✅ Precio mostrado en su moneda local es lo que ven y esperan pagar

**Recomendación:** ✅ Esta es la mejor estrategia para MVP y escalabilidad.

---

### **3. Tasas de Cambio**

**Problema:** Las tasas de cambio fluctúan constantemente.

**Solución (SIMPLIFICADA):**
- ✅ Actualizar tasas cada hora (o diariamente)
- ✅ Caché en Redis (evitar límites de API)
- ✅ Para mostrar precio local: usar tasa actual
- ✅ Para procesar pago: SIEMPRE usar tasa USD→PEN (moneda única)
- ✅ Mostrar disclaimer: "Precio aproximado en tu moneda. El pago se procesará en Soles (PEN)"

**Ventaja:** Solo necesitamos tasa USD→PEN para procesar pagos (más simple).

---

### **4. Validación de Montos**

**Problema:** Redondeo puede causar diferencias pequeñas.

**Solución (SIMPLIFICADA):**
```python
# Validación siempre en PEN (moneda única)
# Tolerancia de 0.01 para redondeo
if abs(amount_pen - expected_pen) <= Decimal('0.01'):
    # Aceptar pago
    pass
```

**Ventaja:** Al procesar siempre en PEN, la validación es más simple y consistente.

---

## 🎯 Plan de Implementación Recomendado

### **Fase 1: MVP (Solo Visualización)**

**Objetivo:** Mostrar precios en USD y moneda local, pero procesar solo en PEN.

**Cambios:**
1. ✅ Agregar `price_usd` al modelo Course
2. ✅ Migración de datos (convertir precios PEN existentes a USD)
3. ✅ Servicio de detección de país (frontend)
4. ✅ Servicio de conversión de moneda (frontend)
5. ✅ Componente MultiCurrencyPrice
6. ⚠️ Pagos siguen en PEN (por ahora)

**Tiempo estimado:** 1-2 semanas

---

### **Fase 2: Optimización (Opcional)**

**Objetivo:** Mejorar experiencia mostrando precio final en PEN claramente.

**Cambios:**
1. ✅ Mostrar precio en moneda local + precio final en PEN
2. ✅ Mensaje claro: "El pago se procesará en Soles (PEN)"
3. ✅ Disclaimer sobre conversión de moneda
4. ✅ Mejorar UX del checkout

**Tiempo estimado:** 3-5 días

**Nota:** Esta fase es opcional. La Fase 1 ya permite mostrar precios convertidos.

---

### **Fase 3: Optimización**

**Objetivo:** Mejorar rendimiento y precisión.

**Cambios:**
1. ✅ Caché de tasas de cambio
2. ✅ Base de datos local de GeoIP
3. ✅ Monitoreo de conversiones
4. ✅ Analytics de conversión por país

**Tiempo estimado:** 1 semana

---

## 🔒 Seguridad Implementada

### **Medidas de Seguridad**

1. ✅ **Validación Server-Side**
   - Backend siempre calcula desde USD base
   - No confiar en conversión del frontend

2. ✅ **Detección de País Server-Side**
   - Backend detecta país desde IP del servidor
   - Frontend solo muestra, no decide

3. ✅ **Validación de Montos**
   - Backend valida monto contra precio USD convertido
   - Tolerancia de redondeo controlada

4. ✅ **Rate Limiting**
   - Limitar requests a API de conversión
   - Caché para evitar abuso

---

## 📊 Impacto en el Sistema Actual

### **Cambios Mínimos Requeridos**

**Backend:**
- ✅ Agregar campo `price_usd` a Course
- ✅ Nuevo servicio `CurrencyService` (conversión USD→PEN y USD→moneda local)
- ✅ Actualizar `PaymentService` para aceptar país (solo para metadata)
- ✅ Nuevo endpoint `/api/v1/currency/detect/` (detección de país)
- ✅ Nuevo endpoint `/api/v1/currency/convert/` (conversión de precios)
- ⚠️ Payment Intent SIEMPRE en PEN (simplificado)

**Frontend:**
- ✅ Nuevo hook `useCountryDetection`
- ✅ Nuevo componente `MultiCurrencyPrice` (muestra USD + moneda local + PEN final)
- ✅ Actualizar `CourseCard` y `CourseDetailPage`
- ✅ Actualizar `CheckoutPage` para mostrar moneda local + precio final en PEN

**Base de Datos:**
- ✅ Migración para agregar `price_usd`
- ✅ Migración para convertir precios existentes (PEN → USD)
- ⚠️ Mantener `price` en PEN para compatibilidad

---

## ⚠️ Riesgos y Mitigaciones

### **Riesgo 1: Manipulación de País**

**Riesgo:** Usuario cambia país para obtener precio más barato.

**Mitigación:**
- ✅ Backend detecta país desde IP del servidor
- ✅ Validación de monto contra precio USD base

---

### **Riesgo 2: Fluctuación de Tasas**

**Riesgo:** Tasa de cambio cambia entre mostrar precio y pagar.

**Mitigación:**
- ✅ Mostrar disclaimer: "Precio aproximado"
- ✅ Usar tasa del momento del pago
- ✅ Tolerancia de redondeo

---

### **Riesgo 3: Límites de API**

**Riesgo:** Exceder límites de API de conversión.

**Mitigación:**
- ✅ Caché en Redis (1 hora)
- ✅ Fallback a tasa fija si API falla
- ✅ Monitoreo de uso

---

## ✅ Recomendación Final

### **✅ IMPLEMENTAR EN FASES**

**Fase 1 (MVP):** Solo visualización multi-moneda
- ✅ Bajo riesgo
- ✅ Mejora UX inmediatamente
- ✅ Permite validar demanda

**Fase 2:** Pagos multi-moneda
- ✅ Mayor complejidad
- ✅ Requiere credenciales por país
- ✅ Validar con Fase 1 primero

---

## 📚 Referencias

- [Mercado Pago Multi-Country](https://www.mercadopago.com/developers/es/docs)
- [ExchangeRate API](https://www.exchangerate-api.com/)
- [ipapi.co](https://ipapi.co/)
- [ISO Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)

---

**Última actualización:** 2025-01-27  
**Estado:** 📊 Análisis Completo - Listo para Implementación

