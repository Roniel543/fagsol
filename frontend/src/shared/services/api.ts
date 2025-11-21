import { ApiResponse, AuthResponse } from '@/shared/types';
import { clearTokens, getAccessToken, getRefreshToken, isTokenExpiringSoon, setTokens } from '@/shared/utils/tokenStorage';

// Configuración de la API
// NEXT_PUBLIC_API_URL se carga automáticamente desde .env en Next.js
// OBLIGATORIO: Debe estar definida en .env

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
    JWT_BASE_URL: getJwtBaseUrl(), // http://localhost:8000 (sin /api/v1)
    ENDPOINTS: {
        LOGIN: '/auth/login/',
        REGISTER: '/auth/register/',
        HEALTH: '/auth/health/',
        LOGOUT: '/auth/logout/',
        ME: '/auth/me/', // Obtener usuario actual
        REFRESH: '/api/token/refresh/', // Endpoint de Simple JWT
        // Payments endpoints (requieren backend)
        PAYMENT_INTENT: '/payments/intent/',
        PAYMENT_PROCESS: '/payments/process/',
    }
};

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresca el token de acceso usando el refresh token
 * Exportada para uso en otros módulos (ej: useAuth)
 */
export async function refreshAccessToken(): Promise<string | null> {
    // Si ya hay un refresh en curso, esperar a que termine
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${API_CONFIG.JWT_BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            if (data.access) {
                // El backend tiene ROTATE_REFRESH_TOKENS activado, así que puede enviar un nuevo refresh token
                // Si viene un nuevo refresh token, usarlo; si no, mantener el actual
                const newRefreshToken = data.refresh || getRefreshToken();
                if (newRefreshToken) {
                    setTokens(data.access, newRefreshToken);
                }
                return data.access;
            }

            throw new Error('No access token in refresh response');
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Si falla el refresh, limpiar tokens y forzar re-login
            clearTokens();
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Función base para hacer requests a la API con refresh automático
 */
export const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    // Asegurar que el endpoint comience con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;

    // Debug: mostrar URL en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.log('🔗 API Request:', url);
    }

    // Verificar si el token está próximo a expirar y refrescarlo preventivamente
    // Solo intentar refresh si hay un token actual (evita errores en login/register)
    const currentToken = getAccessToken();
    if (currentToken && isTokenExpiringSoon()) {
        try {
            await refreshAccessToken();
        } catch (error) {
            // Si falla el refresh preventivo, continuar con el request original
            // El request fallará con 401 y se manejará después
            console.warn('Preventive token refresh failed, continuing with original request');
        }
    }

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    // Añadir token de autorización si existe
    let token = getAccessToken();
    if (token) {
        defaultOptions.headers = {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    // Construir los headers finales que se usarán en la petición
    const finalHeaders = {
        ...defaultOptions.headers,
        ...(options.headers || {}),
    };

    // Construir las opciones finales para la petición
    const finalOptions: RequestInit = {
        ...defaultOptions,
        ...options,
        headers: finalHeaders,
    };

    try {
        let response = await fetch(url, finalOptions);

        // Si el token expiró (401), intentar refrescar y reintentar
        if (response.status === 401 && token) {
            console.log('🔄 Token expirado, intentando refrescar...');
            const newToken = await refreshAccessToken();

            if (newToken) {
                console.log('✅ Token refrescado exitosamente, reintentando petición...');
                // Reintentar con el nuevo token
                // IMPORTANTE: Preservar TODOS los headers originales y actualizar solo Authorization
                const retryOptions: RequestInit = {
                    method: finalOptions.method || 'GET',
                    headers: {
                        ...finalHeaders, // Preservar todos los headers originales
                        'Authorization': `Bearer ${newToken}`, // Sobrescribir solo Authorization
                    },
                    // Mantener el body original si existe
                    body: finalOptions.body,
                };

                // Copiar otros campos de finalOptions (como signal, etc.)
                if (finalOptions.signal) {
                    retryOptions.signal = finalOptions.signal;
                }

                response = await fetch(url, retryOptions);
            } else {
                // Si no se pudo refrescar, verificar si el refresh token también expiró
                console.warn('⚠️ No se pudo refrescar el token');
                // No limpiar tokens aquí, dejar que el código de abajo lo maneje
                // Solo lanzar error para que se maneje apropiadamente
                throw new Error('Authentication failed. Please login again.');
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
                console.warn('Could not parse error response:', e);
            }

            // Si sigue siendo 401 después del refresh, limpiar tokens
            if (response.status === 401) {
                clearTokens();
            }

            // Crear un error con el mensaje del backend
            const error = new Error(errorMessage);
            (error as any).status = response.status;
            (error as any).response = response;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
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
        const response = await apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
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
            // Intentar invalidar token en el servidor
            await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
                method: 'POST',
            });
        } catch (error) {
            // Si falla, igual limpiar tokens localmente
            console.error('Error during server-side logout:', error);
        } finally {
            // Siempre limpiar tokens localmente
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

        // Para FormData, no usar Content-Type: application/json
        const token = getAccessToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/apply-instructor/`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al enviar solicitud');
        }

        return await response.json();
    },
};
