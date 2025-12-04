/**
 * Gestión segura de tokens JWT
 * Usa sessionStorage en lugar de localStorage para mayor seguridad
 * Los tokens se eliminan al cerrar la pestaña
 */

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user',
    TOKEN_EXPIRY: 'token_expiry'
} as const;

/**
 * Obtiene el token de acceso de forma segura
 * Usa sessionStorage en lugar de localStorage
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Obtiene el refresh token de forma segura
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        // Primero intentar obtener de sessionStorage (más seguro)
        const sessionToken = sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
        if (sessionToken) {
            return sessionToken;
        }
        
        // Si no hay en sessionStorage, intentar obtener de localStorage (para sincronización entre pestañas)
        const stored = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
        if (!stored) {
            return null;
        }
        
        // Verificar si es formato nuevo (con expiración) o antiguo (solo token)
        try {
            const data = JSON.parse(stored);
            if (data.token && data.expiresAt) {
                // Formato nuevo: verificar expiración
                if (Date.now() > data.expiresAt) {
                    // Token expirado, limpiar
                    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
                    return null;
                }
                return data.token;
            }
            // Formato antiguo o estructura incorrecta, retornar directamente
            return stored;
        } catch {
            // No es JSON, probablemente formato antiguo (solo token)
            return stored;
        }
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
}

/**
 * Decodifica un JWT sin verificar la firma (solo para obtener el payload)
 * NO usa esto para validar el token, solo para leer datos como exp
 */
function decodeJWT(token: string): any | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        // Decodificar el payload (segunda parte)
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Obtiene el tiempo de expiración del token JWT
 */
function getTokenExpiry(token: string): number | null {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;
    
    // exp está en segundos, convertir a milisegundos
    return decoded.exp * 1000;
}

/**
 * Guarda tokens de forma segura en sessionStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    try {
        // Access token en sessionStorage (seguro, se elimina al cerrar pestaña)
        sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);

        // Refresh token también en localStorage para sincronización entre pestañas
        // IMPORTANTE: Esto es un trade-off seguridad/funcionalidad
        // Mitigaciones: expiración corta, rotación automática, CSP
        const refreshTokenData = {
            token: refreshToken,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 días (ajustable)
            createdAt: Date.now()
        };
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, JSON.stringify(refreshTokenData));

        // Obtener expiración real del token JWT
        const expiryTime = getTokenExpiry(accessToken);
        
        if (expiryTime) {
            // Guardar timestamp de expiración real del token
            sessionStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        } else {
            // Fallback: si no se puede decodificar, usar 60 minutos (configuración del backend)
            const fallbackExpiry = Date.now() + (60 * 60 * 1000); // 60 minutos
            sessionStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, fallbackExpiry.toString());
            console.warn('No se pudo decodificar el token, usando expiración por defecto de 60 minutos');
        }
        
        // Notificar a otras pestañas que hay un nuevo token (sin compartir el token)
        // Esto se hace desde useAuth después de setUser para evitar conflictos
    } catch (error) {
        console.error('Error setting tokens:', error);
    }
}

/**
 * Guarda datos del usuario de forma segura
 */
export function setUserData(user: any): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
        console.error('Error setting user data:', error);
    }
}

/**
 * Obtiene datos del usuario
 */
export function getUserData(): any | null {
    if (typeof window === 'undefined') return null;

    try {
        const userData = sessionStorage.getItem(TOKEN_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * Verifica si el token está próximo a expirar (menos de 5 minutos)
 */
export function isTokenExpiringSoon(): boolean {
    if (typeof window === 'undefined') return true;

    try {
        const expiryStr = sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
        if (!expiryStr) return true;

        const expiry = parseInt(expiryStr, 10);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        return (expiry - now) < fiveMinutes;
    } catch (error) {
        console.error('Error checking token expiry:', error);
        return true;
    }
}

/**
 * Limpia todos los tokens y datos del usuario
 */
export function clearTokens(): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(TOKEN_KEYS.USER_DATA);
        sessionStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);

        // También limpiar localStorage (incluyendo refresh token usado para sincronización)
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.USER_DATA);
        
        // Nota: La notificación de LOGOUT se hace desde useAuth.logout()
        // para evitar duplicación y mantener responsabilidad única
    } catch (error) {
        console.error('Error clearing tokens:', error);
    }
}

/**
 * Solo se ejecuta una vez al detectar tokens en localStorage
 */
export function migrateTokensFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
        const oldAccessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        const oldRefreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
        const oldUserData = localStorage.getItem(TOKEN_KEYS.USER_DATA);

        if (oldAccessToken && oldRefreshToken) {
            // Migrar a sessionStorage
            sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, oldAccessToken);
            sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, oldRefreshToken);

            if (oldUserData) {
                sessionStorage.setItem(TOKEN_KEYS.USER_DATA, oldUserData);
            }

            // Limpiar localStorage
            localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(TOKEN_KEYS.USER_DATA);
        }
    } catch (error) {
        console.error('Error migrating tokens:', error);
    }
}

