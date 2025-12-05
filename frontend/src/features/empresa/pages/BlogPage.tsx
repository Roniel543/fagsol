'use client';

import { Header, Footer } from '@/shared/components';
import { PageHero, ContentSection } from '../components';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export function BlogPage() {
    // Datos de ejemplo - en producción vendrían del backend
    const articulos = [
        {
            id: 1,
            title: 'Tendencias en Procesos Metalúrgicos 2025',
            excerpt: 'Exploramos las últimas tendencias y tecnologías que están transformando la industria metalúrgica este año.',
            author: 'Equipo Fagsol',
            date: '2025-01-15',
            category: 'Tecnología',
            image: '/assets/img/blog-1.jpg',
            readTime: '5 min'
        },
        {
            id: 2,
            title: 'Optimización de Flotación: Mejores Prácticas',
            excerpt: 'Guía completa sobre cómo optimizar tus procesos de flotación para mejorar la recuperación y reducir costos.',
            author: 'Ing. Carlos Mendoza',
            date: '2025-01-10',
            category: 'Procesos',
            image: '/assets/img/blog-2.jpg',
            readTime: '8 min'
        },
        {
            id: 3,
            title: 'Sostenibilidad en la Minería: Casos de Éxito',
            excerpt: 'Conoce cómo empresas mineras están implementando prácticas sostenibles sin comprometer la productividad.',
            author: 'Equipo Fagsol',
            date: '2025-01-05',
            category: 'Sostenibilidad',
            image: '/assets/img/blog-3.jpg',
            readTime: '6 min'
        },
        {
            id: 4,
            title: 'Nuevos Equipos de Análisis para Laboratorios',
            excerpt: 'Revisión de los últimos equipos de análisis químico y sus aplicaciones en laboratorios metalúrgicos.',
            author: 'Ing. María González',
            date: '2024-12-28',
            category: 'Equipos',
            image: '/assets/img/blog-4.jpg',
            readTime: '7 min'
        },
        {
            id: 5,
            title: 'Capacitación Continua: Clave del Éxito',
            excerpt: 'La importancia de la formación continua en la industria minera y cómo Fagsol Academy está ayudando.',
            author: 'Equipo Fagsol',
            date: '2024-12-20',
            category: 'Educación',
            image: '/assets/img/blog-5.jpg',
            readTime: '5 min'
        },
        {
            id: 6,
            title: 'Análisis de Costos en Procesos Metalúrgicos',
            excerpt: 'Herramientas y metodologías para analizar y reducir costos operativos en plantas metalúrgicas.',
            author: 'Ing. Roberto Silva',
            date: '2024-12-15',
            category: 'Gestión',
            image: '/assets/img/blog-6.jpg',
            readTime: '9 min'
        }
    ];

    const categorias = ['Todos', 'Tecnología', 'Procesos', 'Sostenibilidad', 'Equipos', 'Educación', 'Gestión'];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />
            
            <PageHero
                title="Blog"
                subtitle="Conocimiento y Actualidad"
                description="Artículos, noticias y análisis sobre metalurgia, minería, tecnología y educación especializada."
            />

            {/* Filtros de categorías */}
            <ContentSection>
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-orange text-gray-300 hover:text-primary-orange rounded-lg transition-all duration-300"
                        >
                            {categoria}
                        </button>
                    ))}
                </div>

                {/* Grid de artículos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articulos.map((articulo) => (
                        <article
                            key={articulo.id}
                            className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-primary-orange/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/10"
                        >
                            {/* Imagen */}
                            <div className="relative h-48 bg-zinc-800 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-primary-orange/20 border border-primary-orange/40 text-primary-orange text-xs font-semibold rounded-full backdrop-blur-sm">
                                        {articulo.category}
                                    </span>
                                </div>
                                <div className="w-full h-full flex items-center justify-center">
                                    <Tag className="w-16 h-16 text-zinc-700" />
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(articulo.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{articulo.readTime} lectura</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-orange transition-colors duration-300 line-clamp-2">
                                    {articulo.title}
                                </h3>

                                <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                    {articulo.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span>{articulo.author}</span>
                                    </div>
                                    <Link
                                        href={`/blog/${articulo.id}`}
                                        className="flex items-center gap-2 text-primary-orange hover:text-amber-500 font-semibold text-sm transition-colors duration-300 group"
                                    >
                                        Leer más
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center gap-2 mt-12">
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-orange text-gray-300 hover:text-primary-orange rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Anterior
                    </button>
                    <button className="px-4 py-2 bg-primary-orange text-white rounded-lg font-semibold">
                        1
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-orange text-gray-300 hover:text-primary-orange rounded-lg transition-all duration-300">
                        2
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-orange text-gray-300 hover:text-primary-orange rounded-lg transition-all duration-300">
                        3
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-orange text-gray-300 hover:text-primary-orange rounded-lg transition-all duration-300">
                        Siguiente
                    </button>
                </div>
            </ContentSection>

            {/* Newsletter CTA */}
            <ContentSection background="gradient">
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        Mantente actualizado
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Suscríbete a nuestro newsletter para recibir los últimos artículos y noticias
                    </p>
                    <a
                        href="/#newsletter"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                    >
                        Suscribirme
                    </a>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}


