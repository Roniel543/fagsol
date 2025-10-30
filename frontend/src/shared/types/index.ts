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

// ===== Academy Types (Catálogo)
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseProvider = 'fagsol' | 'instructor';

export interface Course {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    category: string; // e.g., Metalurgia, Agroindustria, Renovables
    tags: string[];
    level: CourseLevel;
    language: string;
    hours: number; // duración estimada
    lessons: number;
    rating: number; // 0-5
    ratingsCount: number;
    price: number; // en PEN por ahora
    discountPrice?: number;
    thumbnailUrl: string;
    provider: CourseProvider;
    instructor: {
        id: string;
        name: string;
        title?: string;
        avatarUrl?: string;
    };
}
