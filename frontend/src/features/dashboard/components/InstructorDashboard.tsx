'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDashboard } from '@/shared/hooks/useDashboard';
import { ArrowRight, BookOpen, CheckCircle2, FileText, Plus, Search, Star, Users } from 'lucide-react';
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
                <p className="ml-4 text-secondary-light-gray font-medium">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !instructorStats) {
        return (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-300 mb-2">Error al cargar las estadísticas</h3>
                        <p className="text-red-200 mb-4">
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
        <div className="space-y-6 relative">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-transparent to-primary-orange/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header con bienvenida mejorado */}
            <div className="relative bg-gradient-to-r from-purple-900/30 via-primary-orange/20 to-amber-500/20 rounded-xl p-6 border border-primary-orange/20 backdrop-blur-sm shadow-lg overflow-hidden">
                {/* Patrón decorativo */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-primary-white mb-2 bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                        ¡Bienvenido, Instructor!
                    </h1>
                    <p className="text-secondary-light-gray font-medium text-lg">Gestiona tus cursos, estudiantes y contenido educativo desde aquí.</p>
                </div>
            </div>

            {/* Estadísticas principales mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mis Cursos */}
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                    {/* Efecto de brillo decorativo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Mis Cursos</h3>
                        <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{instructorStats.courses.total}</p>
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                {instructorStats.courses.published} publicados
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {instructorStats.courses.draft} borradores
                            </span>
                        </div>
                    </div>
                </div>

                {/* Estudiantes */}
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                    {/* Efecto de brillo decorativo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Estudiantes</h3>
                        <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-purple-400 transition-colors duration-300">{instructorStats.students.unique}</p>
                        <div className="text-sm text-secondary-light-gray font-medium">
                            Estudiantes únicos en mis cursos
                        </div>
                    </div>
                </div>

                {/* Inscripciones */}
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                    {/* Efecto de brillo decorativo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Inscripciones</h3>
                        <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-green-400 transition-colors duration-300">{instructorStats.enrollments.total}</p>
                        <div className="flex items-center space-x-2 text-sm text-secondary-light-gray">
                            <span className="font-medium text-green-400">{instructorStats.enrollments.active} activas</span>
                            <span>•</span>
                            <span className="font-medium">{instructorStats.enrollments.completed} completadas</span>
                        </div>
                    </div>
                </div>

                {/* Calificación */}
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                    {/* Efecto de brillo decorativo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Calificación</h3>
                        <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-amber-400 transition-colors duration-300">{instructorStats.rating.average.toFixed(1)}</p>
                        <div className="text-sm text-secondary-light-gray font-medium">
                            De {instructorStats.courses.total} cursos
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas mejoradas */}
            <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg overflow-hidden">
                {/* Patrón decorativo de fondo */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-orange/20 via-transparent to-purple-500/20"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-primary-orange to-amber-500 rounded-full"></div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-white">Acciones Rápidas</h2>
                            <p className="text-secondary-light-gray font-medium text-sm mt-1">Gestiona tus cursos y contenido educativo</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/instructor/courses/new">
                            <Button variant="primary" size="lg" className="flex items-center space-x-2 group shadow-lg hover:shadow-primary-orange/50 transition-all duration-300">
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                <span>Crear Nuevo Curso</span>
                            </Button>
                        </Link>
                        <Link href="/instructor/courses">
                            <Button variant="secondary" size="lg" className="flex items-center space-x-2 group shadow-lg hover:shadow-lg transition-all duration-300">
                                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                <span>Ver Mis Cursos</span>
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => router.push('/academy/catalog')}
                            className="flex items-center space-x-2 group shadow-lg hover:shadow-lg transition-all duration-300"
                        >
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span>Ver Catálogo</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Cursos más populares mejorados */}
            {instructorStats.popular_courses.length > 0 && (
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg overflow-hidden">
                    {/* Patrón decorativo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-primary-orange to-amber-500 rounded-full"></div>
                                <h2 className="text-xl font-bold text-primary-white">Mis Cursos Más Populares</h2>
                            </div>
                            <Link
                                href="/instructor/courses"
                                className="text-sm font-medium text-primary-orange hover:text-amber-400 transition-colors flex items-center space-x-1 group"
                            >
                                <span>Ver todos</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {instructorStats.popular_courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between p-4 bg-primary-black/40 hover:bg-primary-black/60 rounded-lg border border-primary-orange/20 hover:border-primary-orange/40 hover:shadow-lg hover:shadow-primary-orange/20 transition-all duration-300 group"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-primary-white text-lg mb-1 group-hover:text-primary-orange transition-colors duration-300">{course.title}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <div className="flex items-center space-x-2 text-secondary-light-gray">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{course.enrollments} inscripciones</span>
                                                </div>
                                                <span className="text-secondary-light-gray">•</span>
                                                <span className={`font-medium flex items-center space-x-1 ${course.status === 'published'
                                                        ? 'text-green-400'
                                                        : 'text-amber-400'
                                                    }`}>
                                                    {course.status === 'published' ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Publicado</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-3 h-3" />
                                                            <span>Borrador</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/instructor/courses/${course.id}`}>
                                        <Button variant="primary" size="sm" className="flex items-center space-x-2 group/btn">
                                            <span>Ver</span>
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Estado vacío si no hay cursos */}
            {instructorStats.courses.total === 0 && (
                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-12 text-center shadow-lg overflow-hidden">
                    {/* Elementos decorativos */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-orange/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-orange to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <BookOpen className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-primary-white mb-3 bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                            ¡Comienza a crear contenido!
                        </h3>
                        <p className="text-secondary-light-gray mb-8 max-w-md mx-auto font-medium text-lg">
                            Aún no has creado ningún curso. Crea tu primer curso y comparte tu conocimiento con la comunidad.
                        </p>
                        <Link href="/instructor/courses/new">
                            <Button
                                variant="primary"
                                className="flex items-center space-x-2 mx-auto group shadow-lg hover:shadow-primary-orange/50 transition-all duration-300"
                            >
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                <span>Crear Mi Primer Curso</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
