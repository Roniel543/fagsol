'use client';

import { Button, ProtectedRoute } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/hooks/useAuth';
import {
    useApproveCourse,
    usePendingCourses,
    useRejectCourse,
} from '@/shared/hooks/useCourses';
import { type CourseWithReview } from '@/shared/services/courses';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { mutate as swrMutate } from 'swr';

function CoursesPendingAdminPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { courses, isLoading, mutate } = usePendingCourses();
    const { approveCourse, isApproving } = useApproveCourse();
    const { rejectCourse, isRejecting } = useRejectCourse();
    const { showToast } = useToast();

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [approvingNotes, setApprovingNotes] = useState('');
    const [showApproveModal, setShowApproveModal] = useState<string | null>(null);

    const handleApprove = async (courseId: string) => {
        try {
            const result = await approveCourse({
                courseId,
                data: approvingNotes ? { notes: approvingNotes } : undefined,
            });

            if (result.success) {
                showToast('Curso aprobado exitosamente', 'success');
                setShowApproveModal(null);
                setApprovingNotes('');
                mutate();
                // Invalidar caché del dashboard para que se actualice inmediatamente
                swrMutate('dashboard-stats');
            } else {
                showToast(result.message || 'Error al aprobar curso', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al aprobar curso', 'error');
        }
    };

    const handleReject = async (courseId: string) => {
        if (!rejectionReason.trim()) {
            showToast('Por favor, proporciona una razón de rechazo', 'error');
            return;
        }

        try {
            const result = await rejectCourse({
                courseId,
                data: { rejection_reason: rejectionReason },
            });

            if (result.success) {
                showToast('Curso rechazado exitosamente', 'success');
                setShowRejectModal(null);
                setRejectionReason('');
                mutate();
                // Invalidar caché del dashboard para que se actualice inmediatamente
                swrMutate('dashboard-stats');
            } else {
                showToast(result.message || 'Error al rechazar curso', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al rechazar curso', 'error');
        } finally {
            setRejectingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            needs_revision: 'bg-orange-100 text-orange-800 border-orange-200',
            published: 'bg-green-100 text-green-800 border-green-200',
            archived: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels = {
            draft: 'Borrador',
            pending_review: 'Pendiente de Revisión',
            needs_revision: 'Requiere Cambios',
            published: 'Publicado',
            archived: 'Archivado',
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.draft
                    }`}
            >
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando cursos pendientes...</p>
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
                                Revisión de Cursos
                            </h1>
                            <p className="text-gray-600">Revisa y aprueba cursos pendientes</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/courses">
                                <Button variant="secondary" size="sm">
                                    Todos los Cursos
                                </Button>
                            </Link>
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
                                <svg
                                    className="h-6 w-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pendientes de Revisión</p>
                                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Cursos Pendientes de Revisión
                        </h2>
                    </div>

                    {courses.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cursos pendientes</h3>
                            <p className="mt-1 text-sm text-gray-500">Todos los cursos han sido revisados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Curso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Creación
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.map((course: CourseWithReview) => (
                                        <tr key={course.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded bg-primary-orange/10 flex items-center justify-center">
                                                        <svg
                                                            className="h-6 w-6 text-primary-orange"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {course.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {course.short_description || course.description?.substring(0, 60) + '...'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {course.created_by?.email || course.instructor?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {new Intl.NumberFormat('es-PE', {
                                                        style: 'currency',
                                                        currency: course.currency || 'PEN',
                                                    }).format(course.price)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(course.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(course.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => setShowApproveModal(course.id)}
                                                        disabled={isApproving}
                                                    >
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setShowRejectModal(course.id)}
                                                        disabled={isRejecting}
                                                    >
                                                        Rechazar
                                                    </Button>
                                                    <Link href={`/admin/courses/${course.id}/edit`}>
                                                        <Button variant="secondary" size="sm">
                                                            Ver Detalles
                                                        </Button>
                                                    </Link>
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

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Aprobar Curso</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-600 mb-4">
                                ¿Estás seguro de que deseas aprobar este curso? (Notas opcionales):
                            </p>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                                rows={4}
                                value={approvingNotes}
                                onChange={(e) => setApprovingNotes(e.target.value)}
                                placeholder="Notas sobre la aprobación (opcional)..."
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setShowApproveModal(null);
                                    setApprovingNotes('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApprove(showApproveModal)}
                                disabled={isApproving}
                            >
                                {isApproving ? 'Aprobando...' : 'Confirmar Aprobación'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Rechazar Curso</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Por favor, proporciona una razón para rechazar este curso:
                            </p>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ej: El contenido no cumple con los estándares de calidad. Por favor, mejora la descripción..."
                                required
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

export default function CoursesPendingAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
            <CoursesPendingAdminPageContent />
        </ProtectedRoute>
    );
}

