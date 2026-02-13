import { ApiResponse, AuthResponse } from '@/shared/types';
import { logger } from '@/shared/utils/logger';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/shared/utils/tokenStorage';

// Configuración de la API

/**
 * Obtiene la URL base de la API de forma segura
 * Evita errores durante SSR si la variable no está disponible
 */
function getBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
        // En desarrollo, mostrar error más claro
        if (process.env.NODE_ENV === 'development') {
            console.error(
                'NEXT_PUBLIC_API_URL no está definida.\n' +
                'Por favor, agrega NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 en tu archivo .env'
            );
        }
        // Valor por defecto para evitar errores en SSR
        return 'http://localhost:8000/api/v1';
    }

    return baseUrl;
}

const baseUrl = getBaseUrl();

// Extraer la URL base sin el path /api/v1 para endpoints JWT
function getJwtBaseUrl(): string {
    // Si baseUrl es "http://localhost:8000/api/v1", extraer "http://localhost:8000"
    try {
        const url = new URL(baseUrl);
        return `${url.protocol}//${url.host}`;
    } catch {
        // Fallback si hay error al parsear URL
        return baseUrl.replace(/\/api\/v1.*$/, '');
    }
}

export const API_CONFIG = {
    BASE_URL: baseUrl,
    ENDPOINTS: {
        LOGIN: '/auth/login/',
        REGISTER: '/auth/register/',
        HEALTH: '/auth/health/',
        LOGOUT: '/auth/logout/',
        REFRESH: '/auth/refresh/', // Endpoint de refresh con cookies
        ME: '/auth/me/', // Obtener usuario actual
        // Payments endpoints (requieren backend)
        PAYMENT_INTENT: '/payments/intent/',
        PAYMENT_PROCESS: '/payments/process/',
    }
};

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresca el access token usando cookie o, si no hay cookies (third-party bloqueadas), el refresh en body.
 * Permite que la app funcione sin cookies de terceros (ej. Chrome con "Bloquear cookies de terceros").
 *
 * @returns true si el refresh fue exitoso, false en caso contrario
 */
export async function refreshAccessToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshFromStorage = typeof window !== 'undefined' ? getRefreshToken() : null;

            // Enviar refresh en el body cuando esté en storage: evita depender de cookies
            // (Chrome y otros navegadores pueden bloquear cookies de terceros en fagsol.com → API)
            const body = refreshFromStorage
                ? JSON.stringify({ refresh: refreshFromStorage })
                : undefined;

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                ...(body ? { body } : {}),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json().catch(() => ({}));
            if (data.tokens?.access && data.tokens?.refresh) {
                setTokens(data.tokens.access, data.tokens.refresh);
            }
            return true;
        } catch (error) {
            logger.debug('Error refreshing token (normal si no hay sesión activa)');
            clearTokens();
            return false;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/** Construye headers incluyendo Bearer si hay access token (para funcionar sin cookies de terceros). */
function buildRequestHeaders(overrides: HeadersInit = {}): HeadersInit {
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    const fromOverrides = overrides && typeof overrides === 'object' && !(overrides instanceof Headers)
        ? (overrides as Record<string, string>)
        : {};
    const headers: Record<string, string> = { ...base, ...fromOverrides };
    const access = typeof window !== 'undefined' ? getAccessToken() : null;
    if (access) {
        headers['Authorization'] = `Bearer ${access}`;
    }
    return headers;
}

/**
 * Función base para hacer requests a la API con refresh automático.
 * Usa cookies y, si hay token en storage, Authorization Bearer (funciona sin cookies de terceros).
 */
export const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;

    logger.apiRequest(options.method || 'GET', normalizedEndpoint);

    const mergedHeaders = buildRequestHeaders(options.headers as Record<string, string>);
    const finalOptions: RequestInit = {
        ...options,
        credentials: options.credentials ?? 'include',
        headers: mergedHeaders,
    };

    try {
        let response = await fetch(url, finalOptions);

        const isAuthEndpoint = normalizedEndpoint.includes('/auth/login') ||
            normalizedEndpoint.includes('/auth/register') ||
            normalizedEndpoint.includes('/auth/logout');

        if (response.status === 401 && !isAuthEndpoint) {
            logger.auth('Token expirado, intentando refrescar...');
            const originalResponse = response.clone();
            const refreshSuccess = await refreshAccessToken();

            if (refreshSuccess) {
                logger.auth('Token refrescado exitosamente, reintentando petición...');
                const retryOptions: RequestInit = {
                    ...finalOptions,
                    headers: buildRequestHeaders(options.headers as Record<string, string>),
                };
                response = await fetch(url, retryOptions);
            } else {
                logger.warn('No se pudo refrescar el token');
                response = originalResponse;
            }
        }
        if (!response.ok) {
            // Intentar obtener el mensaje de error del backend
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } catch (e) {
                // Si no se puede parsear JSON, usar el mensaje por defecto
                logger.debug('Could not parse error response');
            }

            // Si sigue siendo 401 después del refresh, limpiar tokens locales (si existen)
            if (response.status === 401) {
                clearTokens(); // Limpiar cualquier token residual en storage
            }

            // Crear un error ccon el mensaje del backend
            const error = new Error(errorMessage);
            (error as any).status = response.status;
            (error as any).response = response;
            throw error;
        }

        return await response.json();
    } catch (error) {
        // Log del error sin exponer información sensible
        if (error instanceof Error) {
            logger.apiError(normalizedEndpoint, (error as any).status || 0, error.message);
        } else {
            logger.error('API Request Error', error);
        }

        // Si el error ya tiene un mensaje, mantenerlo
        if (error instanceof Error && error.message) {
            throw error;
        }
        // Si es un error de red u otro tipo, lanzar error genérico
        throw new Error('Error de conexión con el servidor');
    }
};

// Funciones específicas para diferentes módulos
export const authAPI = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        // IMPORTANTE: Limpiar espacios en blanco antes de enviar
        const cleanedEmail = email.trim();
        const cleanedPassword = password.trim();

        const response = await apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({
                email: cleanedEmail,
                password: cleanedPassword
            }),
        });
        return response as unknown as AuthResponse;
    },

    register: async (userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role: string;
    }): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
        }) as Promise<AuthResponse>;
    },

    logout: async (): Promise<void> => {
        try {
            // Invalidar token en el servidor (las cookies se limpian automáticamente)
            await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
                method: 'POST',
            });
        } catch (error) {
            // Si falla, igual limpiar tokens locales (si existen)
            logger.debug('Error during server-side logout (puede ser normal si no hay sesión)');
        } finally {
            // Limpiar tokens locales residuales (si existen)
            clearTokens();
        }
    },

    healthCheck: async () => {
        return apiRequest(API_CONFIG.ENDPOINTS.HEALTH);
    },

    getCurrentUser: async (): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.ME) as Promise<AuthResponse>;
    },

    applyToBeInstructor: async (data: {
        professional_title?: string;
        experience_years?: number;
        specialization?: string;
        bio?: string;
        portfolio_url?: string;
        motivation: string;
        cv_file?: File;
    }): Promise<ApiResponse> => {
        const formData = new FormData();

        if (data.professional_title) formData.append('professional_title', data.professional_title);
        if (data.experience_years !== undefined) formData.append('experience_years', data.experience_years.toString());
        if (data.specialization) formData.append('specialization', data.specialization);
        if (data.bio) formData.append('bio', data.bio);
        if (data.portfolio_url) formData.append('portfolio_url', data.portfolio_url);
        formData.append('motivation', data.motivation);
        if (data.cv_file) formData.append('cv_file', data.cv_file);

        // Para FormData, no usar Content-Type (el navegador lo establece automáticamente)
        // Las cookies se envían automáticamente con credentials: 'include'
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/apply-instructor/`, {
            method: 'POST',
            credentials: 'include', // IMPORTANTE: Incluir cookies
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al enviar solicitud');
        }

        return await response.json();
    },

    // Password Reset Functions
    forgotPassword: async (email: string): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/auth/forgot-password/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (
        uid: string,
        token: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<ApiResponse> => {
        return apiRequest<ApiResponse>('/auth/reset-password/', {
            method: 'POST',
            body: JSON.stringify({
                uid,
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        });
    },

    validateResetToken: async (uid: string, token: string): Promise<ApiResponse & { valid?: boolean }> => {
        // El backend retorna { success: true, valid: true } directamente
        // apiRequest retorna el JSON tal cual del backend (no lo envuelve en 'data')
        const response = await apiRequest(`/auth/reset-password/validate/${uid}/${token}/`);
        // El backend retorna { success: true, valid: true } directamente
        // Necesitamos extraer 'valid' del objeto raíz porque apiRequest retorna el JSON tal cual
        return {
            ...response,
            valid: (response as any).valid ?? false,
        } as ApiResponse & { valid: boolean };
    },
};
