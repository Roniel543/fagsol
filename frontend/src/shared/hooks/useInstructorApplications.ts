/**
 * Hooks para gestión de solicitudes de instructor
 */

import {
    approveInstructorApplication,
    getInstructorApplications,
    getMyInstructorApplication,
    InstructorApplicationsResponse,
    MyInstructorApplicationResponse,
    RejectApplicationRequest,
    rejectInstructorApplication
} from '@/shared/services/instructorApplications';
import { useState } from 'react';
import useSWR from 'swr';

/**
 * Hook para obtener solicitudes de instructor
 */
export function useInstructorApplications(status?: 'pending' | 'approved' | 'rejected') {
    const { data, error, isLoading, mutate } = useSWR<InstructorApplicationsResponse>(
        status
            ? [`instructor-applications`, status]
            : 'instructor-applications',
        () => getInstructorApplications(status),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        applications: data?.data || [],
        count: data?.count || 0,
        isLoading,
        isError: error,
        error,
        mutate,
    };
}

/**
 * Hook para aprobar una solicitud de instructor
 */
export function useApproveInstructorApplication() {
    const [isApproving, setIsApproving] = useState(false);

    const approve = async (applicationId: number) => {
        setIsApproving(true);
        try {
            const result = await approveInstructorApplication(applicationId);
            return result;
        } finally {
            setIsApproving(false);
        }
    };

    return {
        approveApplication: approve,
        isApproving,
    };
}

/**
 * Hook para rechazar una solicitud de instructor
 */
export function useRejectInstructorApplication() {
    const [isRejecting, setIsRejecting] = useState(false);

    const reject = async (applicationId: number, data?: RejectApplicationRequest) => {
        setIsRejecting(true);
        try {
            const result = await rejectInstructorApplication(applicationId, data);
            return result;
        } finally {
            setIsRejecting(false);
        }
    };

    return {
        rejectApplication: reject,
        isRejecting,
    };
}

/**
 * Hook para obtener la solicitud de instructor del usuario autenticado
 * Útil para que los estudiantes vean el estado de su solicitud
 */
export function useMyInstructorApplication() {
    const { data, error, isLoading, mutate } = useSWR<MyInstructorApplicationResponse>(
        'my-instructor-application',
        () => getMyInstructorApplication(),
        {
            revalidateOnFocus: true, // Revalidar cuando el usuario vuelve a la pestaña
            revalidateOnReconnect: true,
            refreshInterval: 30000, // Revalidar cada 30 segundos para detectar cambios
            errorRetryCount: 3,
            // Si no hay solicitud (404), no es un error, solo no hay datos
            shouldRetryOnError: (error) => {
                if (error && 'status' in error && error.status === 404) {
                    return false; // No reintentar si no hay solicitud
                }
                return true;
            },
        }
    );

    // Si es 404, significa que no hay solicitud (no es un error)
    const hasApplication = data?.success && data?.data;
    const isNotFound = error && 'status' in error && error.status === 404;

    return {
        application: data?.data,
        hasApplication: !!hasApplication,
        isLoading,
        isError: error && !isNotFound, // Solo es error si no es 404
        error: isNotFound ? null : error,
        mutate, // Para revalidar manualmente
    };
}

