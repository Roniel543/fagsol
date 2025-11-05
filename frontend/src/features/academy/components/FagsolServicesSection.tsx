'use client';

import { TrendingUp, Server, Megaphone, DollarSign, Users, Shield, Zap, ArrowRight } from 'lucide-react';

export function FagsolServicesSection() {
    const services = [
        {
            icon: Megaphone,
            title: 'Marketing Digital',
            description: 'Servicios de marketing completo para hacer crecer tu negocio. Estrategias personalizadas, SEO, redes sociales y más.',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
        },
        {
            icon: Server,
            title: 'Servidores 24/7',
            description: 'Infraestructura cloud confiable y segura. Soporte 24/7, alta disponibilidad y escalabilidad para tu negocio.',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
        },
        {
            icon: TrendingUp,
            title: 'Ganancias y Crecimiento',
            description: 'Asesoría estratégica para maximizar tus ingresos. Análisis de mercado, optimización de procesos y estrategias de crecimiento.',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30'
        },
        {
            icon: Users,
            title: 'Consultoría Empresarial',
            description: 'Expertos en transformación digital y optimización de procesos. Acompañamiento personalizado para tu empresa.',
            color: 'from-primary-orange to-amber-500',
            bgColor: 'bg-primary-orange/10',
            borderColor: 'border-primary-orange/30'
        },
        {
            icon: Shield,
            title: 'Seguridad y Compliance',
            description: 'Protección de datos y cumplimiento normativo. Soluciones de seguridad empresarial adaptadas a tu industria.',
            color: 'from-red-500 to-orange-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30'
        },
        {
            icon: Zap,
            title: 'Automatización',
            description: 'Optimiza tus procesos con automatización inteligente. Reduce costos y aumenta la eficiencia operativa.',
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30'
        }
    ];

    return (
        <section className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-orange/20 to-blue-500/20 border border-primary-orange/30 rounded-full mb-6">
                        <span className="w-2 h-2 bg-primary-orange rounded-full animate-pulse"></span>
                        <span className="text-sm font-semibold text-primary-orange">Más que educación</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Fagsol te ofrece </span>
                        <span className="bg-gradient-to-r from-primary-orange via-blue-500 to-primary-orange bg-clip-text text-transparent">
                            servicios completos
                        </span>
                    </h2>
                    
                    <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
                        No solo aprendes con nosotros. Fagsol también te proporciona herramientas profesionales para hacer crecer tu negocio: 
                        marketing, servidores, consultoría y más.
                    </p>
                </div>

                {/* Grid de servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative ${service.bgColor} border-2 ${service.borderColor} rounded-2xl p-6 hover:border-opacity-60 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 blur-xl`}></div>
                                
                                {/* Content */}
                                <div className="relative z-10">
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-orange transition-colors">
                                        {service.title}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>

                                {/* Hover indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <a
                        href="/contacto"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-bold rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary-orange/50 text-base group"
                    >
                        <span>Conoce nuestros servicios</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
}

export default FagsolServicesSection;

