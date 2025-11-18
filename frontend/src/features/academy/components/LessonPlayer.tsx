'use client';

import { SafeHTML } from '@/shared/components';
import { useLessonProgress, useToggleLessonProgress } from '@/shared/hooks/useLessonProgress';
import { LessonWithContent } from '@/shared/services/courses';
import { CheckCircle2, Circle } from 'lucide-react';

interface LessonPlayerProps {
    lesson: LessonWithContent & { moduleTitle?: string };
    enrollmentId?: string | null;
    onProgressUpdate?: () => void;
}

export function LessonPlayer({ lesson, enrollmentId, onProgressUpdate }: LessonPlayerProps) {
    const { progress, mutate: mutateProgress } = useLessonProgress(
        lesson.id,
        enrollmentId || null
    );
    const { toggleProgress, isLoading: isToggling } = useToggleLessonProgress();

    const isCompleted = progress?.is_completed || false;

    const handleToggleComplete = async () => {
        if (!enrollmentId) return;

        const result = await toggleProgress(lesson.id, enrollmentId, isCompleted);
        if (result.success) {
            // Revalidar progreso
            mutateProgress();
            // Notificar al componente padre para actualizar el progreso del curso
            if (onProgressUpdate) {
                onProgressUpdate();
            }
        }
    };
    return (
        <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 p-6">
            {/* Header de la lección */}
            <div className="mb-6">
                {lesson.moduleTitle && (
                    <div className="text-sm text-primary-orange mb-2">{lesson.moduleTitle}</div>
                )}
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                {lesson.description && (
                    <p className="text-gray-400 mt-2">{lesson.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                    {lesson.duration_minutes > 0 && (
                        <span>⏱️ {lesson.duration_minutes} minutos</span>
                    )}
                    <span>
                        {lesson.lesson_type === 'video' && '📹 Video'}
                        {lesson.lesson_type === 'text' && '📄 Texto'}
                        {lesson.lesson_type === 'document' && '📄 Documento'}
                        {lesson.lesson_type === 'quiz' && '❓ Quiz'}
                    </span>
                </div>

                {/* Checkbox de completado */}
                {enrollmentId && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={handleToggleComplete}
                                disabled={isToggling}
                                className="sr-only"
                            />
                            <div className={`flex items-center gap-2 transition-colors ${isCompleted
                                ? 'text-primary-orange'
                                : 'text-gray-400 group-hover:text-gray-300'
                                }`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <Circle className="w-6 h-6" />
                                )}
                                <span className="font-medium">
                                    {isCompleted ? 'Lección completada' : 'Marcar como completada'}
                                </span>
                            </div>
                        </label>
                        {isToggling && (
                            <p className="text-xs text-gray-500 mt-2">Actualizando...</p>
                        )}
                    </div>
                )}
            </div>

            {/* Contenido según el tipo */}
            <div className="mt-6">
                {lesson.lesson_type === 'video' && lesson.content_url && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                        <iframe
                            src={lesson.content_url}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                        />
                    </div>
                )}

                {lesson.lesson_type === 'text' && lesson.content_text && (
                    <div className="prose prose-invert max-w-none">
                        <SafeHTML html={lesson.content_text} tag="div" />
                    </div>
                )}

                {lesson.lesson_type === 'document' && lesson.content_url && (
                    <div className="space-y-4">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <p className="text-gray-300 mb-4">
                                Documento disponible para descarga o visualización:
                            </p>
                            <a
                                href={lesson.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-orange text-primary-black rounded-lg font-semibold hover:opacity-90"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Abrir Documento
                            </a>
                        </div>
                    </div>
                )}

                {lesson.lesson_type === 'quiz' && (
                    <div className="bg-zinc-800/50 rounded-lg p-6">
                        <p className="text-gray-300 mb-4">
                            Esta lección contiene un quiz. El sistema de quizzes estará disponible próximamente.
                        </p>
                        {lesson.content_url && (
                            <a
                                href={lesson.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-orange text-primary-black rounded-lg font-semibold hover:opacity-90"
                            >
                                Abrir Quiz Externo
                            </a>
                        )}
                    </div>
                )}

                {!lesson.content_url && !lesson.content_text && (
                    <div className="bg-zinc-800/50 rounded-lg p-8 text-center">
                        <p className="text-gray-400">
                            El contenido de esta lección aún no está disponible.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

