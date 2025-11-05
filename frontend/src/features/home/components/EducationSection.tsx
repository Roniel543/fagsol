'use client';

import { GraduationCap, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/shared/components';

export function EducationSection() {
    const courses = [
        {
            category: "Metalurgia",
            title: "Procesos Metalúrgicos del Oro y Plata",
            description: "Aprende técnicas profesionales de extracción y procesamiento de metales preciosos.",
            duration: "8 semanas",
            level: "Intermedio"
        },
        {
            category: "Agroindustria",
            title: "Procesos Agroindustriales Sostenibles",
            description: "Domina los procesos agroindustriales con enfoque en sostenibilidad y eficiencia.",
            duration: "6 semanas",
            level: "Básico"
        },
        {
            category: "Energías Renovables",
            title: "Sistemas de Energía Solar Aplicada",
            description: "Diseña e implementa sistemas de energía solar para aplicaciones industriales.",
            duration: "10 semanas",
            level: "Avanzado"
        }
    ];

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

                {/* Courses Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {courses.map((course, index) => (
                        <div
                            key={index}
                            className="group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-primary-orange/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-orange/10"
                        >
                            {/* Image Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-zinc-700" />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-3">
                                    <Badge variant="secondary" size="sm">
                                        {course.category}
                                    </Badge>
                                </div>
                                <h3 className="text-lg font-bold text-primary-white mb-2 group-hover:text-primary-orange transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>⏱️ {course.duration}</span>
                                    <span>📊 {course.level}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="px-8 py-4 bg-primary-orange hover:bg-primary-orange/90 text-primary-black font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/30">
                        Ver Todos los Cursos
                    </button>
                    <button className="px-8 py-4 border-2 border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-primary-black font-semibold rounded-lg transition-all duration-300">
                        Enseña en Fagsol
                    </button>
                </div>
            </div>
        </section>
    );
}

