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

// Course types
export interface Instructor {
    id: string;
    name: string;
    title?: string;
}

export interface Course {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    category: string;
    tags: string[];
    level: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    hours: number;
    lessons: number;
    rating: number;
    ratingsCount: number;
    price: number;
    discountPrice?: number;
    thumbnailUrl: string;
    provider: string;
    instructor: Instructor;
    // Campos adicionales para detalle de curso
    is_creator?: boolean; // Indica si el usuario actual es el creador del curso
    is_enrolled?: boolean; // Indica si el usuario actual está inscrito
    modules?: Array<{
        id: string;
        title: string;
        description?: string;
        price?: number;
        is_purchasable: boolean;
        lessons: Array<{
            id: string;
            title: string;
            lesson_type: string;
            duration_minutes: number;
            order: number;
        }>;
        order: number;
    }>;
    status?: string; // Estado del curso (published, draft, etc.)
    enrollments?: number; // Número de inscripciones
}