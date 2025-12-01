'use client';

import { Button, Modal, ProtectedRoute } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useApproveInstructorApplication, useInstructorApplications, useRejectInstructorApplication } from '@/shared/hooks/useInstructorApplications';
import { Award, Briefcase, CheckCircle2, Clock, Download, ExternalLink, FileText, GraduationCap, UserCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function InstructorApplicationsAdminPageContent() {
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined);
    const { applications, count, isLoading, mutate } = useInstructorApplications(statusFilter);
    const { approveApplication, isApproving } = useApproveInstructorApplication();
    const { rejectApplication, isRejecting } = useRejectInstructorApplication();
    const { showToast } = useToast();

    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [showApproveModal, setShowApproveModal] = useState<number | null>(null);
    const [approvingApplication, setApprovingApplication] = useState<{ id: number; userName: string } | null>(null);

    const handleApproveClick = (applicationId: number, userName: string) => {
        setApprovingApplication({ id: applicationId, userName });
        setShowApproveModal(applicationId);
    };

    const handleApproveConfirm = async () => {
        if (!approvingApplication) return;

        try {
            const result = await approveApplication(approvingApplication.id);

            if (result.success) {
                showToast('Solicitud aprobada exitosamente. El usuario ahora es instructor.', 'success');
                setShowApproveModal(null);
                setApprovingApplication(null);
                mutate();
            } else {
                showToast(result.message || 'Error al aprobar solicitud', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al aprobar solicitud', 'error');
        }
    };

    const handleReject = async (applicationId: number) => {
        if (!rejectionReason.trim()) {
            showToast('Por favor, proporciona una razón de rechazo', 'error');
            return;
        }

        try {
            const result = await rejectApplication(applicationId, { rejection_reason: rejectionReason });

            if (result.success) {
                showToast('Solicitud rechazada exitosamente', 'success');
                setShowRejectModal(null);
                setRejectionReason('');
                mutate();
            } else {
                showToast(result.message || 'Error al rechazar solicitud', 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Error al rechazar solicitud', 'error');
        } finally {
            setRejectingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Pendiente',
                icon: <Clock className="w-4 h-4" />,
            },
            approved: {
                color: 'bg-green-100 text-green-800 border-green-200',
                label: 'Aprobado',
                icon: <CheckCircle2 className="w-4 h-4" />,
            },
            rejected: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'Rechazado',
                icon: <XCircle className="w-4 h-4" />,
            },
        };

        const statusConfig = config[status as keyof typeof config] || config.pending;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
            </span>
        );
    };

    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.filter(app => app.status === 'rejected').length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
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
                                Solicitudes de Instructor
                            </h1>
                            <p className="text-gray-600">Revisa y gestiona las solicitudes de instructores</p>
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
                <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                                <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total</p>
                                <p className="text-2xl font-semibold text-gray-900">{count}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                                <p className="text-2xl font-semibold text-gray-900">{approvedCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                                <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                        <button
                            onClick={() => setStatusFilter(undefined)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === undefined
                                    ? 'bg-primary-orange text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === 'approved'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Aprobadas
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === 'rejected'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Rechazadas
                        </button>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Solicitudes de Instructor
                        </h2>
                    </div>

                    {applications.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {statusFilter
                                    ? `No hay solicitudes con estado "${statusFilter}"`
                                    : 'No hay solicitudes de instructor registradas.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-orange/10 flex items-center justify-center">
                                                    <span className="text-primary-orange font-semibold text-lg">
                                                        {application.user.first_name[0]}{application.user.last_name[0]}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {application.user.first_name} {application.user.last_name}
                                                        </h3>
                                                        {getStatusBadge(application.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{application.user.email}</p>
                                                    
                                                    {/* Información clave siempre visible */}
                                                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                                        {application.professional_title && (
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <GraduationCap className="w-4 h-4 text-primary-orange" />
                                                                <span className="font-medium">{application.professional_title}</span>
                                                            </div>
                                                        )}
                                                        {application.experience_years > 0 && (
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Briefcase className="w-4 h-4 text-primary-orange" />
                                                                <span>{application.experience_years} {application.experience_years === 1 ? 'año' : 'años'} de experiencia</span>
                                                            </div>
                                                        )}
                                                        {application.specialization && (
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Award className="w-4 h-4 text-primary-orange" />
                                                                <span>{application.specialization}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Información expandible */}
                                            {expandedId === application.id && (
                                                <div className="ml-16 mt-4 space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-4">
                                                    {application.professional_title && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Título Profesional:</span>{' '}
                                                            {application.professional_title}
                                                        </div>
                                                    )}
                                                    {application.experience_years > 0 && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Años de Experiencia:</span>{' '}
                                                            {application.experience_years}
                                                        </div>
                                                    )}
                                                    {application.specialization && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Especialidad:</span>{' '}
                                                            {application.specialization}
                                                        </div>
                                                    )}
                                                    {application.bio && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Biografía:</span>
                                                            <p className="mt-1 text-gray-600">{application.bio}</p>
                                                        </div>
                                                    )}
                                                    {application.portfolio_url && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Portfolio:</span>{' '}
                                                            <a
                                                                href={application.portfolio_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-orange hover:underline inline-flex items-center gap-1 font-medium"
                                                            >
                                                                Ver Portfolio
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                    {application.cv_file_url && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">CV:</span>{' '}
                                                            <a
                                                                href={application.cv_file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="text-primary-orange hover:underline inline-flex items-center gap-1 font-medium"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                                Descargar CV (PDF)
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-medium text-gray-700">Motivación:</span>
                                                        <p className="mt-1 text-gray-600">{application.motivation}</p>
                                                    </div>
                                                    {application.reviewed_by && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Revisado por:</span>{' '}
                                                            {application.reviewed_by.email}
                                                            {application.reviewed_at && (
                                                                <span className="text-gray-500">
                                                                    {' '}el {new Date(application.reviewed_at).toLocaleDateString('es-ES')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {application.rejection_reason && (
                                                        <div>
                                                            <span className="font-medium text-red-700">Razón de Rechazo:</span>
                                                            <p className="mt-1 text-red-600">{application.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <div>
                                                            <span className="font-medium">Creada:</span> {new Date(application.created_at).toLocaleString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                        {application.reviewed_at && (
                                                            <div>
                                                                <span className="font-medium">Revisada:</span> {new Date(application.reviewed_at).toLocaleString('es-ES', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3 ml-4">
                                            {application.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApproveClick(application.id, `${application.user.first_name} ${application.user.last_name}`)}
                                                        disabled={isApproving}
                                                    >
                                                        {isApproving ? 'Aprobando...' : 'Aprobar'}
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setShowRejectModal(application.id)}
                                                        disabled={isRejecting}
                                                    >
                                                        Rechazar
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setExpandedId(expandedId === application.id ? null : application.id)}
                                            >
                                                {expandedId === application.id ? 'Ocultar' : 'Ver Detalles'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Approve Modal */}
            {showApproveModal && approvingApplication && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setShowApproveModal(null);
                        setApprovingApplication(null);
                    }}
                    title="¿Aprobar Solicitud?"
                    message={
                        <>
                            Estás a punto de aprobar la solicitud de <strong>{approvingApplication.userName}</strong>.
                            <br /><br />
                            Al confirmar, el usuario se convertirá en <strong>instructor</strong> y podrá:
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>Crear cursos en la plataforma</li>
                                <li>Gestionar su contenido educativo</li>
                                <li>Publicar cursos (después de revisión)</li>
                            </ul>
                            <br />
                            <span className="text-sm text-gray-500">¿Deseas continuar?</span>
                        </>
                    }
                    icon={<UserCheck className="w-6 h-6" />}
                    confirmText="Sí, Aprobar"
                    cancelText="Cancelar"
                    onConfirm={handleApproveConfirm}
                    variant="success"
                    isLoading={isApproving}
                />
            )}

            {/* Reject Modal */}
            {showRejectModal && (() => {
                const application = applications.find(app => app.id === showRejectModal);
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                        setShowRejectModal(null);
                        setRejectionReason('');
                    }}>
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                {/* Icon and Title */}
                                <div className="flex items-start space-x-4 mb-4">
                                    <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rechazar Solicitud</h3>
                                        <p className="text-gray-600 leading-relaxed mb-2">
                                            Estás a punto de rechazar la solicitud de{' '}
                                            <strong>{application?.user.first_name} {application?.user.last_name}</strong>.
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Por favor, proporciona una razón para el rechazo. Esta información será útil para el usuario.
                                        </p>
                                    </div>
                                </div>

                                {/* Rejection Reason Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Razón de Rechazo <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows={4}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Ej: No cumple con los requisitos mínimos de experiencia o especialización requerida para ser instructor en nuestra plataforma..."
                                    />
                                    {!rejectionReason.trim() && (
                                        <p className="mt-1 text-xs text-red-500">La razón de rechazo es requerida</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setShowRejectModal(null);
                                            setRejectionReason('');
                                        }}
                                        disabled={isRejecting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            setRejectingId(showRejectModal);
                                            handleReject(showRejectModal);
                                        }}
                                        disabled={!rejectionReason.trim() || isRejecting}
                                        loading={isRejecting}
                                    >
                                        {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default function InstructorApplicationsAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
            <InstructorApplicationsAdminPageContent />
        </ProtectedRoute>
    );
}

