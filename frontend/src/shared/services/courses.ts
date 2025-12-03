/**
 * Servicios de API para Cursos
 * Conecta el frontend con el backend de Django
 */

import { Course } from '@/shared/types';
import { apiRequest } from './api';

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
    is_creator?: boolean;  // Indica si el usuario actual es el creador del curso
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
    status?: string;
    enrollments?: number;
    is_creator?: boolean;
} {
    const baseCourse = adaptBackendCourseToFrontend(backendDetail);

    return {
        ...baseCourse,
        modules: backendDetail.modules,
        is_enrolled: backendDetail.is_enrolled,
        status: (backendDetail as any).status,
        enrollments: (backendDetail as any).enrollments,
        is_creator: backendDetail.is_creator || false,
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
    status?: 'draft' | 'pending_review' | 'needs_revision' | 'published' | 'archived';
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
export interface UpdateCourseRequest extends Partial<CreateCourseRequest> { }

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
 * Interfaz para la respuesta de subida de imagen
 */
export interface UploadImageResponse {
    success: boolean;
    data?: {
        url: string;
        width: number;
        height: number;
        original_width: number;
        original_height: number;
        size: number;
        original_size: number;
        compression_ratio: number;
        format: string;
    };
    message?: string;
}

/**
 * Sube y optimiza una imagen para un curso
 * Requiere autenticación y rol admin o instructor
 */
export async function uploadCourseImage(
    file: File,
    imageType: 'thumbnail' | 'banner'
): Promise<UploadImageResponse> {
    const { getAccessToken } = await import('@/shared/utils/tokenStorage');
    const { API_CONFIG } = await import('@/shared/services/api');

    const token = getAccessToken();
    if (!token) {
        throw new Error('No autenticado');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', imageType);

    // Hacer request con FormData (no JSON)
    const response = await fetch(`${API_CONFIG.BASE_URL}/courses/upload-image/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // NO incluir Content-Type, el navegador lo hará automáticamente con el boundary
        },
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Si no se puede parsear JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
    }

    return await response.json();
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


/**
 * Interfaz para curso con información de revisión
 */
export interface CourseWithReview extends BackendCourse {
    category?: string;
    level?: string;
    is_active?: boolean;
    reviewed_by?: {
        id: number;
        email: string;
    };
    reviewed_at?: string;
    review_comments?: string;
    created_by?: {
        id: number;
        email: string;
        username: string;
    };
    instructor?: {
        id: string;
        name: string;
        title?: string;
    };
}

/**
 * Respuesta de lista de cursos con revisión
 */
export interface CoursesWithReviewResponse {
    success: boolean;
    data: CourseWithReview[];
    count: number;
}

/**
 * Solicita revisión de un curso (Instructor)
 */
export async function requestCourseReview(courseId: string): Promise<{
    success: boolean;
    data: {
        course: {
            id: string;
            title: string;
            status: string;
            requested_at: string;
        };
    };
    message?: string;
}> {
    const response = await apiRequest<{
        success: boolean;
        data: {
            course: {
                id: string;
                title: string;
                status: string;
                requested_at: string;
            };
        };
        message?: string;
    }>(`/courses/${courseId}/request-review/`, {
        method: 'POST',
    });
    return response as unknown as {
        success: boolean;
        data: {
            course: {
                id: string;
                title: string;
                status: string;
                requested_at: string;
            };
        };
        message?: string;
    };
}

/**
 * Obtiene la lista de cursos pendientes de revisión (Admin)
 */
export async function getPendingCourses(): Promise<CoursesWithReviewResponse> {
    const response = await apiRequest<CoursesWithReviewResponse>('/admin/courses/pending/', {
        method: 'GET',
    });
    return response as unknown as CoursesWithReviewResponse;
}

/**
 * Obtiene todos los cursos con filtro opcional por estado (Admin)
 */
export async function getAllCoursesAdmin(
    status?: 'pending_review' | 'needs_revision' | 'published' | 'draft' | 'archived'
): Promise<CoursesWithReviewResponse> {
    const url = status ? `/admin/courses/?status=${status}` : '/admin/courses/';
    const response = await apiRequest<CoursesWithReviewResponse>(url, {
        method: 'GET',
    });
    return response as unknown as CoursesWithReviewResponse;
}

/**
 * Tipo para contadores de cursos por estado
 */
export interface CourseStatusCounts {
    all: number;
    published: number;
    draft: number;
    pending_review: number;
    needs_revision: number;
    archived: number;
}

export interface CourseStatusCountsResponse {
    success: boolean;
    data: CourseStatusCounts;
}

/**
 * Obtiene contadores de cursos por estado (Admin)
 */
export async function getCourseStatusCounts(): Promise<CourseStatusCountsResponse> {
    const response = await apiRequest<CourseStatusCountsResponse>('/admin/courses/status-counts/', {
        method: 'GET',
    });
    return response as unknown as CourseStatusCountsResponse;
}

/**
 * Interfaz para aprobar curso
 */
export interface ApproveCourseRequest {
    notes?: string;
}

/**
 * Interfaz para rechazar curso
 */
export interface RejectCourseRequest {
    rejection_reason: string;
}

/**
 * Respuesta de acción de aprobación/rechazo
 */
export interface CourseActionResponse {
    success: boolean;
    data: {
        course: CourseWithReview;
    };
    message?: string;
}

/**
 * Aprueba un curso pendiente de revisión (Admin)
 */
export async function approveCourse(
    courseId: string,
    data?: ApproveCourseRequest
): Promise<CourseActionResponse> {
    const response = await apiRequest<CourseActionResponse>(`/admin/courses/${courseId}/approve/`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
    });
    return response as unknown as CourseActionResponse;
}

/**
 * Rechaza un curso pendiente de revisión (Admin)
 */
export async function rejectCourse(
    courseId: string,
    data: RejectCourseRequest
): Promise<CourseActionResponse> {
    const response = await apiRequest<CourseActionResponse>(`/admin/courses/${courseId}/reject/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as CourseActionResponse;
}

//  VISUALIZACIÓN DE CONTENIDO 

/**
 * Lección con contenido completo
 */
export interface LessonWithContent {
    id: string;
    title: string;
    description?: string;
    lesson_type: 'video' | 'document' | 'quiz' | 'text';
    duration_minutes: number;
    order: number;
    content_url?: string;
    content_text?: string;
}

/**
 * Módulo con lecciones completas
 */
export interface ModuleWithContent {
    id: string;
    title: string;
    description?: string;
    order: number;
    lessons: LessonWithContent[];
}

/**
 * Enrollment del curso
 */
export interface CourseEnrollment {
    id: string;
    status: 'active' | 'completed' | 'expired' | 'cancelled';
    completed: boolean;
    completion_percentage: number;
    enrolled_at: string;
}

/**
 * Material complementario del curso
 */
export interface CourseMaterial {
    id: string;
    title: string;
    description?: string;
    material_type: 'video' | 'link';
    url: string;
    order: number;
    module_id?: string;
    module_title?: string;
    lesson_id?: string;
    lesson_title?: string;
}

/**
 * Respuesta del contenido completo del curso
 */
export interface CourseContentResponse {
    success: boolean;
    data: {
        course: {
            id: string;
            title: string;
            description?: string;
            slug: string;
        };
        enrollment?: CourseEnrollment;
        access_type?: 'admin_or_instructor';
        modules: ModuleWithContent[];
        materials: CourseMaterial[]; // ✅ Agregar materiales
    };
}

/**
 * Obtiene el contenido completo de un curso (requiere estar inscrito o ser admin/instructor)
 */
export async function getCourseContent(courseId: string): Promise<CourseContentResponse> {
    const response = await apiRequest<CourseContentResponse>(`/courses/${courseId}/content/`);
    return response as unknown as CourseContentResponse;
}

/**
 * Parámetros para listar cursos del instructor
 */
export interface ListInstructorCoursesParams {
    status?: 'all' | 'published' | 'draft' | 'pending_review' | 'needs_revision' | 'archived';
    search?: string;
}

/**
 * Respuesta de lista de cursos del instructor
 */
export interface ListInstructorCoursesResponse {
    success: boolean;
    data: BackendCourseDetail[];
    count: number;
}

/**
 * Lista los cursos del instructor autenticado
 * Requiere autenticación y rol instructor
 */
export async function listInstructorCourses(params?: ListInstructorCoursesParams): Promise<ListInstructorCoursesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status && params.status !== 'all') {
        queryParams.append('status', params.status);
    }

    if (params?.search) {
        queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/instructor/courses/${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<ListInstructorCoursesResponse>(endpoint);
    return response as unknown as ListInstructorCoursesResponse;
}

