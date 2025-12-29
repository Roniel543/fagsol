'use client';

import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { Button, LoadingSpinner, Modal, ProtectedRoute, useToast } from '@/shared/components';
import { useInstructorCourses } from '@/shared/hooks/useCourses';
import { deleteCourse } from '@/shared/services/courses';
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Edit, Eye, FileText, Plus, Search, Star, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { mutate as swrMutate } from 'swr';

function InstructorCoursesPageContent() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending_review' | 'needs_revision' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string; status: string; enrollments: number } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Obtener cursos del instructor
    const { courses, isLoading, isError, error, mutate } = useInstructorCourses({
        status: statusFilter,
        search: searchQuery || undefined,
    });

    // Filtrar cursos localmente si es necesario (el backend ya filtra, pero por si acaso)
    const filteredCourses = useMemo(() => {
        if (statusFilter === 'all') {
            return courses;
        }
        return courses.filter(course => {
            const courseStatus = (course as any).status;
            if (statusFilter === 'pending_review') {
                return courseStatus === 'pending_review';
            }
            return courseStatus === statusFilter;
        });
    }, [courses, statusFilter]);

    // Determinar si un curso puede ser eliminado por el instructor
    const canDeleteCourse = (course: any): { canDelete: boolean; reason?: string } => {
        const courseStatus = course.status;
        const enrollments = course.enrollments || 0;

        // Solo puede eliminar cursos en draft o needs_revision
        if (courseStatus !== 'draft' && courseStatus !== 'needs_revision') {
            return {
                canDelete: false,
                reason: courseStatus === 'published'
                    ? 'No puedes eliminar cursos publicados. Contacta a un administrador.'
                    : 'Solo puedes eliminar cursos en estado "Borrador" o "Requiere Cambios".'
            };
        }

        // No puede eliminar si hay estudiantes inscritos
        if (enrollments > 0) {
            return {
                canDelete: false,
                reason: `No puedes eliminar este curso porque tiene ${enrollments} estudiante(s) inscrito(s). Contacta a un administrador.`
            };
        }

        return { canDelete: true };
    };

    const handleDeleteClick = (course: any) => {
        const { canDelete, reason } = canDeleteCourse(course);

        if (!canDelete) {
            showToast(reason || 'No puedes eliminar este curso', 'error');
            return;
        }

        setCourseToDelete({
            id: course.id,
            title: course.title,
            status: course.status,
            enrollments: course.enrollments || 0
        });
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!courseToDelete) return;

        setDeletingId(courseToDelete.id);
        setShowDeleteModal(false);

        try {
            const result = await deleteCourse(courseToDelete.id);
            if (result.success) {
                showToast('Curso eliminado exitosamente', 'success');
                mutate();
                // Invalidar caché del dashboard para que se actualice inmediatamente
                swrMutate('dashboard-stats');
            } else {
                showToast(`${result.message || 'Error al eliminar el curso'}`, 'error');
            }
        } catch (err: any) {
            showToast(`${err.message || 'Error al eliminar el curso'}`, 'error');
        } finally {
            setDeletingId(null);
            setCourseToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
    };

    return (
        <div className="min-h-screen bg-primary-black text-primary-white relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <InstructorHeader
                title="Mis Cursos"
                subtitle="Gestiona todos tus cursos desde aquí"
                rightAction={
                    <Link href="/instructor/courses/new">
                        <Button variant="primary" size="lg" className="flex items-center space-x-2 shadow-lg hover:shadow-primary-orange/50 transition-all duration-300">
                            <Plus className="w-5 h-5" />
                            <span>Crear Nuevo Curso</span>
                        </Button>
                    </Link>
                }
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Búsqueda y Filtros */}
                <div className="mb-8 space-y-6">
                    {/* Barra de búsqueda mejorada */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Search className="w-5 h-5 text-secondary-light-gray" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar cursos por título..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-primary-black/40 border border-primary-orange/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-primary-white placeholder-secondary-light-gray transition-all duration-300"
                        />
                    </div>

                    {/* Filtros por estado mejorados */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${statusFilter === 'all'
                                ? 'bg-gradient-to-r from-primary-orange to-amber-500 text-white shadow-lg shadow-primary-orange/30'
                                : 'bg-secondary-dark-gray/60 border border-primary-orange/20 text-secondary-light-gray hover:border-primary-orange/40 hover:bg-secondary-dark-gray/80'
                                }`}
                        >
                            <span>Todos</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('published')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${statusFilter === 'published'
                                ? 'bg-green-500/20 border-2 border-green-500 text-green-300 shadow-lg shadow-green-500/20'
                                : 'bg-secondary-dark-gray/60 border border-primary-orange/20 text-secondary-light-gray hover:border-green-500/40 hover:bg-secondary-dark-gray/80'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Publicados</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('draft')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${statusFilter === 'draft'
                                ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                                : 'bg-secondary-dark-gray/60 border border-primary-orange/20 text-secondary-light-gray hover:border-amber-500/40 hover:bg-secondary-dark-gray/80'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Borradores</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending_review')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${statusFilter === 'pending_review'
                                ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20'
                                : 'bg-secondary-dark-gray/60 border border-primary-orange/20 text-secondary-light-gray hover:border-blue-500/40 hover:bg-secondary-dark-gray/80'
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>Pendientes</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('needs_revision')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${statusFilter === 'needs_revision'
                                ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-300 shadow-lg shadow-orange-500/20'
                                : 'bg-secondary-dark-gray/60 border border-primary-orange/20 text-secondary-light-gray hover:border-orange-500/40 hover:bg-secondary-dark-gray/80'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Requiere Cambios</span>
                        </button>
                    </div>
                </div>

                {/* Lista de Cursos */}
                {isLoading ? (
                    <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg p-12 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-secondary-light-gray font-medium">Cargando cursos...</p>
                    </div>
                ) : isError ? (
                    <div className="relative bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center backdrop-blur-sm">
                        <p className="text-red-300 mb-4 font-medium">
                            {error?.message || 'Error al cargar los cursos. Por favor, intenta nuevamente.'}
                        </p>
                        <Button variant="primary" onClick={() => mutate()}>
                            Reintentar
                        </Button>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-orange/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-primary-orange" />
                        </div>
                        <h3 className="text-2xl font-bold text-primary-white mb-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No se encontraron cursos'
                                : 'No tienes cursos aún'}
                        </h3>
                        <p className="text-secondary-light-gray mb-6 max-w-md mx-auto">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Intenta con otros filtros o crea un nuevo curso'
                                : 'Comienza creando tu primer curso y comparte tu conocimiento con el mundo'}
                        </p>
                        <Link href="/instructor/courses/new">
                            <Button variant="primary" size="lg" className="flex items-center space-x-2 mx-auto">
                                <Plus className="w-5 h-5" />
                                <span>Crear Mi Primer Curso</span>
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredCourses.map((course) => {
                            const courseStatus = (course as any).status;
                            const enrollments = (course as any).enrollments || 0;
                            const rating = course.rating || 0.0;

                            // Colores y estilos según el estado
                            const statusConfig = {
                                published: {
                                    bg: 'bg-green-500/20',
                                    border: 'border-green-500/40',
                                    text: 'text-green-300',
                                    icon: <CheckCircle2 className="w-3 h-3" />,
                                    label: 'Publicado'
                                },
                                draft: {
                                    bg: 'bg-amber-500/20',
                                    border: 'border-amber-500/40',
                                    text: 'text-amber-300',
                                    icon: <FileText className="w-3 h-3" />,
                                    label: 'Borrador'
                                },
                                pending_review: {
                                    bg: 'bg-blue-500/20',
                                    border: 'border-blue-500/40',
                                    text: 'text-blue-300',
                                    icon: <Clock className="w-3 h-3" />,
                                    label: 'Pendiente'
                                },
                                needs_revision: {
                                    bg: 'bg-orange-500/20',
                                    border: 'border-orange-500/40',
                                    text: 'text-orange-300',
                                    icon: <FileText className="w-3 h-3" />,
                                    label: 'Requiere Cambios'
                                },
                                archived: {
                                    bg: 'bg-gray-500/20',
                                    border: 'border-gray-500/40',
                                    text: 'text-gray-300',
                                    icon: <FileText className="w-3 h-3" />,
                                    label: 'Archivado'
                                }
                            };

                            const status = statusConfig[courseStatus as keyof typeof statusConfig] || statusConfig.draft;

                            return (
                                <div
                                    key={course.id}
                                    className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Efecto de brillo decorativo */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/5 rounded-full blur-3xl group-hover:bg-primary-orange/10 transition-all duration-300"></div>

                                    <div className="relative p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <h3 className="text-xl font-bold text-primary-white group-hover:text-primary-orange transition-colors duration-300 truncate">
                                                        {course.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.border} ${status.text}`}>
                                                        {status.icon}
                                                        <span>{status.label}</span>
                                                    </span>
                                                </div>
                                                <p className="text-secondary-light-gray mb-4 line-clamp-2 text-sm">
                                                    {course.description || course.subtitle || 'Sin descripción'}
                                                </p>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <span className="flex items-center gap-2 text-secondary-light-gray">
                                                        <Users className="w-4 h-4 text-primary-orange" />
                                                        <span className="font-medium">{enrollments} {enrollments === 1 ? 'inscripción' : 'inscripciones'}</span>
                                                    </span>
                                                    <span className="flex items-center gap-2 text-secondary-light-gray">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                        <span className="font-medium">{rating.toFixed(1)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Link
                                                    href={`/academy/course/${course.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Ver curso en la academia"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="hover:bg-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={`/instructor/courses/${course.id}/edit`}
                                                    title="Editar curso"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="hover:bg-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {(() => {
                                                    const { canDelete, reason } = canDeleteCourse(course);
                                                    const tooltipText = !canDelete ? reason : 'Eliminar curso';
                                                    return (
                                                        <div title={tooltipText} className="inline-block">
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(course)}
                                                                disabled={deletingId === course.id || !canDelete}
                                                                aria-label={tooltipText}
                                                                className="hover:scale-110 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {deletingId === course.id ? (
                                                                    <LoadingSpinner size="sm" />
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal de confirmación para eliminar curso */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={handleDeleteCancel}
                    title="Eliminar Curso"
                    message={
                        courseToDelete ? (
                            <div className="space-y-2">
                                <p>¿Estás seguro de que deseas eliminar el curso <strong>"{courseToDelete.title}"</strong>?</p>
                                <p className="text-sm text-gray-600">Esta acción no se puede deshacer. El curso será archivado.</p>
                            </div>
                        ) : '¿Estás seguro de que deseas eliminar este curso?'
                    }
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant="danger"
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    onConfirm={handleDeleteConfirm}
                    isLoading={deletingId !== null}
                />
            </main>
        </div>
    );
}

export default function InstructorCoursesPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <InstructorCoursesPageContent />
        </ProtectedRoute>
    );
}

