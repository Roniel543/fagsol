/**
 * Hook para gestión de instructores usando SWR
 * FASE 1: Sistema de aprobación de instructores
 */

import {
    approveInstructor,
    getAllInstructors,
    getPendingInstructors,
    rejectInstructor,
    type ApproveInstructorRequest,
    type InstructorActionResponse,
    type InstructorsResponse,
    type RejectInstructorRequest,
} from '@/shared/services/instructors';
import React from 'react';
import useSWR from 'swr';

const INSTRUCTORS_KEY = '/admin/instructors';

/**
 * Hook para obtener instructores pendientes
 */
export function usePendingInstructors() {
    const { data, error, isLoading, mutate } = useSWR<InstructorsResponse>(
        `${INSTRUCTORS_KEY}/pending`,
        () => getPendingInstructors(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0, // No auto-refresh por defecto
        }
    );

    return {
        instructors: data?.data || [],
        count: data?.count || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook para obtener todos los instructores con filtro opcional
 */
export function useAllInstructors(status?: 'pending_approval' | 'approved' | 'rejected') {
    const key = status ? `${INSTRUCTORS_KEY}?status=${status}` : INSTRUCTORS_KEY;

    const { data, error, isLoading, mutate } = useSWR<InstructorsResponse>(
        key,
        () => getAllInstructors(status),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    );

    return {
        instructors: data?.data || [],
        count: data?.count || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook para aprobar un instructor
 */
export function useApproveInstructor() {
    const [isApproving, setIsApproving] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const approve = React.useCallback(async (
        args: { instructorId: number; data?: ApproveInstructorRequest }
    ): Promise<InstructorActionResponse> => {
        setIsApproving(true);
        setError(null);
        try {
            const result = await approveInstructor(args.instructorId, args.data);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsApproving(false);
        }
    }, []);

    return {
        approveInstructor: approve,
        isApproving,
        error,
    };
}

/**
 * Hook para rechazar un instructor
 */
export function useRejectInstructor() {
    const [isRejecting, setIsRejecting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const reject = React.useCallback(async (
        args: { instructorId: number; data: RejectInstructorRequest }
    ): Promise<InstructorActionResponse> => {
        setIsRejecting(true);
        setError(null);
        try {
            const result = await rejectInstructor(args.instructorId, args.data);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsRejecting(false);
        }
    }, []);

    return {
        rejectInstructor: reject,
        isRejecting,
        error,
    };
}

