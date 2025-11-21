'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useDashboard } from '@/shared/hooks/useDashboard';
import { useAuth } from '@/shared/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function InstructorDashboard() {
    const router = useRouter();
    const { instructorStats, isLoading, isError } = useDashboard();
    const { loading: authLoading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación o se cargan las estadísticas
    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !instructorStats) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar las estadísticas</h3>
                        <p className="text-red-700 mb-4">
                            No se pudieron cargar las estadísticas del dashboard. Por favor, intenta recargar la página.
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => window.location.reload()}
                            >
                                Recargar Página
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => router.push('/instructor/courses')}
                            >
                                Ver Mis Cursos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con bienvenida */}
            <div className="bg-gradient-to-r from-primary-orange/10 to-amber-500/10 rounded-xl p-6 border border-primary-orange/20">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido, Instructor!</h1>
                <p className="text-gray-600">Gestiona tus cursos, estudiantes y contenido educativo desde aquí.</p>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl p-6 border border-blue-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Mis Cursos</h3>
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{instructorStats.courses.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            {instructorStats.courses.published} publicados
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {instructorStats.courses.draft} borradores
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-purple-50 shadow-lg rounded-xl p-6 border border-purple-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Estudiantes</h3>
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{instructorStats.students.unique}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        Estudiantes únicos en mis cursos
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-green-50 shadow-lg rounded-xl p-6 border border-green-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Inscripciones</h3>
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{instructorStats.enrollments.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="text-green-600 font-medium">{instructorStats.enrollments.active} activas</span>
                        {' • '}
                        <span className="text-gray-500">{instructorStats.enrollments.completed} completadas</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-amber-50 shadow-lg rounded-xl p-6 border border-amber-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Calificación</h3>
                        <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{instructorStats.rating.average.toFixed(1)}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        De {instructorStats.courses.total} cursos
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Acciones Rápidas</h2>
                <p className="text-gray-600 mb-6">Gestiona tus cursos y contenido educativo</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/instructor/courses/new">
                        <Button variant="primary" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Nuevo Curso
                            </span>
                        </Button>
                    </Link>
                    <Link href="/instructor/courses">
                        <Button variant="secondary" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver Mis Cursos
                            </span>
                        </Button>
                    </Link>
                    <Button 
                        variant="secondary" 
                        size="lg" 
                        onClick={() => router.push('/academy/catalog')}
                        className="shadow-md hover:shadow-lg transition-shadow"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Ver Catálogo
                        </span>
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

