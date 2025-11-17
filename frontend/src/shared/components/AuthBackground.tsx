'use client';

interface AuthBackgroundProps {
    variant?: 'education' | 'technology' | 'academy' | 'gradient';
}

/**
 * Componente de fondo para páginas de autenticación
 * Diferentes variantes según el tema
 */
export function AuthBackground({ variant = 'education' }: AuthBackgroundProps) {
    const backgrounds: Record<string, string> = {
        education: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
        technology: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        academy: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    const isGradient = variant === 'gradient';
    const backgroundImage = isGradient ? undefined : backgrounds[variant];
    const backgroundGradient = isGradient ? backgrounds.gradient : undefined;

    return (
        <div className="absolute inset-0 z-0">
            {/* Fondo base con color de respaldo */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

            {/* Fondo con imagen o gradiente */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    ...(backgroundImage && { backgroundImage: `url(${backgroundImage})` }),
                    ...(backgroundGradient && { background: backgroundGradient }),
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Overlay con gradiente oscuro - menos opaco para ver la imagen */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />

            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
        </div>
    );
}

