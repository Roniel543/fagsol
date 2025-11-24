'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAdminModules, useCreateModule, useDeleteModule } from '@/shared/hooks/useAdminModules';
import { useCourse } from '@/shared/hooks/useCourses';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function CourseModulesPageContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const { course, isLoading: isLoadingCourse } = useCourse(courseId);
    const { modules, isLoading, mutate } = useAdminModules(courseId);
    const { createModule, isCreating } = useCreateModule();
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
            showToast(err.message || 'Error al eliminar el módulo', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoadingCourse) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando curso...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">Curso no encontrado</p>
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
                            Módulos: {course.title}
                        </h1>
                        <p className="text-gray-600 mt-1">Gestiona los módulos y lecciones del curso</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/admin/courses">
                            <Button variant="secondary" size="sm">
                                Volver a Cursos
                            </Button>
                        </Link>
                        <Link href={`/admin/courses/${courseId}/modules/new`}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Módulo
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
                    <p className="mt-4 text-gray-600">Cargando módulos...</p>
                </div>
            )}

            {/* Modules List */}
            {!isLoading && (
                <>
                    {modules.length === 0 ? (
                        <Card className="p-8 text-center bg-white border border-gray-200">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-900 mb-4 font-medium">Este curso no tiene módulos aún.</p>
                            <Link href={`/admin/courses/${courseId}/modules/new`}>
                                <Button className="flex mx-auto" variant="primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Primer Módulo
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {modules.map((module) => (
                                <Card key={module.id} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                                    {module.order}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {module.title}
                                                    </h3>
                                                    {module.description && (
                                                        <p className="text-sm text-gray-800 mt-1">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-4 text-sm">
                                                <span className="text-gray-900 font-medium">{module.lessons_count} lección{module.lessons_count !== 1 ? 'es' : ''}</span>
                                                {module.is_purchasable && (
                                                    <span className="text-primary-orange font-semibold">
                                                        S/ {module.price.toFixed(2)} (separable)
                                                    </span>
                                                )}
                                                {module.is_active ? (
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
                                            <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                                                <Button variant="secondary" size="sm">
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Lecciones
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/courses/${courseId}/modules/${module.id}/edit`}>
                                                <Button variant="primary" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(module.id)}
                                                disabled={deletingId === module.id || isDeleting}
                                            >
                                                {deletingId === module.id ? (
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

export default function CourseModulesPage() {
    return <CourseModulesPageContent />;
}

