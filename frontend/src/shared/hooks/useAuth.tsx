'use client';

import { authAPI } from '@/shared/services/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/types';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<AuthResponse>;
    register: (userData: RegisterRequest) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verificar si hay usuario en localStorage
        const userData = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        if (userData && accessToken) {
            try {
                const userObj = JSON.parse(userData);
                setUser(userObj);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.clear();
            }
        }

        setLoading(false);
    }, []);

    const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await authAPI.login(credentials.email, credentials.password);

            if (response.success && response.user && response.tokens) {
                // Guardar datos en localStorage
                localStorage.setItem('access_token', response.tokens.access);
                localStorage.setItem('refresh_token', response.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(response.user));

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
                // Guardar datos en localStorage
                localStorage.setItem('access_token', response.tokens.access);
                localStorage.setItem('refresh_token', response.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(response.user));

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

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth/login');
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
