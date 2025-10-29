'use client';

import { Button } from '@/shared/components';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Fondo de imagen */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/assets/img/bg-main.jpg)' }}
            />

            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/80 " />

            {/* Contenido */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Título principal */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    <span className="text-primary-orange">FagSol SAC</span>
                    <br />
                    <span className="text-primary-white">Procesos Metalúrgicos</span>
                    <br />
                    <span className="text-primary-orange">Especializados</span>
                </h1>

                {/* Descripción */}
                <p className="text-lg sm:text-xl text-primary-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Asesoramos y buscamos soluciones a medida de la pequeña minería en Perú y toda la región,
                    desarrollando procesos metalúrgicos eficientes y sostenibles para la extracción y
                    procesamiento de minerales.
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-2 px-8 py-4 text-lg"
                    >
                        Ver Procesos Metalúrgicos
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center gap-2 px-8 py-4 text-lg border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-primary-black"
                    >
                        Equipos de Minería
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </Button>
                </div>
            </div>
        </section>
    );
}
