'use client';

import { Button, Footer, LoadingSpinner } from '@/shared/components';
import { useEnrollments } from '@/shared/hooks/useEnrollments';
import { BookOpen, CheckCircle2, Filter, Play, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AcademyHeader } from '../components/AcademyHeader';
import { EnrolledCourseCard } from '../components/EnrolledCourseCard';

type FilterStatus = 'all' | 'active' | 'completed';

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

    const { enrollments, isLoading, isError, error } = useEnrollments();

    // Filtrar enrollments
    const filteredEnrollments = useMemo(() => {
        return enrollments.filter((enrollment) => {
            // Filtro por búsqueda
            const matchesSearch = !searchQuery ||
                enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                enrollment.course.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Filtro por estado
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && enrollment.status === 'active' && !enrollment.completed) ||
                (statusFilter === 'completed' && enrollment.completed);

            return matchesSearch && matchesStatus;
        });
    }, [enrollments, searchQuery, statusFilter]);

    // Estadísticas
    const stats = useMemo(() => {
        const total = enrollments.length;
        const active = enrollments.filter(e => e.status === 'active' && !e.completed).length;
        const completed = enrollments.filter(e => e.completed).length;
        const avgProgress = enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + e.completion_percentage, 0) / enrollments.length
            : 0;

        return { total, active, completed, avgProgress };
    }, [enrollments]);

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary-black" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-primary-white">
                                    Mis Cursos
                                </h1>
                                <p className="text-secondary-light-gray mt-1">
                                    Continúa aprendiendo desde donde lo dejaste
                                </p>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        {!isLoading && enrollments.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-primary-white">{stats.total}</div>
                                    <div className="text-xs text-secondary-light-gray mt-1">Total</div>
                                </div>
                                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
                                    <div className="text-xs text-secondary-light-gray mt-1">En progreso</div>
                                </div>
                                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                                    <div className="text-xs text-secondary-light-gray mt-1">Completados</div>
                                </div>
                                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-primary-orange">{Math.round(stats.avgProgress)}%</div>
                                    <div className="text-xs text-secondary-light-gray mt-1">Progreso promedio</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filtros y búsqueda */}
                    {!isLoading && enrollments.length > 0 && (
                        <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Búsqueda */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-light-gray" />
                                    <input
                                        type="text"
                                        placeholder="Buscar cursos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-primary-black/40 border border-primary-orange/30 rounded-lg text-primary-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                    />
                                </div>

                                {/* Filtro por estado */}
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-secondary-light-gray" />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                                                    ? 'bg-primary-orange text-primary-black'
                                                    : 'bg-primary-black/40 text-secondary-light-gray hover:bg-primary-black/60'
                                                }`}
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('active')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${statusFilter === 'active'
                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : 'bg-primary-black/40 text-secondary-light-gray hover:bg-primary-black/60'
                                                }`}
                                        >
                                            <Play className="w-3 h-3" />
                                            En progreso
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('completed')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${statusFilter === 'completed'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-primary-black/40 text-secondary-light-gray hover:bg-primary-black/60'
                                                }`}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            Completados
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-secondary-light-gray">Cargando tus cursos...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {isError && (
                        <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg backdrop-blur-sm text-center">
                            <p className="font-medium mb-2">Error al cargar tus cursos</p>
                            <p className="text-sm text-red-200">{error?.message || 'Error desconocido'}</p>
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                                className="mt-4"
                            >
                                Reintentar
                            </Button>
                        </div>
                    )}

                    {/* Empty state - Sin cursos */}
                    {!isLoading && !isError && enrollments.length === 0 && (
                        <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-12 text-center">
                            <div className="w-16 h-16 bg-primary-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-primary-orange" />
                            </div>
                            <h3 className="text-xl font-bold text-primary-white mb-2">
                                Aún no tienes cursos inscritos
                            </h3>
                            <p className="text-secondary-light-gray mb-6">
                                Explora nuestro catálogo y encuentra el curso perfecto para ti
                            </p>
                            <Link href="/academy/catalog">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Explorar Cursos
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Empty state - Sin resultados de filtro */}
                    {!isLoading && !isError && enrollments.length > 0 && filteredEnrollments.length === 0 && (
                        <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-lg p-12 text-center">
                            <div className="w-16 h-16 bg-primary-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-primary-orange" />
                            </div>
                            <h3 className="text-xl font-bold text-primary-white mb-2">
                                No se encontraron cursos
                            </h3>
                            <p className="text-secondary-light-gray mb-6">
                                Intenta ajustar tus filtros de búsqueda
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    )}

                    {/* Lista de cursos */}
                    {!isLoading && !isError && filteredEnrollments.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-secondary-light-gray">
                                    {filteredEnrollments.length} curso{filteredEnrollments.length !== 1 ? 's' : ''} encontrado{filteredEnrollments.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEnrollments.map((enrollment) => (
                                    <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

