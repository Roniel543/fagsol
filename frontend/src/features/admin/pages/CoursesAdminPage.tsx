'use client';

import { Button, LoadingSpinner, Modal, ProtectedRoute, useToast } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAllCoursesAdmin, useCourseStatusCounts } from '@/shared/hooks/useCourses';
import { deleteCourse } from '@/shared/services/courses';
import { AlertTriangle, BookOpen, Edit, Eye, FileText, Filter, MoreVertical, Trash2, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { mutate as swrMutate } from 'swr';

type StatusFilter = 'pending_review' | 'needs_revision' | 'published' | 'draft' | 'archived' | undefined;

function CoursesAdminPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
    const { courses, isLoading, mutate } = useAllCoursesAdmin(statusFilter);
    const { counts, isLoading: isLoadingCounts } = useCourseStatusCounts();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    const handleDeleteClick = (courseId: string) => {
        setCourseToDelete(courseId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!courseToDelete) return;

        setDeletingId(courseToDelete);
        setError(null);
        setShowDeleteModal(false);

        try {
            const result = await deleteCourse(courseToDelete);
            if (result.success) {
                showToast('Curso eliminado exitosamente', 'success');
                // Revalidar la lista de cursos y contadores
                mutate();
                // Invalidar caché del dashboard para que se actualice inmediatamente
                swrMutate('dashboard-stats');
            } else {
                showToast(`${result.message || 'Error al eliminar el curso'}`, 'error');
                setError(result.message || 'Error al eliminar el curso');
            }
        } catch (err: any) {
            showToast(`❌ ${err.message || 'Error al eliminar el curso'}`, 'error');
            setError(err.message || 'Error al eliminar el curso');
        } finally {
            setDeletingId(null);
            setCourseToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
    };

    const getStatusBadge = (course: any) => {
        const status = (course as any).status || 'draft';
        const colors = {
            published: 'bg-green-600 text-white border border-green-700',
            draft: 'bg-gray-600 text-white border border-gray-700',
            pending_review: 'bg-yellow-600 text-white border border-yellow-700',
            needs_revision: 'bg-orange-600 text-white border border-orange-700',
            archived: 'bg-red-600 text-white border border-red-700',
        };
        const labels = {
            published: 'Publicado',
            draft: 'Borrador',
            pending_review: 'Pendiente',
            needs_revision: 'Requiere Cambios',
            archived: 'Archivado',
        };
        return (
            <span className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${colors[status as keyof typeof colors] || colors.draft}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const filterButtons = [
        { key: undefined as StatusFilter, label: 'Todos', count: counts.all },
        { key: 'published' as StatusFilter, label: 'Publicados', count: counts.published },
        { key: 'draft' as StatusFilter, label: 'Borradores', count: counts.draft },
        { key: 'pending_review' as StatusFilter, label: 'Pendientes', count: counts.pending_review },
        { key: 'needs_revision' as StatusFilter, label: 'Requieren Cambios', count: counts.needs_revision },
        { key: 'archived' as StatusFilter, label: 'Archivados', count: counts.archived },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Administración de Cursos
                            </h1>
                            <p className="text-gray-600">Gestiona los cursos de la plataforma</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user?.role === 'admin' && (
                                <Link href="/admin/courses/pending">
                                    <Button variant="secondary" size="sm">
                                        Cursos Pendientes
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="secondary" size="sm">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                            <Link href="/admin/courses/new">
                                <Button variant="primary" size="sm">
                                    Crear Nuevo Curso
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Filtros */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Filtrar por Estado</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filterButtons.map((filter) => (
                                <button
                                    key={filter.key || 'all'}
                                    onClick={() => setStatusFilter(filter.key)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        flex items-center gap-2
                                        ${statusFilter === filter.key
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }
                                    `}
                                    disabled={isLoadingCounts}
                                >
                                    <span>{filter.label}</span>
                                    {!isLoadingCounts && (
                                        <span
                                            className={`
                                                px-2 py-0.5 rounded-full text-xs font-bold
                                                ${statusFilter === filter.key
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                                }
                                            `}
                                        >
                                            {filter.count}
                                        </span>
                                    )}
                                    {statusFilter === filter.key && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusFilter(undefined);
                                            }}
                                            className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-600">Cargando cursos...</p>
                        </div>
                    )}

                    {/* Courses List */}
                    {!isLoading && (
                        <>
                            {courses.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                    <p className="text-gray-900 mb-4 font-medium">
                                        {statusFilter
                                            ? `No hay cursos con estado "${filterButtons.find((f) => f.key === statusFilter)?.label || statusFilter}".`
                                            : 'No hay cursos creados aún.'}
                                    </p>
                                    {!statusFilter && (
                                        <Link href="/admin/courses/new">
                                            <Button variant="primary">Crear Primer Curso</Button>
                                        </Link>
                                    )}
                                    {statusFilter && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => setStatusFilter(undefined)}
                                        >
                                            Ver Todos los Cursos
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-semibold">{courses.length}</span>{' '}
                                            {courses.length === 1 ? 'curso' : 'cursos'}
                                            {statusFilter && (
                                                <>
                                                    {' '}
                                                    con estado{' '}
                                                    <span className="font-semibold">
                                                        "{filterButtons.find((f) => f.key === statusFilter)?.label}"
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    {/* Grid de Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {courses.map((course) => (
                                            <div
                                                key={course.id}
                                                className={`group relative bg-white rounded-lg shadow-sm border border-gray-300 hover:shadow-md hover:border-gray-400 transition-all duration-200 ${openMenuId === course.id ? 'overflow-visible' : 'overflow-hidden'}`}
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                                    {course.thumbnail_url ? (
                                                                <img
                                                                    src={course.thumbnail_url}
                                                                    alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <BookOpen className="w-16 h-16 text-gray-400" />
                                                        </div>
                                                    )}
                                                    {/* Overlay con badge de estado */}
                                                    <div className="absolute top-3 left-3 z-10">
                                                        {getStatusBadge(course)}
                                                    </div>
                                                    {/* Menú de acciones en hover */}
                                                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                                                                className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                                                            >
                                                                <MoreVertical className="w-4 h-4 text-gray-800" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dropdown fuera del thumbnail para evitar cortes */}
                                                {openMenuId === course.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-30"
                                                            onClick={() => setOpenMenuId(null)}
                                                        ></div>
                                                        <div className="absolute top-14 right-3 w-48 bg-white rounded-md shadow-lg border border-gray-300 z-40 py-1">
                                                            <Link
                                                                href={`/academy/course/${course.slug}`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Eye className="w-4 h-4 text-gray-700" />
                                                                Ver Curso
                                                            </Link>
                                                            <Link
                                                                href={`/admin/courses/${course.id}/modules`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <BookOpen className="w-4 h-4 text-gray-700" />
                                                                Módulos
                                                            </Link>
                                                            <Link
                                                                href={`/admin/courses/${course.id}/materials`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <FileText className="w-4 h-4 text-gray-700" />
                                                                Materiales
                                                            </Link>
                                                            <Link
                                                                href={`/admin/courses/${course.id}/students`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Users className="w-4 h-4 text-gray-700" />
                                                                Alumnos
                                                            </Link>
                                                            {user?.role === 'admin' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenMenuId(null);
                                                                        handleDeleteClick(course.id);
                                                                    }}
                                                                    disabled={deletingId === course.id}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    {deletingId === course.id ? 'Eliminando...' : 'Eliminar'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}

                                                {/* Contenido del Card */}
                                                <div className="p-5">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-orange transition-colors">
                                                                        {course.title}
                                                                    </h3>
                                                    <p className="text-sm text-gray-700 line-clamp-2 mb-4 min-h-[2.5rem]">
                                                                    {course.short_description || course.description}
                                                                </p>

                                                    {/* Información adicional */}
                                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Precio</span>
                                                            <span className="text-lg font-bold text-primary-orange mt-1">S/ {course.price}</span>
                                                        </div>
                                                                    {course.category && (
                                                            <div className="text-right">
                                                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide block">Categoría</span>
                                                                <span className="text-sm font-semibold text-gray-900 mt-1">{course.category}</span>
                                                            </div>
                                                        )}
                                                        </div>

                                                    {/* Botones principales siempre visibles */}
                                                    <div className="flex gap-2">
                                                        <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                                                            <Button variant="primary" size="sm" className="w-full">
                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                </Link>
                                                        <Link href={`/academy/course/${course.slug}`} className="flex-1">
                                                            <Button variant="secondary" size="sm" className="w-full">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Ver
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modal de confirmación para eliminar curso */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                title="Eliminar Curso"
                message="¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer."
                icon={<AlertTriangle className="w-6 h-6" />}
                variant="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                isLoading={deletingId !== null}
            />
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export default function CoursesAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor']} fallbackRoute="/dashboard">
            <CoursesAdminPageContent />
        </ProtectedRoute>
    );
}
