/**
 * Servicios de API para Contacto
 * Conecta el frontend con el backend de Django
 */

import { apiRequest } from './api';

/**
 * Datos del formulario de contacto
 */
export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

/**
 * Errores de validación del formulario
 */
export interface ContactFormErrors {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
}

/**
 * Respuesta del endpoint de contacto
 */
export interface ContactResponse {
    success: boolean;
    message: string;
    errors?: ContactFormErrors;
}

/**
 * Envía un mensaje de contacto
 * POST /api/v1/contact/
 * 
 * @param formData - Datos del formulario de contacto
 * @returns Respuesta del servidor
 */
export async function sendContactMessage(formData: ContactFormData): Promise<ContactResponse> {
    // Este endpoint es público, no requiere autenticación
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const url = `${baseUrl}/contact/`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Si hay errores de validación (400) o rate limit (429), retornar la respuesta
        if (response.status === 400 || response.status === 429) {
            return data as ContactResponse;
        }
        // Para otros errores, lanzar excepción
        throw new Error(data.message || 'Error al enviar el mensaje');
    }
    
    return data as ContactResponse;
}

