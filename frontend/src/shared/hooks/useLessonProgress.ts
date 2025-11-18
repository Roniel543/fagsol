/**
 * Hook para manejar el progreso de lecciones
 */

import { useToast } from '@/shared/components';
import {
    getCourseProgress,
    getLessonProgress,
    markLessonCompleted,
    markLessonIncomplete,
    type CourseProgress,
    type LessonProgress,
} from '@/shared/services/progress';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para obtener el progreso de una lección específica
 */
export function useLessonProgress(lessonId: string | null, enrollmentId: string | null) {
    const { data, error, isLoading, mutate } = useSWR<LessonProgress>(
        lessonId && enrollmentId ? ['lesson-progress', lessonId, enrollmentId] : null,
        async (): Promise<LessonProgress> => {
            if (!lessonId || !enrollmentId) {
                throw new Error('lessonId and enrollmentId are required');
            }
            const response = await getLessonProgress(lessonId, enrollmentId);
            if (!response.success || !response.data) {
                // Si no hay progreso, retornar objeto por defecto
                return {
                    lesson_id: lessonId,
                    is_completed: false,
                    progress_percentage: 0,
                    completed_at: null,
                    last_accessed_at: null,
                    time_watched_seconds: 0,
                };
            }
            return response.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        progress: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para obtener el progreso completo de un curso
 */
export function useCourseProgress(enrollmentId: string | null) {
    const { data, error, isLoading, mutate } = useSWR<CourseProgress>(
        enrollmentId ? ['course-progress', enrollmentId] : null,
        async (): Promise<CourseProgress> => {
            if (!enrollmentId) {
                throw new Error('enrollmentId is required');
            }
            const response = await getCourseProgress(enrollmentId);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Error al obtener progreso del curso');
            }
            return response.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        progress: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para marcar lección como completada/incompleta
 */
export function useToggleLessonProgress() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const toggleProgress = React.useCallback(async (
        lessonId: string,
        enrollmentId: string,
        isCompleted: boolean
    ) => {
        setIsLoading(true);
        try {
            let response;
            if (isCompleted) {
                response = await markLessonIncomplete(lessonId, enrollmentId);
            } else {
                response = await markLessonCompleted(lessonId, enrollmentId);
            }

            if (response.success) {
                showToast(
                    isCompleted
                        ? 'Lección marcada como incompleta'
                        : 'Lección marcada como completada',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                showToast(response.message || 'Error al actualizar progreso', 'error');
                return { success: false, error: response.message };
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Error al actualizar progreso';
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    return {
        toggleProgress,
        isLoading,
    };
}

