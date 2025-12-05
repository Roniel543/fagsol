'use client';

import { Footer, Header } from '@/shared/components';
import { Award, Globe, Lightbulb, Target, TrendingUp, Users } from 'lucide-react';
import { ContentSection, FeatureCard, PageHero, StatsSection } from '../components';

export function SobreNosotrosPage() {
    const valores = [
        {
            icon: Target,
            title: 'Misión',
            description: 'Proporcionar servicios metalúrgicos de excelencia y educación especializada que transformen la industria minera, contribuyendo al desarrollo sostenible de la pequeña minería en Perú y Latinoamérica.'
        },
        {
            icon: Lightbulb,
            title: 'Visión',
            description: 'Ser líderes reconocidos en servicios metalúrgicos y educación especializada, siendo referentes en innovación tecnológica y conocimiento aplicado para la industria minera.'
        },
        {
            icon: Award,
            title: 'Valores',
            description: 'Excelencia, innovación, compromiso con la sostenibilidad, integridad y pasión por el conocimiento. Trabajamos con ética y responsabilidad social.'
        }
    ];

    const estadisticas = [
        { value: '15+', label: 'Años de Experiencia' },
        { value: '500+', label: 'Proyectos Completados' },
        { value: '50+', label: 'Clientes Satisfechos' },
        { value: '1000+', label: 'Estudiantes Capacitados' }
    ];

    const servicios = [
        {
            icon: TrendingUp,
            title: 'Innovación Continua',
            description: 'Invertimos constantemente en tecnología y metodologías avanzadas para ofrecer soluciones de vanguardia.'
        },
        {
            icon: Users,
            title: 'Equipo Especializado',
            description: 'Contamos con profesionales altamente capacitados en metalurgia, minería y educación técnica.'
        },
        {
            icon: Globe,
            title: 'Alcance',
            description: 'Servimos a clientes en todo Perú'
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />

            <PageHero
                title="Sobre Nosotros"
                subtitle="Fagsol SAC"
                description="Líderes en servicios metalúrgicos y educación especializada. Transformando la industria minera con tecnología y conocimiento."
            />

            {/* Historia */}
            <ContentSection>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            <span className="text-white">Nuestra </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Historia
                            </span>
                        </h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Fundada en 2010, Fagsol SAC nació con la visión de democratizar el acceso a servicios metalúrgicos de calidad
                                y educación especializada para la pequeña y mediana minería en Perú.
                            </p>
                            <p>
                                Comenzamos como una empresa de consultoría metalúrgica, pero rápidamente identificamos la necesidad de
                                capacitar a los profesionales del sector. Así nació Fagsol Academy, nuestra plataforma de educación en línea
                                que combina teoría y práctica.
                            </p>
                            <p>
                                Hoy, somos una empresa integral que ofrece servicios de consultoría, análisis de laboratorio, asesoría técnica,
                                capacitación y venta de equipos especializados, siempre con un enfoque en la sostenibilidad y la innovación.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">🏭</div>
                                <p className="text-gray-400">Imagen de nuestras instalaciones</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentSection>

            {/* Estadísticas */}
            <StatsSection
                stats={estadisticas}
            />

            {/* Misión, Visión y Valores */}
            <ContentSection background="dark">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Misión, Visión y </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Valores
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {valores.map((valor, index) => (
                        <FeatureCard
                            key={index}
                            icon={valor.icon}
                            title={valor.title}
                            description={valor.description}
                        />
                    ))}
                </div>
            </ContentSection>

            {/* Por qué elegirnos */}
            <ContentSection>
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">¿Por qué </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Elegirnos?
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                        Combinamos experiencia práctica con innovación educativa para ofrecer soluciones integrales
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        ¿Listo para trabajar con nosotros?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Contáctanos y descubre cómo podemos ayudarte a alcanzar tus objetivos
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/#contacto"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                        >
                            Contáctanos
                        </a>
                        <a
                            href="/academy"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            Ver Cursos
                        </a>
                    </div>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}


