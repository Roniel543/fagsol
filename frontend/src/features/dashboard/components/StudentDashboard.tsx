'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useDashboard } from '@/shared/hooks/useDashboard';
import { useAuth } from '@/shared/hooks/useAuth';
import { PaymentsDashboard } from './PaymentsDashboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
                <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
            </div>
        );
    }

    if (isError || !studentStats) {
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
        <div className="space-y-6">
            {/* Tabs de navegación */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${
                            activeTab === 'overview'
                                ? 'border-primary-orange text-primary-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Resumen
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`${
                            activeTab === 'payments'
                                ? 'border-primary-orange text-primary-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Historial de Pagos
                    </button>
                </nav>
            </div>

            {/* Contenido según tab activo */}
            {activeTab === 'payments' ? (
                <PaymentsDashboard />
            ) : (
                <>
                    {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Cursos Inscritos</h3>
                    <p className="text-3xl font-bold text-gray-900">{studentStats.enrollments.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        {studentStats.enrollments.active} activos • {studentStats.enrollments.completed} completados
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">En Progreso</h3>
                    <p className="text-3xl font-bold text-gray-900">{studentStats.enrollments.in_progress}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        Cursos con progreso
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Progreso Promedio</h3>
                    <p className="text-3xl font-bold text-gray-900">{studentStats.progress.average.toFixed(1)}%</p>
                    <div className="mt-2 text-sm text-gray-600">
                        De todos tus cursos
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Certificados</h3>
                    <p className="text-3xl font-bold text-gray-900">{studentStats.certificates.total}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        Certificados obtenidos
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" onClick={() => router.push('/academy/catalog')}>
                        Explorar Cursos
                    </Button>
                    {studentStats.enrollments.active > 0 && (
                        <Button variant="secondary" onClick={() => router.push('/academy/my-courses')}>
                            Ver Mis Cursos
                        </Button>
                    )}
                </div>
            </div>

            {/* Cursos recientes */}
            {studentStats.recent_courses.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cursos Recientes</h2>
                    <div className="space-y-3">
                        {studentStats.recent_courses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-4 flex-1">
                                    {course.thumbnail_url && (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="h-12 w-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{course.title}</p>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                            <span>Progreso: {course.progress.toFixed(0)}%</span>
                                            <span>•</span>
                                            <span>{course.status === 'active' ? 'Activo' : 'Completado'}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/academy/course/${course.slug}`}>
                                    <Button variant="primary" size="sm">
                                        Continuar
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cursos completados */}
            {studentStats.completed_courses.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cursos Completados</h2>
                    <div className="space-y-3">
                        {studentStats.completed_courses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-4 flex-1">
                                    {course.thumbnail_url && (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="h-12 w-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{course.title}</p>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                            <span className="text-green-600">✓ Completado</span>
                                            {course.has_certificate && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-blue-600">Certificado disponible</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/academy/course/${course.slug}`}>
                                    <Button variant="secondary" size="sm">
                                        Ver
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    );
}

