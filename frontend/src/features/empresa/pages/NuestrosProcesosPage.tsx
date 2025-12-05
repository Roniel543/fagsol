'use client';

import { Footer, Header } from '@/shared/components';
import { ArrowRight, CheckCircle2, FileText, FlaskConical, Microscope, Users } from 'lucide-react';
import { ContentSection, PageHero } from '../components';

export function NuestrosProcesosPage() {
    const procesos = [
        {
            icon: FlaskConical,
            title: 'Consultoría Metalúrgica',
            description: 'Análisis exhaustivo de procesos metalúrgicos, optimización de operaciones y diseño de soluciones personalizadas para mejorar la eficiencia y rentabilidad de tus operaciones mineras.',
            steps: [
                'Evaluación inicial del proceso',
                'Análisis de muestras y pruebas',
                'Diseño de soluciones optimizadas',
                'Implementación y seguimiento'
            ]
        },
        {
            icon: Microscope,
            title: 'Análisis de Laboratorio',
            description: 'Servicios de análisis químico y físico de minerales, concentrados y productos finales. Contamos con equipos de última generación y metodologías certificadas.',
            steps: [
                'Recepción y preparación de muestras',
                'Análisis químico y físico',
                'Interpretación de resultados',
                'Informe técnico detallado'
            ]
        },
        {
            icon: FileText,
            title: 'Asesoría Técnica',
            description: 'Asesoramiento especializado en procesos mineros, normativas ambientales, seguridad industrial y mejores prácticas del sector. Soporte técnico continuo para tus operaciones.',
            steps: [
                'Diagnóstico de necesidades',
                'Desarrollo de estrategias',
                'Capacitación del personal',
                'Seguimiento y ajustes'
            ]
        },
        {
            icon: Users,
            title: 'Capacitación In-House',
            description: 'Programas de capacitación personalizados en tus instalaciones. Formamos a tu equipo en procesos metalúrgicos, seguridad, mantenimiento y operación de equipos.',
            steps: [
                'Análisis de necesidades formativas',
                'Diseño de programa personalizado',
                'Ejecución en tus instalaciones',
                'Evaluación y certificación'
            ]
        }
    ];

    const metodologia = [
        {
            title: '1. Diagnóstico',
            description: 'Evaluamos tu situación actual mediante análisis detallados y consultas con tu equipo.'
        },
        {
            title: '2. Diseño',
            description: 'Desarrollamos soluciones personalizadas basadas en tus necesidades específicas.'
        },
        {
            title: '3. Implementación',
            description: 'Ejecutamos las soluciones con acompañamiento continuo y ajustes en tiempo real.'
        },
        {
            title: '4. Seguimiento',
            description: 'Monitoreamos resultados y optimizamos procesos para garantizar el éxito a largo plazo.'
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />

            <PageHero
                title="Nuestros Procesos"
                subtitle="Metodología Probada"
                description="Procesos estructurados y metodologías probadas que garantizan resultados exitosos en cada proyecto."
            />

            {/* Procesos principales */}
            <ContentSection>
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Nuestros </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Servicios
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                        Cada servicio sigue un proceso estructurado diseñado para maximizar resultados
                    </p>
                </div>

                <div className="space-y-12">
                    {procesos.map((proceso, index) => {
                        const IconComponent = proceso.icon;
                        return (
                            <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center justify-center w-16 h-16 bg-primary-orange/10 rounded-xl">
                                            <IconComponent className="w-8 h-8 text-primary-orange" />
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                            {proceso.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed mb-6">
                                        {proceso.description}
                                    </p>
                                    <div className="space-y-3">
                                        {proceso.steps.map((step, stepIndex) => (
                                            <div key={stepIndex} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                    <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <IconComponent className="w-16 h-16 text-primary-orange mx-auto mb-4" />
                                            <p className="text-gray-400">{proceso.title}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ContentSection>

            {/* Metodología */}
            <ContentSection background="dark">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Nuestra </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Metodología
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                        Un enfoque sistemático que garantiza resultados exitosos
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metodologia.map((item, index) => (
                        <div
                            key={index}
                            className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-primary-orange/50 transition-all duration-300 hover:scale-105"
                        >
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-orange rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 mt-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {item.description}
                            </p>
                            {index < metodologia.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                                    <ArrowRight className="w-6 h-6 text-primary-orange" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ContentSection>

            {/* CTA */}
            <ContentSection background="gradient">
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        ¿Necesitas nuestros servicios?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Contáctanos para conocer más sobre nuestros procesos y cómo podemos ayudarte
                    </p>
                    <a
                        href="/#contacto"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                    >
                        Solicitar Consultoría
                    </a>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}

