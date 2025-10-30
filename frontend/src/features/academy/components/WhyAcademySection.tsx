'use client';

export function WhyAcademySection() {
    return (
        <section className="relative bg-primary-black text-primary-white px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                    Por qué elegir Fagsol Academy
                </h2>
                <p className="mt-3 text-gray-300 max-w-2xl">
                    Formación aplicada para la industria: certificación, comunidad y acceso de por vida.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    {[
                        { title: 'Certificados verificables', desc: 'Acredita tus competencias con respaldo de Fagsol.' },
                        { title: 'Acceso de por vida', desc: 'Actualizaciones incluidas, aprende a tu ritmo.' },
                        { title: 'Comunidad y soporte', desc: 'Conecta con profesionales y mentores.' },
                        { title: 'Materiales listos', desc: 'Plantillas, casos y checklists para usar en planta.' },
                    ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-primary-orange transition-colors">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="mt-1 text-sm text-gray-300">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhyAcademySection;


