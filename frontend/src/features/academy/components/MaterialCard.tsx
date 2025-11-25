'use client';

import { CourseMaterial } from '@/shared/services/courses';
import { ExternalLink, Video } from 'lucide-react';

interface MaterialCardProps {
    material: CourseMaterial;
}

export function MaterialCard({ material }: MaterialCardProps) {
    const isVideo = material.material_type === 'video';
    const isLink = material.material_type === 'link';

    // Sanitizar URL para prevenir XSS
    const safeUrl = material.url?.startsWith('http://') || material.url?.startsWith('https://')
        ? material.url
        : `https://${material.url}`;

    return (
        <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 p-4 hover:border-primary-orange/50 transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Header con icono y título */}
                    <div className="flex items-center space-x-3 mb-2">
                        {isVideo && (
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <Video className="w-5 h-5 text-red-400" />
                            </div>
                        )}
                        {isLink && (
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-blue-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-primary-white text-base mb-1 truncate">
                                {material.title}
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">
                                {isVideo ? 'Video Vimeo' : 'Enlace Externo'}
                            </span>
                        </div>
                    </div>

                    {/* Descripción */}
                    {material.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {material.description}
                        </p>
                    )}

                    {/* Información de asociación */}
                    {(material.module_title || material.lesson_title) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                            {material.module_title && (
                                <span className="px-2 py-1 bg-zinc-800/50 rounded">
                                    Módulo: {material.module_title}
                                </span>
                            )}
                            {material.lesson_title && (
                                <span className="px-2 py-1 bg-zinc-800/50 rounded">
                                    Lección: {material.lesson_title}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Enlace de acción */}
                    <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-primary-orange hover:text-amber-400 text-sm font-medium transition-colors duration-200 group"
                        onClick={(e) => {
                            // Validar que la URL sea segura antes de abrir
                            if (!safeUrl || (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://'))) {
                                e.preventDefault();
                                console.error('URL inválida:', safeUrl);
                                return;
                            }
                        }}
                    >
                        <span>
                            {isVideo ? 'Ver Video' : 'Abrir Enlace'}
                        </span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>
            </div>
        </div>
    );
}

