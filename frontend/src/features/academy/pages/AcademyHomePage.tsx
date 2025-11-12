'use client';

import { AcademyHeader, AcademyHero } from '../index';
import { FagsolServicesSection } from '../components/FagsolServicesSection';
import { CourseCard } from '../components/CourseCard';
import { Footer } from '@/shared/components';
import { useCourses } from '@/shared/hooks/useCourses';

export function AcademyHomePage() {
    // Obtener cursos del backend usando SWR
    const { courses, isLoading } = useCourses({ status: 'published' });
    const featuredCourses = courses.slice(0, 3);

    return (
        <main className="flex min-h-screen flex-col">
            <AcademyHeader />
            <AcademyHero />
            
            {/* Cursos Destacados */}
            <section className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-white">Cursos </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Destacados
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                            Explora nuestros cursos más populares y comienza tu aprendizaje hoy mismo
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
                            <p className="mt-4 text-gray-400">Cargando cursos...</p>
                        </div>
                    ) : featuredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {featuredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No hay cursos disponibles en este momento.</p>
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <a
                            href="/academy/catalog"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 group"
                        >
                            <span>Ver todos los cursos</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </div>
            </section>
            
            {/* Servicios adicionales de Fagsol */}
            <FagsolServicesSection />
            
            {/* Aquí irán más secciones en la Fase 2 */}
            {/* - Rutas de aprendizaje */}
            {/* - Instructores */}
            {/* - Testimonios */}
            
            <Footer />
        </main>
    );
}

export default AcademyHomePage;

