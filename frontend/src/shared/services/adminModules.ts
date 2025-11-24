/**
 * Servicios de API para Gestión de Módulos (Admin)
 */

import { apiRequest } from './api';

/**
 * Respuesta del backend para módulo
 */
export interface BackendModule {
    id: string;
    title: string;
    description?: string;
    price: number;
    is_purchasable: boolean;
    order: number;
    is_active: boolean;
    lessons_count: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Respuesta de lista de módulos
 */
export interface ListModulesResponse {
    success: boolean;
    data: BackendModule[];
    count: number;
}

/**
 * Respuesta de detalle de módulo
 */
export interface ModuleDetailResponse {
    success: boolean;
    data: BackendModule;
}

/**
 * Interfaz para crear un módulo
 */
export interface CreateModuleRequest {
    title: string;
    description?: string;
    price?: number;
    is_purchasable?: boolean;
    order: number;
    is_active?: boolean;
}

/**
 * Interfaz para actualizar un módulo
 */
export interface UpdateModuleRequest {
    title?: string;
    description?: string;
    price?: number;
    is_purchasable?: boolean;
    order?: number;
    is_active?: boolean;
}

/**
 * Lista todos los módulos de un curso (Admin)
 */
export async function listCourseModules(courseId: string): Promise<ListModulesResponse> {
    const response = await apiRequest<ListModulesResponse>(`/admin/courses/${courseId}/modules/`);
    return response as unknown as ListModulesResponse;
}

/**
 * Crea un nuevo módulo (Admin)
 */
export async function createModule(courseId: string, data: CreateModuleRequest): Promise<ModuleDetailResponse> {
    const response = await apiRequest<ModuleDetailResponse>(`/admin/courses/${courseId}/modules/create/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as ModuleDetailResponse;
}

/**
 * Actualiza un módulo existente (Admin)
 */
export async function updateModule(moduleId: string, data: UpdateModuleRequest): Promise<ModuleDetailResponse> {
    const response = await apiRequest<ModuleDetailResponse>(`/admin/modules/${moduleId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as ModuleDetailResponse;
}

/**
 * Elimina un módulo (Admin)
 */
export async function deleteModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/admin/modules/${moduleId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}

