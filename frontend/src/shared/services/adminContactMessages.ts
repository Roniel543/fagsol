/**
 * Servicios de API para Gestión de Mensajes de Contacto (Admin)
 * Conecta el frontend con el backend de Django
 */

import { apiRequest } from './api';

/**
 * Mensaje de contacto del backend
 */
export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    status_display: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    read_at: string | null;
}

/**
 * Parámetros para listar mensajes de contacto
 */
export interface ListContactMessagesParams {
    status?: 'new' | 'read' | 'replied' | 'archived';
    search?: string;
}

/**
 * Respuesta del backend para lista de mensajes
 */
export interface ListContactMessagesResponse {
    success: boolean;
    data: ContactMessage[];
    count: number;
}

/**
 * Request para actualizar un mensaje
 */
export interface UpdateContactMessageRequest {
    status?: 'new' | 'read' | 'replied' | 'archived';
    admin_notes?: string;
}

/**
 * Respuesta del backend para actualizar mensaje
 */
export interface UpdateContactMessageResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        status: string;
        status_display: string;
        admin_notes: string | null;
        read_at: string | null;
    };
}

/**
 * Lista todos los mensajes de contacto (Admin)
 */
export async function listContactMessages(params?: ListContactMessagesParams): Promise<ListContactMessagesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
        queryParams.append('status', params.status);
    }

    if (params?.search) {
        queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/admin/contact-messages/${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<ListContactMessagesResponse>(endpoint);
    return response as unknown as ListContactMessagesResponse;
}

/**
 * Actualiza un mensaje de contacto (Admin)
 */
export async function updateContactMessage(
    messageId: number,
    data: UpdateContactMessageRequest
): Promise<UpdateContactMessageResponse> {
    const response = await apiRequest<UpdateContactMessageResponse>(
        `/admin/contact-messages/${messageId}/`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        }
    );
    return response as unknown as UpdateContactMessageResponse;
}

