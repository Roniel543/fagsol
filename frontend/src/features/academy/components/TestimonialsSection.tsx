'use client';

type Testimonial = {
    name: string;
    role: string;
    quote: string;
};

const TESTIMONIALS: Testimonial[] = [
    {
        name: 'María G.',
        role: 'Ing. Metalurgista',
        quote: 'Los cursos me ayudaron a estandarizar procesos y mejorar la recuperación de planta.',
    },
    {
        name: 'Juan P.',
        role: 'Supervisor de Planta',
        quote: 'Contenido práctico y directo. Aplicamos lo visto la misma semana.',
    },
    {
        name: 'Camila R.',
        role: 'Técnica de Laboratorio',
        quote: 'Excelente enfoque práctico, las plantillas nos ahorran horas de trabajo.',
    },
];

export function TestimonialsSection() {
    return (
        <section className="relative bg-primary-black text-primary-white px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Testimonios</h2>
                <p className="mt-3 text-gray-300 max-w-2xl">Historias reales de impacto: lo que aprenden se aplica en planta.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                    {TESTIMONIALS.map((t) => (
                        <figure key={t.name} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                            <blockquote className="text-gray-200">“{t.quote}”</blockquote>
                            <figcaption className="mt-3 text-sm text-gray-400">
                                <span className="font-medium text-primary-white">{t.name}</span> · {t.role}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;


