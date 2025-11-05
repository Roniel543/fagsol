'use client';

import { Button, AnimatedCounter } from '@/shared/components';

export function HeroSection() {
    return (
        <section id="inicio" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Fondo de imagen con parallax */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 scale-105 hover:scale-100"
                style={{ backgroundImage: 'url(/assets/img/bg-main.jpg)' }}
            />

            {/* Overlay con gradiente mejorado */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black" />
            
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Contenido con animaciones */}
            <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-in">
                {/* Badge */}
                <div className="inline-block mb-4 animate-slide-down" style={{ animationDelay: '0.2s' }}>
                    <span className="px-4 py-2 bg-primary-orange/20 border border-primary-orange/40 text-primary-orange text-sm font-semibold rounded-full backdrop-blur-sm hover:bg-primary-orange/30 hover:scale-105 transition-all duration-300 cursor-default">
                        Educación + Servicios Industriales
                    </span>
                </div>

                {/* Título principal con animación */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up leading-tight" style={{ animationDelay: '0.3s' }}>
                    <span className="text-primary-white">Aprende, Aplica y</span>
                    <br />
                    <span className="bg-gradient-to-r from-primary-orange via-yellow-500 to-primary-orange bg-clip-text text-transparent animate-gradient">
                        Transforma la Industria
                    </span>
                </h1>

                {/* Descripción */}
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    Plataforma de educación en línea especializada en procesos industriales y metalúrgicos.
                    Ofrecemos cursos prácticos y servicios profesionales para la pequeña minería en Perú y toda Latinoamérica.
                </p>

                {/* Botones de acción con animaciones mejoradas */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <Button
                        variant="primary"
                        size="lg"
                        className="group flex items-center gap-2 px-6 py-3 text-base font-semibold hover:scale-105 hover:shadow-2xl hover:shadow-primary-orange/50 transition-all duration-300 relative overflow-hidden"
                    >
                        <span className="relative z-10">Explorar Cursos</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {/* Efecto de brillo al hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="group flex items-center gap-2 px-6 py-3 text-base font-semibold border-2 border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-primary-black hover:scale-105 hover:shadow-2xl hover:shadow-primary-orange/50 transition-all duration-300 relative overflow-hidden"
                    >
                        <span className="relative z-10">Servicios Metalúrgicos</span>
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </Button>
                </div>

                {/* Stats con animación al aparecer */}
                <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-12 pt-8 border-t border-zinc-800 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
                            <AnimatedCounter end={500} suffix="+" duration={2500} />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Estudiantes</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
                            <AnimatedCounter end={50} suffix="+" duration={2000} />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Cursos</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-yellow-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
                            <AnimatedCounter end={10} suffix="+" duration={1500} />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Años Experiencia</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
