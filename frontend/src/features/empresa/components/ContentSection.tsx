'use client';

interface ContentSectionProps {
    children: React.ReactNode;
    className?: string;
    background?: 'default' | 'dark' | 'gradient';
}

export function ContentSection({ children, className = '', background = 'default' }: ContentSectionProps) {
    const backgroundClasses = {
        default: 'bg-primary-black',
        dark: 'bg-gradient-to-b from-black via-zinc-950 to-black',
        gradient: 'bg-gradient-to-b from-primary-black via-zinc-950 to-primary-black'
    };

    return (
        <section className={`relative ${backgroundClasses[background]} py-16 sm:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {children}
            </div>
        </section>
    );
}


