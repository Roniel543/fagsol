'use client';

import { LessonForm } from '@/features/admin/components/LessonForm';
import { Button, ProtectedRoute } from '@/shared/components';
import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function CreateLessonPageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;
    const moduleId = params?.moduleId as string;

    const handleSuccess = () => {
        router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons`);
    };

    if (!courseId || !moduleId) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">ID de curso o módulo no válido</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo identificar el curso o módulo.</p>
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
                title="Crear Nueva Lección"
                subtitle="Completa el formulario para crear una nueva lección"
                showBackButton={true}
                backHref={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}
                backLabel="Volver a Lecciones"
                rightAction={
                    <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons`}>
                        <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a Lecciones</span>
                        </Button>
                    </Link>
                }
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-secondary-dark-gray/60 border border-primary-orange/20 rounded-xl shadow-lg p-8 backdrop-blur-sm">
                    <LessonForm moduleId={moduleId} onSuccess={handleSuccess} />
                </div>
            </main>
        </div>
    );
}

export default function CreateLessonPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <CreateLessonPageContent />
        </ProtectedRoute>
    );
}

