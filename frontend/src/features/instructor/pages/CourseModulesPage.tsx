'use client';

import { Button, LoadingSpinner, ProtectedRoute } from '@/shared/components';
import { InstructorHeader } from '@/features/instructor/components/InstructorHeader';
import { useToast } from '@/shared/components/Toast';
import { useAdminModules, useDeleteModule } from '@/shared/hooks/useAdminModules';
import { useCourse } from '@/shared/hooks/useCourses';
import { ArrowLeft, BookOpen, Edit, Layers, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function CourseModulesPageContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const { course, isLoading: isLoadingCourse } = useCourse(courseId);
    const { modules, isLoading, mutate } = useAdminModules(courseId);
    const { deleteModule, isDeleting } = useDeleteModule();
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (moduleId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este módulo? Esta acción eliminará todas las lecciones asociadas.')) {
            return;
        }

        setDeletingId(moduleId);
        setError(null);

        try {
            await deleteModule(moduleId);
            showToast('Módulo eliminado exitosamente', 'success');
            mutate();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el módulo');
            showToast(`${err.message || 'Error al eliminar el módulo'}`, 'error');
        } finally {
            setDeletingId(null);
        }
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

    if (!course) {
        return (
            <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
                <div className="bg-secondary-dark-gray/60 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-white mb-2">Curso no encontrado</h3>
                    <p className="text-secondary-light-gray mb-6">No se pudo encontrar el curso solicitado.</p>
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
                title={`Módulos: ${course.title}`}
                subtitle="Gestiona los módulos y lecciones del curso"
                showBackButton={true}
                backHref={`/instructor/courses/${courseId}/edit`}
                backLabel="Volver al Curso"
                rightAction={
                    <>
                        <Link href={`/instructor/courses/${courseId}/edit`}>
                            <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver al Curso</span>
                            </Button>
                        </Link>
                        <Link href={`/instructor/courses/${courseId}/modules/new`}>
                            <Button variant="primary" size="lg" className="flex items-center space-x-2 shadow-lg hover:shadow-primary-orange/50 transition-all duration-300">
                                <Plus className="w-5 h-5" />
                                <span>Crear Módulo</span>
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
                        <p className="mt-4 text-secondary-light-gray font-medium">Cargando módulos...</p>
                    </div>
                )}

                {/* Modules List */}
                {!isLoading && (
                    <>
                        {modules.length === 0 ? (
                            <div className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg p-12 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-orange/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Layers className="w-10 h-10 text-primary-orange" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary-white mb-2">Este curso no tiene módulos aún</h3>
                                <p className="text-secondary-light-gray mb-6 max-w-md mx-auto">
                                    Crea tu primer módulo para organizar el contenido de tu curso en secciones.
                                </p>
                                <Link href={`/instructor/courses/${courseId}/modules/new`}>
                                    <Button variant="primary" size="lg" className="flex items-center space-x-2 mx-auto">
                                        <Plus className="w-5 h-5" />
                                        <span>Crear Primer Módulo</span>
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {modules.map((module) => (
                                    <div
                                        key={module.id}
                                        className="relative bg-secondary-dark-gray/60 backdrop-blur-sm border border-primary-orange/20 rounded-xl shadow-lg hover:shadow-primary-orange/30 hover:border-primary-orange/50 transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Efecto de brillo decorativo */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/5 rounded-full blur-3xl group-hover:bg-primary-orange/10 transition-all duration-300"></div>

                                        <div className="relative p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                                            {module.order}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-xl font-bold text-primary-white group-hover:text-primary-orange transition-colors duration-300 truncate">
                                                                {module.title}
                                                            </h3>
                                                            {module.description && (
                                                                <p className="text-sm text-secondary-light-gray mt-1 line-clamp-2">
                                                                    {module.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-4 text-sm">
                                                        <span className="flex items-center space-x-2 text-secondary-light-gray">
                                                            <BookOpen className="w-4 h-4 text-primary-orange" />
                                                            <span className="font-medium">{module.lessons_count} {module.lessons_count === 1 ? 'lección' : 'lecciones'}</span>
                                                        </span>
                                                        {module.is_purchasable && (
                                                            <span className="text-primary-orange font-semibold">
                                                                S/ {module.price.toFixed(2)} (separable)
                                                            </span>
                                                        )}
                                                        {module.is_active ? (
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
                                                    <Link href={`/instructor/courses/${courseId}/modules/${module.id}/lessons`}>
                                                        <Button variant="secondary" size="sm" className="flex items-center space-x-2 hover:bg-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>Lecciones</span>
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/instructor/courses/${courseId}/modules/${module.id}/edit`}>
                                                        <Button variant="primary" size="sm" className="flex items-center space-x-2">
                                                            <Edit className="w-4 h-4" />
                                                            <span>Editar</span>
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(module.id)}
                                                        disabled={deletingId === module.id || isDeleting}
                                                        className="hover:scale-110 transition-transform duration-300"
                                                    >
                                                        {deletingId === module.id ? (
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

export default function CourseModulesPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <CourseModulesPageContent />
        </ProtectedRoute>
    );
}

