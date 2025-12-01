'use client';

import { LessonForm } from '@/features/admin/components/LessonForm';
import { Button, ProtectedRoute } from '@/shared/components';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function EditLessonPageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;
    const moduleId = params?.moduleId as string;
    const lessonId = params?.lessonId as string;

    const handleSuccess = () => {
        router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons`);
    };

    if (!courseId || !moduleId || !lessonId) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">ID de curso, módulo o lección no válido</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo identificar el curso, módulo o lección.</p>
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
            <header className="relative bg-secondary-dark-gray/60 backdrop-blur-sm shadow-lg border-b border-primary-orange/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-dark-gray/60 hover:bg-secondary-dark-gray border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 group"
                            >
                                <ArrowLeft className="w-5 h-5 text-primary-orange group-hover:text-amber-400" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                                    Editar Lección
                                </h1>
                                <p className="text-secondary-light-gray font-medium mt-1">Modifica la información de la lección</p>
                            </div>
                        </div>
                        <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}>
                            <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver a Lecciones</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-secondary-dark-gray/60 border border-primary-orange/20 rounded-xl shadow-lg p-8 backdrop-blur-sm">
                    <LessonForm moduleId={moduleId} lessonId={lessonId} onSuccess={handleSuccess} />
                </div>
            </main>
        </div>
    );
}

export default function EditLessonPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <EditLessonPageContent />
        </ProtectedRoute>
    );
}

