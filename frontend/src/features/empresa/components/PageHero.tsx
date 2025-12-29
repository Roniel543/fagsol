'use client';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
}

export function PageHero({ title, subtitle, description, backgroundImage }: PageHeroProps) {
    return (
        <section className="relative pt-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Fondo con imagen opcional */}
            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 scale-105"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}

            {/* Overlay con gradiente */}
            <div className={`absolute inset-0 ${backgroundImage ? 'bg-gradient-to-b from-black/90 via-black/80 to-black' : 'bg-gradient-to-b from-primary-black via-zinc-950 to-primary-black'}`} />

            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-in">
                {subtitle && (
                    <div className="inline-block mb-4 animate-slide-down" style={{ animationDelay: '0.2s' }}>
                        <span className="px-4 py-2 bg-primary-orange/20 border border-primary-orange/40 text-primary-orange text-sm font-semibold rounded-full backdrop-blur-sm">
                            {subtitle}
                        </span>
                    </div>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up leading-tight" style={{ animationDelay: '0.3s' }}>
                    <span className="text-primary-white">{title}</span>
                </h1>

                {description && (
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
}


