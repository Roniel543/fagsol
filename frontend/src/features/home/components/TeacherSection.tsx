'use client';

import { DollarSign, FileText, Users, Headphones } from 'lucide-react';

export function TeacherSection() {
    const benefits = [
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: "Excelentes Ganancias",
            description: "Obtén un margen competitivo por cada curso vendido"
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Asesoría Completa",
            description: "Te ayudamos a desarrollar módulos de cursos profesionales"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Audiencia Global",
            description: "Alcanza estudiantes de toda Latinoamérica"
        },
        {
            icon: <Headphones className="w-6 h-6" />,
            title: "Soporte 24/7",
            description: "Equipo dedicado para resolver tus dudas"
        }
    ];

    return (
        <section id="enseña" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-950 to-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-block mb-4">
                            <span className="px-3 py-1 bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-xs font-semibold rounded-full">
                                Para Profesores
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                            <span className="text-primary-white">Comparte tu </span>
                            <span className="text-primary-orange">Conocimiento</span>
                        </h2>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            ¿Eres experto en procesos industriales, metalurgia, energías renovables o áreas relacionadas?
                            Únete a nuestra plataforma y monetiza tu experiencia enseñando a profesionales de todo el mundo.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-primary-orange/30 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 bg-primary-orange/10 border border-primary-orange/20 rounded-lg flex items-center justify-center text-primary-orange flex-shrink-0">
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary-white mb-1">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="px-8 py-4 bg-primary-orange hover:bg-primary-orange/90 text-primary-black font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/30">
                            Comienza a Enseñar Hoy
                        </button>
                    </div>

                    {/* Right Content - Stats */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8">
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-primary-orange mb-2">
                                        +500
                                    </div>
                                    <p className="text-gray-400">Estudiantes Activos</p>
                                </div>
                                <div className="border-t border-zinc-800"></div>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-primary-orange mb-2">
                                        50+
                                    </div>
                                    <p className="text-gray-400">Cursos Disponibles</p>
                                </div>
                                <div className="border-t border-zinc-800"></div>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-primary-orange mb-2">
                                        4.8★
                                    </div>
                                    <p className="text-gray-400">Calificación Promedio</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -z-10 top-4 right-4 w-full h-full bg-primary-orange/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

