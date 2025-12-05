'use client';

import { useEffect, useState } from 'react';
import { useCountryDetection } from '@/shared/hooks/useCountryDetection';
import { convertCurrency, formatPrice, CurrencyConversion } from '@/shared/services/currency';

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
 * El usuario NO ve que se procesa en PEN (transparente)
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
    }, [country, priceUsd]);

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
        return (
            <div className={className}>
                {/* Precio principal en moneda local */}
                <div className={`${sizeClasses[size]} font-bold text-primary-orange`}>
                    {formatPrice(localPrice.amount_converted, localPrice.to_currency)}
                </div>
                {/* Precio en USD (base) */}
                {showUsd && (
                    <div className={`${sizeClassesSecondary[size]} text-gray-400 mt-1`}>
                        ≈ {formatPrice(priceUsd, 'USD')} USD
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

