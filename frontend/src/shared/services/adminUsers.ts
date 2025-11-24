/**
 * Servicios de API para Gestión de Usuarios (Admin)
 * Conecta el frontend con el backend de Django
 */

import { User } from '@/shared/types';
import { apiRequest } from './api';

/**
 * Respuesta del backend para lista de usuarios
 */
export interface BackendUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    is_email_verified: boolean;
    phone?: string;
    created_at: string;
    last_login?: string;
}

/**
 * Parámetros para listar usuarios
 */
export interface ListUsersParams {
    role?: 'student' | 'teacher' | 'admin';
    is_active?: boolean;
    search?: string;
}

/**
 * Respuesta de lista de usuarios
 */
export interface ListUsersResponse {
    success: boolean;
    data: BackendUser[];
    count: number;
}

/**
 * Respuesta de detalle de usuario
 */
export interface UserDetailResponse {
    success: boolean;
    data: BackendUser;
}

/**
 * Interfaz para crear un usuario
 */
export interface CreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'teacher' | 'admin';
    phone?: string;
    is_active?: boolean;
}

/**
 * Interfaz para actualizar un usuario
 */
export interface UpdateUserRequest {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: 'student' | 'teacher' | 'admin';
    phone?: string;
    is_active?: boolean;
    password?: string;
}

/**
 * Lista todos los usuarios disponibles (Admin)
 */
export async function listUsers(params?: ListUsersParams): Promise<ListUsersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.role) {
        queryParams.append('role', params.role);
    }

    if (params?.is_active !== undefined) {
        queryParams.append('is_active', params.is_active.toString());
    }

    if (params?.search) {
        queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/admin/users/${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<ListUsersResponse>(endpoint);
    return response as unknown as ListUsersResponse;
}

/**
 * Obtiene un usuario por ID (Admin)
 */
export async function getUserById(userId: number): Promise<UserDetailResponse> {
    const response = await apiRequest<UserDetailResponse>(`/admin/users/${userId}/`);
    return response as unknown as UserDetailResponse;
}

/**
 * Crea un nuevo usuario (Admin)
 */
export async function createUser(data: CreateUserRequest): Promise<UserDetailResponse> {
    const response = await apiRequest<UserDetailResponse>('/admin/users/create/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response as unknown as UserDetailResponse;
}

/**
 * Actualiza un usuario existente (Admin)
 */
export async function updateUser(userId: number, data: UpdateUserRequest): Promise<UserDetailResponse> {
    const response = await apiRequest<UserDetailResponse>(`/admin/users/${userId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response as unknown as UserDetailResponse;
}

/**
 * Elimina (desactiva) un usuario (Admin)
 */
export async function deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/delete/`, {
        method: 'DELETE',
    });
    return response as unknown as { success: boolean; message: string };
}

/**
 * Activa un usuario (Admin)
 */
export async function activateUser(userId: number): Promise<{ success: boolean; message: string; data: { id: number; is_active: boolean } }> {
    const response = await apiRequest<{ success: boolean; message: string; data: { id: number; is_active: boolean } }>(
        `/admin/users/${userId}/activate/`,
        {
            method: 'POST',
        }
    );
    return response as unknown as { success: boolean; message: string; data: { id: number; is_active: boolean } };
}

/**
 * Desactiva un usuario (Admin)
 */
export async function deactivateUser(userId: number): Promise<{ success: boolean; message: string; data: { id: number; is_active: boolean } }> {
    const response = await apiRequest<{ success: boolean; message: string; data: { id: number; is_active: boolean } }>(
        `/admin/users/${userId}/deactivate/`,
        {
            method: 'POST',
        }
    );
    return response as unknown as { success: boolean; message: string; data: { id: number; is_active: boolean } };
}

/**
 * Adapta un usuario del backend al formato del frontend
 */
export function adaptBackendUserToFrontend(backendUser: BackendUser): User {
    return {
        id: backendUser.id,
        email: backendUser.email,
        first_name: backendUser.first_name,
        last_name: backendUser.last_name,
        role: backendUser.role,
        is_active: backendUser.is_active,
    };
}

