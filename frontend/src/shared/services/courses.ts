/**
 * Servicios de API para Cursos
 * Conecta el frontend con el backend de Django
 */

import { apiRequest } from './api';
import { Course } from '@/shared/types';

/**
 * Respuesta del backend para lista de cursos
 */
export interface BackendCourse {
    id: string;
    title: string;
    slug: string;
    short_description?: string;
    description?: string;
    price: number;
    currency: string;
    thumbnail_url?: string;
    status: string;
    created_at: string;
}

/**
 * Respuesta del backend para detalle de curso
 */
export interface BackendCourseDetail extends BackendCourse {
    banner_url?: string;
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
    is_enrolled?: boolean;
}

/**
 * Parámetros para listar cursos
 */
export interface ListCoursesParams {
    status?: 'published' | 'draft';
    search?: string;
}

/**
 * Respuesta de lista de cursos
 */
export interface ListCoursesResponse {
    success: boolean;
    data: BackendCourse[];
    count: number;
}

/**
 * Respuesta de detalle de curso
 */
export interface CourseDetailResponse {
    success: boolean;
    data: BackendCourseDetail;
}

/**
 * Lista todos los cursos disponibles
 */
export async function listCourses(params?: ListCoursesParams): Promise<ListCoursesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) {
        queryParams.append('status', params.status);
    }
    
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/courses/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest<ListCoursesResponse>(endpoint);
    // El backend retorna directamente ListCoursesResponse (con success, data, count)
    return response as unknown as ListCoursesResponse;
}

/**
 * Obtiene un curso por ID
 */
export async function getCourseById(courseId: string): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>(`/courses/${courseId}/`);
    return response as unknown as CourseDetailResponse;
}

/**
 * Obtiene un curso por slug
 */
export async function getCourseBySlug(slug: string): Promise<CourseDetailResponse | null> {
    try {
        const response = await apiRequest<CourseDetailResponse>(`/courses/slug/${slug}/`);
        return response as unknown as CourseDetailResponse;
    } catch (error) {
        console.error('Error getting course by slug:', error);
        return null;
    }
}

/**
 * Adapta un curso del backend al formato del frontend
 * Mapea campos del backend a los que espera el frontend
 */
export function adaptBackendCourseToFrontend(backendCourse: BackendCourse): Course {
    // Extraer campos del backend (ahora vienen directamente)
    const extendedCourse = backendCourse as any;
    const tags = Array.isArray(extendedCourse.tags) ? extendedCourse.tags : [];
    
    // Calcular número de lecciones desde módulos si está disponible
    let lessonsCount = 0;
    if (extendedCourse.modules && Array.isArray(extendedCourse.modules)) {
        lessonsCount = extendedCourse.modules.reduce((total: number, module: any) => {
            return total + (module.lessons?.length || 0);
        }, 0);
    }
    
    // Mapear campos básicos
    return {
        id: backendCourse.id,
        slug: backendCourse.slug,
        title: backendCourse.title,
        subtitle: backendCourse.short_description,
        description: extendedCourse.description || backendCourse.short_description || '',
        category: extendedCourse.category || 'General',
        tags: tags,
        level: (extendedCourse.level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        language: 'es', // Por defecto español
        hours: extendedCourse.hours || 0,
        lessons: lessonsCount || extendedCourse.lessons || 0,
        rating: extendedCourse.rating || 0,
        ratingsCount: extendedCourse.ratings_count || 0,
        price: backendCourse.price,
        discountPrice: extendedCourse.discount_price || undefined,
        thumbnailUrl: backendCourse.thumbnail_url || '',
        provider: extendedCourse.provider || 'fagsol',
        instructor: extendedCourse.instructor && typeof extendedCourse.instructor === 'object'
            ? {
                id: extendedCourse.instructor.id || 'i-001',
                name: extendedCourse.instructor.name || 'Equipo Fagsol',
                title: extendedCourse.instructor.title,
            }
            : {
                id: 'i-001',
                name: 'Equipo Fagsol',
            },
    };
}

/**
 * Adapta el detalle de curso del backend al formato del frontend
 */
export function adaptBackendCourseDetailToFrontend(backendDetail: BackendCourseDetail): Course & {
    modules?: BackendCourseDetail['modules'];
    is_enrolled?: boolean;
} {
    const baseCourse = adaptBackendCourseToFrontend(backendDetail);
    
    return {
        ...baseCourse,
        modules: backendDetail.modules,
        is_enrolled: backendDetail.is_enrolled,
    };
}

/**
 * Interfaz para crear un curso
 */
export interface CreateCourseRequest {
    title: string;
    description: string;
    short_description?: string;
    price: number;
    currency?: string;
    status?: 'draft' | 'published' | 'archived';
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    thumbnail_url?: string;
    banner_url?: string;
    discount_price?: number;
    hours?: number;
    instructor?: {
        id: string;
        name: string;
        title?: string;
    };
    tags?: string[];
    provider?: string;
}

/**
 * Interfaz para actualizar un curso
 */
export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

/**
 * Crea un nuevo curso
 * Requiere autenticación y rol admin o instructor
 */
export async function createCourse(data: CreateCourseRequest): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>('/courses/create/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as CourseDetailResponse;
}

/**
 * Actualiza un curso existente
 * Requiere autenticación y permiso para editar el curso
 */
export async function updateCourse(courseId: string, data: UpdateCourseRequest): Promise<CourseDetailResponse> {
    const response = await apiRequest<CourseDetailResponse>(`/courses/${courseId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as CourseDetailResponse;
}

/**
 * Elimina (archiva) un curso
 * Solo administradores pueden eliminar cursos
 */
export async function deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/courses/${courseId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}

