/**
 * Hooks SWR para data fetching de módulos (Admin)
 */

import {
    createModule,
    deleteModule,
    listCourseModules,
    updateModule,
    type CreateModuleRequest,
    type UpdateModuleRequest
} from '@/shared/services/adminModules';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para listar módulos de un curso (Admin)
 */
export function useAdminModules(courseId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId ? ['admin-modules', courseId] : null,
        async () => {
            if (!courseId) return null;
            const response = await listCourseModules(courseId);
            return {
                modules: response.data,
                count: response.count,
            };
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        modules: data?.modules || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para crear un módulo (Admin)
 */
export function useCreateModule() {
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const create = React.useCallback(async (
        courseId: string,
        data: CreateModuleRequest
    ) => {
        setIsCreating(true);
        setError(null);
        try {
            const result = await createModule(courseId, data);
            return result.data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return {
        createModule: create,
        isCreating,
        error,
    };
}

/**
 * Hook para actualizar un módulo (Admin)
 */
export function useUpdateModule() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const update = React.useCallback(async (
        moduleId: string,
        data: UpdateModuleRequest
    ) => {
        setIsUpdating(true);
        setError(null);
        try {
            const result = await updateModule(moduleId, data);
            return result.data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, []);

    return {
        updateModule: update,
        isUpdating,
        error,
    };
}

/**
 * Hook para eliminar un módulo (Admin)
 */
export function useDeleteModule() {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const deleteModuleAction = React.useCallback(async (
        moduleId: string
    ): Promise<void> => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteModule(moduleId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        deleteModule: deleteModuleAction,
        isDeleting,
        error,
    };
}

