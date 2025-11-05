'use client';

import { Leaf, Droplets, Recycle, Sun } from 'lucide-react';

export function CommitmentSection() {
    const commitments = [
        {
            icon: <Sun className="w-6 h-6" />,
            title: "Energía 100% Renovable",
            description: "Operamos con energía solar, reduciendo la huella de carbono y costos operativos."
        },
        {
            icon: <Droplets className="w-6 h-6" />,
            title: "Cero Químicos Tóxicos",
            description: "Sin mercurio ni cianuro. Procesos limpios que protegen el medio ambiente y la salud."
        },
        {
            icon: <Recycle className="w-6 h-6" />,
            title: "Deshidratación Natural",
            description: "Métodos naturales que preservan la calidad del producto y cuidan el planeta."
        },
        {
            icon: <Leaf className="w-6 h-6" />,
            title: "Procesos Sostenibles",
            description: "Diseñados para la pequeña minería con mínimo impacto ambiental."
        }
    ];

    return (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-orange/5 via-transparent to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto">
                {/* Título principal - Más compacto */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-3">
                        <span className="px-3 py-1 bg-green-950/30 border border-green-500/30 text-green-400 text-xs font-semibold rounded-full">
                            Sostenibilidad
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                        <span className="text-primary-white">Compromiso con la </span>
                        <span className="text-primary-orange">Sostenibilidad</span>
                    </h2>
                    <p className="text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Todos nuestros procesos están diseñados para operar con energía 100% renovable, principalmente solar.
                        No utilizamos químicos tóxicos como mercurio en minería, y nuestros métodos de deshidratación y destilación
                        son completamente naturales, preservando la calidad del producto final mientras cuidamos el planeta.
                    </p>
                </div>

                {/* Grid de compromisos - Más compacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {commitments.map((item, index) => (
                        <div 
                            key={index}
                            className="group relative bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-primary-orange/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-orange/10"
                        >
                            {/* Icono */}
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-primary-orange/10 group-hover:bg-primary-orange/20 border border-primary-orange/20 group-hover:border-primary-orange/40 rounded-lg flex items-center justify-center text-primary-orange transition-all duration-300">
                                    {item.icon}
                                </div>
                            </div>
                            
                            {/* Contenido */}
                            <h3 className="text-base font-bold text-primary-white mb-2 text-center">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 text-xs leading-relaxed text-center">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Estadísticas destacadas - Más compacto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-8 border-t border-zinc-800">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2 bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent">
                            100%
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Libre de Mercurio</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2 bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent">
                            95%+
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Recuperación de Metales</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2 bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent">
                            24/7
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Soporte Técnico</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
