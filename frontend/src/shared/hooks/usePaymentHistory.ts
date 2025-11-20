/**
 * Hook para obtener el historial de pagos del usuario
 */

import { useState, useEffect } from 'react';
import { getPaymentHistory, PaymentHistoryResponse, PaymentHistoryItem } from '../services/payments';

interface UsePaymentHistoryOptions {
    page?: number;
    pageSize?: number;
    status?: string;
    autoFetch?: boolean;
}

interface UsePaymentHistoryReturn {
    payments: PaymentHistoryItem[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    pagination: {
        count: number;
        next: string | null;
        previous: string | null;
        page: number;
        pageSize: number;
    } | null;
    refetch: () => Promise<void>;
    setPage: (page: number) => void;
    setStatus: (status: string | undefined) => void;
}

export function usePaymentHistory(options: UsePaymentHistoryOptions = {}): UsePaymentHistoryReturn {
    const { page = 1, pageSize = 10, status, autoFetch = true } = options;
    
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UsePaymentHistoryReturn['pagination']>(null);
    const [currentPage, setCurrentPage] = useState(page);
    const [currentStatus, setCurrentStatus] = useState<string | undefined>(status);
    
    const fetchPayments = async () => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        
        try {
            const response = await getPaymentHistory(currentPage, pageSize, currentStatus);
            
            if (response.success && response.data) {
                setPayments(response.data.results);
                setPagination({
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous,
                    page: response.data.page,
                    pageSize: response.data.page_size,
                });
            } else {
                setIsError(true);
                setError(response.message || 'Error al obtener el historial de pagos');
            }
        } catch (err) {
            setIsError(true);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (autoFetch) {
            fetchPayments();
        }
    }, [currentPage, currentStatus, autoFetch]);
    
    const refetch = async () => {
        await fetchPayments();
    };
    
    const handleSetPage = (newPage: number) => {
        setCurrentPage(newPage);
    };
    
    const handleSetStatus = (newStatus: string | undefined) => {
        setCurrentStatus(newStatus);
        setCurrentPage(1); // Resetear a la primera página cuando cambia el filtro
    };
    
    return {
        payments,
        isLoading,
        isError,
        error,
        pagination,
        refetch,
        setPage: handleSetPage,
        setStatus: handleSetStatus,
    };
}

