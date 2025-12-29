'use client';

import { AnimatedCounter } from '@/shared/components';
import { BookOpen, Play, Search, Star, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function AcademyHero() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/academy/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/academy/catalog');
        }
    };
    const stats = [
        { value: 500, label: 'Estudiantes Activos', suffix: '+' },
        { value: 50, label: 'Cursos Prácticos', suffix: '+' },
        { value: 4.8, label: 'Calificación Promedio', suffix: '⭐', decimals: 1 },
        { value: 100, label: 'Aprendizaje Flexible', suffix: '%' }
    ];

    const categories = [
        { name: 'Tecnología', icon: '💻', courses: 25 },
        { name: 'Negocios', icon: '💼', courses: 22 },
        { name: 'Salud', icon: '🏥', courses: 18 },
        { name: 'Diseño', icon: '🎨', courses: 15 },
        { name: 'Industria', icon: '🏭', courses: 20 },
        { name: 'Ciencias', icon: '🔬', courses: 16 },
        { name: 'Artes', icon: '🎭', courses: 14 },
        { name: 'Idiomas', icon: '🌍', courses: 13 },
        { name: 'Más categorías', icon: '📚', courses: 50 }
    ];

    return (
        <section className="relative min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black py-12">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-600/5 to-primary-orange/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-primary-orange/20 border border-green-500/30 rounded-full mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-semibold text-green-400">Plataforma Universal • Educación para Todos</span>
                    </div>

                    {/* Título Principal */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
                        <span className="text-white">Aprende </span>
                        <span className="bg-gradient-to-r from-green-500 via-primary-orange to-amber-500 bg-clip-text text-transparent">
                            Habilidades Prácticas
                        </span>
                        <br />
                        <span className="text-white">para Cualquier Industria</span>
                    </h1>

                    {/* Descripción */}
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Plataforma de educación en línea abierta a todo el público. Encuentra cursos sobre cualquier tema que te interese.
                        Aprende a tu ritmo, certifícate y transforma tu carrera con conocimientos aplicables al mundo real.
                    </p>

                    {/* Buscador Grande */}
                    <div className="max-w-5xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <form onSubmit={handleSearch} className="relative group">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-primary-orange transition-colors pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Busca cualquier curso que te interese..."
                                className="w-full pl-16 pr-32 py-5 bg-zinc-900/80 border-2 border-zinc-700 hover:border-zinc-600 focus:border-primary-orange rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-orange/20 transition-all duration-300 shadow-xl text-base"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40 active:scale-95"
                            >
                                Buscar
                            </button>
                        </form>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <a
                            href="/academy/catalog"
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-bold rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary-orange/50 text-base"
                        >
                            <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>Explorar Cursos</span>
                        </a>

                        <a
                            href="#como-funciona"
                            className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 text-base"
                        >
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Ver Cómo Funciona</span>
                        </a>
                    </div>

                    {/* Categorías Rápidas */}
                    <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <p className="text-sm text-gray-500 mb-5 text-center">Categorías Populares:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category, index) => (
                                <a
                                    key={index}
                                    href={`/academy/categoria/${category.name.toLowerCase()}`}
                                    className="group flex items-center gap-3 px-5 py-3 bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-700/50 hover:border-primary-orange/50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/20"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-200 group-hover:text-primary-orange transition-colors">
                                            {category.name}
                                        </span>
                                        <span className="text-xs text-gray-500">{category.courses} cursos</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-12 border-t border-zinc-800 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center group cursor-default"
                        >
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-primary-orange bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                                <AnimatedCounter
                                    end={stat.value}
                                    suffix={stat.suffix}
                                    decimals={stat.decimals || 0}
                                    duration={2500}
                                />
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-12 pt-8 border-t border-zinc-800/50 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>Aprendizaje Práctico</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>Aprende con Expertos</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                        <TrendingUp className="w-4 h-4 text-primary-orange" />
                        <span>Aprende a Tu Ritmo</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>¿Experto? Enseña con Nosotros</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

