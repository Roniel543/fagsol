/**
 * Servicio de Pagos Seguro
 * 
 * IMPORTANTE: Este servicio NO calcula precios en el frontend.
 * El backend valida y calcula todos los precios desde la base de datos.
 */

import { apiRequest } from './api';

// Tipos para pagos
export interface PaymentIntent {
    id: string;
    total: number;
    currency: string;
    items: PaymentItem[];
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    created_at: string;
}

export interface PaymentItem {
    course_id: string;
    course_title: string;
    price: number; // Solo para mostrar en UI, NO se usa para validación
}

export interface CreatePaymentIntentRequest {
    course_ids: string[]; // ✅ Solo IDs, NO precios
}

export interface CreatePaymentIntentResponse {
    success: boolean;
    data?: PaymentIntent;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ProcessPaymentRequest {
    payment_intent_id: string;
    payment_token: string; // Token de Mercado Pago (tokenización client-side)
    //  NO incluir: card_number, cvv, expiration_date, amount, price osea solo el token de mercado pago
}

export interface ProcessPaymentResponse {
    success: boolean;
    data?: {
        payment_id: string;
        status: 'approved' | 'rejected' | 'pending';
        enrollment_ids?: string[];
    };
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Crea un payment intent en el backend
 * El backend valida cursos, calcula precios y retorna el total
 * 
 * @param courseIds - Array de IDs de cursos (NO incluir precios)
 * @returns PaymentIntent con total calculado por backend
 */
export async function createPaymentIntent(
    courseIds: string[]
): Promise<CreatePaymentIntentResponse> {
    if (!courseIds || courseIds.length === 0) {
        return {
            success: false,
            message: 'No se han seleccionado cursos'
        };
    }

    try {
        const response = await apiRequest<{ data: PaymentIntent }>(
            '/payments/intent/',
            {
                method: 'POST',
                body: JSON.stringify({
                    course_ids: courseIds // ✅ Solo IDs
                } as CreatePaymentIntentRequest),
            }
        );

        // apiRequest retorna ApiResponse<T>, necesitamos extraer el contenido
        return {
            success: response.success,
            data: response.data?.data,
            message: response.message,
            errors: response.errors,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            success: false,
            message: 'Error al crear la intención de pago. Por favor, intenta nuevamente.'
        };
    }
}

/**
 * Procesa el pago con Mercado Pago
 * 
 * IMPORTANTE: Solo envía el token de Mercado Pago (tokenización client-side).
 * NUNCA envía datos de tarjeta directamente.
 * 
 * @param paymentIntentId - ID del payment intent creado
 * @param paymentToken - Token de Mercado Pago (obtenido client-side)
 * @returns Resultado del pago
 */
export async function processPayment(
    paymentIntentId: string,
    paymentToken: string
): Promise<ProcessPaymentResponse> {
    if (!paymentIntentId || !paymentToken) {
        return {
            success: false,
            message: 'Datos de pago incompletos'
        };
    }

    try {
        const response = await apiRequest<{ data: ProcessPaymentResponse['data'] }>(
            '/payments/process/',
            {
                method: 'POST',
                body: JSON.stringify({
                    payment_intent_id: paymentIntentId,
                    payment_token: paymentToken // ✅ Solo token, NO datos de tarjeta
                } as ProcessPaymentRequest),
            }
        );

        // apiRequest retorna ApiResponse<T>, necesitamos extraer el contenido
        return {
            success: response.success,
            data: response.data?.data,
            message: response.message,
            errors: response.errors,
        };
    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            message: 'Error al procesar el pago. Por favor, intenta nuevamente.'
        };
    }
}

/**
 * Obtiene el estado de un payment intent
 */
export async function getPaymentIntent(
    paymentIntentId: string
): Promise<CreatePaymentIntentResponse> {
    try {
        const response = await apiRequest<{ data: PaymentIntent }>(
            `/payments/intent/${paymentIntentId}/`,
            {
                method: 'GET',
            }
        );

        // apiRequest retorna ApiResponse<T>, necesitamos extraer el contenido
        return {
            success: response.success,
            data: response.data?.data,
            message: response.message,
            errors: response.errors,
        };
    } catch (error) {
        console.error('Error getting payment intent:', error);
        return {
            success: false,
            message: 'Error al obtener la información del pago.'
        };
    }
}

