'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useDashboard } from '@/shared/hooks/useDashboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function InstructorDashboard() {
    const router = useRouter();
    const { instructorStats, isLoading, isError } = useDashboard();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !instructorStats) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error al cargar las estadísticas
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Mis Cursos</h3>
                    <p className="text-3xl font-bold text-gray-900">{instructorStats.courses.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="text-green-600">{instructorStats.courses.published} publicados</span>
                        {' • '}
                        <span className="text-yellow-600">{instructorStats.courses.draft} borradores</span>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Estudiantes</h3>
                    <p className="text-3xl font-bold text-gray-900">{instructorStats.students.unique}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        Estudiantes únicos en mis cursos
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Inscripciones</h3>
                    <p className="text-3xl font-bold text-gray-900">{instructorStats.enrollments.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        {instructorStats.enrollments.active} activas • {instructorStats.enrollments.completed} completadas
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Calificación Promedio</h3>
                    <p className="text-3xl font-bold text-gray-900">{instructorStats.rating.average.toFixed(1)}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        De {instructorStats.courses.total} cursos
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/courses/new">
                        <Button variant="primary">Crear Nuevo Curso</Button>
                    </Link>
                    <Link href="/admin/courses">
                        <Button variant="secondary">Ver Mis Cursos</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => router.push('/academy/catalog')}>
                        Ver Catálogo
                    </Button>
                </div>
            </div>

            {/* Cursos más populares */}
            {instructorStats.popular_courses.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Cursos Más Populares</h2>
                    <div className="space-y-3">
                        {instructorStats.popular_courses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium text-gray-900">{course.title}</p>
                                    <p className="text-sm text-gray-600">{course.enrollments} inscripciones</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {course.status === 'published' ? 'Publicado' : 'Borrador'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

