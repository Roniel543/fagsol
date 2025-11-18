'use client';

import { Button, Card, LoadingSpinner, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCourses } from '@/shared/hooks/useCourses';
import { deleteCourse } from '@/shared/services/courses';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function CoursesAdminPageContent() {
    const router = useRouter();
    const { user } = useAuth(); // Solo necesitamos user para verificar rol
    const { courses, isLoading, mutate } = useCourses({ status: undefined }); // Obtener todos los cursos
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
                // Revalidar la lista de cursos
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
        // El status puede venir del backend directamente o necesitamos obtenerlo
        const status = (course as any).status || 'draft';
        const colors = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-gray-100 text-gray-800',
            pending_review: 'bg-yellow-100 text-yellow-800',
            needs_revision: 'bg-orange-100 text-orange-800',
            archived: 'bg-red-100 text-red-800',
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
                                    <p className="text-gray-600 mb-4">No hay cursos creados aún.</p>
                                    <Link href="/admin/courses/new">
                                        <Button variant="primary">Crear Primer Curso</Button>
                                    </Link>
                                </Card>
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {courses.map((course) => (
                                            <li key={course.id}>
                                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            {course.thumbnailUrl && (
                                                                <img
                                                                    src={course.thumbnailUrl}
                                                                    alt={course.title}
                                                                    className="h-16 w-16 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2">
                                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                                        {course.title}
                                                                    </h3>
                                                                    {getStatusBadge(course)}
                                                                </div>
                                                                <p className="text-sm text-gray-500 truncate mt-1">
                                                                    {course.subtitle || course.description}
                                                                </p>
                                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                                    <span>Precio: S/ {course.price}</span>
                                                                    <span>•</span>
                                                                    <span>Categoría: {course.category}</span>
                                                                    <span>•</span>
                                                                    <span>Nivel: {course.level}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <Link href={`/academy/course/${course.slug}`}>
                                                                <Button variant="secondary" size="sm">
                                                                    Ver
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                                <Button variant="primary" size="sm">
                                                                    Editar
                                                                </Button>
                                                            </Link>
                                                            {user?.role === 'admin' && (
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(course.id)}
                                                                    disabled={deletingId === course.id}
                                                                >
                                                                    {deletingId === course.id ? 'Eliminando...' : 'Eliminar'}
                                                                </Button>
                                                            )}
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

