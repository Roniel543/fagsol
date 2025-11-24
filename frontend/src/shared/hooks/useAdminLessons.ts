/**
 * Hooks SWR para data fetching de lecciones (Admin)
 */

import {
    createLesson,
    deleteLesson,
    listModuleLessons,
    updateLesson,
    type CreateLessonRequest,
    type UpdateLessonRequest
} from '@/shared/services/adminLessons';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para listar lecciones de un módulo (Admin)
 */
export function useAdminLessons(moduleId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        moduleId ? ['admin-lessons', moduleId] : null,
        async () => {
            if (!moduleId) return null;
            const response = await listModuleLessons(moduleId);
            return {
                lessons: response.data,
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
        lessons: data?.lessons || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para crear una lección (Admin)
 */
export function useCreateLesson() {
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const create = React.useCallback(async (
        moduleId: string,
        data: CreateLessonRequest
    ) => {
        setIsCreating(true);
        setError(null);
        try {
            const result = await createLesson(moduleId, data);
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
        createLesson: create,
        isCreating,
        error,
    };
}

/**
 * Hook para actualizar una lección (Admin)
 */
export function useUpdateLesson() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const update = React.useCallback(async (
        lessonId: string,
        data: UpdateLessonRequest
    ) => {
        setIsUpdating(true);
        setError(null);
        try {
            const result = await updateLesson(lessonId, data);
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
        updateLesson: update,
        isUpdating,
        error,
    };
}

/**
 * Hook para eliminar una lección (Admin)
 */
export function useDeleteLesson() {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const deleteLessonAction = React.useCallback(async (
        lessonId: string
    ): Promise<void> => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteLesson(lessonId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        deleteLesson: deleteLessonAction,
        isDeleting,
        error,
    };
}

