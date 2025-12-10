'use client';

import { useCountryDetection } from '@/shared/hooks/useCountryDetection';
import { convertCurrency, CurrencyConversion, formatPrice } from '@/shared/services/currency';
import { useEffect, useState } from 'react';

interface MultiCurrencyPriceProps {
    /** Precio en USD (base) */
    priceUsd: number;
    /** Precio en PEN (para mostrar si no hay conversión) */
    pricePen?: number;
    /** Tamaño del texto principal */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Mostrar precio en USD */
    showUsd?: boolean;
    /** Clase CSS adicional */
    className?: string;
}

/**
 * Componente que muestra precio en USD y moneda local del usuario
 * 
 * Opción C (Híbrido Mejorado): PEN como base + USD fijo
 * - Admin ingresa precio en PEN
 * - Sistema calcula price_usd una vez (fijo)
 * - Usuarios ven precios convertidos desde price_usd guardado
 * - Pagos siempre en PEN
 * 
 * Comportamiento:
 * - Usuario en Perú: Muestra pricePen directamente (sin conversión)
 * - Usuario en otro país: Convierte desde priceUsd a moneda local
 */
export function MultiCurrencyPrice({
    priceUsd,
    pricePen,
    size = 'md',
    showUsd = true,
    className = '',
}: MultiCurrencyPriceProps) {
    const { country, loading } = useCountryDetection();
    const [localPrice, setLocalPrice] = useState<CurrencyConversion | null>(null);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        if (!country || country.currency === 'USD') {
            setLocalPrice(null);
            return;
        }

        // Opción C: Si el usuario está en Perú y tenemos pricePen,
        // mostrar directamente el precio en PEN que ingresó el admin (sin conversión)
        // Esto asegura que el precio mostrado sea exactamente el que ingresó el admin
        if (country.currency === 'PEN' && pricePen !== undefined) {
            setLocalPrice(null);
            return;
        }

        const loadConversion = async () => {
            try {
                setConverting(true);
                const conversion = await convertCurrency(priceUsd, country.currency);
                setLocalPrice(conversion);
            } catch (error) {
                console.error('Error al convertir precio:', error);
                setLocalPrice(null);
            } finally {
                setConverting(false);
            }
        };

        loadConversion();
    }, [country, priceUsd, pricePen]);

    // Tamaños de texto
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    const sizeClassesSecondary = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const sizeClassesTiny = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-base',
    };

    if (loading || converting) {
        return (
            <div className={`${sizeClasses[size]} text-gray-400 ${className}`}>
                Calculando precio...
            </div>
        );
    }

    // Opción C: Si el usuario está en Perú y tenemos pricePen,
    // mostrar directamente el precio en PEN que ingresó el admin (sin conversión)
    // Esto asegura que el precio mostrado sea exactamente el que ingresó el admin
    if (country && country.currency === 'PEN' && pricePen !== undefined) {
        return (
            <div className={className}>
                <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                    {formatPrice(pricePen, 'PEN')}
                </div>
                {showUsd && (
                    <div className={`${sizeClassesSecondary[size]} text-gray-400 mt-1`}>
                        ≈ {formatPrice(priceUsd, 'USD')} USD
                    </div>
                )}
            </div>
        );
    }

    // Si no hay país detectado o es USD, mostrar solo USD
    if (!country || country.currency === 'USD') {
        return (
            <div className={className}>
                <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                    {formatPrice(priceUsd, 'USD')}
                </div>
            </div>
        );
    }

    // Si hay conversión, mostrar moneda local + USD
    if (localPrice) {
        // Mostrar código de moneda para monedas que usan el mismo símbolo ($)
        const needsCode = ['USD', 'COP', 'CLP', 'ARS', 'MXN', 'UYU', 'DOP', 'CUP'].includes(localPrice.to_currency);

        return (
            <div className={className}>
                {/* Precio principal en moneda local */}
                <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                    {formatPrice(localPrice.amount_converted, localPrice.to_currency, true, needsCode)}
                </div>
                {/* Precio en USD (base) */}
                {showUsd && (
                    <div className={`${sizeClassesSecondary[size]} text-gray-400 mt-1`}>
                        ≈ {formatPrice(priceUsd, 'USD', true, true)} USD
                    </div>
                )}
            </div>
        );
    }

    // Fallback: mostrar precio en PEN si está disponible
    if (pricePen !== undefined) {
        return (
            <div className={className}>
                <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                    {formatPrice(pricePen, 'PEN')}
                </div>
                {showUsd && (
                    <div className={`${sizeClassesSecondary[size]} text-gray-400 mt-1`}>
                        ≈ {formatPrice(priceUsd, 'USD')} USD
                    </div>
                )}
            </div>
        );
    }

    // Último fallback: solo USD
    return (
        <div className={className}>
            <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                {formatPrice(priceUsd, 'USD')}
            </div>
        </div>
    );
}

