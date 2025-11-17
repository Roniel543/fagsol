/**
 * Servicio de API para gestión de instructores
 * FASE 1: Sistema de aprobación de instructores
 */

import { apiRequest } from './api';

export interface Instructor {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    instructor_status: 'pending_approval' | 'approved' | 'rejected';
    created_at: string;
    phone?: string;
    is_email_verified?: boolean;
    approved_by?: {
        id: number;
        email: string;
    };
    approved_at?: string;
    rejection_reason?: string;
}

export interface InstructorsResponse {
    success: boolean;
    data: Instructor[];
    count: number;
    message?: string;
}

export interface ApproveInstructorRequest {
    notes?: string;
}

export interface RejectInstructorRequest {
    rejection_reason: string;
}

export interface InstructorActionResponse {
    success: boolean;
    data: {
        instructor: Instructor;
    };
    message?: string;
}

/**
 * Obtiene la lista de instructores pendientes de aprobación
 */
export async function getPendingInstructors(): Promise<InstructorsResponse> {
    const response = await apiRequest<InstructorsResponse>('/admin/instructors/pending/', {
        method: 'GET',
    });
    return response as unknown as InstructorsResponse;
}

/**
 * Obtiene todos los instructores con filtro opcional por estado
 */
export async function getAllInstructors(
    status?: 'pending_approval' | 'approved' | 'rejected'
): Promise<InstructorsResponse> {
    const url = status
        ? `/admin/instructors/?status=${status}`
        : '/admin/instructors/';

    const response = await apiRequest<InstructorsResponse>(url, {
        method: 'GET',
    });
    return response as unknown as InstructorsResponse;
}

/**
 * Aprueba un instructor pendiente
 */
export async function approveInstructor(
    instructorId: number,
    data?: ApproveInstructorRequest
): Promise<InstructorActionResponse> {
    const response = await apiRequest<InstructorActionResponse>(
        `/admin/instructors/${instructorId}/approve/`,
        {
            method: 'POST',
            body: JSON.stringify(data || {}),
        }
    );
    return response as unknown as InstructorActionResponse;
}

/**
 * Rechaza un instructor pendiente
 */
export async function rejectInstructor(
    instructorId: number,
    data: RejectInstructorRequest
): Promise<InstructorActionResponse> {
    const response = await apiRequest<InstructorActionResponse>(
        `/admin/instructors/${instructorId}/reject/`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
    return response as unknown as InstructorActionResponse;
}

