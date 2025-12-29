/**
 * Hook para obtener enrollments (cursos inscritos) del usuario
 * Usa SWR para caché y revalidación automática
 */

import { BackendEnrollment, listEnrollments } from '@/shared/services/enrollments';
import { logger } from '@/shared/utils/logger';
import useSWR from 'swr';

export interface UseEnrollmentsOptions {
    autoFetch?: boolean;
}

export interface UseEnrollmentsReturn {
    enrollments: BackendEnrollment[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    mutate: () => Promise<any>;
}

/**
 * Hook para obtener los cursos en los que el usuario está inscrito
 */
export function useEnrollments(options: UseEnrollmentsOptions = {}): UseEnrollmentsReturn {
    const { autoFetch = true } = options;

    const { data, error, isLoading, mutate } = useSWR<BackendEnrollment[]>(
        autoFetch ? 'enrollments' : null,
        async () => {
            try {
                const response = await listEnrollments();
                if (response.success) {
                    return response.data;
                } else {
                    throw new Error('Error al obtener enrollments');
                }
            } catch (err) {
                logger.error('Error fetching enrollments', err);
                throw err;
            }
        },
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            shouldRetryOnError: true,
            errorRetryCount: 3,
        }
    );

    return {
        enrollments: data || [],
        isLoading,
        isError: !!error,
        error: error as Error | null,
        mutate,
    };
}
