'use client';

export function CommitmentSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-black">
            <div className="max-w-7xl mx-auto text-center">
                {/* Título */}
                <h2 className="text-4xl sm:text-5xl font-bold mb-8">
                    <span className="text-primary-white">Compromiso con la</span>{' '}
                    <span className="text-primary-orange">Pequeña Minería</span>
                </h2>

                {/* Descripción */}
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Nos especializamos en brindar soluciones metalúrgicas a medida para pequeños mineros en Perú y toda la región.
                        Nuestros procesos están diseñados para ser eficientes, sostenibles y económicamente viables para operaciones de pequeña escala,
                        eliminando el uso de mercurio y otros químicos tóxicos.
                    </p>
                </div>

                {/* Estadísticas o características destacadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2">100%</div>
                        <p className="text-gray-200">Libre de Mercurio</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2">95%+</div>
                        <p className="text-gray-200">Recuperación de Metales</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-orange mb-2">24/7</div>
                        <p className="text-gray-200">Soporte Técnico</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
