'use client';

import { authAPI } from '@/shared/services/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/types';
// clearTokens solo para limpiar tokens residuales en storage (si existen)
import { logger } from '@/shared/utils/logger';
import { clearTokens, setTokens } from '@/shared/utils/tokenStorage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loadingUser: boolean;
    login: (credentials: LoginRequest) => Promise<AuthResponse>;
    register: (userData: RegisterRequest) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // IMPORTANTE: Siempre empezar con null y loadingUser = true para SSR
    // Esto asegura que servidor y cliente rendericen lo mismo inicialmente
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const router = useRouter();

    // Flag para evitar revalidaciones durante login/logout en la misma pestaña
    const isProcessingAuth = useRef(false);

    // ID único de esta pestaña para identificar mensajes propios
    const tabId = useRef(Math.random().toString(36).substring(7));

    useEffect(() => {
        /**
         * Valida el usuario en background con la API
         */
        const validateUserInBackground = async () => {
            // Evitar revalidar si estamos procesando login/logout
            if (isProcessingAuth.current) {
                return;
            }

            // Validar sesión con el backend (las cookies se envían automáticamente)
            try {
                const response = await authAPI.getCurrentUser();

                if (response.success && response.user) {
                    // Sesión válida, actualizar usuario con datos frescos
                    setUser(response.user);
                } else {
                    // Sesión inválida, intentar refrescar antes de limpiar
                    logger.debug('Sesión inválida, intentando refrescar...');
                    try {
                        const { refreshAccessToken } = await import('@/shared/services/api');
                        const refreshSuccess = await refreshAccessToken();

                        if (refreshSuccess) {
                            // Si se pudo refrescar, intentar obtener el usuario nuevamente
                            const retryResponse = await authAPI.getCurrentUser();
                            if (retryResponse.success && retryResponse.user) {
                                setUser(retryResponse.user);
                            } else {
                                // Limpiar tokens residuales en storage (si existen)
                                clearTokens();
                                setUser(null);
                            }
                        } else {
                            // No se pudo refrescar, limpiar tokens residuales
                            clearTokens();
                            setUser(null);
                        }
                    } catch (refreshError) {
                        logger.debug('Error refreshing token (normal si no hay sesión activa)');
                        clearTokens();
                        setUser(null);
                    }
                }
            } catch (error) {
                // Error al validar sesión (token expirado, inválido, etc.)
                // No loguear errores de autenticación cuando no hay sesión (es normal)
                logger.debug('Error validating session (normal si no hay sesión activa)');

                // Intentar refrescar antes de limpiar
                try {
                    const { refreshAccessToken } = await import('@/shared/services/api');
                    const refreshSuccess = await refreshAccessToken();

                    if (refreshSuccess) {
                        // Si se pudo refrescar, intentar obtener el usuario nuevamente
                        const retryResponse = await authAPI.getCurrentUser();
                        if (retryResponse.success && retryResponse.user) {
                            setUser(retryResponse.user);
                        } else {
                            clearTokens();
                            setUser(null);
                        }
                    } else {
                        clearTokens();
                        setUser(null);
                    }
                } catch (refreshError) {
                    // Si el refresh también falla, limpiar tokens residuales
                    logger.debug('Error refreshing token during validation (normal si no hay sesión activa)');
                    clearTokens();
                    setUser(null);
                }
            } finally {
                setLoadingUser(false);
            }
        };

        // Validar usuario al montar el componente
        validateUserInBackground();

        /**
         * Escuchar eventos de sincronización entre pestañas usando BroadcastChannel
         * Solo para sincronizar cuando otra pestaña hace login/logout
         */
        let authChannel: BroadcastChannel | null = null;
        if (typeof BroadcastChannel !== 'undefined') {
            authChannel = new BroadcastChannel('auth-sync');

            authChannel.onmessage = (event) => {
                // Ignorar mensajes de la misma pestaña (evitar loops)
                if (event.data.tabId === tabId.current) {
                    return;
                }

                if (event.data.type === 'TOKEN_UPDATED') {
                    // Cuando otra pestaña hace login/register, las cookies ya están establecidas
                    // por el backend. Solo necesitamos revalidar el usuario en esta pestaña.
                    if (!isProcessingAuth.current) {
                        logger.debug('[BroadcastChannel] Otra pestaña hizo login, revalidando sesión...');
                        // Revalidar usuario (las cookies se envían automáticamente)
                        validateUserInBackground();
                    }
                } else if (event.data.type === 'LOGOUT') {
                    // Cerrar sesión cuando otra pestaña cierra sesión
                    // Las cookies ya fueron limpiadas por el backend en la otra pestaña
                    if (!isProcessingAuth.current) {
                        logger.debug('[BroadcastChannel] Otra pestaña hizo logout, limpiando estado...');
                        // Limpiar tokens residuales en storage (si existen)
                        clearTokens();
                        setUser(null);
                        setLoadingUser(false);
                    }
                } else if (event.data.type === 'SESSION_REFRESHED') {
                    // Cuando otra pestaña refresca el token, revalidar en esta pestaña
                    if (!isProcessingAuth.current) {
                        logger.debug('[BroadcastChannel] Otra pestaña refrescó sesión, revalidando...');
                        validateUserInBackground();
                    }
                }
            };
        }

        // Cleanup: cerrar el canal cuando el componente se desmonte
        return () => {
            if (authChannel) {
                authChannel.close();
            }
        };
    }, []);

    const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
        // Marcar que estamos procesando login para evitar revalidaciones
        isProcessingAuth.current = true;

        try {
            const response = await authAPI.login(credentials.email, credentials.password);

            if (response.success && response.user) {
                if (response.tokens?.access && response.tokens?.refresh) {
                    setTokens(response.tokens.access, response.tokens.refresh);
                }
                setUser(response.user);
                setLoadingUser(false);

                // Notificar a otras pestañas que hay una nueva sesión (sin compartir tokens)
                // Incluir tabId para que esta pestaña ignore su propio mensaje
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('auth-sync');
                    channel.postMessage({
                        type: 'TOKEN_UPDATED',
                        tabId: tabId.current
                    });
                    channel.close();
                } else {
                    logger.debug('[BroadcastChannel] No disponible en este navegador');
                }
            } else {
                isProcessingAuth.current = false;
            }

            return response;
        } catch (error) {
            // No loguear errores de autenticación esperados (ya se muestran en apiError)
            // Solo loguear errores inesperados
            if (error instanceof Error) {
                const isExpectedError =
                    error.message.includes('Credenciales incorrectas') ||
                    error.message.includes('Cuenta bloqueada temporalmente') ||
                    error.message.includes('bloqueada temporalmente');

                if (!isExpectedError) {
                    logger.error('Login error', error);
                } else {
                    // Errores esperados solo en debug
                    logger.debug(`Login error (esperado): ${error.message}`);
                }
            }
            isProcessingAuth.current = false;

            // Extraer el mensaje de error si está disponible
            let errorMessage = 'Error de conexión con el servidor';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            return {
                success: false,
                message: errorMessage
            };
        } finally {
            // Resetear el flag después de un pequeño delay para permitir que el estado se actualice
            setTimeout(() => {
                isProcessingAuth.current = false;
            }, 300);
        }
    };

    const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
        // Marcar que estamos procesando registro para evitar revalidaciones
        isProcessingAuth.current = true;

        try {
            const response = await authAPI.register(userData);

            if (response.success && response.user) {
                if (response.tokens?.access && response.tokens?.refresh) {
                    setTokens(response.tokens.access, response.tokens.refresh);
                }
                setUser(response.user);
                setLoadingUser(false);

                // Notificar a otras pestañas que hay una nueva sesión (sin compartir tokens)
                // Incluir tabId para que esta pestaña ignore su propio mensaje
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('auth-sync');
                    channel.postMessage({
                        type: 'TOKEN_UPDATED',
                        tabId: tabId.current
                    });
                    channel.close();
                } else {
                    logger.debug('[BroadcastChannel] No disponible en este navegador');
                }
            } else {
                isProcessingAuth.current = false;
            }

            return response;
        } catch (error) {
            // Solo loguear errores reales, no errores de validación esperados
            logger.error('Register error', error);
            isProcessingAuth.current = false;

            // Extraer el mensaje de error si está disponible
            let errorMessage = 'Error de conexión con el servidor';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            return {
                success: false,
                message: errorMessage
            };
        } finally {
            // Resetear el flag después de un pequeño delay
            setTimeout(() => {
                isProcessingAuth.current = false;
            }, 500);
        }
    };

    const logout = async () => {
        // Marcar que estamos procesando logout
        isProcessingAuth.current = true;

        try {
            // Invalidar token en el servidor (las cookies se limpian automáticamente)
            await authAPI.logout();
        } catch (error) {
            logger.debug('Logout error (puede ser normal si no hay sesión activa)');
        } finally {
            // Limpiar tokens residuales en storage (si existen)
            clearTokens();
            setUser(null);
            setLoadingUser(false);

            // Notificar a otras pestañas que se cerró sesión
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('auth-sync');
                channel.postMessage({
                    type: 'LOGOUT',
                    tabId: tabId.current
                });
                channel.close();
            }

            // Resetear el flag después de un pequeño delay
            setTimeout(() => {
                isProcessingAuth.current = false;
            }, 300);

            router.push('/auth/login');
        }
    };

    const value: AuthContextType = {
        user,
        loadingUser,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
