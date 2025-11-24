/**
 * Hooks SWR para data fetching de alumnos inscritos (Admin)
 */

import {
    getStudentProgress,
    listCourseStudents,
    type ListStudentsParams
} from '@/shared/services/adminStudents';
import useSWR from 'swr';

/**
 * Hook para listar alumnos inscritos en un curso (Admin)
 */
export function useAdminStudents(courseId: string | null, params?: ListStudentsParams) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId ? ['admin-students', courseId, params] : null,
        async () => {
            if (!courseId) return null;
            const response = await listCourseStudents(courseId, params);
            return {
                students: response.data,
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
        students: data?.students || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para obtener el progreso de un alumno (Admin)
 */
export function useStudentProgress(courseId: string | null, enrollmentId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        courseId && enrollmentId ? ['admin-student-progress', courseId, enrollmentId] : null,
        async () => {
            if (!courseId || !enrollmentId) return null;
            const response = await getStudentProgress(courseId, enrollmentId);
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

