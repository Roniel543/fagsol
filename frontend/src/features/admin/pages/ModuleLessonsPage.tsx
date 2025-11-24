'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAdminLessons, useDeleteLesson } from '@/shared/hooks/useAdminLessons';
import { useAdminModules } from '@/shared/hooks/useAdminModules';
import { useCourse } from '@/shared/hooks/useCourses';
import { BookOpen, Edit, FileText, HelpCircle, Plus, Trash2, Video } from 'lucide-react';
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
            showToast('Lección eliminada exitosamente', 'success');
            mutate();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la lección');
            showToast(err.message || 'Error al eliminar la lección', 'error');
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
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando curso...</p>
            </div>
        );
    }

    if (!course || !module) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">Curso o módulo no encontrado</p>
                    <Link href="/admin/courses">
                        <Button variant="primary">Volver a Cursos</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Lecciones: {module.title}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Curso: {course.title}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/courses/${courseId}/modules`}>
                            <Button variant="secondary" size="sm">
                                Volver a Módulos
                            </Button>
                        </Link>
                        <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/new`}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Lección
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando lecciones...</p>
                </div>
            )}

            {/* Lessons List */}
            {!isLoading && (
                <>
                    {lessons.length === 0 ? (
                        <Card className="p-8 text-center bg-white border border-gray-200">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-700 mb-4 font-medium">Este módulo no tiene lecciones aún.</p>
                            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/new`}>
                                <Button variant="primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Primera Lección
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {lessons.map((lesson) => (
                                <Card key={lesson.id} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                                    {lesson.order}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getLessonTypeIcon(lesson.lesson_type)}
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">
                                                            {lesson.title}
                                                        </h3>
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {getLessonTypeLabel(lesson.lesson_type)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {lesson.description && (
                                                <p className="text-sm text-gray-700 mt-2 ml-13">
                                                    {lesson.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm ml-13">
                                                {lesson.duration_minutes > 0 && (
                                                    <span className="text-gray-700 font-medium">{lesson.duration_minutes} min</span>
                                                )}
                                                {lesson.content_url && (
                                                    <span className="text-primary-orange font-medium">URL: {lesson.content_url.substring(0, 30)}...</span>
                                                )}
                                                {lesson.is_active ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`}>
                                                <Button variant="primary" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(lesson.id)}
                                                disabled={deletingId === lesson.id || isDeleting}
                                            >
                                                {deletingId === lesson.id ? (
                                                    'Eliminando...'
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Eliminar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function ModuleLessonsPage() {
    return <ModuleLessonsPageContent />;
}

