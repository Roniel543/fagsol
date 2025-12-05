'use client';

interface Stat {
    value: string;
    label: string;
    suffix?: string;
}

interface StatsSectionProps {
    stats: Stat[];
    title?: string;
    description?: string;
}

export function StatsSection({ stats, title, description }: StatsSectionProps) {
    return (
        <section className="relative bg-gradient-to-b from-zinc-950 via-black to-zinc-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {(title || description) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                                <span className="text-white">{title}</span>
                            </h2>
                        )}
                        {description && (
                            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-primary-orange/30 transition-all duration-300 hover:scale-105"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                    {stat.value}
                                </span>
                                {stat.suffix && (
                                    <span className="text-primary-orange text-2xl sm:text-3xl">{stat.suffix}</span>
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


