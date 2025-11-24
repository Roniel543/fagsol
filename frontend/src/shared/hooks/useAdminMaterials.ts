/**
 * Hooks SWR para data fetching de materiales (Admin)
 */

import {
    createMaterial,
    deleteMaterial,
    listCourseMaterials,
    updateMaterial,
    type CreateMaterialRequest,
    type ListMaterialsParams,
    type UpdateMaterialRequest
} from '@/shared/services/adminMaterials';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para listar materiales de un curso (Admin)
 */
export function useAdminMaterials(courseId: string | null, params?: ListMaterialsParams) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId ? ['admin-materials', courseId, params] : null,
        async () => {
            if (!courseId) return null;
            const response = await listCourseMaterials(courseId, params);
            return {
                materials: response.data,
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
        materials: data?.materials || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para crear un material (Admin)
 */
export function useCreateMaterial() {
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const create = React.useCallback(async (
        courseId: string,
        data: CreateMaterialRequest
    ) => {
        setIsCreating(true);
        setError(null);
        try {
            const result = await createMaterial(courseId, data);
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
        createMaterial: create,
        isCreating,
        error,
    };
}

/**
 * Hook para actualizar un material (Admin)
 */
export function useUpdateMaterial() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const update = React.useCallback(async (
        materialId: string,
        data: UpdateMaterialRequest
    ) => {
        setIsUpdating(true);
        setError(null);
        try {
            const result = await updateMaterial(materialId, data);
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
        updateMaterial: update,
        isUpdating,
        error,
    };
}

/**
 * Hook para eliminar un material (Admin)
 */
export function useDeleteMaterial() {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const deleteMaterialAction = React.useCallback(async (
        materialId: string
    ): Promise<void> => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteMaterial(materialId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        deleteMaterial: deleteMaterialAction,
        isDeleting,
        error,
    };
}

