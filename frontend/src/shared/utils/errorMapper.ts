/**
 * Mapeo de errores del backend a mensajes amigables para el usuario
 * 
 * Este módulo centraliza el manejo de errores y proporciona mensajes
 * consistentes y seguros (sin filtrar detalles internos sensibles)
 */

export interface ApiError {
    message?: string;
    errors?: Record<string, string[]>;
    status?: number;
    statusText?: string;
}

export interface ErrorMapping {
    userMessage: string;
    logMessage?: string;
    code?: string;
}

/**
 * Mapea códigos de error de Mercado Pago a mensajes amigables
 */
const mercadoPagoErrorMap: Record<string, string> = {
    'cc_rejected_other_reason': 'Tu tarjeta fue rechazada. Por favor, verifica los datos o intenta con otra tarjeta.',
    'cc_rejected_call_for_authorize': 'Necesitas autorizar este pago. Por favor, contacta a tu banco.',
    'cc_rejected_card_disabled': 'Tu tarjeta está deshabilitada. Por favor, contacta a tu banco.',
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en tu tarjeta.',
    'cc_rejected_bad_filled_card_number': 'El número de tarjeta es incorrecto.',
    'cc_rejected_bad_filled_date': 'La fecha de vencimiento es incorrecta.',
    'cc_rejected_bad_filled_other': 'Algunos datos de la tarjeta son incorrectos.',
    'cc_rejected_bad_filled_security_code': 'El código de seguridad (CVV) es incorrecto.',
    'cc_rejected_high_risk': 'El pago fue rechazado por medidas de seguridad de Mercado Pago. Esto puede ocurrir en pagos nuevos o con montos muy bajos. Por favor, intenta con otra tarjeta o contacta a Mercado Pago.',
    'cc_rejected_max_attempts': 'Has excedido el número máximo de intentos. Intenta más tarde.',
    'cc_rejected_card_error': 'Error al procesar tu tarjeta. Intenta nuevamente.',
    'cc_rejected_duplicated_payment': 'Ya existe un pago con estos datos.',
    'cc_rejected_invalid_installments': 'El número de cuotas no es válido.',
    'cc_rejected_fraud': 'El pago fue rechazado por medidas de seguridad.',
};

/**
 * Mapea códigos de estado HTTP a mensajes amigables
 */
const httpErrorMap: Record<number, string> = {
    400: 'Los datos enviados son inválidos. Por favor, verifica la información.',
    401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    409: 'Ya existe un registro con estos datos.',
    422: 'Los datos enviados no son válidos. Por favor, verifica la información.',
    429: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.',
    500: 'Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.',
    502: 'El servidor no está disponible temporalmente. Por favor, intenta más tarde.',
    503: 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.',
};

/**
 * Extrae el mensaje de error de una respuesta de la API
 */
export function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError;
        
        // Intentar obtener mensaje del backend
        if (apiError.message) {
            return apiError.message;
        }
        
        // Intentar obtener mensajes de validación
        if (apiError.errors) {
            const firstError = Object.values(apiError.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
                return firstError[0];
            }
        }
    }
    
    return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
}

/**
 * Mapea un error a un mensaje amigable para el usuario
 */
export function mapErrorToUserMessage(error: unknown, context?: string): ErrorMapping {
    const errorMessage = extractErrorMessage(error);
    
    // Si el mensaje ya es amigable (viene del backend traducido), usarlo directamente
    // Verificar si el mensaje coincide con alguno de nuestros mensajes traducidos
    const translatedMessages = Object.values(mercadoPagoErrorMap);
    if (translatedMessages.some(msg => errorMessage === msg || errorMessage.includes(msg))) {
        return {
            userMessage: errorMessage,
            logMessage: errorMessage,
        };
    }
    
    // Verificar si es un error de Mercado Pago por código
    for (const [code, message] of Object.entries(mercadoPagoErrorMap)) {
        if (errorMessage.toLowerCase().includes(code) || errorMessage.toLowerCase().includes(code.replace(/_/g, ' '))) {
            return {
                userMessage: message,
                logMessage: errorMessage,
                code,
            };
        }
    }
    
    // Verificar si es un error HTTP
    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError;
        if (apiError.status && httpErrorMap[apiError.status]) {
            return {
                userMessage: httpErrorMap[apiError.status],
                logMessage: errorMessage,
                code: `HTTP_${apiError.status}`,
            };
        }
    }
    
    // Mensajes específicos por contexto
    if (context === 'payment') {
        if (errorMessage.toLowerCase().includes('amount') || errorMessage.toLowerCase().includes('monto')) {
            return {
                userMessage: 'El monto del pago no es válido. Por favor, intenta nuevamente.',
                logMessage: errorMessage,
            };
        }
        if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('token')) {
            return {
                userMessage: 'Error al procesar los datos de la tarjeta. Por favor, intenta nuevamente.',
                logMessage: errorMessage,
            };
        }
        if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('expirado')) {
            return {
                userMessage: 'La sesión de pago ha expirado. Por favor, inicia el proceso nuevamente.',
                logMessage: errorMessage,
            };
        }
    }
    
    if (context === 'auth') {
        if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credenciales')) {
            return {
                userMessage: 'Las credenciales son incorrectas. Por favor, verifica tu email y contraseña.',
                logMessage: errorMessage,
            };
        }
        if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('expirado')) {
            return {
                userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                logMessage: errorMessage,
            };
        }
    }
    
    // Mensaje genérico si no se encuentra un mapeo específico
    // IMPORTANTE: No exponer detalles internos del error al usuario
    return {
        userMessage: 'Ocurrió un error inesperado. Por favor, intenta nuevamente. Si el problema persiste, contacta al soporte.',
        logMessage: errorMessage,
    };
}

/**
 * Formatea un error para logging (incluye información adicional)
 */
export function formatErrorForLogging(error: unknown, context?: string): string {
    const errorMessage = extractErrorMessage(error);
    const contextInfo = context ? `[${context}] ` : '';
    
    if (error instanceof Error) {
        return `${contextInfo}${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
    }
    
    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError;
        return `${contextInfo}API Error (${apiError.status || 'unknown'}): ${errorMessage}`;
    }
    
    return `${contextInfo}${errorMessage}`;
}

/**
 * Determina si un error es recuperable (el usuario puede intentar nuevamente)
 */
export function isRecoverableError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError;
        
        // Errores 5xx son generalmente recuperables
        if (apiError.status && apiError.status >= 500) {
            return true;
        }
        
        // Errores 429 (rate limit) son recuperables después de esperar
        if (apiError.status === 429) {
            return true;
        }
        
        // Errores 401 pueden ser recuperables si se refresca el token
        if (apiError.status === 401) {
            return true;
        }
    }
    
    // Errores de red son recuperables
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return true;
    }
    
    return false;
}

