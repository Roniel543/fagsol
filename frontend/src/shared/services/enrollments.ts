/**
 * Servicios de API para Enrollments
 * Conecta el frontend con el backend de Django
 */

import { apiRequest } from './api';

/**
 * Enrollment del backend
 */
export interface BackendEnrollment {
    id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnail_url?: string;
        description?: string;
    };
    status: 'active' | 'completed' | 'expired' | 'cancelled';
    completed: boolean;
    completion_percentage: number;
    enrolled_at: string;
    completed_at?: string;
    expires_at?: string;
}

/**
 * Respuesta de lista de enrollments
 */
export interface ListEnrollmentsResponse {
    success: boolean;
    data: BackendEnrollment[];
    count: number;
}

/**
 * Respuesta de detalle de enrollment
 */
export interface EnrollmentDetailResponse {
    success: boolean;
    data: BackendEnrollment;
}

/**
 * Lista los enrollments del usuario autenticado
 */
export async function listEnrollments(): Promise<ListEnrollmentsResponse> {
    const response = await apiRequest<ListEnrollmentsResponse>('/enrollments/');
    return response as unknown as ListEnrollmentsResponse;
}

/**
 * Obtiene un enrollment por ID
 */
export async function getEnrollmentById(enrollmentId: string): Promise<EnrollmentDetailResponse> {
    const response = await apiRequest<EnrollmentDetailResponse>(`/enrollments/${enrollmentId}/`);
    return response as unknown as EnrollmentDetailResponse;
}

