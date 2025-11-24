/**
 * Servicios de API para Gestión de Materiales (Admin)
 */

import { apiRequest } from './api';

/**
 * Respuesta del backend para material
 */
export interface BackendMaterial {
    id: string;
    title: string;
    description?: string;
    material_type: 'video' | 'link';
    url: string;
    order: number;
    is_active: boolean;
    module_id?: string;
    module_title?: string;
    lesson_id?: string;
    lesson_title?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Parámetros para listar materiales
 */
export interface ListMaterialsParams {
    material_type?: 'video' | 'link';
}

/**
 * Respuesta de lista de materiales
 */
export interface ListMaterialsResponse {
    success: boolean;
    data: BackendMaterial[];
    count: number;
}

/**
 * Respuesta de detalle de material
 */
export interface MaterialDetailResponse {
    success: boolean;
    data: BackendMaterial;
}

/**
 * Interfaz para crear un material
 */
export interface CreateMaterialRequest {
    title: string;
    description?: string;
    material_type: 'video' | 'link';
    url: string;
    module_id?: string;
    lesson_id?: string;
    order: number;
    is_active?: boolean;
}

/**
 * Interfaz para actualizar un material
 */
export interface UpdateMaterialRequest {
    title?: string;
    description?: string;
    material_type?: 'video' | 'link';
    url?: string;
    module_id?: string;
    lesson_id?: string;
    order?: number;
    is_active?: boolean;
}

/**
 * Lista todos los materiales de un curso (Admin)
 */
export async function listCourseMaterials(courseId: string, params?: ListMaterialsParams): Promise<ListMaterialsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.material_type) {
        queryParams.append('material_type', params.material_type);
    }
    const queryString = queryParams.toString();
    const endpoint = `/admin/courses/${courseId}/materials/${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<ListMaterialsResponse>(endpoint);
    return response as unknown as ListMaterialsResponse;
}

/**
 * Crea un nuevo material (Admin)
 */
export async function createMaterial(courseId: string, data: CreateMaterialRequest): Promise<MaterialDetailResponse> {
    const response = await apiRequest<MaterialDetailResponse>(`/admin/courses/${courseId}/materials/create/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as MaterialDetailResponse;
}

/**
 * Actualiza un material existente (Admin)
 */
export async function updateMaterial(materialId: string, data: UpdateMaterialRequest): Promise<MaterialDetailResponse> {
    const response = await apiRequest<MaterialDetailResponse>(`/admin/materials/${materialId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as MaterialDetailResponse;
}

/**
 * Elimina un material (Admin)
 */
export async function deleteMaterial(materialId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/admin/materials/${materialId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}

