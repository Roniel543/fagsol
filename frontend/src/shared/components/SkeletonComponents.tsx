'use client';

import { Badge } from '.';
//Esto si sdentro de shared porque se usaran para carga de cards, imgs y demas componentes para una mejor experiencia de usuario cuando se cargan los datos.

interface SkeletonImageProps {
    width?: string;
    height?: string;
    className?: string;
}

export function SkeletonImage({
    width = "100%",
    height = "200px",
    className = ""
}: SkeletonImageProps) {
    return (
        <div
            className={`bg-gradient-to-r from-secondary-medium-gray via-secondary-dark-gray to-secondary-medium-gray animate-pulse rounded-lg ${className}`}
            style={{ width, height }}
        >
            <div className="flex items-center justify-center h-full">
                <div className="text-secondary-light-gray text-sm">
                    📷 Imagen
                </div>
            </div>
        </div>
    );
}

interface ProcessSkeletonProps {
    title: string;
    description: string;
    icon: string;
    labels: { text: string; color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' }[];
}

export function ProcessSkeleton({ title, description, icon, labels }: ProcessSkeletonProps) {
    return (
        <div className="bg-zinc-950 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Icono */}
            <div className="text-center mb-4">
                <div className="text-4xl mb-2">{icon}</div>
                <h3 className="text-xl font-bold text-primary-white mb-3">
                    {title}
                </h3>
            </div>

            {/* Imagen skeleton */}
            <div className="mb-4 rounded-lg overflow-hidden">
                <SkeletonImage height="192px" />
            </div>

            {/* Descripción */}
            <p className="text-primary-white/80 mb-4 text-sm leading-relaxed">
                {description}
            </p>

            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-4">
                {labels.map((label, index) => (
                    <Badge
                        key={index}
                        variant={label.color}
                        size="sm"
                    >
                        {label.text}
                    </Badge>
                ))}
            </div>

            {/* Enlace */}
            <div className="text-center">
                <a
                    href="#"
                    className="text-primary-orange hover:text-primary-orange/80 font-medium text-sm transition-colors"
                >
                    Más Información →
                </a>
            </div>
        </div>
    );
}

interface HeroSkeletonProps {
    className?: string;
}

export function HeroSkeleton({ className = "" }: HeroSkeletonProps) {
    return (
        <section className={`relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${className}`}>
            {/* Fondo skeleton */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark-gray via-secondary-medium-gray to-secondary-dark-gray animate-pulse" />

            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-primary-black/60" />

            {/* Contenido skeleton */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Título skeleton */}
                <div className="mb-6">
                    <div className="h-16 bg-secondary-medium-gray rounded-lg animate-pulse mb-4"></div>
                    <div className="h-16 bg-secondary-medium-gray rounded-lg animate-pulse mb-4"></div>
                    <div className="h-16 bg-primary-orange/30 rounded-lg animate-pulse"></div>
                </div>

                {/* Descripción skeleton */}
                <div className="mb-8 max-w-3xl mx-auto">
                    <div className="h-6 bg-secondary-medium-gray rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-secondary-medium-gray rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-secondary-medium-gray rounded animate-pulse w-3/4 mx-auto"></div>
                </div>

                {/* Botones skeleton */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="h-12 bg-primary-orange/30 rounded-lg animate-pulse w-64"></div>
                    <div className="h-12 bg-secondary-medium-gray rounded-lg animate-pulse w-48"></div>
                </div>
            </div>
        </section>
    );
}
