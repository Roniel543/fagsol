/**
 * Servicio de Progreso de Lecciones
 * Maneja el progreso de usuarios en lecciones
 */

import { apiRequest } from './api';

/**
 * Progreso de una lección
 */
export interface LessonProgress {
    lesson_progress_id?: string;
    lesson_id: string;
    is_completed: boolean;
    progress_percentage: number;
    completed_at: string | null;
    last_accessed_at: string | null;
    time_watched_seconds: number;
}

/**
 * Progreso completo de un curso
 */
export interface CourseProgress {
    enrollment: {
        id: string;
        completion_percentage: number;
        completed: boolean;
        status: string;
    };
    lessons_progress: Record<string, {
        lesson_id: string;
        lesson_title: string;
        module_id: string;
        module_title: string;
        is_completed: boolean;
        progress_percentage: number;
        completed_at: string | null;
        last_accessed_at: string | null;
    }>;
    total_lessons: number;
    completed_lessons: number;
    completion_percentage: number;
}

/**
 * Respuesta estándar de la API
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Marca una lección como completada
 */
export async function markLessonCompleted(
    lessonId: string,
    enrollmentId: string
): Promise<ApiResponse<{
    lesson_progress_id: string;
    is_completed: boolean;
    completed_at: string | null;
    enrollment_completion_percentage: number;
    enrollment_completed: boolean;
}>> {
    try {
        const response = await apiRequest<{
            success: boolean;
            data: {
                lesson_progress_id: string;
                is_completed: boolean;
                completed_at: string | null;
                enrollment_completion_percentage: number;
                enrollment_completed: boolean;
            };
            message?: string;
        }>('/progress/lessons/complete/', {
            method: 'POST',
            body: JSON.stringify({
                lesson_id: lessonId,
                enrollment_id: enrollmentId,
            }),
        });

        return response as ApiResponse<{
            lesson_progress_id: string;
            is_completed: boolean;
            completed_at: string | null;
            enrollment_completion_percentage: number;
            enrollment_completed: boolean;
        }>;
    } catch (error: any) {
        console.error('Error al marcar lección como completada:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error al marcar lección como completada',
        };
    }
}

/**
 * Marca una lección como incompleta
 */
export async function markLessonIncomplete(
    lessonId: string,
    enrollmentId: string
): Promise<ApiResponse<{
    lesson_progress_id: string;
    is_completed: boolean;
    enrollment_completion_percentage: number;
    enrollment_completed: boolean;
}>> {
    try {
        const response = await apiRequest<{
            success: boolean;
            data: {
                lesson_progress_id: string;
                is_completed: boolean;
                enrollment_completion_percentage: number;
                enrollment_completed: boolean;
            };
            message?: string;
        }>('/progress/lessons/incomplete/', {
            method: 'POST',
            body: JSON.stringify({
                lesson_id: lessonId,
                enrollment_id: enrollmentId,
            }),
        });

        return response as ApiResponse<{
            lesson_progress_id: string;
            is_completed: boolean;
            enrollment_completion_percentage: number;
            enrollment_completed: boolean;
        }>;
    } catch (error: any) {
        console.error('Error al marcar lección como incompleta:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error al marcar lección como incompleta',
        };
    }
}

/**
 * Obtiene el progreso de una lección específica
 */
export async function getLessonProgress(
    lessonId: string,
    enrollmentId: string
): Promise<ApiResponse<LessonProgress>> {
    try {
        const params = new URLSearchParams({
            lesson_id: lessonId,
            enrollment_id: enrollmentId,
        });
        const response = await apiRequest<{
            success: boolean;
            data: LessonProgress;
            message?: string;
        }>(`/progress/lesson/?${params.toString()}`);

        return response as ApiResponse<LessonProgress>;
    } catch (error: any) {
        console.error('Error al obtener progreso de lección:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener progreso de lección',
        };
    }
}

/**
 * Obtiene el progreso completo de un curso
 */
export async function getCourseProgress(
    enrollmentId: string
): Promise<ApiResponse<CourseProgress>> {
    try {
        const params = new URLSearchParams({
            enrollment_id: enrollmentId,
        });
        const response = await apiRequest<{
            success: boolean;
            data: CourseProgress;
            message?: string;
        }>(`/progress/course/?${params.toString()}`);

        return response as ApiResponse<CourseProgress>;
    } catch (error: any) {
        console.error('Error al obtener progreso del curso:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener progreso del curso',
        };
    }
}

