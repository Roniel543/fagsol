'use client';

import { Button, LoadingSpinner, ProtectedRoute } from '@/shared/components';
import { useInstructorCourses } from '@/shared/hooks/useCourses';
import { BookOpen, CheckCircle2, Clock, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function InstructorCoursesPageContent() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending_review' | 'needs_revision' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mis Cursos
                            </h1>
                            <p className="text-gray-600 mt-1">Gestiona todos tus cursos desde aquí</p>
                        </div>
                        <Link href="/instructor/courses/new">
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Nuevo Curso
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Búsqueda y Filtros */}
                <div className="mb-6 space-y-4">
                    {/* Barra de búsqueda */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar cursos por título..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Filtros por estado */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                                ? 'bg-primary-orange text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setStatusFilter('published')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'published'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Publicados
                        </button>
                        <button
                            onClick={() => setStatusFilter('draft')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'draft'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Borradores
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending_review')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'pending_review'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setStatusFilter('needs_revision')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'needs_revision'
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Requiere Cambios
                        </button>
                    </div>
                </div>

                {/* Lista de Cursos */}
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600">Cargando cursos...</p>
                    </div>
                ) : isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">
                            {error?.message || 'Error al cargar los cursos. Por favor, intenta nuevamente.'}
                        </p>
                        <Button variant="primary" onClick={() => mutate()}>
                            Reintentar
                        </Button>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No se encontraron cursos'
                                : 'No tienes cursos aún'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Intenta con otros filtros o crea un nuevo curso'
                                : 'Comienza creando tu primer curso'}
                        </p>
                        <Link href="/instructor/courses/new">
                            <Button variant="primary">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Mi Primer Curso
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                                            {(() => {
                                                const courseStatus = (course as any).status;
                                                return (
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${courseStatus === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : courseStatus === 'draft'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : courseStatus === 'pending_review'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : courseStatus === 'needs_revision'
                                                                        ? 'bg-orange-100 text-orange-800'
                                                                        : courseStatus === 'archived'
                                                                            ? 'bg-gray-100 text-gray-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {courseStatus === 'published'
                                                            ? 'Publicado'
                                                            : courseStatus === 'draft'
                                                                ? 'Borrador'
                                                                : courseStatus === 'pending_review'
                                                                    ? 'Pendiente'
                                                                    : courseStatus === 'needs_revision'
                                                                        ? 'Requiere Cambios'
                                                                        : courseStatus === 'archived'
                                                                            ? 'Archivado'
                                                                            : courseStatus || 'Desconocido'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {(course as any).enrollments || 0} inscripciones
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {course.rating || 0.0} ⭐
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Link
                                            href={`/academy/course/${course.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Ver curso en la academia"
                                        >
                                            <Button variant="secondary" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/instructor/courses/${course.id}/edit`}
                                            title="Editar curso"
                                        >
                                            <Button variant="secondary" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Implementar eliminación
                                                if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
                                                    // Llamar a deleteCourse
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

