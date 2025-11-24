/**
 * Servicios de API para Gestión de Lecciones (Admin)
 */

import { apiRequest } from './api';

/**
 * Respuesta del backend para lección
 */
export interface BackendLesson {
    id: string;
    title: string;
    description?: string;
    lesson_type: 'video' | 'document' | 'quiz' | 'text';
    content_url?: string;
    content_text?: string;
    duration_minutes: number;
    order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Respuesta de lista de lecciones
 */
export interface ListLessonsResponse {
    success: boolean;
    data: BackendLesson[];
    count: number;
}

/**
 * Respuesta de detalle de lección
 */
export interface LessonDetailResponse {
    success: boolean;
    data: BackendLesson;
}

/**
 * Interfaz para crear una lección
 */
export interface CreateLessonRequest {
    title: string;
    description?: string;
    lesson_type: 'video' | 'document' | 'quiz' | 'text';
    content_url?: string;
    content_text?: string;
    duration_minutes?: number;
    order: number;
    is_active?: boolean;
}

/**
 * Interfaz para actualizar una lección
 */
export interface UpdateLessonRequest {
    title?: string;
    description?: string;
    lesson_type?: 'video' | 'document' | 'quiz' | 'text';
    content_url?: string;
    content_text?: string;
    duration_minutes?: number;
    order?: number;
    is_active?: boolean;
}

/**
 * Lista todas las lecciones de un módulo (Admin)
 */
export async function listModuleLessons(moduleId: string): Promise<ListLessonsResponse> {
    const response = await apiRequest<ListLessonsResponse>(`/admin/modules/${moduleId}/lessons/`);
    return response as unknown as ListLessonsResponse;
}

/**
 * Crea una nueva lección (Admin)
 */
export async function createLesson(moduleId: string, data: CreateLessonRequest): Promise<LessonDetailResponse> {
    const response = await apiRequest<LessonDetailResponse>(`/admin/modules/${moduleId}/lessons/create/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as LessonDetailResponse;
}

/**
 * Actualiza una lección existente (Admin)
 */
export async function updateLesson(lessonId: string, data: UpdateLessonRequest): Promise<LessonDetailResponse> {
    const response = await apiRequest<LessonDetailResponse>(`/admin/lessons/${lessonId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as LessonDetailResponse;
}

/**
 * Elimina una lección (Admin)
 */
export async function deleteLesson(lessonId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/admin/lessons/${lessonId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}

