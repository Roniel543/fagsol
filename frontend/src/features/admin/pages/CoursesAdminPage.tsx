'use client';

import { Button, Card, LoadingSpinner, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAllCoursesAdmin, useCourseStatusCounts } from '@/shared/hooks/useCourses';
import { deleteCourse } from '@/shared/services/courses';
import { BookOpen, Edit, Eye, FileText, Filter, Trash2, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

type StatusFilter = 'pending_review' | 'needs_revision' | 'published' | 'draft' | 'archived' | undefined;

function CoursesAdminPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
    const { courses, isLoading, mutate } = useAllCoursesAdmin(statusFilter);
    const { counts, isLoading: isLoadingCounts } = useCourseStatusCounts();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (courseId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeletingId(courseId);
        setError(null);

        try {
            const result = await deleteCourse(courseId);
            if (result.success) {
                // Revalidar la lista de cursos y contadores
                mutate();
            } else {
                setError(result.message || 'Error al eliminar el curso');
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el curso');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (course: any) => {
        const status = (course as any).status || 'draft';
        const colors = {
            published: 'bg-green-100 text-green-800 border border-green-300',
            draft: 'bg-gray-100 text-gray-800 border border-gray-300',
            pending_review: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
            needs_revision: 'bg-orange-100 text-orange-800 border border-orange-300',
            archived: 'bg-red-100 text-red-800 border border-red-300',
        };
        const labels = {
            published: 'Publicado',
            draft: 'Borrador',
            pending_review: 'Pendiente de Revisión',
            needs_revision: 'Requiere Cambios',
            archived: 'Archivado',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.draft}`}>
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
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
                                        ${
                                            statusFilter === filter.key
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
                                                ${
                                                    statusFilter === filter.key
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
                                <Card className="p-8 text-center">
                                    <p className="text-gray-900 mb-4">
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
                                </Card>
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
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
                                    <ul className="divide-y divide-gray-200">
                                        {courses.map((course) => (
                                            <li key={course.id}>
                                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                                                            {course.thumbnail_url && (
                                                                <img
                                                                    src={course.thumbnail_url}
                                                                    alt={course.title}
                                                                    className="h-16 w-16 object-cover rounded flex-shrink-0"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                                        {course.title}
                                                                    </h3>
                                                                    {getStatusBadge(course)}
                                                                </div>
                                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                                    {course.short_description || course.description}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                                    <span>Precio: S/ {course.price}</span>
                                                                    {course.category && (
                                                                        <>
                                                                            <span className="hidden sm:inline">•</span>
                                                                            <span>Categoría: {course.category}</span>
                                                                        </>
                                                                    )}
                                                                    {course.level && (
                                                                        <>
                                                                            <span className="hidden sm:inline">•</span>
                                                                            <span>Nivel: {course.level}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:items-end lg:min-w-[200px]">
                                                            {/* Botones principales */}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Link href={`/academy/course/${course.slug}`} className="flex-shrink-0">
                                                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                                                                        <Eye className="w-4 h-4 mr-1" />
                                                                        Ver
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/admin/courses/${course.id}/edit`} className="flex-shrink-0">
                                                                    <Button variant="primary" size="sm" className="w-full sm:w-auto">
                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                </Link>
                                                                {user?.role === 'admin' && (
                                                                    <Button
                                                                        variant="danger"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(course.id)}
                                                                        disabled={deletingId === course.id}
                                                                        className="w-full sm:w-auto"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        {deletingId === course.id ? 'Eliminando...' : 'Eliminar'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            {/* Enlaces de gestión */}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Link href={`/admin/courses/${course.id}/modules`} className="flex-shrink-0">
                                                                    <Button variant="secondary" size="sm" className="text-xs w-full sm:w-auto">
                                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                                        Módulos
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/admin/courses/${course.id}/materials`} className="flex-shrink-0">
                                                                    <Button variant="secondary" size="sm" className="text-xs w-full sm:w-auto">
                                                                        <FileText className="w-3 h-3 mr-1" />
                                                                        Materiales
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/admin/courses/${course.id}/students`} className="flex-shrink-0">
                                                                    <Button variant="secondary" size="sm" className="text-xs w-full sm:w-auto">
                                                                        <Users className="w-3 h-3 mr-1" />
                                                                        Alumnos
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
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
