/**
 * Servicios de API para Gestión de Alumnos Inscritos (Admin)
 */

import { apiRequest } from './api';

/**
 * Respuesta del backend para alumno inscrito
 */
export interface BackendStudent {
    enrollment_id: string;
    user_id: number;
    user_email: string;
    user_first_name: string;
    user_last_name: string;
    status: 'active' | 'completed' | 'expired' | 'cancelled';
    completed: boolean;
    completion_percentage: number;
    enrolled_at?: string;
    completed_at?: string;
    expires_at?: string;
}

/**
 * Parámetros para listar alumnos
 */
export interface ListStudentsParams {
    status?: 'active' | 'completed' | 'expired' | 'cancelled';
    search?: string;
}

/**
 * Respuesta de lista de alumnos
 */
export interface ListStudentsResponse {
    success: boolean;
    data: BackendStudent[];
    count: number;
}

/**
 * Progreso de una lección
 */
export interface LessonProgress {
    id: string;
    title: string;
    lesson_type: string;
    order: number;
    is_completed: boolean;
    progress_percentage: number;
    completed_at?: string;
}

/**
 * Progreso de un módulo
 */
export interface ModuleProgress {
    id: string;
    title: string;
    order: number;
    lessons: LessonProgress[];
    lessons_count: number;
    completed_lessons: number;
}

/**
 * Detalle de progreso del alumno
 */
export interface StudentProgressDetail {
    enrollment: {
        id: string;
        status: string;
        completed: boolean;
        completion_percentage: number;
        enrolled_at?: string;
        completed_at?: string;
    };
    student: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
    };
    course: {
        id: string;
        title: string;
    };
    modules: ModuleProgress[];
    overall_progress: {
        total_lessons: number;
        completed_lessons: number;
        percentage: number;
    };
}

/**
 * Respuesta de detalle de progreso
 */
export interface StudentProgressResponse {
    success: boolean;
    data: StudentProgressDetail;
}

/**
 * Lista todos los alumnos inscritos en un curso (Admin)
 */
export async function listCourseStudents(courseId: string, params?: ListStudentsParams): Promise<ListStudentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) {
        queryParams.append('status', params.status);
    }
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    const queryString = queryParams.toString();
    const endpoint = `/admin/courses/${courseId}/students/${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<ListStudentsResponse>(endpoint);
    return response as unknown as ListStudentsResponse;
}

/**
 * Obtiene el detalle de progreso de un alumno (Admin)
 */
export async function getStudentProgress(courseId: string, enrollmentId: string): Promise<StudentProgressResponse> {
    const response = await apiRequest<StudentProgressResponse>(`/admin/courses/${courseId}/students/${enrollmentId}/progress/`);
    return response as unknown as StudentProgressResponse;
}

