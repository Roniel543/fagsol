'use client';

import { ModuleForm } from '@/features/admin/components/ModuleForm';
import { Button, ProtectedRoute } from '@/shared/components';
import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function CreateModulePageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const handleSuccess = () => {
        router.push(`/instructor/courses/${courseId}/modules`);
    };

    if (!courseId) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">ID de curso no válido</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo identificar el curso.</p>
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
                title="Crear Nuevo Módulo"
                subtitle="Completa el formulario para crear un nuevo módulo"
                showBackButton={true}
                backHref={`/instructor/courses/${courseId}/modules`}
                backLabel="Volver a Módulos"
                rightAction={
                    <Link href={`/instructor/courses/${courseId}/modules`}>
                        <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a Módulos</span>
                        </Button>
                    </Link>
                }
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-secondary-dark-gray/60 border border-primary-orange/20 rounded-xl shadow-lg p-8 backdrop-blur-sm">
                    <ModuleForm courseId={courseId} onSuccess={handleSuccess} />
                </div>
            </main>
        </div>
    );
}

export default function CreateModulePage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <CreateModulePageContent />
        </ProtectedRoute>
    );
}

