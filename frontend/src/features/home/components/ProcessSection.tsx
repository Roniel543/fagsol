'use client';

import { ProcessSkeleton } from '@/shared/components';

export function ProcessSection() {
    const processes = [
        {
            id: 1,
            title: "Separación por Gravedad",
            description: "Tecnología de separación mineral por densidad específica. Separa materiales ligeros de pesados con alta precisión, ideal para oro, plata y minerales pesados.",
            icon: "⚖️",
            image: "/assets/img/gravity-separation.jpg",
            labels: [
                { text: "Sin Químicos Tóxicos", color: "success" },
                { text: "95% Recuperación", color: "error" }
            ]
        },
        {
            id: 2,
            title: "Extracción Electrolítica",
            description: "Proceso de extracción de metales preciosos mediante electrólisis. Recuperación de oro y plata de desechos electrónicos y concentrados minerales.",
            icon: "⚡",
            image: "/assets/img/electrolytic-extraction.jpg",
            labels: [
                { text: "Proceso Limpio", color: "success" },
                { text: "98% Pureza", color: "info" }
            ]
        },
        {
            id: 3,
            title: "Fundición Especializada",
            description: "Hornos de fundición para metales preciosos con control de temperatura preciso. Procesamiento de concentrados auríferos y argentíferos.",
            icon: "🔥",
            image: "/assets/img/smelting.jpg",
            labels: [
                { text: "Emisiones Controladas", color: "success" },
                { text: "99.5% Recuperación", color: "error" }
            ]
        }
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Título de la sección */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                        <span className="text-primary-white">Procesos</span>{' '}
                        <span className="text-primary-orange">Metalúrgicos</span>
                    </h2>
                    <p className="text-lg text-gray-200 max-w-4xl mx-auto leading-relaxed">
                        Soluciones metalúrgicas especializadas para pequeños mineros en Perú y toda la región.
                        Procesos eficientes, sostenibles y adaptados a operaciones de pequeña escala.
                    </p>
                </div>

                {/* Cards de procesos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {processes.map((process) => (
                        <ProcessSkeleton
                            key={process.id}
                            title={process.title}
                            description={process.description}
                            icon={process.icon}
                            labels={process.labels as { text: string; color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' }[]}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
