'use client';

import { Button, ProtectedRoute } from '@/shared/components';
import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import { getCourseById } from '@/shared/services/courses';
import { ArrowLeft, BookOpen, Layers, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CourseForm } from '../components/CourseForm';

function EditCoursePageContent() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const courseId = params?.id as string;
    const [courseStatus, setCourseStatus] = useState<string | null>(null);
    const [loadingCourse, setLoadingCourse] = useState(true);

    const handleSuccess = () => {
        // Redirigir según el rol del usuario
        if (user?.role === 'instructor') {
            router.push('/instructor/courses');
        } else {
            router.push('/admin/courses');
        }
    };

    // Cargar estado del curso para validar permisos
    useEffect(() => {
        const loadCourseStatus = async () => {
            if (!courseId) {
                setLoadingCourse(false);
                return;
            }

            try {
                const response = await getCourseById(courseId);
                if (response.success && response.data) {
                    setCourseStatus((response.data as any).status || 'draft');
                }
            } catch (error) {
                console.error('Error loading course status:', error);
            } finally {
                setLoadingCourse(false);
            }
        };

        loadCourseStatus();
    }, [courseId]);

    const isInstructor = user?.role === 'instructor';
    
    // Determinar si el instructor puede gestionar módulos y lecciones
    // Solo puede hacerlo si el curso está en 'draft' o 'needs_revision'
    const canManageContent = !isInstructor || !courseStatus || courseStatus === 'draft' || courseStatus === 'needs_revision';

    if (!courseId) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">ID de curso no válido</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo encontrar el curso que intentas editar.</p>
                    <Link href={user?.role === 'instructor' ? '/instructor/courses' : '/admin/courses'}>
                        <Button variant="primary" className="flex items-center space-x-2 mx-auto">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a Cursos</span>
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
            {isInstructor ? (
                <InstructorHeader
                    title="Editar Curso"
                    subtitle="Modifica la información del curso"
                    showBackButton={true}
                    backHref="/instructor/courses"
                    backLabel="Volver a Mis Cursos"
                    rightAction={
                        <Link href="/instructor/courses">
                            <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver a Cursos</span>
                            </Button>
                        </Link>
                    }
                />
            ) : (
                <header className="relative bg-secondary-dark-gray/60 backdrop-blur-sm shadow-lg border-b border-primary-orange/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/admin/courses"
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-dark-gray/60 hover:bg-secondary-dark-gray border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 group"
                                >
                                    <ArrowLeft className="w-5 h-5 text-primary-orange group-hover:text-amber-400" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                                        Editar Curso
                                    </h1>
                                    <p className="text-secondary-light-gray font-medium mt-1">
                                        Modifica la información del curso
                                    </p>
                                </div>
                            </div>
                            <Link href="/admin/courses">
                                <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Volver a Cursos</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna principal del formulario */}
                    <div className="lg:col-span-2">
                        <div className="bg-secondary-dark-gray/60 border border-primary-orange/20 rounded-xl shadow-lg p-8 backdrop-blur-sm">
                            <CourseForm courseId={courseId} onSuccess={handleSuccess} />
                        </div>
                    </div>

                    {/* Sidebar de información (solo para instructores) */}
                    {isInstructor && (
                        <div className="lg:col-span-1">
                            <div className="bg-secondary-dark-gray/60 border border-primary-orange/20 rounded-xl shadow-lg p-6 backdrop-blur-sm space-y-6 sticky top-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary-white">Información del Curso</h2>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div className="p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                        <p className="text-secondary-light-gray mb-2">Estado Actual</p>
                                        <p className="text-primary-white font-semibold">
                                            {courseStatus === 'pending_review' 
                                                ? 'El curso está en revisión. No puedes editarlo hasta que se complete la revisión o se soliciten cambios.'
                                                : courseStatus === 'published'
                                                ? 'El curso está publicado. No puedes editarlo directamente.'
                                                : 'El curso se guardará con su estado actual. Puedes solicitar revisión cuando esté listo.'}
                                        </p>
                                    </div>

                                    {canManageContent && (
                                        <div className="p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                            <p className="text-secondary-light-gray mb-2">Después de Editar</p>
                                            <p className="text-primary-white font-semibold">
                                                Una vez guardes los cambios, podrás agregar módulos y lecciones desde aquí.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Botón para gestionar módulos */}
                                {canManageContent ? (
                                    <div className="pt-4 border-t border-primary-orange/20">
                                        <Link href={`/instructor/courses/${courseId}/modules`}>
                                            <Button variant="primary" size="lg" className="w-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary-orange/50 transition-all duration-300">
                                                <Layers className="w-5 h-5" />
                                                <span>Gestionar Módulos y Lecciones</span>
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-secondary-light-gray mt-2 text-center">
                                            Agrega contenido a tu curso antes de solicitar revisión
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-primary-orange/20">
                                        <div className="w-full p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                            <div className="flex items-center justify-center space-x-2 text-secondary-light-gray mb-2">
                                                <Lock className="w-5 h-5" />
                                                <span className="font-semibold">No disponible</span>
                                            </div>
                                            <p className="text-xs text-secondary-light-gray text-center">
                                                {courseStatus === 'pending_review'
                                                    ? 'No puedes gestionar contenido mientras el curso está en revisión. Espera a que se complete la revisión o se soliciten cambios.'
                                                    : 'No puedes gestionar contenido mientras el curso está publicado.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export default function EditCoursePage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor']} fallbackRoute="/dashboard">
            <EditCoursePageContent />
        </ProtectedRoute>
    );
}

