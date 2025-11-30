'use client';

import { LessonPlayer } from '@/features/academy/components/LessonPlayer';
import { MaterialCard } from '@/features/academy/components/MaterialCard';
import { Footer, LoadingSpinner, ProtectedRoute, useToast } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCourseBySlug, useCourseContent } from '@/shared/hooks/useCourses';
import { useEnrollments } from '@/shared/hooks/useEnrollments';
import { useCourseProgress } from '@/shared/hooks/useLessonProgress';
import { CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AcademyHeader } from '../components/AcademyHeader';

export default function CourseLearnPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug as string;
    const router = useRouter();
    const { showToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const { enrollments } = useEnrollments();

    // Obtener curso por slug
    const { course: courseDetail, isLoading: isLoadingCourse } = useCourseBySlug(slug);

    // Obtener contenido del curso (solo si tenemos el ID)
    const courseId = courseDetail?.id || null;
    const { content, isLoading: isLoadingContent, isError, error } = useCourseContent(courseId);

    // Estado para la lección seleccionada
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    // Obtener enrollment del curso actual
    const enrollment = useMemo(() => {
        if (!courseDetail || !enrollments.length) return null;
        return enrollments.find(
            (enrollment) => enrollment.course.id === courseDetail.id && enrollment.status === 'active'
        ) || null;
    }, [courseDetail, enrollments]);

    const enrollmentId = enrollment?.id || null;

    // Verificar si el usuario está inscrito
    const isEnrolled = !!enrollment;

    // Obtener progreso del curso
    const { progress: courseProgress, mutate: mutateCourseProgress } = useCourseProgress(enrollmentId);

    // Verificar si es admin
    const isAdmin = useMemo(() => {
        return user?.role === 'admin';
    }, [user]);

    // Verificar si el instructor es el creador del curso
    const isCourseCreator = useMemo(() => {
        if (!courseDetail || !user) return false;
        // Verificar si el backend indica que es el creador
        return courseDetail.is_creator === true;
    }, [courseDetail, user]);

    // Lección seleccionada
    const selectedLesson = useMemo(() => {
        if (!content || !selectedLessonId) return null;

        for (const courseModule of content.modules) {
            const lesson = courseModule.lessons.find((l) => l.id === selectedLessonId);
            if (lesson) return { ...lesson, moduleTitle: courseModule.title };
        }
        return null;
    }, [content, selectedLessonId]);

    // Auto-seleccionar primera lección si no hay ninguna seleccionada
    useEffect(() => {
        if (!selectedLessonId && content && content.modules.length > 0) {
            const firstModule = content.modules[0];
            if (firstModule.lessons.length > 0) {
                setSelectedLessonId(firstModule.lessons[0].id);
            }
        }
    }, [content, selectedLessonId]);

    // Loading state
    if (isLoadingCourse || isLoadingContent) {
        return (
            <>
                <AcademyHeader />
                <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                        <div className="text-center py-12">
                            <LoadingSpinner />
                            <p className="mt-4 text-gray-400">Cargando contenido del curso...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error state o sin acceso
    if (isError || !content) {
        const errorMessage = error?.message || 'No tienes acceso a este curso. Debes estar inscrito.';

        return (
            <>
                <AcademyHeader />
                <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                        <div className="text-center py-12">
                            <div className="text-red-500 text-xl font-semibold mb-4">
                                Acceso Denegado
                            </div>
                            <p className="text-gray-400 mb-6">{errorMessage}</p>
                            <button
                                onClick={() => router.push(`/academy/course/${slug}`)}
                                className="px-6 py-2 bg-primary-orange text-primary-black rounded-lg font-semibold hover:opacity-90"
                            >
                                Volver al Curso
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Verificar acceso (debe estar inscrito, ser admin, o ser instructor creador del curso)
    // Nota: El backend es la autoridad final, esta validación es solo para UX
    if (!isEnrolled && !isAdmin && !isCourseCreator) {
        return (
            <>
                <AcademyHeader />
                <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                        <div className="text-center py-12">
                            <div className="text-yellow-500 text-xl font-semibold mb-4">
                                No estás inscrito en este curso
                            </div>
                            <p className="text-gray-400 mb-6">
                                Debes inscribirte para acceder al contenido del curso.
                            </p>
                            <button
                                onClick={() => router.push(`/academy/course/${slug}`)}
                                className="px-6 py-2 bg-primary-orange text-primary-black rounded-lg font-semibold hover:opacity-90"
                            >
                                Ver Detalles del Curso
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <ProtectedRoute>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header del curso */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.push(`/academy/course/${slug}`)}
                            className="text-primary-orange hover:opacity-80 mb-4 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver al curso
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold">{content.course.title}</h1>
                        {/* Barra de progreso */}
                        {(content.enrollment || courseProgress) && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">
                                        Progreso del curso
                                    </span>
                                    <span className="text-sm font-semibold text-primary-orange">
                                        {courseProgress
                                            ? `${courseProgress.completion_percentage.toFixed(0)}%`
                                            : content.enrollment
                                                ? `${content.enrollment.completion_percentage.toFixed(0)}%`
                                                : '0%'}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                    <div
                                        className="bg-primary-orange h-2.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${courseProgress
                                                ? courseProgress.completion_percentage
                                                : content.enrollment
                                                    ? content.enrollment.completion_percentage
                                                    : 0}%`,
                                        }}
                                    />
                                </div>
                                {courseProgress && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        {courseProgress.completed_lessons} de {courseProgress.total_lessons} lecciones completadas
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar: Lista de módulos y lecciones */}
                        <div className="lg:col-span-1">
                            <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 p-4 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                <h2 className="font-semibold text-lg mb-4">Contenido del Curso</h2>
                                <div className="space-y-4">
                                    {content.modules.map((courseModule) => (
                                        <div key={courseModule.id} className="space-y-2">
                                            <h3 className="font-medium text-primary-orange">{courseModule.title}</h3>
                                            {courseModule.description && (
                                                <p className="text-xs text-gray-400 mb-2">{courseModule.description}</p>
                                            )}
                                            <ul className="space-y-1">
                                                {courseModule.lessons.map((lesson) => {
                                                    const isSelected = selectedLessonId === lesson.id;
                                                    const lessonProgress = courseProgress?.lessons_progress[lesson.id];
                                                    const isCompleted = lessonProgress?.is_completed || false;

                                                    return (
                                                        <li key={lesson.id}>
                                                            <button
                                                                onClick={() => setSelectedLessonId(lesson.id)}
                                                                className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${isSelected
                                                                    ? 'bg-primary-orange text-primary-black font-semibold'
                                                                    : 'bg-zinc-800/50 text-gray-300 hover:bg-zinc-800'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        {isCompleted && (
                                                                            <CheckCircle2 className="w-4 h-4 text-primary-orange flex-shrink-0" />
                                                                        )}
                                                                        <span className="truncate">{lesson.title}</span>
                                                                    </div>
                                                                    {lesson.duration_minutes > 0 && (
                                                                        <span className="text-xs opacity-70 flex-shrink-0">
                                                                            {lesson.duration_minutes} min
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {lesson.lesson_type && (
                                                                    <span className="text-xs opacity-60 mt-1 block">
                                                                        {lesson.lesson_type === 'video' && '📹 Video'}
                                                                        {lesson.lesson_type === 'text' && '📄 Texto'}
                                                                        {lesson.lesson_type === 'document' && '📄 Documento'}
                                                                        {lesson.lesson_type === 'quiz' && '❓ Quiz'}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contenido principal: Reproductor de lección */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedLesson ? (
                                <LessonPlayer
                                    lesson={selectedLesson}
                                    enrollmentId={enrollmentId}
                                    onProgressUpdate={() => {
                                        // Revalidar progreso del curso cuando se actualiza una lección
                                        mutateCourseProgress();
                                    }}
                                />
                            ) : (
                                <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 p-8 text-center">
                                    <p className="text-gray-400">Selecciona una lección para comenzar</p>
                                </div>
                            )}

                            {/* Sección de Materiales Complementarios */}
                            {content.materials && content.materials.length > 0 && (
                                <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 p-6">
                                    <h2 className="text-xl font-bold text-primary-white mb-4">
                                        <span>Materiales Complementarios</span>
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Recursos adicionales para complementar tu aprendizaje
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {content.materials.map((material) => (
                                            <MaterialCard key={material.id} material={material} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </ProtectedRoute>
    );
}

