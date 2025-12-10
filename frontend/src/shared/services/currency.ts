/**
 * Servicio de Moneda y Detección de País
 * FagSol Escuela Virtual - Fase 1 Multi-Moneda
 */

import { apiRequest } from './api';

export interface CountryInfo {
    country_code: string;
    currency: string;
    currency_symbol: string;
    currency_name: string;
}

export interface CurrencyConversion {
    from_currency: string;
    to_currency: string;
    amount_usd: number;
    amount_converted: number;
    rate: number;
    currency_symbol: string;
    currency_name: string;
}

/**
 * Detecta el país del usuario desde su IP
 */
export async function detectCountry(): Promise<CountryInfo | null> {
    try {
        const response = await apiRequest<CountryInfo>('/currency/detect/');
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error al detectar país:', error);
        // Fallback: retornar Perú por defecto
        return {
            country_code: 'PE',
            currency: 'PEN',
            currency_symbol: 'S/',
            currency_name: 'Soles',
        };
    }
}

/**
 * Convierte un precio de USD a una moneda objetivo
 */
export async function convertCurrency(
    amountUsd: number,
    toCurrency: string
): Promise<CurrencyConversion | null> {
    try {
        const queryParams = new URLSearchParams({
            amount: amountUsd.toString(),
            to_currency: toCurrency,
        });
        const response = await apiRequest<CurrencyConversion>(
            `/currency/convert/?${queryParams.toString()}`
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error al convertir moneda:', error);
        return null;
    }
}

/**
 * Formatea un precio según la moneda
 * @param amount - Monto a formatear
 * @param currency - Código de moneda (USD, PEN, COP, etc.)
 * @param showSymbol - Mostrar símbolo de moneda
 * @param showCode - Mostrar código de moneda (útil cuando el símbolo es ambiguo, ej: $ para USD, COP, MXN, etc.)
 */
export function formatPrice(
    amount: number,
    currency: string,
    showSymbol: boolean = true,
    showCode: boolean = false
): string {
    const symbols: Record<string, string> = {
        USD: '$',
        PEN: 'S/',
        COP: '$',
        CLP: '$',
        BOB: 'Bs.',
        ARS: '$',
        MXN: '$',
        BRL: 'R$',
        UYU: '$',
        PYG: '₲',
        VES: 'Bs.',
        CRC: '₡',
        PAB: 'B/.',
        GTQ: 'Q',
        HNL: 'L',
        NIO: 'C$',
        DOP: '$',
        CUP: '$',
    };

    // Monedas que usan el mismo símbolo $ y necesitan código para diferenciarse
    const ambiguousSymbols = ['USD', 'COP', 'CLP', 'ARS', 'MXN', 'UYU', 'DOP', 'CUP'];
    const needsCode = ambiguousSymbols.includes(currency) || showCode;

    const symbol = symbols[currency] || '$';
    const formatted = amount.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (!showSymbol) {
        return formatted;
    }

    // Si necesita código, mostrar: $ 292,053.64 COP
    if (needsCode) {
        return `${symbol} ${formatted} ${currency}`;
    }

    // Si no necesita código, mostrar: S/ 260.00
    return `${symbol} ${formatted}`;
}

/**
 * Obtiene el símbolo de moneda
 */
export function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
        USD: '$',
        PEN: 'S/',
        COP: '$',
        CLP: '$',
        BOB: 'Bs.',
        ARS: '$',
        MXN: '$',
        BRL: 'R$',
    };
    return symbols[currency] || '$';
}

