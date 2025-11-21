/**
 * Servicio de API para gestión de solicitudes de instructor
 * FASE 2: Sistema de solicitud y aprobación de instructores
 */

import { apiRequest } from './api';

export interface InstructorApplication {
    id: number;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
    };
    professional_title?: string;
    experience_years: number;
    specialization?: string;
    bio?: string;
    portfolio_url?: string;
    motivation: string;
    status: 'pending' | 'approved' | 'rejected';
    status_display: string;
    reviewed_by?: {
        id: number;
        email: string;
    } | null;
    reviewed_at?: string | null;
    rejection_reason?: string | null;
    created_at: string;
    updated_at: string;
}

export interface InstructorApplicationsResponse {
    success: boolean;
    data: InstructorApplication[];
    count: number;
    message?: string;
}

export interface RejectApplicationRequest {
    rejection_reason?: string;
}

export interface ApplicationActionResponse {
    success: boolean;
    data: {
        id: number;
        user_id?: number;
        status: string;
    };
    message?: string;
}

/**
 * Obtiene la lista de solicitudes de instructor
 * @param status - Filtrar por estado (pending, approved, rejected)
 */
export async function getInstructorApplications(
    status?: 'pending' | 'approved' | 'rejected'
): Promise<InstructorApplicationsResponse> {
    const url = status
        ? `/admin/instructor-applications/?status=${status}`
        : '/admin/instructor-applications/';

    const response = await apiRequest<InstructorApplicationsResponse>(url, {
        method: 'GET',
    });
    return response as unknown as InstructorApplicationsResponse;
}

/**
 * Aprueba una solicitud de instructor
 */
export async function approveInstructorApplication(
    applicationId: number
): Promise<ApplicationActionResponse> {
    const response = await apiRequest<ApplicationActionResponse>(
        `/admin/instructor-applications/${applicationId}/approve/`,
        {
            method: 'POST',
        }
    );
    return response as unknown as ApplicationActionResponse;
}

/**
 * Rechaza una solicitud de instructor
 */
export async function rejectInstructorApplication(
    applicationId: number,
    data?: RejectApplicationRequest
): Promise<ApplicationActionResponse> {
    const response = await apiRequest<ApplicationActionResponse>(
        `/admin/instructor-applications/${applicationId}/reject/`,
        {
            method: 'POST',
            body: JSON.stringify(data || {}),
        }
    );
    return response as unknown as ApplicationActionResponse;
}

