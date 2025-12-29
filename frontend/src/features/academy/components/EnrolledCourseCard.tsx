'use client';

import { CoursePlaceholder } from '@/shared/components';
import { BackendEnrollment } from '@/shared/services/enrollments';
import { BookOpen, CheckCircle2, Clock, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface EnrolledCourseCardProps {
    enrollment: BackendEnrollment;
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps) {
    const { course, status, completed, completion_percentage, enrolled_at } = enrollment;

    const getStatusBadge = () => {
        if (completed) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Completado
                </span>
            );
        }

        if (status === 'active') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Play className="w-3 h-3" />
                    En progreso
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                <Clock className="w-3 h-3" />
                {status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    return (
        <div className="group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-primary-orange transition-all duration-300 hover:shadow-lg hover:shadow-primary-orange/10">
            <Link href={`/academy/course/${course.slug}/learn`} className="block">
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-zinc-800">
                    {course.thumbnail_url ? (
                        <Image
                            src={course.thumbnail_url}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <CoursePlaceholder size="default" />
                    )}
                    {/* Overlay con progreso */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex items-center justify-between mb-2">
                            {getStatusBadge()}
                            <span className="text-xs text-primary-white font-medium">
                                {Math.round(completion_percentage)}%
                            </span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full bg-zinc-700/50 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-orange to-amber-500 transition-all duration-300"
                                style={{ width: `${completion_percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                    <h3 className="font-semibold text-primary-white leading-snug line-clamp-2 mb-2 group-hover:text-primary-orange transition-colors">
                        {course.title}
                    </h3>

                    {course.description && (
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                            {course.description}
                        </p>
                    )}

                    {/* Información adicional */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-3 h-3" />
                            <span>Inscrito: {formatDate(enrolled_at)}</span>
                        </div>
                        {completed && enrollment.completed_at && (
                            <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Completado</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

