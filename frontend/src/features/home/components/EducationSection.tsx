'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/shared/components';
import { useCourses } from '@/shared/hooks/useCourses';
import { Course } from '@/shared/types';
import Image from 'next/image';
import { CoursePlaceholder } from '@/shared/components';

export function EducationSection() {
    // Obtener cursos publicados del backend
    const { courses, isLoading, isError } = useCourses({ 
        status: 'published' 
    });

    // Seleccionar top 3 cursos por rating y enrollments
    const topCourses = useMemo(() => {
        if (!courses || courses.length === 0) return [];
        
        // Ordenar por score combinado (rating * 10 + enrollments)
        const sorted = [...courses]
            .sort((a, b) => {
                const aScore = (a.rating || 0) * 10 + (a.enrollments || 0);
                const bScore = (b.rating || 0) * 10 + (b.enrollments || 0);
                return bScore - aScore;
            })
            .slice(0, 3); // Top 3
        
        return sorted;
    }, [courses]);

    // Formatear nivel para mostrar
    const formatLevel = (level: string) => {
        const levelMap: Record<string, string> = {
            'beginner': 'Básico',
            'intermediate': 'Intermedio',
            'advanced': 'Avanzado'
        };
        return levelMap[level] || level;
    };

    const features = [
        {
            icon: <GraduationCap className="w-6 h-6" />,
            title: "Aprende de Expertos",
            description: "Profesores con experiencia real en la industria"
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Cursos Prácticos",
            description: "Contenido aplicable directamente al trabajo"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Comunidad Activa",
            description: "Conecta con profesionales de tu área"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Crecimiento Continuo",
            description: "Nuevos cursos y contenido cada mes"
        }
    ];

    return (
        <section id="cursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <Badge variant="primary" size="sm">
                            Plataforma Educativa
                        </Badge>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                        <span className="text-primary-white">Aprende y </span>
                        <span className="text-primary-orange">Enseña</span>
                        <span className="text-primary-white"> con Nosotros</span>
                    </h2>
                    <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Accede a cursos especializados en procesos industriales, metalúrgicos, agroindustriales,
                        energías renovables y más. Aprende a tu ritmo de expertos reales de la industria.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center hover:border-primary-orange/50 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-primary-orange/10 border border-primary-orange/20 rounded-lg flex items-center justify-center text-primary-orange mx-auto mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-base font-bold text-primary-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Courses Preview - Con datos reales */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-pulse"
                            >
                                <div className="h-48 bg-zinc-900"></div>
                                <div className="p-6">
                                    <div className="h-4 bg-zinc-800 rounded w-20 mb-3"></div>
                                    <div className="h-6 bg-zinc-800 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4"></div>
                                    <div className="flex gap-4">
                                        <div className="h-3 bg-zinc-800 rounded w-20"></div>
                                        <div className="h-3 bg-zinc-800 rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="text-center py-12 mb-12">
                        <p className="text-gray-400 mb-4">No se pudieron cargar los cursos</p>
                        <Link
                            href="/academy"
                            className="inline-block px-6 py-3 bg-primary-orange text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Ver Catálogo Completo
                        </Link>
                    </div>
                )}

                {!isLoading && !isError && topCourses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {topCourses.map((course: Course) => (
                            <Link
                                key={course.id}
                                href={`/academy/course/${course.slug}`}
                                className="group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-primary-orange/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-orange/10 block"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-gradient-to-br from-zinc-900 to-zinc-800 overflow-hidden">
                                    {course.thumbnailUrl ? (
                                        <Image
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <CoursePlaceholder size="default" />
                                        </div>
                                    )}
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <Badge variant="secondary" size="sm">
                                            {course.category || 'General'}
                                        </Badge>
                                        {course.rating > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                <span>⭐</span>
                                                <span className="text-gray-300">{course.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-white mb-2 group-hover:text-primary-orange transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2">
                                        {course.subtitle || course.description || 'Curso especializado con contenido de alta calidad.'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{course.hours > 0 ? `${course.hours} h` : 'Flexible'}</span>
                                        </div>
                                        <span>📊 {formatLevel(course.level)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!isLoading && !isError && topCourses.length === 0 && (
                    <div className="text-center py-12 mb-12">
                        <p className="text-gray-400 mb-4">No hay cursos disponibles en este momento</p>
                        <Link
                            href="/academy"
                            className="inline-block px-6 py-3 bg-primary-orange text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Ver Catálogo Completo
                        </Link>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/academy"
                        className="px-8 py-4 bg-primary-orange hover:bg-primary-orange/90 text-primary-black font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/30"
                    >
                        Ver Todos los Cursos
                    </Link>
                    <Link
                        href="/auth/become-instructor"
                        className="px-8 py-4 border-2 border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-primary-black font-semibold rounded-lg transition-all duration-300"
                    >
                        Enseña en Fagsol
                    </Link>
                </div>
            </div>
        </section>
    );
}

