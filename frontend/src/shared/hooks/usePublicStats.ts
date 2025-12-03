/**
 * Hook SWR para obtener estadísticas públicas (sin autenticación)
 * Usado en la página de inicio para mostrar estadísticas generales
 */

import useSWR from 'swr';
import { getPublicStats, PublicStatsResponse } from '@/shared/services/dashboard';

/**
 * Hook para obtener estadísticas públicas
 * No requiere autenticación - ideal para páginas públicas
 */
export function usePublicStats() {
    const { data, error, isLoading, mutate } = useSWR<PublicStatsResponse>(
        'public-stats',
        async () => {
            return await getPublicStats();
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 300000, // Cache por 5 minutos (estadísticas no cambian frecuentemente)
            revalidateIfStale: true,
            // Retry con backoff exponencial
            errorRetryCount: 3,
            errorRetryInterval: 5000,
        }
    );

    // Valores por defecto (fallback si falla el API)
    const defaultStats = {
        students: 500,
        courses: 50,
        years_experience: 10,
        instructors: {
            active: 20,
            courses_created: 50,
            average_rating: 4.8,
        },
    };

    return {
        stats: data?.success && data?.data ? data.data : defaultStats,
        isLoading,
        isError: !!error || (data && !data.success),
        error: error || (data && !data.success ? new Error('Error al cargar estadísticas') : null),
        mutate,
    };
}

