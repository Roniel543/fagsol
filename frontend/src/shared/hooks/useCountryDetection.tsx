'use client';

import { useState, useEffect } from 'react';
import { detectCountry, CountryInfo } from '@/shared/services/currency';

/**
 * Hook para detectar el país del usuario automáticamente
 */
export function useCountryDetection() {
    const [country, setCountry] = useState<CountryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadCountry = async () => {
            try {
                setLoading(true);
                setError(null);
                const detectedCountry = await detectCountry();
                if (mounted) {
                    setCountry(detectedCountry);
                }
            } catch (err) {
                console.error('Error al detectar país:', err);
                if (mounted) {
                    setError('No se pudo detectar el país');
                    // Fallback: usar Perú por defecto
                    setCountry({
                        country_code: 'PE',
                        currency: 'PEN',
                        currency_symbol: 'S/',
                        currency_name: 'Soles',
                    });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadCountry();

        return () => {
            mounted = false;
        };
    }, []);

    return { country, loading, error };
}

