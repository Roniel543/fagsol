/**
 * Hooks SWR para data fetching de enrollments
 */

import useSWR from 'swr';
import { listEnrollments, getEnrollmentById, BackendEnrollment } from '@/shared/services/enrollments';
import { useAuth } from './useAuth';

/**
 * Hook para listar enrollments del usuario autenticado
 */
export function useEnrollments() {
    const { isAuthenticated } = useAuth();
    
    const { data, error, isLoading, mutate } = useSWR(
        isAuthenticated ? 'enrollments' : null,
        async () => {
            const response = await listEnrollments();
            return response.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        enrollments: data || [],
        count: data?.length || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para obtener un enrollment por ID
 */
export function useEnrollment(enrollmentId: string | null) {
    const { isAuthenticated } = useAuth();
    
    const { data, error, isLoading, mutate } = useSWR(
        isAuthenticated && enrollmentId ? ['enrollment', enrollmentId] : null,
        async () => {
            if (!enrollmentId) return null;
            const response = await getEnrollmentById(enrollmentId);
            return response.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        enrollment: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

