/**
 * Hooks para gestión de solicitudes de instructor
 */

import useSWR from 'swr';
import { useState } from 'react';
import {
    getInstructorApplications,
    approveInstructorApplication,
    rejectInstructorApplication,
    InstructorApplicationsResponse,
    ApplicationActionResponse,
    RejectApplicationRequest,
} from '@/shared/services/instructorApplications';

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

