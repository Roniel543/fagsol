// Tipos compartidos para toda la aplicación
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    message?: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}
