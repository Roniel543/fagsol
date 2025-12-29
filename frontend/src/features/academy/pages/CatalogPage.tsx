'use client';

import { Footer } from '@/shared/components';
import { useCourses } from '@/shared/hooks/useCourses';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AcademyHeader } from '../components/AcademyHeader';
import { CourseCard } from '../components/CourseCard';
import { FiltersBar } from '../components/FiltersBar';

export default function CatalogPage() {
    const searchParams = useSearchParams();
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [provider, setProvider] = useState('');

    // Leer parámetro de búsqueda de la URL
    useEffect(() => {
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            setQ(searchQuery);
        }
    }, [searchParams]);

    // Obtener cursos del backend usando SWR
    const { courses, isLoading, isError, error } = useCourses({
        status: 'published',
        search: q || undefined,
    });

    // Filtrar cursos localmente (el backend solo soporta search por título)
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesCategory = !category || course.category === category;
            const matchesLevel = !level || course.level === level;
            const matchesProvider = !provider || course.provider === provider;
            return matchesCategory && matchesLevel && matchesProvider;
        });
    }, [courses, category, level, provider]);

    // Extraer categorías únicas de los cursos
    const categories = useMemo(() => {
        return Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
    }, [courses]);

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white overflow-x-hidden">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Cursos</h1>

                    <div className="mt-5">
                        <FiltersBar
                            q={q}
                            category={category}
                            level={level}
                            categories={categories}
                            provider={provider}
                            onChange={(next) => {
                                if (next.q !== undefined) setQ(next.q);
                                if (next.category !== undefined) setCategory(next.category || '');
                                if (next.level !== undefined) setLevel(next.level || '');
                                if (next.provider !== undefined) setProvider(next.provider || '');
                            }}
                        />
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="mt-6 text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
                            <p className="mt-4 text-gray-400">Cargando cursos...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {isError && (
                        <div className="mt-6 text-center py-12">
                            <p className="text-red-500">Error al cargar cursos: {error?.message || 'Error desconocido'}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-primary-orange text-primary-black rounded-lg hover:opacity-90"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {!isLoading && !isError && (
                        <>
                            {filteredCourses.length === 0 ? (
                                <div className="mt-6 text-center py-12">
                                    <p className="text-gray-400">No se encontraron cursos con los filtros seleccionados.</p>
                                </div>
                            ) : (
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
                                    {filteredCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}


