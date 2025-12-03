/**
 * Hooks SWR para data fetching de mensajes de contacto (Admin)
 */

import {
    listContactMessages,
    updateContactMessage,
    type ContactMessage,
    type ListContactMessagesParams,
    type UpdateContactMessageRequest
} from '@/shared/services/adminContactMessages';
import React from 'react';
import useSWR from 'swr';
import { useToast } from '@/shared/components/Toast';

/**
 * Hook para listar mensajes de contacto (Admin)
 */
export function useAdminContactMessages(params?: ListContactMessagesParams) {
    const { data, error, isLoading, mutate } = useSWR(
        ['admin-contact-messages', params],
        async () => {
            const response = await listContactMessages(params);
            return {
                messages: response.data,
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
        messages: data?.messages || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

/**
 * Hook para actualizar un mensaje de contacto (Admin)
 */
export function useUpdateContactMessage() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const { showToast } = useToast();

    const update = React.useCallback(
        async (messageId: number, data: UpdateContactMessageRequest) => {
            setIsUpdating(true);
            try {
                const response = await updateContactMessage(messageId, data);
                showToast(response.message || 'Mensaje actualizado exitosamente', 'success');
                return response;
            } catch (error: any) {
                const errorMessage = error.message || 'Error al actualizar el mensaje';
                showToast(errorMessage, 'error');
                throw error;
            } finally {
                setIsUpdating(false);
            }
        },
        [showToast]
    );

    return {
        updateContactMessage: update,
        isUpdating,
    };
}

