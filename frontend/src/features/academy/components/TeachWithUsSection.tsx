'use client';

export function TeachWithUsSection() {
    return (
        <section className="relative bg-zinc-950 text-primary-white px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                        Enseña con Fagsol y monetiza tu experiencia
                    </h2>
                    <p className="mt-3 text-gray-300">
                        Publica tu curso con acompañamiento editorial y comienza a generar ingresos. Nosotros te apoyamos en contenido, producción y publicación.
                    </p>
                    <ul className="mt-5 space-y-2 text-gray-300">
                        <li>• Altos márgenes y pagos puntuales</li>
                        <li>• Soporte editorial y pedagógico</li>
                        <li>• Plataforma simple para subir clases</li>
                    </ul>
                    <div className="mt-6">
                        <a href="#" className="inline-flex items-center justify-center rounded-lg bg-primary-orange px-5 py-3 font-semibold text-primary-black hover:opacity-90 transition-opacity">
                            Postula como instructor
                        </a>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="rounded-lg bg-zinc-900 p-4">
                            <div className="text-3xl font-bold text-primary-orange">70%</div>
                            <div className="text-sm text-gray-300">Hasta de revenue share</div>
                        </div>
                        <div className="rounded-lg bg-zinc-900 p-4">
                            <div className="text-3xl font-bold text-primary-orange">+10k</div>
                            <div className="text-sm text-gray-300">Estudiantes potenciales</div>
                        </div>
                        <div className="rounded-lg bg-zinc-900 p-4">
                            <div className="text-3xl font-bold text-primary-orange">Soporte</div>
                            <div className="text-sm text-gray-300">Producción y edición</div>
                        </div>
                        <div className="rounded-lg bg-zinc-900 p-4">
                            <div className="text-3xl font-bold text-primary-orange">Simple</div>
                            <div className="text-sm text-gray-300">Publica en minutos</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TeachWithUsSection;


