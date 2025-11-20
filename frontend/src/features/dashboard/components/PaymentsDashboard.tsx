'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { usePaymentHistory } from '@/shared/hooks/usePaymentHistory';
import { CheckCircle2, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

/**
 * Componente de Dashboard de Pagos
 * Muestra el historial de pagos y cursos comprados del usuario
 */
export function PaymentsDashboard() {
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const { payments, isLoading, isError, error, pagination, setPage, setStatus } = usePaymentHistory({
        pageSize: 10,
        status: statusFilter,
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            approved: 'Aprobado',
            rejected: 'Rechazado',
            pending: 'Pendiente',
            refunded: 'Reembolsado',
            cancelled: 'Cancelado',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            refunded: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount: number | string, currency: string) => {
        const symbols: Record<string, string> = {
            PEN: 'S/',
            USD: '$',
            EUR: '€',
        };
        const symbol = symbols[currency] || currency;
        // Convertir a número si es string (DRF devuelve DecimalField como string)
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        // Validar que sea un número válido
        if (isNaN(numAmount)) {
            return `${symbol} 0.00`;
        }
        return `${symbol} ${numAmount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando historial de pagos...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Error al cargar el historial de pagos</p>
                <p className="text-sm mt-1">{error || 'Error desconocido'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
                    <p className="text-gray-600 mt-1">
                        {pagination ? `${pagination.count} pago${pagination.count !== 1 ? 's' : ''} encontrado${pagination.count !== 1 ? 's' : ''}` : 'Cargando...'}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
                    <select
                        value={statusFilter || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStatusFilter(value || undefined);
                            setStatus(value || undefined);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        <option value="approved">Aprobados</option>
                        <option value="rejected">Rechazados</option>
                        <option value="pending">Pendientes</option>
                        <option value="refunded">Reembolsados</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Lista de pagos */}
            {payments.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg">No hay pagos registrados</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Tus pagos aparecerán aquí una vez que realices una compra
                    </p>
                    <Link href="/academy/catalog">
                        <Button variant="primary" className="mt-4">
                            Explorar Cursos
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header del pago */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {getStatusIcon(payment.status)}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Pago #{payment.id.slice(-8).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(payment.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalles del pago */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Monto</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Estado</p>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    payment.status
                                                )}`}
                                            >
                                                {getStatusLabel(payment.status)}
                                            </span>
                                        </div>
                                        {payment.installments > 1 && (
                                            <div>
                                                <p className="text-sm text-gray-500">Cuotas</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {payment.installments} cuotas
                                                </p>
                                            </div>
                                        )}
                                        {payment.mercado_pago_payment_id && (
                                            <div>
                                                <p className="text-sm text-gray-500">ID Mercado Pago</p>
                                                <p className="text-sm font-mono text-gray-600">
                                                    {payment.mercado_pago_payment_id}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cursos comprados */}
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Cursos comprados:
                                        </p>
                                        <div className="space-y-1">
                                            {payment.course_names.map((courseName, index) => (
                                                <div
                                                    key={payment.course_ids[index] || index}
                                                    className="flex items-center gap-2 text-sm text-gray-600"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    <span>{courseName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginación */}
            {pagination && pagination.count > 0 && (
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
                            {Math.min(pagination.page * pagination.pageSize, pagination.count)} de{' '}
                            {pagination.count} pagos
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPage(pagination.page - 1)}
                                disabled={!pagination.previous}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </Button>
                            <span className="text-sm text-gray-600 px-4">
                                Página {pagination.page}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={!pagination.next}
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

