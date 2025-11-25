'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDashboard } from '@/shared/hooks/useDashboard';
import { ArrowRight, Award, BookOpen, CheckCircle2, GraduationCap, PlayCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PaymentsDashboard } from './PaymentsDashboard';

export function StudentDashboard() {
    const router = useRouter();
    const { studentStats, isLoading, isError } = useDashboard();
    const { loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');

    // Mostrar loading mientras se verifica la autenticación o se cargan las estadísticas
    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-secondary-light-gray font-medium">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !studentStats) {
        return (
            <div className="bg-red-50 border border-red-300 rounded-lg p-6">
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
                                onClick={() => router.push('/academy/catalog')}
                            >
                                Explorar Cursos
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
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-orange/5 via-transparent to-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Tabs de navegación mejorados */}
            <div className="relative border-b border-primary-orange/20 bg-secondary-dark-gray/50 backdrop-blur-sm rounded-t-lg shadow-lg">
                <nav className="-mb-px flex space-x-8 px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview'
                            ? 'border-primary-orange text-primary-orange font-semibold'
                            : 'border-transparent text-secondary-light-gray hover:text-primary-white hover:border-primary-orange/50'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 relative`}
                    >
                        Resumen
                        {activeTab === 'overview' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-orange to-transparent"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`${activeTab === 'payments'
                            ? 'border-primary-orange text-primary-orange font-semibold'
                            : 'border-transparent text-secondary-light-gray hover:text-primary-white hover:border-primary-orange/50'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 relative`}
                    >
                        Historial de Pagos
                        {activeTab === 'payments' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-orange to-transparent"></span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Contenido según tab activo */}
            {activeTab === 'payments' ? (
                <PaymentsDashboard />
            ) : (
                <div className="relative space-y-6">
                    {/* Estadísticas principales mejoradas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Cursos Inscritos */}
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                            {/* Efecto de brillo decorativo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Cursos Inscritos</h3>
                                <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{studentStats.enrollments.total}</p>
                                <div className="flex items-center space-x-2 text-sm text-secondary-light-gray">
                                    <span className="font-medium">{studentStats.enrollments.active} activos</span>
                                    <span>•</span>
                                    <span className="font-medium">{studentStats.enrollments.completed} completados</span>
                                </div>
                            </div>
                        </div>

                        {/* En Progreso */}
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                            {/* Efecto de brillo decorativo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/10 rounded-full blur-2xl group-hover:bg-primary-orange/20 transition-all duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">En Progreso</h3>
                                <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-primary-orange transition-colors duration-300">{studentStats.enrollments.in_progress}</p>
                                <div className="text-sm text-secondary-light-gray font-medium">
                                    Cursos con progreso
                                </div>
                            </div>
                        </div>

                        {/* Progreso Promedio */}
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                            {/* Efecto de brillo decorativo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Progreso Promedio</h3>
                                <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-green-400 transition-colors duration-300">{studentStats.progress.average.toFixed(1)}%</p>
                                <div className="text-sm text-secondary-light-gray font-medium">
                                    De todos tus cursos
                                </div>
                            </div>
                        </div>

                        {/* Certificados */}
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 hover:scale-105 transition-all duration-300 overflow-hidden group">
                            {/* Efecto de brillo decorativo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-secondary-light-gray mb-2">Certificados</h3>
                                <p className="text-3xl font-bold text-primary-white mb-2 group-hover:text-purple-400 transition-colors duration-300">{studentStats.certificates.total}</p>
                                <div className="text-sm text-secondary-light-gray font-medium">
                                    Certificados obtenidos
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones rápidas mejoradas */}
                    <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg overflow-hidden">
                        {/* Patrón decorativo de fondo */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-orange/20 via-transparent to-blue-500/20"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-1 h-8 bg-gradient-to-b from-primary-orange to-amber-500 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-primary-white">Acciones Rápidas</h2>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="primary"
                                    onClick={() => router.push('/academy/catalog')}
                                    className="flex items-center space-x-2 group"
                                >
                                    <span>Explorar Cursos</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                                {studentStats.enrollments.active > 0 && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => router.push('/academy/my-courses')}
                                        className="flex items-center space-x-2 group"
                                    >
                                        <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span>Ver Mis Cursos</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cursos recientes mejorados */}
                    {studentStats.recent_courses.length > 0 && (
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg overflow-hidden">
                            {/* Patrón decorativo */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1 h-8 bg-gradient-to-b from-primary-orange to-amber-500 rounded-full"></div>
                                        <h2 className="text-xl font-bold text-primary-white">Cursos Recientes</h2>
                                    </div>
                                    <Link
                                        href="/academy/my-courses"
                                        className="text-sm font-medium text-primary-orange hover:text-amber-400 transition-colors flex items-center space-x-1 group"
                                    >
                                        <span>Ver todos</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {studentStats.recent_courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between p-4 bg-primary-black/40 hover:bg-primary-black/60 rounded-lg border border-primary-orange/20 hover:border-primary-orange/40 hover:shadow-lg hover:shadow-primary-orange/20 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center space-x-4 flex-1">
                                                {course.thumbnail_url ? (
                                                    <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        <img
                                                            src={course.thumbnail_url}
                                                            alt={course.title}
                                                            className="h-16 w-16 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-16 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        <BookOpen className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-primary-white text-lg mb-1 group-hover:text-primary-orange transition-colors duration-300">{course.title}</p>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-24 bg-primary-black/60 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-primary-orange to-amber-500 h-2 rounded-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary-orange/50"
                                                                    style={{ width: `${course.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-secondary-light-gray font-medium">{course.progress.toFixed(0)}%</span>
                                                        </div>
                                                        <span className="text-secondary-light-gray">•</span>
                                                        <span className={`font-medium flex items-center space-x-1 ${course.status === 'active'
                                                            ? 'text-primary-orange'
                                                            : 'text-green-400'
                                                            }`}>
                                                            {course.status === 'active' && <PlayCircle className="w-3 h-3" />}
                                                            {course.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                            <span>{course.status === 'active' ? 'En progreso' : 'Completado'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/academy/course/${course.slug}`}>
                                                <Button variant="primary" size="sm" className="flex items-center space-x-2 group/btn">
                                                    <PlayCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                                                    <span>Continuar</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cursos completados mejorados */}
                    {studentStats.completed_courses.length > 0 && (
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-6 shadow-lg overflow-hidden">
                            {/* Patrón decorativo */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                                        <h2 className="text-xl font-bold text-primary-white">Cursos Completados</h2>
                                    </div>
                                    <Link
                                        href="/academy/my-courses"
                                        className="text-sm font-medium text-primary-orange hover:text-amber-400 transition-colors flex items-center space-x-1 group"
                                    >
                                        <span>Ver todos</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {studentStats.completed_courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 hover:from-green-900/40 hover:to-emerald-900/40 rounded-lg border border-green-500/30 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center space-x-4 flex-1">
                                                {course.thumbnail_url ? (
                                                    <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        <img
                                                            src={course.thumbnail_url}
                                                            alt={course.title}
                                                            className="h-16 w-16 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-lg">
                                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                                        <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-xl"></div>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-primary-white text-lg mb-1 group-hover:text-green-400 transition-colors duration-300">{course.title}</p>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <div className="flex items-center space-x-2 text-green-400">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span className="font-medium">Completado</span>
                                                        </div>
                                                        {course.has_certificate && (
                                                            <>
                                                                <span className="text-secondary-light-gray">•</span>
                                                                <div className="flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                                                                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                                                    <span className="font-medium">Certificado disponible</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/academy/course/${course.slug}`}>
                                                <Button variant="secondary" size="sm" className="flex items-center space-x-2 group/btn">
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
                    {studentStats.enrollments.total === 0 && (
                        <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-12 text-center shadow-lg overflow-hidden">
                            {/* Elementos decorativos */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-orange/30 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-orange to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                                    <BookOpen className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary-white mb-3 bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                                    ¡Comienza tu aprendizaje!
                                </h3>
                                <p className="text-secondary-light-gray mb-8 max-w-md mx-auto font-medium text-lg">
                                    Aún no te has inscrito en ningún curso. Explora nuestro catálogo y encuentra el curso perfecto para ti.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => router.push('/academy/catalog')}
                                    className="flex items-center space-x-2 mx-auto group shadow-lg hover:shadow-primary-orange/50 transition-all duration-300"
                                >
                                    <span>Explorar Cursos</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
