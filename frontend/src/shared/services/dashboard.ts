/**
 * Servicios de API para Dashboard
 * Conecta el frontend con el backend de Django
 */

import { apiRequest } from './api';

/**
 * Estadísticas de Admin
 */
export interface AdminStats {
    courses: {
        total: number;
        published: number;
        draft: number;
        archived: number;
    };
    users: {
        total: number;
        students: number;
        instructors: number;
        admins: number;
    };
    enrollments: {
        total: number;
        active: number;
        completed: number;
    };
    payments: {
        total: number;
        total_revenue: number;
        revenue_last_month: number;
    };
    certificates: {
        total: number;
    };
    popular_courses: Array<{
        id: string;
        title: string;
        enrollments: number;
        status: string;
    }>;
    revenue_by_month: Array<{
        month: string;
        total: number;
    }>;
}

/**
 * Estadísticas de Instructor
 */
export interface InstructorStats {
    courses: {
        total: number;
        published: number;
        draft: number;
    };
    enrollments: {
        total: number;
        active: number;
        completed: number;
    };
    students: {
        unique: number;
    };
    rating: {
        average: number;
    };
    certificates: {
        total: number;
    };
    popular_courses: Array<{
        id: string;
        title: string;
        enrollments: number;
        status: string;
    }>;
}

/**
 * Estadísticas de Estudiante
 */
export interface StudentStats {
    enrollments: {
        total: number;
        active: number;
        completed: number;
        in_progress: number;
    };
    progress: {
        average: number;
    };
    certificates: {
        total: number;
    };
    recent_courses: Array<{
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string;
        progress: number;
        status: string;
        enrolled_at: string;
    }>;
    completed_courses: Array<{
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string;
        completed_at: string | null;
        has_certificate: boolean;
    }>;
}

/**
 * Respuesta de estadísticas del dashboard
 */
export interface DashboardStatsResponse {
    success: boolean;
    data: AdminStats | InstructorStats | StudentStats | { role: string; message: string };
}

/**
 * Obtiene estadísticas del dashboard según el rol del usuario
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await apiRequest<DashboardStatsResponse>('/dashboard/stats/');
    return response as unknown as DashboardStatsResponse;
}

/**
 * Obtiene estadísticas de administrador
 */
export async function getAdminStats(): Promise<DashboardStatsResponse> {
    const response = await apiRequest<DashboardStatsResponse>('/dashboard/admin/stats/');
    return response as unknown as DashboardStatsResponse;
}

/**
 * Obtiene estadísticas de instructor
 */
export async function getInstructorStats(): Promise<DashboardStatsResponse> {
    const response = await apiRequest<DashboardStatsResponse>('/dashboard/instructor/stats/');
    return response as unknown as DashboardStatsResponse;
}

/**
 * Obtiene estadísticas de estudiante
 */
export async function getStudentStats(): Promise<DashboardStatsResponse> {
    const response = await apiRequest<DashboardStatsResponse>('/dashboard/student/stats/');
    return response as unknown as DashboardStatsResponse;
}

/**
 * Estadísticas públicas (sin autenticación)
 */
export interface PublicStats {
    students: number;
    courses: number;
    years_experience: number;
    instructors: {
        active: number;
        courses_created: number;
        average_rating: number;
    };
}

/**
 * Respuesta de estadísticas públicas
 */
export interface PublicStatsResponse {
    success: boolean;
    data: PublicStats;
}

/**
 * Obtiene estadísticas públicas para la página de inicio
 * No requiere autenticación
 */
export async function getPublicStats(): Promise<PublicStatsResponse> {
    const response = await apiRequest<PublicStatsResponse>('/stats/public/');
    return response as unknown as PublicStatsResponse;
}

