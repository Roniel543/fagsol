'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useDashboard } from '@/shared/hooks/useDashboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AdminDashboard() {
    const router = useRouter();
    const { adminStats, isLoading, isError } = useDashboard();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !adminStats) {
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
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Cursos</h3>
                    <p className="text-3xl font-bold text-gray-900">{adminStats.courses.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="text-green-600">{adminStats.courses.published} publicados</span>
                        {' • '}
                        <span className="text-yellow-600">{adminStats.courses.draft} borradores</span>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Usuarios</h3>
                    <p className="text-3xl font-bold text-gray-900">{adminStats.users.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        {adminStats.users.students} estudiantes • {adminStats.users.instructors} instructores
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ingresos Totales</h3>
                    <p className="text-3xl font-bold text-gray-900">S/ {adminStats.payments.total_revenue.toFixed(2)}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        S/ {adminStats.payments.revenue_last_month.toFixed(2)} este mes
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Inscripciones</h3>
                    <p className="text-3xl font-bold text-gray-900">{adminStats.enrollments.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        {adminStats.enrollments.active} activas • {adminStats.enrollments.completed} completadas
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
                        <Button variant="secondary">Gestionar Cursos</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => router.push('/academy/catalog')}>
                        Ver Catálogo
                    </Button>
                </div>
            </div>

            {/* Cursos más populares */}
            {adminStats.popular_courses.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cursos Más Populares</h2>
                    <div className="space-y-3">
                        {adminStats.popular_courses.map((course) => (
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

