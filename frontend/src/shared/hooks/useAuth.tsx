'use client';

import { authAPI } from '@/shared/services/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/types';
import {
    clearTokens,
    migrateTokensFromLocalStorage,
    setTokens,
    setUserData
} from '@/shared/utils/tokenStorage';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<AuthResponse>;
    register: (userData: RegisterRequest) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Función para verificar y restaurar sesión
        const verifyAndRestoreSession = async () => {
            // Migrar tokens de localStorage a sessionStorage (compatibilidad)
            migrateTokensFromLocalStorage();

            // Verificar si hay tokens en sessionStorage
            const accessToken = typeof window !== 'undefined'
                ? sessionStorage.getItem('access_token')
                : null;

            if (!accessToken) {
                setLoading(false);
                return;
            }

            // Validar token con el backend
            try {
                const response = await authAPI.getCurrentUser();

                if (response.success && response.user) {
                    // Token válido, restaurar usuario
                    setUserData(response.user); // Actualizar datos del usuario
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
                setLoading(false);
            }
        };

        verifyAndRestoreSession();
    }, []);

    const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await authAPI.login(credentials.email, credentials.password);

            if (response.success && response.user && response.tokens) {
                // Guardar datos de forma segura en sessionStorage
                setTokens(response.tokens.access, response.tokens.refresh);
                setUserData(response.user);
                setUser(response.user);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);

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
        try {
            // Invalidar token en el servidor
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Siempre limpiar tokens localmente
            clearTokens();
            setUser(null);
            router.push('/auth/login');
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
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
