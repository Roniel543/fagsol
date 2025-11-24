'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAdminMaterials, useDeleteMaterial } from '@/shared/hooks/useAdminMaterials';
import { useAdminModules } from '@/shared/hooks/useAdminModules';
import { useCourse } from '@/shared/hooks/useCourses';
import { Edit, ExternalLink, Link as LinkIcon, Plus, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function CourseMaterialsPageContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const { course, isLoading: isLoadingCourse } = useCourse(courseId);
    const { modules } = useAdminModules(courseId);
    const [filters, setFilters] = useState<{ material_type?: string }>({});
    const { materials, isLoading, mutate } = useAdminMaterials(courseId, filters.material_type ? { material_type: filters.material_type as 'video' | 'link' } : undefined);
    const { deleteMaterial, isDeleting } = useDeleteMaterial();
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (materialId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeletingId(materialId);
        setError(null);

        try {
            await deleteMaterial(materialId);
            showToast('Material eliminado exitosamente', 'success');
            mutate();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el material');
            showToast(err.message || 'Error al eliminar el material', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const getMaterialTypeIcon = (type: string) => {
        return type === 'video' ? (
            <Video className="w-5 h-5 text-red-500" />
        ) : (
            <LinkIcon className="w-5 h-5 text-blue-500" />
        );
    };

    const getMaterialTypeLabel = (type: string) => {
        return type === 'video' ? 'Video Vimeo' : 'Enlace Externo';
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
                            Materiales: {course.title}
                        </h1>
                        <p className="text-gray-600 mt-1">Gestiona los materiales complementarios del curso</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/admin/courses">
                            <Button variant="secondary" size="sm">
                                Volver a Cursos
                            </Button>
                        </Link>
                        <Link href={`/admin/courses/${courseId}/materials/new`}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Material
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <Card className="p-4 mb-6 bg-white border border-gray-200">
                <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-900">
                        Tipo:
                    </label>
                    <select
                        value={filters.material_type || ''}
                        onChange={(e) => setFilters({ ...filters, material_type: e.target.value || undefined })}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        <option value="video">Video Vimeo</option>
                        <option value="link">Enlace Externo</option>
                    </select>
                </div>
            </Card>

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
                    <p className="mt-4 text-gray-600">Cargando materiales...</p>
                </div>
            )}

            {/* Materials List */}
            {!isLoading && (
                <>
                    {materials.length === 0 ? (
                        <Card className="p-8 text-center bg-white border border-gray-200">
                            <Video className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-900 mb-4 font-medium">Este curso no tiene materiales aún.</p>
                            <Link href={`/admin/courses/${courseId}/materials/new`}>
                                <Button variant="primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Primer Material
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {materials.map((material) => (
                                <Card key={material.id} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                {getMaterialTypeIcon(material.material_type)}
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {material.title}
                                                    </h3>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {getMaterialTypeLabel(material.material_type)}
                                                    </span>
                                                </div>
                                            </div>
                                            {material.description && (
                                                <p className="text-sm text-gray-700 mt-2 ml-8">
                                                    {material.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm ml-8">
                                                <a
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-1 text-primary-orange hover:underline font-medium"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span className="truncate max-w-md">{material.url}</span>
                                                </a>
                                                {material.module_title && (
                                                    <span className="text-gray-700">
                                                        • Módulo: <span className="font-medium">{material.module_title}</span>
                                                    </span>
                                                )}
                                                {material.lesson_title && (
                                                    <span className="text-gray-700">
                                                        • Lección: <span className="font-medium">{material.lesson_title}</span>
                                                    </span>
                                                )}
                                                {material.is_active ? (
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
                                            <Link href={`/admin/courses/${courseId}/materials/${material.id}/edit`}>
                                                <Button variant="primary" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(material.id)}
                                                disabled={deletingId === material.id || isDeleting}
                                            >
                                                {deletingId === material.id ? (
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

export default function CourseMaterialsPage() {
    return <CourseMaterialsPageContent />;
}

