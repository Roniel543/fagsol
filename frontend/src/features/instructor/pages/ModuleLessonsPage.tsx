'use client';

import { Button, LoadingSpinner, ProtectedRoute } from '@/shared/components';
import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { useToast } from '@/shared/components/Toast';
import { useAdminLessons, useDeleteLesson } from '@/shared/hooks/useAdminLessons';
import { useAdminModules } from '@/shared/hooks/useAdminModules';
import { useCourse } from '@/shared/hooks/useCourses';
import { ArrowLeft, BookOpen, Edit, FileText, HelpCircle, Plus, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function ModuleLessonsPageContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const moduleId = params?.moduleId as string;
    const { course, isLoading: isLoadingCourse } = useCourse(courseId);
    const { modules } = useAdminModules(courseId);
    const module = modules.find(m => m.id === moduleId);
    const { lessons, isLoading, mutate } = useAdminLessons(moduleId);
    const { deleteLesson, isDeleting } = useDeleteLesson();
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (lessonId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta lección? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeletingId(lessonId);
        setError(null);

        try {
            await deleteLesson(lessonId);
            showToast('✅ Lección eliminada exitosamente', 'success');
            mutate();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la lección');
            showToast(`❌ ${err.message || 'Error al eliminar la lección'}`, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const getLessonTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'document':
                return <FileText className="w-5 h-5" />;
            case 'quiz':
                return <HelpCircle className="w-5 h-5" />;
            case 'text':
                return <BookOpen className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getLessonTypeLabel = (type: string) => {
        const labels = {
            video: 'Video',
            document: 'Documento',
            quiz: 'Quiz',
            text: 'Texto',
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (isLoadingCourse) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-secondary-light-gray font-medium">Cargando curso...</p>
                </div>
            </div>
        );
    }

    if (!course || !module) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">Curso o módulo no encontrado</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo encontrar el curso o módulo solicitado.</p>
                    <Link href="/instructor/courses">
                        <Button variant="primary" className="flex items-center space-x-2 mx-auto">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a Mis Cursos</span>
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-black text-primary-white relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <InstructorHeader
                title={`Lecciones: ${module.title}`}
                subtitle={`Curso: ${course.title}`}
                showBackButton={true}
                backHref={`/instructor/courses/${courseId}/modules`}
                backLabel="Volver a Módulos"
                rightAction={
                    <>
                        <Link href={`/instructor/courses/${courseId}/modules`}>
                            <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver a Módulos</span>
                            </Button>
                        </Link>
                        <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/new`}>
                            <Button variant="primary" size="lg" className="flex items-center space-x-2 shadow-lg hover:shadow-primary-orange/50 transition-all duration-300">
                                <Plus className="w-5 h-5" />
                                <span>Crear Lección</span>
                            </Button>
                        </Link>
                    </>
                }
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-secondary-light-gray font-medium">Cargando lecciones...</p>
                    </div>
                )}

                {/* Lessons List */}
                {!isLoading && (
                    <>
                        {lessons.length === 0 ? (
                            <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg p-12 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-orange/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-primary-orange" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary-white mb-2">Este módulo no tiene lecciones aún</h3>
                                <p className="text-secondary-light-gray mb-6 max-w-md mx-auto">
                                    Crea tu primera lección para agregar contenido a este módulo.
                                </p>
                                <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/new`}>
                                    <Button variant="primary" size="lg" className="flex items-center space-x-2 mx-auto">
                                        <Plus className="w-5 h-5" />
                                        <span>Crear Primera Lección</span>
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Efecto de brillo decorativo */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/5 rounded-full blur-3xl group-hover:bg-primary-orange/10 transition-all duration-300"></div>

                                        <div className="relative p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                                            {lesson.order}
                                                        </div>
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <div className="text-primary-orange">
                                                                {getLessonTypeIcon(lesson.lesson_type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-xl font-bold text-primary-white group-hover:text-primary-orange transition-colors duration-300 truncate">
                                                                    {lesson.title}
                                                                </h3>
                                                                <span className="text-xs font-medium text-secondary-light-gray">
                                                                    {getLessonTypeLabel(lesson.lesson_type)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {lesson.description && (
                                                        <p className="text-sm text-secondary-light-gray mt-2 ml-16 line-clamp-2">
                                                            {lesson.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 mt-4 text-sm ml-16">
                                                        {lesson.duration_minutes > 0 && (
                                                            <span className="text-secondary-light-gray font-medium">{lesson.duration_minutes} min</span>
                                                        )}
                                                        {lesson.content_url && (
                                                            <span className="text-primary-orange font-medium truncate max-w-xs">URL: {lesson.content_url.substring(0, 30)}...</span>
                                                        )}
                                                        {lesson.is_active ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/40">
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`}>
                                                        <Button variant="primary" size="sm" className="flex items-center space-x-2">
                                                            <Edit className="w-4 h-4" />
                                                            <span>Editar</span>
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(lesson.id)}
                                                        disabled={deletingId === lesson.id || isDeleting}
                                                        className="hover:scale-110 transition-transform duration-300"
                                                    >
                                                        {deletingId === lesson.id ? (
                                                            'Eliminando...'
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default function ModuleLessonsPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <ModuleLessonsPageContent />
        </ProtectedRoute>
    );
}

