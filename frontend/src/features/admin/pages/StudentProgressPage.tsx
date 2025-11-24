'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useStudentProgress } from '@/shared/hooks/useAdminStudents';
import { useCourse } from '@/shared/hooks/useCourses';
import { BookOpen, CheckCircle, Clock, FileText, HelpCircle, Video, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function StudentProgressPageContent() {
    const params = useParams();
    const courseId = params?.id as string;
    const enrollmentId = params?.enrollmentId as string;
    const { course } = useCourse(courseId);
    const { progress, isLoading } = useStudentProgress(courseId, enrollmentId);

    const getLessonTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="w-4 h-4" />;
            case 'document':
                return <FileText className="w-4 h-4" />;
            case 'quiz':
                return <HelpCircle className="w-4 h-4" />;
            case 'text':
                return <BookOpen className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando progreso del alumno...</p>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">No se pudo cargar el progreso del alumno</p>
                    <Link href={`/admin/courses/${courseId}/students`}>
                        <Button variant="primary">Volver a Alumnos</Button>
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
                            Progreso del Alumno
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {progress.student.first_name} {progress.student.last_name} - {progress.course.title}
                        </p>
                    </div>
                    <Link href={`/admin/courses/${courseId}/students`}>
                        <Button variant="secondary" size="sm">
                            Volver a Alumnos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Progreso General</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {progress.overall_progress.percentage.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-primary-orange/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary-orange" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary-orange h-2.5 rounded-full"
                                style={{ width: `${progress.overall_progress.percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {progress.overall_progress.completed_lessons} de {progress.overall_progress.total_lessons} lecciones completadas
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Estado</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                                {progress.enrollment.status}
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            {progress.enrollment.completed ? (
                                <CheckCircle className="w-8 h-8 text-blue-600" />
                            ) : (
                                <Clock className="w-8 h-8 text-blue-600" />
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Inscrito: {progress.enrollment.enrolled_at
                            ? new Date(progress.enrollment.enrolled_at).toLocaleDateString('es-ES')
                            : '-'}
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completitud del Curso</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {progress.enrollment.completion_percentage.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    {progress.enrollment.completed_at && (
                        <p className="text-xs text-gray-500 mt-4">
                            Completado: {new Date(progress.enrollment.completed_at).toLocaleDateString('es-ES')}
                        </p>
                    )}
                </Card>
            </div>

            {/* Módulos y Lecciones */}
            <div className="space-y-6">
                {progress.modules.map((module) => (
                    <Card key={module.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center text-primary-black font-bold">
                                    {module.order}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {module.completed_lessons} de {module.lessons_count} lecciones completadas
                                    </p>
                                </div>
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-primary-orange h-2.5 rounded-full"
                                    style={{ width: `${(module.completed_lessons / module.lessons_count) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${lesson.is_completed ? 'bg-green-50' : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${lesson.is_completed ? 'bg-green-500' : 'bg-gray-300'
                                            }`}>
                                            {lesson.is_completed ? (
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getLessonTypeIcon(lesson.lesson_type)}
                                            <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {lesson.progress_percentage > 0 && lesson.progress_percentage < 100 && (
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${lesson.progress_percentage}%` }}
                                                />
                                            </div>
                                        )}
                                        {lesson.completed_at && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(lesson.completed_at).toLocaleDateString('es-ES')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function StudentProgressPage() {
    return <StudentProgressPageContent />;
}

