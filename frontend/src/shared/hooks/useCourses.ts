/**
 * Hooks SWR para data fetching de cursos
 */

import {
    adaptBackendCourseDetailToFrontend,
    adaptBackendCourseToFrontend,
    approveCourse,
    getAllCoursesAdmin,
    getCourseById,
    getCourseBySlug,
    getCourseContent,
    getCourseStatusCounts,
    getPendingCourses,
    listCourses,
    rejectCourse,
    requestCourseReview,
    type ApproveCourseRequest,
    type CourseActionResponse,
    type CourseStatusCountsResponse,
    type CoursesWithReviewResponse,
    type ListCoursesParams,
    type RejectCourseRequest
} from '@/shared/services/courses';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para listar cursos
 */
export function useCourses(params?: ListCoursesParams) {
    const { data, error, isLoading, mutate } = useSWR(
        ['courses', params],
        async () => {
            const response = await listCourses(params);
            // Adaptar cada curso del backend al formato del frontend
            return {
                courses: response.data.map(adaptBackendCourseToFrontend),
                count: response.count,
            };
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // Evitar requests duplicados por 5 segundos
        }
    );

    return {
        courses: data?.courses || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate, // Para revalidar manualmente
    };
}

/**
 * Hook para obtener un curso por ID
 */
export function useCourse(courseId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId ? ['course', courseId] : null,
        async () => {
            if (!courseId) return null;
            const response = await getCourseById(courseId);
            return adaptBackendCourseDetailToFrontend(response.data);
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        course: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para obtener un curso por slug
 */
export function useCourseBySlug(slug: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        slug ? ['course-slug', slug] : null,
        async () => {
            if (!slug) return null;
            const response = await getCourseBySlug(slug);
            if (!response) return null;
            return adaptBackendCourseDetailToFrontend(response.data);
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        course: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

// ========== FASE 2: APROBACIÓN DE CURSOS ==========

const COURSES_ADMIN_KEY = '/admin/courses';

/**
 * Hook para solicitar revisión de un curso (Instructor)
 */
export function useRequestCourseReview() {
    const [isRequesting, setIsRequesting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const requestReview = React.useCallback(async (
        courseId: string
    ): Promise<CourseActionResponse> => {
        setIsRequesting(true);
        setError(null);
        try {
            const result = await requestCourseReview(courseId);
            return result as unknown as CourseActionResponse;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsRequesting(false);
        }
    }, []);

    return {
        requestReview,
        isRequesting,
        error,
    };
}

/**
 * Hook para obtener cursos pendientes de revisión (Admin)
 */
export function usePendingCourses() {
    const { data, error, isLoading, mutate } = useSWR<CoursesWithReviewResponse>(
        `${COURSES_ADMIN_KEY}/pending`,
        () => getPendingCourses(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    );

    return {
        courses: data?.data || [],
        count: data?.count || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook para obtener todos los cursos con filtro opcional (Admin)
 */
export function useAllCoursesAdmin(
    status?: 'pending_review' | 'needs_revision' | 'published' | 'draft' | 'archived'
) {
    const key = status ? `${COURSES_ADMIN_KEY}?status=${status}` : COURSES_ADMIN_KEY;

    const { data, error, isLoading, mutate } = useSWR<CoursesWithReviewResponse>(
        key,
        () => getAllCoursesAdmin(status),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    );

    return {
        courses: data?.data || [],
        count: data?.count || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook para obtener contadores de cursos por estado (Admin)
 */
export function useCourseStatusCounts() {
    const { data, error, isLoading, mutate } = useSWR<CourseStatusCountsResponse>(
        '/admin/courses/status-counts/',
        () => getCourseStatusCounts(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    );

    return {
        counts: data?.data || {
            all: 0,
            published: 0,
            draft: 0,
            pending_review: 0,
            needs_revision: 0,
            archived: 0,
        },
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook para aprobar un curso (Admin)
 */
export function useApproveCourse() {
    const [isApproving, setIsApproving] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const approve = React.useCallback(async (
        args: { courseId: string; data?: ApproveCourseRequest }
    ): Promise<CourseActionResponse> => {
        setIsApproving(true);
        setError(null);
        try {
            const result = await approveCourse(args.courseId, args.data);
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
        approveCourse: approve,
        isApproving,
        error,
    };
}

/**
 * Hook para rechazar un curso (Admin)
 */
export function useRejectCourse() {
    const [isRejecting, setIsRejecting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const reject = React.useCallback(async (
        args: { courseId: string; data: RejectCourseRequest }
    ): Promise<CourseActionResponse> => {
        setIsRejecting(true);
        setError(null);
        try {
            const result = await rejectCourse(args.courseId, args.data);
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
        rejectCourse: reject,
        isRejecting,
        error,
    };
}

// ========== PRIORIDAD 1: VISUALIZACIÓN DE CONTENIDO ==========

/**
 * Hook para obtener el contenido completo de un curso
 * Requiere que el usuario esté inscrito o sea admin/instructor
 */
export function useCourseContent(courseId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId ? ['course-content', courseId] : null,
        async () => {
            if (!courseId) return null;
            const response = await getCourseContent(courseId);
            return response.data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            shouldRetryOnError: (error) => {
                // No reintentar si es 403 (sin acceso) o 404 (no encontrado)
                if (error?.status === 403 || error?.status === 404) {
                    return false;
                }
                return true;
            },
        }
    );

    return {
        content: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

