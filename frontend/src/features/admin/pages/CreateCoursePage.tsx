'use client';

import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { ArrowLeft, BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseForm } from '../components/CourseForm';

function CreateCoursePageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const isInstructor = user?.role === 'instructor';

    const handleSuccess = () => {
        // Redirigir según el rol del usuario
        if (isInstructor) {
            router.push('/instructor/courses');
        } else {
            router.push('/admin/courses');
        }
    };

    return (
        <div className={`min-h-screen ${isInstructor ? 'bg-primary-black' : 'bg-white'}`}>
            {/* Header */}
            {isInstructor ? (
                <InstructorHeader
                    title="Crear Nuevo Curso"
                    subtitle="Completa el formulario para crear tu curso. Podrás agregar módulos y lecciones después."
                    showBackButton={true}
                    backHref="/instructor/courses"
                    backLabel="Volver a Mis Cursos"
                />
            ) : (
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/admin/courses"
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200 group"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-primary-orange transition-colors" />
                                </Link>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            Crear Nuevo Curso
                                        </h1>
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        Completa el formulario para crear un nuevo curso
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isInstructor ? 'bg-primary-black' : 'bg-white'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar con tips (solo para instructores) */}
                    {isInstructor && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-4">
                                {/* Tips Card */}
                                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl p-6 shadow-lg overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/10 rounded-full blur-2xl"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center">
                                                <Lightbulb className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-primary-white">Tips para crear tu curso</h3>
                                        </div>
                                        <div className="space-y-3 text-sm text-secondary-light-gray">
                                            <div className="flex items-start space-x-2">
                                                <Sparkles className="w-4 h-4 text-primary-orange mt-0.5 flex-shrink-0" />
                                                <p><span className="font-semibold text-primary-white">Título claro:</span> Usa un título descriptivo que capture la atención</p>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Sparkles className="w-4 h-4 text-primary-orange mt-0.5 flex-shrink-0" />
                                                <p><span className="font-semibold text-primary-white">Descripción completa:</span> Explica qué aprenderán los estudiantes</p>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Sparkles className="w-4 h-4 text-primary-orange mt-0.5 flex-shrink-0" />
                                                <p><span className="font-semibold text-primary-white">Precio justo:</span> Considera el valor que ofreces</p>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Sparkles className="w-4 h-4 text-primary-orange mt-0.5 flex-shrink-0" />
                                                <p><span className="font-semibold text-primary-white">Imágenes:</span> Usa URLs de imágenes de alta calidad</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Proceso Card */}
                                <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl p-6 shadow-lg overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold text-primary-white mb-4">Proceso de publicación</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-primary-black font-bold text-xs mt-0.5">
                                                    1
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary-white text-sm">Crear curso</p>
                                                    <p className="text-xs text-secondary-light-gray">Completa la información básica</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-secondary-dark-gray border border-primary-orange/30 rounded-full flex items-center justify-center text-secondary-light-gray font-bold text-xs mt-0.5">
                                                    2
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-secondary-light-gray text-sm">Agregar contenido</p>
                                                    <p className="text-xs text-secondary-light-gray">Módulos y lecciones</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-secondary-dark-gray border border-primary-orange/30 rounded-full flex items-center justify-center text-secondary-light-gray font-bold text-xs mt-0.5">
                                                    3
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-secondary-light-gray text-sm">Solicitar revisión</p>
                                                    <p className="text-xs text-secondary-light-gray">Un admin revisará tu curso</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formulario */}
                    <div className={isInstructor ? 'lg:col-span-3' : 'lg:col-span-4'}>
                        <CourseForm onSuccess={handleSuccess} />
                    </div>
                </div>
            </main>
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export default function CreateCoursePage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor']} fallbackRoute="/dashboard">
            <CreateCoursePageContent />
        </ProtectedRoute>
    );
}

