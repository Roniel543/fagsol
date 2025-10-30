'use client';

import { AnimatedCounter, Badge } from '@/shared/components';
import { BookOpen, CheckCircle, Clock, MessageCircle, Play, ShoppingCart, Users } from 'lucide-react';

export function CoursesPreviewSection() {
    const featuredCourse = {
        badge: 'Bestseller',
        rating: 4.9,
        totalStudents: 657,
        title: 'Procesamiento de Minerales Auríferos',
        description: 'Domina las técnicas más avanzadas y sostenibles para el procesamiento de oro sin mercurio.',
        duration: '120 horas',
        students: '657 estudiantes',
        modules: '6 módulos',
        originalPrice: '$3999',
        currentPrice: '$1999',
        benefits: [
            'Certificado profesional reconocido',
            'Acceso de por vida al contenido actualizado',
            'Networking con expertos de la industria',
            'Soporte directo del instructor 24/7',
            'Kit de herramientas digitales GRATIS',
            'Garantía de devolución por 30 días'
        ]
    };

    const modules = [
        {
            id: 1,
            badge: 'Básico',
            badgeColor: 'success',
            title: 'Fundamentos de Mineralogía Aurífera',
            description: 'Aprende a identificar y clasificar minerales auríferos de forma profesional',
            price: '$299',
            features: ['Teoría incluida', 'Evaluación en línea', 'Duración secuencial', 'Técnicas de identificación', '+7 más']
        },
        {
            id: 2,
            badge: 'Intermedio',
            badgeColor: 'warning',
            title: 'Separación Gravimétrica Avanzada',
            description: 'Técnicas modernas de concentración gravimétrica para recuperación óptima',
            price: '$399',
            features: ['Teoría incluida', 'Proyectos en línea', 'Duración de Navidades', 'Tips esenciales', '+7 más']
        },
        {
            id: 3,
            badge: 'Avanzado',
            badgeColor: 'error',
            title: 'Flotación Ecológica',
            description: 'Procesos de flotación sin químicos tóxicos para minería sostenible',
            price: '$499',
            features: ['Teoría incluida', 'Recursos digitales', 'Evaluación del curso', 'Recuperación de agua', '+7 más']
        }
    ];

    return (
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">
                        🎓 Academia Fagsol
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-primary-white">Cursos </span>
                        <span className="bg-gradient-to-r from-primary-orange to-amber-500 bg-clip-text text-transparent">
                            Especializados
                        </span>
                    </h2>
                    <p className="text-base sm:text-sm md:text-lg text-gray-400 max-w-3xl mx-auto">
                        Domina las técnicas más avanzadas en procesamiento de minerales con nuestros cursos modulares.
                        Cada módulo es independiente - aprende solo lo que necesitas o completa la especialización completa.
                    </p>
                </div>

                {/* Featured Course Card - Exact Figma Layout */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl p-6 lg:p-8 border border-primary-orange/30 shadow-xl shadow-primary-orange/20 mb-12">
                    {/* Header with Badge, Title and Price */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        {/* Left Content */}
                        <div className="flex-1">
                            {/* Badge + Rating */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1.5 bg-primary-orange text-white text-xs font-bold rounded-md">
                                    {featuredCourse.badge}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-base">⭐</span>
                                    <span className="text-white font-bold text-sm">{featuredCourse.rating}</span>
                                    <span className="text-gray-400 text-xs">
                                        (<AnimatedCounter end={featuredCourse.totalStudents} duration={2000} /> estudiantes)
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                                {featuredCourse.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                {featuredCourse.description}
                            </p>

                            {/* Course Info Icons */}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-primary-orange" />
                                    <span>{featuredCourse.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-primary-orange" />
                                    <span>{featuredCourse.students}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-primary-orange" />
                                    <span>{featuredCourse.modules}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Price Box */}
                        <div className="lg:min-w-[180px] bg-black/30 p-4 rounded-xl border border-zinc-800 text-right lg:text-center">
                            <p className="text-gray-400 text-sm line-through mb-1">{featuredCourse.originalPrice}</p>
                            <p className="text-3xl lg:text-4xl font-bold text-primary-orange mb-1">{featuredCourse.currentPrice}</p>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6 border-t border-zinc-800 pt-6">
                        <h4 className="text-white font-semibold mb-4 text-sm">Beneficios incluidos:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {featuredCourse.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-300 text-xs">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex flex-1 items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Comprar Curso Completo</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-zinc-700">
                            <Play className="w-4 h-4" />
                            <span>Vista Previa Gratuita</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-all duration-300">
                            <MessageCircle className="w-4 h-4" />
                            <span>Consultar por WhatsApp</span>
                        </button>
                    </div>
                </div>

                {/* Módulos Independientes */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Módulos Independientes</h3>
                        <p className="text-sm text-gray-400">Inscríbete solo en las unidades que necesites</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module, index) => (
                            <div
                                key={module.id}
                                className="group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 hover:border-primary-orange/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/20 animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="p-5">
                                    {/* Badge + Price */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${module.badgeColor === 'success' ? 'bg-green-500/20 text-green-400' :
                                            module.badgeColor === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {module.badge}
                                        </span>
                                        <span className="text-2xl font-bold text-primary-orange">{module.price}</span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-primary-orange transition-colors">
                                        {module.title}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                        {module.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-1.5 mb-5 pb-4 border-b border-zinc-800">
                                        {module.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <span className="text-[10px]">✓</span>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40">
                                        Inscribirse Ahora
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Métodos de Pago Disponibles */}
                <div className="mt-16 text-center">
                    <h4 className="text-white font-semibold mb-6 text-lg">Métodos de Pago Disponibles</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-primary-orange/30 transition-colors">
                            <span className="text-2xl">💳</span>
                            <span className="text-gray-300 text-sm">Transferencia</span>
                        </div>
                    </div>
                </div>

                {/* CTA Final */}
                <div className="text-center mt-12">
                    <a
                        href="/academy"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/30 group"
                    >
                        <span>Ver Todos los Cursos Disponibles</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}

