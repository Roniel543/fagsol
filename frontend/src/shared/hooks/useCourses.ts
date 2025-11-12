/**
 * Hooks SWR para data fetching de cursos
 */

import useSWR from 'swr';
import { listCourses, getCourseById, getCourseBySlug, adaptBackendCourseToFrontend, adaptBackendCourseDetailToFrontend } from '@/shared/services/courses';
import { Course } from '@/shared/types';
import { ListCoursesParams } from '@/shared/services/courses';

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

