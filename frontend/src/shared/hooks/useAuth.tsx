'use client';

import { authAPI } from '@/shared/services/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/types';
import {
    clearTokens,
    getUserData,
    migrateTokensFromLocalStorage,
    setTokens,
    setUserData
} from '@/shared/utils/tokenStorage';
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


function loadInitialUserSnapshot(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        // Migrar tokens de localStorage a sessionStorage (compatibilidad)
        migrateTokensFromLocalStorage();

        // Cargar snapshot del usuario desde sessionStorage
        const userSnapshot = getUserData();
        const accessToken = sessionStorage.getItem('access_token');

        // Solo retornar snapshot si hay token y datos de usuario
        if (accessToken && userSnapshot) {
            return userSnapshot as User;
        }

        return null;
    } catch (error) {
        console.error('Error loading initial user snapshot:', error);
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // IMPORTANTE: Siempre empezar con null y loadingUser = true para SSR
    // Esto asegura que servidor y cliente rendericen lo mismo inicialmente
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const router = useRouter();

    // Flag para evitar revalidaciones durante login/logout en la misma pestaña
    const isProcessingAuth = useRef(false);

    useEffect(() => {
        /**
         * Cargar snapshot inicial solo en el cliente (después de hidratación)
         * Esto evita errores de hidratación mientras mantiene FOUC bajo
         */
        const loadSnapshot = () => {
            const initialUser = loadInitialUserSnapshot();
            if (initialUser) {
                // Si hay snapshot, usarlo inmediatamente y marcar como no-loading
                // Esto permite mostrar el contenido correcto rápidamente
                setUser(initialUser);
                setLoadingUser(false);
            }
        };

        /**
         * Valida el usuario en background con la API
         * Esto actualiza el estado con datos frescos del servidor
         */
        const validateUserInBackground = async () => {
            // Evitar revalidar si estamos procesando login/logout
            if (isProcessingAuth.current) {
                return;
            }
            const accessToken = typeof window !== 'undefined'
                ? sessionStorage.getItem('access_token')
                : null;

            if (!accessToken) {
                // No hay token, limpiar usuario si existe snapshot obsoleto
                setUser(null);
                setLoadingUser(false);
                return;
            }

            // Validar token con el backend
            try {
                const response = await authAPI.getCurrentUser();

                if (response.success && response.user) {
                    // Token válido, actualizar usuario con datos frescos
                    setUserData(response.user);
                    setUser(response.user);
                } else {
                    // Token inválido, intentar refrescar antes de limpiar
                    console.log('🔄 Token inválido, intentando refrescar...');
                    try {
                        const { refreshAccessToken } = await import('@/shared/services/api');
                        const newToken = await refreshAccessToken();

                        if (newToken) {
                            // Si se pudo refrescar, intentar obtener el usuario nuevamente
                            const retryResponse = await authAPI.getCurrentUser();
                            if (retryResponse.success && retryResponse.user) {
                                setUserData(retryResponse.user);
                                setUser(retryResponse.user);
                            } else {
                                clearTokens();
                                setUser(null);
                            }
                        } else {
                            // No se pudo refrescar, limpiar tokens
                            clearTokens();
                            setUser(null);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        clearTokens();
                        setUser(null);
                    }
                }
            } catch (error) {
                // Error al validar token (token expirado, inválido, etc.)
                console.error('Error validating token:', error);

                // Intentar refrescar antes de limpiar
                try {
                    const { refreshAccessToken } = await import('@/shared/services/api');
                    const newToken = await refreshAccessToken();

                    if (newToken) {
                        // Si se pudo refrescar, intentar obtener el usuario nuevamente
                        const retryResponse = await authAPI.getCurrentUser();
                        if (retryResponse.success && retryResponse.user) {
                            setUserData(retryResponse.user);
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
                    // Si el refresh también falla, limpiar tokens
                    console.error('Error refreshing token during validation:', refreshError);
                    clearTokens();
                    setUser(null);
                }
            } finally {
                setLoadingUser(false);
            }
        };

        // Cargar snapshot inicial y validar usuario
        loadSnapshot();
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
                if (event.data.source === 'same-tab') {
                    return;
                }

                if (event.data.type === 'TOKEN_UPDATED') {
                    // Solo revalidar si no estamos procesando auth en esta pestaña
                    // y hay token disponible (otra pestaña hizo login)
                    if (!isProcessingAuth.current) {
                        const currentToken = sessionStorage.getItem('access_token');
                        if (currentToken) {
                            validateUserInBackground();
                        }
                    }
                } else if (event.data.type === 'LOGOUT') {
                    // Cerrar sesión cuando otra pestaña cierra sesión
                    if (!isProcessingAuth.current) {
                        clearTokens();
                        setUser(null);
                        setLoadingUser(false);
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

            if (response.success && response.user && response.tokens) {
                // Guardar datos de forma segura en sessionStorage
                setTokens(response.tokens.access, response.tokens.refresh);
                setUserData(response.user);
                setUser(response.user);
                setLoadingUser(false);

                // Notificar a otras pestañas que hay un nuevo token (sin compartir el token)
                // Marcar como 'same-tab' para que esta pestaña ignore el mensaje
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('auth-sync');
                    channel.postMessage({
                        type: 'TOKEN_UPDATED',
                        source: 'same-tab'
                    });
                    channel.close();
                }
            } else {
                isProcessingAuth.current = false;
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
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
            }, 500);
        }
    };

    const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await authAPI.register(userData);

            if (response.success && response.user && response.tokens) {
                // Guardar datos de forma segura en sessionStorage
                setTokens(response.tokens.access, response.tokens.refresh);
                setUserData(response.user);
                setUser(response.user);
            }

            return response;
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: 'Error de conexión con el servidor'
            };
        }
    };

    const logout = async () => {
        // Marcar que estamos procesando logout
        isProcessingAuth.current = true;

        try {
            // Invalidar token en el servidor
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Siempre limpiar tokens localmente
            clearTokens();
            setUser(null);
            setLoadingUser(false);

            // Notificar a otras pestañas que se cerró sesión
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('auth-sync');
                channel.postMessage({
                    type: 'LOGOUT',
                    source: 'same-tab'
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
