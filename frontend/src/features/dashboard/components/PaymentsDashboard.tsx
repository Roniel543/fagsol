'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { usePaymentHistory } from '@/shared/hooks/usePaymentHistory';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
            approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
            rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
            refunded: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
            cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
                <p className="ml-4 text-secondary-light-gray">Cargando historial de pagos...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                <p className="font-medium">Error al cargar el historial de pagos</p>
                <p className="text-sm mt-1 text-red-200">{error || 'Error desconocido'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary-white">Historial de Pagos</h2>
                    <p className="text-secondary-light-gray mt-1">
                        {pagination ? `${pagination.count} pago${pagination.count !== 1 ? 's' : ''} encontrado${pagination.count !== 1 ? 's' : ''}` : 'Cargando...'}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-primary-white">Filtrar por estado:</label>
                    <select
                        value={statusFilter || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStatusFilter(value || undefined);
                            setStatus(value || undefined);
                        }}
                        className="bg-primary-black/40 border border-primary-orange/30 rounded-md px-3 py-2 text-sm text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-colors"
                    >
                        <option value="" className="bg-secondary-dark-gray">Todos</option>
                        <option value="approved" className="bg-secondary-dark-gray">Aprobados</option>
                        <option value="rejected" className="bg-secondary-dark-gray">Rechazados</option>
                        <option value="pending" className="bg-secondary-dark-gray">Pendientes</option>
                        <option value="refunded" className="bg-secondary-dark-gray">Reembolsados</option>
                        <option value="cancelled" className="bg-secondary-dark-gray">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Lista de pagos */}
            {payments.length === 0 ? (
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 shadow-lg rounded-lg p-12 text-center">
                    <p className="text-primary-white text-lg font-semibold">No hay pagos registrados</p>
                    <p className="text-secondary-light-gray text-sm mt-2">
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
                            className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 shadow-lg rounded-lg p-6 hover:border-primary-orange/40 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header del pago */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {getStatusIcon(payment.status)}
                                        <div>
                                            <h3 className="font-semibold text-primary-white">
                                                Pago #{payment.id.slice(-8).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-secondary-light-gray">
                                                {formatDate(payment.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalles del pago */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-secondary-light-gray">Monto</p>
                                            <p className="text-lg font-semibold text-primary-white">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-secondary-light-gray">Estado</p>
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
                                                <p className="text-sm text-secondary-light-gray">Cuotas</p>
                                                <p className="text-sm font-medium text-primary-white">
                                                    {payment.installments} cuotas
                                                </p>
                                            </div>
                                        )}
                                        {payment.mercado_pago_payment_id && (
                                            <div>
                                                <p className="text-sm text-secondary-light-gray">ID Mercado Pago</p>
                                                <p className="text-sm font-mono text-secondary-light-gray">
                                                    {payment.mercado_pago_payment_id}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cursos comprados */}
                                    <div className="border-t border-primary-orange/20 pt-4">
                                        <p className="text-sm font-medium text-primary-white mb-2">
                                            Cursos comprados:
                                        </p>
                                        <div className="space-y-1">
                                            {payment.course_names.map((courseName, index) => (
                                                <div
                                                    key={payment.course_ids[index] || index}
                                                    className="flex items-center gap-2 text-sm text-secondary-light-gray"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
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
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 shadow-lg rounded-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-sm text-secondary-light-gray">
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
                            <span className="text-sm text-primary-white px-4">
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

