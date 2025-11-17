/**
 * Hooks SWR para data fetching de dashboard
 */

import { AdminStats, DashboardStatsResponse, getDashboardStats, InstructorStats, StudentStats } from '@/shared/services/dashboard';
import useSWR from 'swr';
import { useAuth } from './useAuth';

/**
 * Hook para obtener estadísticas del dashboard según el rol
 */
export function useDashboard() {
    const { isAuthenticated } = useAuth();

    const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
        isAuthenticated ? 'dashboard-stats' : null,
        async () => {
            return await getDashboardStats();
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000, // Cache por 1 minuto
        }
    );

    // Type guards para determinar el tipo de estadísticas
    const isAdminStats = (data: any): data is AdminStats => {
        return data && 'courses' in data && 'users' in data && 'payments' in data;
    };

    const isInstructorStats = (data: any): data is InstructorStats => {
        return data && 'courses' in data && 'students' in data && 'rating' in data && !('users' in data);
    };

    const isStudentStats = (data: any): data is StudentStats => {
        return data && 'enrollments' in data && 'progress' in data && 'recent_courses' in data;
    };

    return {
        stats: data?.data || null,
        isAdminStats: data?.data ? isAdminStats(data.data) : false,
        isInstructorStats: data?.data ? isInstructorStats(data.data) : false,
        isStudentStats: data?.data ? isStudentStats(data.data) : false,
        adminStats: data?.data && isAdminStats(data.data) ? data.data as AdminStats : null,
        instructorStats: data?.data && isInstructorStats(data.data) ? data.data as InstructorStats : null,
        studentStats: data?.data && isStudentStats(data.data) ? data.data as StudentStats : null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

