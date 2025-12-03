'use client';

import { Badge, SkeletonImage, AnimatedCounter } from '@/shared/components';
import { Star, ShoppingCart, Wrench, Droplets, Sun, Zap, ChevronRight } from 'lucide-react';

interface Equipment {
    id: number;
    title: string;
    description: string;
    image: string;
    rating: number;
    tags: string[];
    category: string;
}

export function EquipmentSection() {
    const equipments: Equipment[] = [
        {
            id: 1,
            title: 'Separador Mineral por Densidad',
            description: 'Equipo de alta precisión para procesos de concentración gravimétrica. Ideal para separar minerales de diferentes densidades con alta eficiencia y bajo consumo energético.',
            image: '/assets/img/equipment-separator.jpg',
            rating: 5,
            tags: ['Alta Eficiencia', 'Separación 95%', 'Bajo Consumo'],
            category: 'Minería'
        },
        {
            id: 2,
            title: 'Destilador de Aceites Esenciales',
            description: 'Sistema de destilación por arrastre de vapor para extracción de aceites esenciales. Diseño modular de acero inoxidable con control automático de temperatura.',
            image: '/assets/img/equipment-distiller.jpg',
            rating: 5,
            tags: ['Pureza 99.9%', 'Acero Inoxidable', 'Control Temp.'],
            category: 'Agroindustria'
        },
        {
            id: 3,
            title: 'Sistema Hidropónico Solar',
            description: 'Sistema de cultivo hidropónico completamente autónomo con paneles solares. Ideal para zonas remotas, optimiza recursos hídricos y energéticos.',
            image: '/assets/img/equipment-hydroponic.jpg',
            rating: 5,
            tags: ['100% Solar', 'Ahorro Agua', 'Sistema Autónomo'],
            category: 'Agricultura'
        }
    ];

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'Minería': return <Wrench className="w-5 h-5" />;
            case 'Agroindustria': return <Droplets className="w-5 h-5" />;
            case 'Agricultura': return <Sun className="w-5 h-5" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    return (
        <section id="marketplace" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">
                        Marketplace Industrial
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-primary-white">Equipos </span>
                        <span className="bg-gradient-to-r from-primary-orange to-amber-500 bg-clip-text text-transparent">
                            Especializados
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
                        Maquinaria industrial especializada para procesos sostenibles. Equipos diseñados para minería artesanal, 
                        procesos agroindustriales, manejo de agua y agroindustria ecológica.
                    </p>
                </div>

                {/* Equipment Asymmetric Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Featured Equipment - Large Card (Primer equipo) */}
                    <div className="group lg:row-span-2 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-3xl overflow-hidden border-2 border-primary-orange/30 hover:border-primary-orange transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-orange/30 animate-fade-in">
                        {/* Large Image */}
                        <div className="relative h-80 lg:h-96 overflow-hidden bg-zinc-800">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                            
                            {/* Featured Badge */}
                            <div className="absolute top-4 left-4 z-20 px-4 py-2 bg-gradient-to-r from-primary-orange to-amber-600 rounded-lg shadow-lg shadow-primary-orange/30">
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                    ⭐ Más Vendido
                                </span>
                            </div>

                            {/* Category Badge */}
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg border border-zinc-700">
                                {getCategoryIcon(equipments[0].category)}
                                <span className="text-sm font-semibold text-primary-orange">{equipments[0].category}</span>
                            </div>

                            {/* Rating Badge */}
                            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg border border-zinc-700">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-bold text-white">{equipments[0].rating}.0</span>
                            </div>

                            {/* Image Skeleton */}
                            <div className="w-full h-full group-hover:scale-110 transition-transform duration-700">
                                <SkeletonImage height="100%" className="rounded-none" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 lg:p-8">
                            {/* Title */}
                            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-primary-orange transition-colors duration-300">
                                {equipments[0].title}
                            </h3>

                            {/* Description - Sin line-clamp para mostrar todo */}
                            <p className="text-base text-gray-300 mb-6 leading-relaxed">
                                {equipments[0].description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {equipments[0].tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="px-4 py-2 bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-sm font-semibold rounded-full hover:bg-primary-orange/20 transition-colors duration-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Specs adicionales para featured */}
                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Capacidad</p>
                                    <p className="text-sm font-semibold text-white">500 kg/h</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Garantía</p>
                                    <p className="text-sm font-semibold text-white">2 Años</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Instalación</p>
                                    <p className="text-sm font-semibold text-white">Incluida</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Soporte</p>
                                    <p className="text-sm font-semibold text-white">24/7</p>
                                </div>
                            </div>

                            {/* CTA Button - Más prominente */}
                            <a
                                href="#contacto"
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-orange/60 group/btn"
                            >
                                <ShoppingCart className="w-6 h-6 group-hover/btn:rotate-12 transition-transform duration-300" />
                                <span>Solicitar Cotización</span>
                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                            </a>
                        </div>
                    </div>

                    {/* Smaller Equipment Cards (Resto de equipos) */}
                    {equipments.slice(1).map((equipment, index) => (
                        <div
                            key={equipment.id}
                            className="group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary-orange/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/20 animate-fade-in"
                            style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                        >
                            {/* Small Image */}
                            <div className="relative h-48 overflow-hidden bg-zinc-800">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                
                                {/* Category Badge */}
                                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-zinc-700">
                                    {getCategoryIcon(equipment.category)}
                                    <span className="text-xs font-semibold text-primary-orange">{equipment.category}</span>
                                </div>

                                {/* Rating Badge */}
                                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-zinc-700">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs font-bold text-white">{equipment.rating}</span>
                                </div>

                                {/* Image Skeleton */}
                                <div className="w-full h-full group-hover:scale-110 transition-transform duration-500">
                                    <SkeletonImage height="100%" className="rounded-none" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-orange transition-colors duration-300 line-clamp-2">
                                    {equipment.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                    {equipment.description}
                                </p>

                                {/* Tags - Solo 2 primeros */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {equipment.tags.slice(0, 2).map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-2 py-1 bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-xs font-semibold rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <a
                                    href="#contacto"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40 group/btn"
                                >
                                    <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                                    <span>Cotizar</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ver Catálogo Completo */}
                <div className="text-center mt-12">
                    <a
                        href="#contacto"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/30 group"
                    >
                        <span>Contactar para Ver Catálogo Completo de Equipos</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                {/* Bottom Info */}
                <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-zinc-800">
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-orange mb-2 group-hover:scale-110 transition-transform duration-300">
                            <AnimatedCounter end={15} suffix="+" duration={2000} />
                        </div>
                        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Equipos Disponibles</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-orange mb-2 group-hover:scale-110 transition-transform duration-300">
                            24/7
                        </div>
                        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Financiamiento Disponible</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-orange mb-2 group-hover:scale-110 transition-transform duration-300">
                            <AnimatedCounter end={2} suffix=" Años" duration={1500} />
                        </div>
                        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Garantía Extendida</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

