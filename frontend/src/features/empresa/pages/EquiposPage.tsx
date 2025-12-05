'use client';

import { Header, Footer } from '@/shared/components';
import { PageHero, ContentSection, FeatureCard } from '../components';
import { Wrench, FlaskConical, Microscope, Settings, Package, CheckCircle2 } from 'lucide-react';

export function EquiposPage() {
    const categoriasEquipos = [
        {
            icon: FlaskConical,
            title: 'Equipos de Laboratorio',
            description: 'Instrumentos de análisis químico y físico para laboratorios metalúrgicos. Incluye espectrómetros, balanzas analíticas, hornos y más.',
            equipos: [
                'Espectrómetros de absorción atómica',
                'Balanzas analíticas de precisión',
                'Hornos de mufla y secado',
                'Equipos de preparación de muestras'
            ]
        },
        {
            icon: Microscope,
            title: 'Equipos de Análisis',
            description: 'Sistemas avanzados para análisis de minerales, concentrados y productos finales. Tecnología de última generación.',
            equipos: [
                'Microscopios metalográficos',
                'Difractómetros de rayos X',
                'Analizadores de tamaño de partícula',
                'Equipos de análisis térmico'
            ]
        },
        {
            icon: Wrench,
            title: 'Equipos de Proceso',
            description: 'Maquinaria y equipos para procesos metalúrgicos industriales. Desde molienda hasta flotación y lixiviación.',
            equipos: [
                'Molinos de bolas y barras',
                'Celdas de flotación',
                'Equipos de lixiviación',
                'Filtros y espesadores'
            ]
        },
        {
            icon: Settings,
            title: 'Equipos de Control',
            description: 'Sistemas de control y monitoreo para optimizar procesos industriales. Automatización y eficiencia energética.',
            equipos: [
                'Sistemas de control SCADA',
                'Sensores y transductores',
                'Equipos de medición de flujo',
                'Sistemas de automatización'
            ]
        }
    ];

    const servicios = [
        {
            icon: Package,
            title: 'Venta de Equipos',
            description: 'Distribuimos equipos de las mejores marcas internacionales con garantía y soporte técnico.'
        },
        {
            icon: Wrench,
            title: 'Instalación y Puesta en Marcha',
            description: 'Nuestro equipo técnico realiza la instalación y puesta en marcha de todos los equipos vendidos.'
        },
        {
            icon: Settings,
            title: 'Mantenimiento y Reparación',
            description: 'Servicios de mantenimiento preventivo y correctivo para mantener tus equipos en óptimas condiciones.'
        },
        {
            icon: CheckCircle2,
            title: 'Capacitación',
            description: 'Entrenamos a tu personal en el uso correcto y mantenimiento de los equipos adquiridos.'
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />
            
            <PageHero
                title="Equipos y Maquinaria"
                subtitle="Tecnología de Vanguardia"
                description="Equipos especializados para laboratorios metalúrgicos y procesos industriales. Las mejores marcas con garantía y soporte técnico."
            />

            {/* Categorías de equipos */}
            <ContentSection>
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Nuestras </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Categorías
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                        Equipos especializados para cada necesidad de tu operación
                    </p>
                </div>

                <div className="space-y-12">
                    {categoriasEquipos.map((categoria, index) => {
                        const IconComponent = categoria.icon;
                        return (
                        <div key={index} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 hover:border-primary-orange/30 transition-all duration-300">
                            <div className="flex items-start gap-6 mb-6">
                                <div className="flex items-center justify-center w-16 h-16 bg-primary-orange/10 rounded-xl flex-shrink-0">
                                    <IconComponent className="w-8 h-8 text-primary-orange" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                        {categoria.title}
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        {categoria.description}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {categoria.equipos.map((equipo, equipoIndex) => (
                                            <div key={equipoIndex} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300">{equipo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </ContentSection>

            {/* Servicios relacionados */}
            <ContentSection background="dark">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Servicios </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Adicionales
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                        Más que vender equipos, ofrecemos soluciones integrales
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {servicios.map((servicio, index) => (
                        <FeatureCard
                            key={index}
                            icon={servicio.icon}
                            title={servicio.title}
                            description={servicio.description}
                        />
                    ))}
                </div>
            </ContentSection>

            {/* CTA */}
            <ContentSection background="gradient">
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        ¿Buscas equipos especializados?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Contáctanos para conocer nuestro catálogo completo y recibir asesoría personalizada
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/#contacto"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                        >
                            Solicitar Catálogo
                        </a>
                        <a
                            href="/empresa/nuestros-procesos"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            Ver Servicios
                        </a>
                    </div>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}

