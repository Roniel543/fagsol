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
        return sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
}

/**
 * Guarda tokens de forma segura en sessionStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);

        // Calcular expiración (típicamente JWT expira en 15 minutos)
        // Guardamos timestamp de expiración para verificar después
        const expiryTime = Date.now() + (15 * 60 * 1000); // 15 minutos
        sessionStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
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

        // También limpiar localStorage por si acaso hay datos antiguos
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.USER_DATA);
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

