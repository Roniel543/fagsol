/**
 * Servicio de Pagos Seguro
 * 
 * IMPORTANTE: Este servicio NO calcula precios en el frontend.
 * El backend valida y calcula todos los precios desde la base de datos.
 * 
 * Usa Mercado Pago Bricks (CardPayment Brick) para tokenización client-side.
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
    token: string; // Token de Mercado Pago (obtenido de CardPayment Brick)
    payment_method_id: string; // Payment method ID (ej: "visa", "master")
    installments: number; // Número de cuotas
    amount: number; // Monto (validado por backend)
    payment_intent_id: string; // ID del payment intent
    idempotency_key?: string; // Clave de idempotencia (opcional, se genera si no se proporciona)
}

export interface ProcessPaymentResponse {
    success: boolean;
    data?: {
        payment_id: string;
        status: 'approved' | 'rejected' | 'pending';
        enrollment_ids?: string[];
        amount?: number;
        currency?: string;
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
        const response = await apiRequest<PaymentIntent>(
            '/payments/intent/',
            {
                method: 'POST',
                body: JSON.stringify({
                    course_ids: courseIds // ✅ Solo IDs
                } as CreatePaymentIntentRequest),
            }
        );

        // apiRequest retorna ApiResponse<T>, donde T es PaymentIntent
        // El backend retorna: { success: true, data: PaymentIntent }
        return {
            success: response.success || false,
            data: response.data, // PaymentIntent viene en response.data
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
 * Procesa el pago con Mercado Pago usando token de CardPayment Brick
 * 
 * IMPORTANTE: Solo envía el token de Mercado Pago (tokenización client-side con Bricks).
 * NUNCA envía datos de tarjeta directamente.
 * 
 * @param paymentIntentId - ID del payment intent creado
 * @param token - Token de Mercado Pago (obtenido de CardPayment Brick)
 * @param paymentMethodId - Payment method ID (ej: "visa", "master")
 * @param installments - Número de cuotas
 * @param amount - Monto (será validado por backend contra DB)
 * @param idempotencyKey - Clave de idempotencia (opcional)
 * @returns Resultado del pago
 */
export async function processPayment(
    paymentIntentId: string,
    token: string,
    paymentMethodId: string,
    installments: number,
    amount: number,
    idempotencyKey?: string
): Promise<ProcessPaymentResponse> {
    if (!paymentIntentId || !token || !paymentMethodId || !installments || !amount) {
        return {
            success: false,
            message: 'Datos de pago incompletos'
        };
    }

    try {
        // Generar idempotency key si no se proporciona
        const finalIdempotencyKey = idempotencyKey || `${paymentIntentId}_${Date.now()}`;

        const response = await apiRequest<ProcessPaymentResponse['data']>(
            '/payments/process/',
            {
                method: 'POST',
                headers: {
                    'X-Idempotency-Key': finalIdempotencyKey,
                },
                body: JSON.stringify({
                    token,
                    payment_method_id: paymentMethodId,
                    installments,
                    amount,
                    payment_intent_id: paymentIntentId,
                    idempotency_key: finalIdempotencyKey,
                } as ProcessPaymentRequest),
            }
        );

        // apiRequest retorna ApiResponse<T>, donde T es ProcessPaymentResponse['data']
        return {
            success: response.success || false,
            data: response.data, // Los datos vienen directamente en response.data
            message: response.message,
            errors: response.errors,
        };
    } catch (error: any) {
        console.error('Error processing payment:', error);
        // Preservar el mensaje del backend si está disponible
        const errorMessage = error?.message || error?.response?.message || 'Error al procesar el pago. Por favor, intenta nuevamente.';
        return {
            success: false,
            message: errorMessage
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

// Tipos para historial de pagos
export interface PaymentHistoryItem {
    id: string;
    payment_intent_id: string;
    amount: number | string; // DRF DecimalField se serializa como string
    currency: string;
    status: 'approved' | 'rejected' | 'pending' | 'refunded' | 'cancelled';
    installments: number;
    mercado_pago_payment_id: string | null;
    created_at: string;
    course_names: string[];
    course_ids: string[];
}

export interface PaymentHistoryResponse {
    success: boolean;
    data?: {
        count: number;
        next: string | null;
        previous: string | null;
        page: number;
        page_size: number;
        results: PaymentHistoryItem[];
    };
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Obtiene el historial de pagos del usuario autenticado
 * 
 * @param page - Número de página (default: 1)
 * @param pageSize - Tamaño de página (default: 10, max: 100)
 * @param status - Filtrar por estado (opcional)
 * @returns Historial de pagos paginado
 */
export async function getPaymentHistory(
    page: number = 1,
    pageSize: number = 10,
    status?: string
): Promise<PaymentHistoryResponse> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: Math.min(pageSize, 100).toString(),
        });
        
        if (status) {
            params.append('status', status);
        }
        
        const response = await apiRequest<PaymentHistoryResponse['data']>(
            `/payments/history/?${params.toString()}`,
            {
                method: 'GET',
            }
        );
        
        return {
            success: response.success || false,
            data: response.data,
            message: response.message,
            errors: response.errors,
        };
    } catch (error) {
        console.error('Error getting payment history:', error);
        return {
            success: false,
            message: 'Error al obtener el historial de pagos. Por favor, intenta nuevamente.'
        };
    }
}
