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
        // Migrar tokens de localStorage a sessionStorage (compatibilidad)
        migrateTokensFromLocalStorage();

        // Verificar si hay usuario en sessionStorage
        const userData = getUserData();
        const accessToken = typeof window !== 'undefined'
            ? sessionStorage.getItem('access_token')
            : null;

        if (userData && accessToken) {
            try {
                setUser(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                clearTokens();
            }
        }

        setLoading(false);
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
            return {
                success: false,
                message: 'Error de conexión con el servidor'
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
