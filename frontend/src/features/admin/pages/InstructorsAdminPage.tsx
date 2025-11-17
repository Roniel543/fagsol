'use client';

import { Button, ProtectedRoute } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/hooks/useAuth';
import { useApproveInstructor, usePendingInstructors, useRejectInstructor } from '@/shared/hooks/useInstructors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function InstructorsAdminPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { instructors, isLoading, mutate } = usePendingInstructors();
    const { approveInstructor, isApproving } = useApproveInstructor();
    const { rejectInstructor, isRejecting } = useRejectInstructor();
    const { showToast } = useToast();

    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

    const handleApprove = async (instructorId: number) => {
        if (!confirm('¿Estás seguro de que deseas aprobar a este instructor?')) {
            return;
        }

        try {
            const result = await approveInstructor({ instructorId, data: {} });

            if (result.success) {
                showToast('Instructor aprobado exitosamente', 'success');
                mutate();
            } else {
                showToast(result.message || 'Error al aprobar instructor', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al aprobar instructor', 'error');
        }
    };

    const handleReject = async (instructorId: number) => {
        if (!rejectionReason.trim()) {
            showToast('Por favor, proporciona una razón de rechazo', 'error');
            return;
        }

        try {
            const result = await rejectInstructor({ instructorId, data: { rejection_reason: rejectionReason } });

            if (result.success) {
                showToast('Instructor rechazado exitosamente', 'success');
                setShowRejectModal(null);
                setRejectionReason('');
                mutate();
            } else {
                showToast(result.message || 'Error al rechazar instructor', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al rechazar instructor', 'error');
        } finally {
            setRejectingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels = {
            pending_approval: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending_approval}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando instructores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Administración de Instructores
                            </h1>
                            <p className="text-gray-600">Revisa y aprueba instructores pendientes</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="secondary" size="sm">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold text-gray-900">{instructors.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructors List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Instructores Pendientes de Aprobación
                        </h2>
                    </div>

                    {instructors.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay instructores pendientes</h3>
                            <p className="mt-1 text-sm text-gray-500">Todos los instructores han sido revisados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Registro
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {instructors.map((instructor) => (
                                        <tr key={instructor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-orange/10 flex items-center justify-center">
                                                        <span className="text-primary-orange font-semibold">
                                                            {instructor.first_name[0]}{instructor.last_name[0]}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {instructor.first_name} {instructor.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{instructor.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(instructor.instructor_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(instructor.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApprove(instructor.id)}
                                                        disabled={isApproving}
                                                    >
                                                        {isApproving ? 'Aprobando...' : 'Aprobar'}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setShowRejectModal(instructor.id)}
                                                        disabled={isRejecting}
                                                    >
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Rechazar Instructor</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Por favor, proporciona una razón para rechazar a este instructor:
                            </p>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ej: No cumple con los requisitos mínimos de experiencia..."
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectionReason('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setRejectingId(showRejectModal);
                                    handleReject(showRejectModal);
                                }}
                                disabled={!rejectionReason.trim() || isRejecting}
                            >
                                {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InstructorsAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
            <InstructorsAdminPageContent />
        </ProtectedRoute>
    );
}

