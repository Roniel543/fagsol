/**
 * Hooks SWR para data fetching de usuarios (Admin)
 */

import {
    activateUser,
    adaptBackendUserToFrontend,
    createUser,
    deactivateUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
    type CreateUserRequest,
    type ListUsersParams,
    type UpdateUserRequest
} from '@/shared/services/adminUsers';
import { User } from '@/shared/types';
import React from 'react';
import useSWR from 'swr';

/**
 * Hook para listar usuarios (Admin)
 */
export function useAdminUsers(params?: ListUsersParams) {
    const { data, error, isLoading, mutate } = useSWR(
        ['admin-users', params],
        async () => {
            const response = await listUsers(params);
            // Adaptar cada usuario del backend al formato del frontend
            return {
                users: response.data.map(adaptBackendUserToFrontend),
                count: response.count,
            };
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        users: data?.users || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para obtener un usuario por ID (Admin)
 */
export function useAdminUser(userId: number | null) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? ['admin-user', userId] : null,
        async () => {
            if (!userId) return null;
            const response = await getUserById(userId);
            return adaptBackendUserToFrontend(response.data);
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        user: data || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para crear un usuario (Admin)
 */
export function useCreateUser() {
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const create = React.useCallback(async (
        data: CreateUserRequest
    ): Promise<User> => {
        setIsCreating(true);
        setError(null);
        try {
            const result = await createUser(data);
            return adaptBackendUserToFrontend(result.data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return {
        createUser: create,
        isCreating,
        error,
    };
}

/**
 * Hook para actualizar un usuario (Admin)
 */
export function useUpdateUser() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const update = React.useCallback(async (
        userId: number,
        data: UpdateUserRequest
    ): Promise<User> => {
        setIsUpdating(true);
        setError(null);
        try {
            const result = await updateUser(userId, data);
            return adaptBackendUserToFrontend(result.data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, []);

    return {
        updateUser: update,
        isUpdating,
        error,
    };
}

/**
 * Hook para eliminar un usuario (Admin)
 */
export function useDeleteUser() {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const deleteUserAction = React.useCallback(async (
        userId: number
    ): Promise<void> => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteUser(userId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        deleteUser: deleteUserAction,
        isDeleting,
        error,
    };
}

/**
 * Hook para activar un usuario (Admin)
 */
export function useActivateUser() {
    const [isActivating, setIsActivating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const activate = React.useCallback(async (
        userId: number
    ): Promise<void> => {
        setIsActivating(true);
        setError(null);
        try {
            await activateUser(userId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsActivating(false);
        }
    }, []);

    return {
        activateUser: activate,
        isActivating,
        error,
    };
}

/**
 * Hook para desactivar un usuario (Admin)
 */
export function useDeactivateUser() {
    const [isDeactivating, setIsDeactivating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const deactivate = React.useCallback(async (
        userId: number
    ): Promise<void> => {
        setIsDeactivating(true);
        setError(null);
        try {
            await deactivateUser(userId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            throw error;
        } finally {
            setIsDeactivating(false);
        }
    }, []);

    return {
        deactivateUser: deactivate,
        isDeactivating,
        error,
    };
}

