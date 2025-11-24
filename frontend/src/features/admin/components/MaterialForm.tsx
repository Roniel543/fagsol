'use client';

import { Button, Input, LoadingSpinner, Select } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAdminLessons } from '@/shared/hooks/useAdminLessons';
import { useCreateMaterial, useUpdateMaterial } from '@/shared/hooks/useAdminMaterials';
import { useAdminModules } from '@/shared/hooks/useAdminModules';
import { CreateMaterialRequest, UpdateMaterialRequest, listCourseMaterials } from '@/shared/services/adminMaterials';
import { useCallback, useEffect, useState } from 'react';

interface MaterialFormProps {
    courseId: string;
    materialId?: string; // Si existe, es edición; si no, es creación
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function MaterialForm({ courseId, materialId, onSuccess, onCancel }: MaterialFormProps) {
    const [formData, setFormData] = useState<CreateMaterialRequest>({
        title: '',
        description: '',
        material_type: 'video',
        url: '',
        module_id: '',
        lesson_id: '',
        order: 0,
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingMaterial, setLoadingMaterial] = useState(!!materialId);
    const [error, setError] = useState<string | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string>('');

    const { createMaterial, isCreating } = useCreateMaterial();
    const { updateMaterial, isUpdating } = useUpdateMaterial();
    const { showToast } = useToast();
    const { modules } = useAdminModules(courseId);
    const { lessons, mutate: mutateLessons } = useAdminLessons(selectedModuleId || null);

    // Cargar material si es edición
    useEffect(() => {
        if (materialId) {
            loadMaterial();
        } else {
            loadNextOrder();
        }
    }, [materialId, courseId]);

    // Cargar lecciones cuando se selecciona un módulo
    useEffect(() => {
        if (selectedModuleId) {
            mutateLessons();
        }
    }, [selectedModuleId]);

    const loadNextOrder = async () => {
        try {
            const response = await listCourseMaterials(courseId);
            const maxOrder = response.data.length > 0
                ? Math.max(...response.data.map(m => m.order))
                : -1;
            setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
        } catch (err) {
            // Ignorar error, usar 0 por defecto
        }
    };

    const loadMaterial = useCallback(async () => {
        if (!materialId) return;
        try {
            setLoadingMaterial(true);
            const response = await listCourseMaterials(courseId);
            const material = response.data.find(m => m.id === materialId);
            if (material) {
                setFormData({
                    title: material.title || '',
                    description: material.description || '',
                    material_type: material.material_type || 'video',
                    url: material.url || '',
                    module_id: material.module_id || '',
                    lesson_id: material.lesson_id || '',
                    order: material.order || 0,
                    is_active: material.is_active,
                });
                if (material.module_id) {
                    setSelectedModuleId(material.module_id);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar el material');
            showToast(err.message || 'Error al cargar el material', 'error');
        } finally {
            setLoadingMaterial(false);
        }
    }, [materialId, courseId, showToast]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'title':
                if (!value || value.trim().length < 3) {
                    return 'El título debe tener al menos 3 caracteres';
                }
                return '';
            case 'url':
                if (!value || value.trim().length === 0) {
                    return 'La URL es requerida';
                }
                if (!value.match(/^https?:\/\//)) {
                    return 'La URL debe comenzar con http:// o https://';
                }
                return '';
            case 'order':
                if (value < 0) {
                    return 'El orden debe ser mayor o igual a 0';
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;

        if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            newValue = value === '' ? 0 : parseInt(value);
        }

        // Si cambia el módulo, limpiar la lección seleccionada
        if (name === 'module_id') {
            setSelectedModuleId(value);
            setFormData((prev) => ({
                ...prev,
                [name]: newValue,
                lesson_id: '', // Limpiar lección al cambiar módulo
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: newValue,
            }));
        }

        const error = validateField(name, newValue);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        Object.keys(formData).forEach((key) => {
            if (key === 'module_id' || key === 'lesson_id' || key === 'description') {
                // Estos campos son opcionales
                return;
            }
            const error = validateField(key, formData[key as keyof CreateMaterialRequest]);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (materialId) {
                // Editar material
                const updateData: UpdateMaterialRequest = {
                    title: formData.title,
                    description: formData.description || undefined,
                    material_type: formData.material_type,
                    url: formData.url,
                    order: formData.order,
                    is_active: formData.is_active,
                };

                // Solo incluir module_id y lesson_id si están seleccionados
                if (formData.module_id) {
                    updateData.module_id = formData.module_id;
                }
                if (formData.lesson_id) {
                    updateData.lesson_id = formData.lesson_id;
                }

                await updateMaterial(materialId, updateData);
                showToast('Material actualizado exitosamente', 'success');
            } else {
                // Crear material
                const createData: CreateMaterialRequest = {
                    title: formData.title,
                    description: formData.description || undefined,
                    material_type: formData.material_type,
                    url: formData.url,
                    order: formData.order,
                    is_active: formData.is_active,
                };

                // Solo incluir module_id y lesson_id si están seleccionados
                if (formData.module_id) {
                    createData.module_id = formData.module_id;
                }
                if (formData.lesson_id) {
                    createData.lesson_id = formData.lesson_id;
                }

                await createMaterial(courseId, createData);
                showToast('Material creado exitosamente', 'success');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.message || (materialId ? 'Error al actualizar el material' : 'Error al crear el material');
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingMaterial) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando material...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="Título del Material"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        error={errors.title}
                        variant="light"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                    />
                </div>

                <Select
                    label="Tipo de Material"
                    name="material_type"
                    value={formData.material_type}
                    onChange={handleChange}
                    required
                    options={[
                        { value: 'video', label: 'Video Vimeo' },
                        { value: 'link', label: 'Enlace Externo' },
                    ]}
                    error={errors.material_type}
                    variant="light"
                />

                <Input
                    label="Orden"
                    name="order"
                    type="number"
                    value={formData.order.toString()}
                    onChange={handleChange}
                    required
                    error={errors.order}
                    variant="light"
                />

                <div className="md:col-span-2">
                    <Input
                        label="URL"
                        name="url"
                        type="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder={formData.material_type === 'video' ? 'https://vimeo.com/...' : 'https://...'}
                        required
                        error={errors.url}
                        variant="light"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.material_type === 'video'
                            ? 'Ingresa la URL completa del video de Vimeo'
                            : 'Ingresa la URL del enlace externo'}
                    </p>
                </div>

                <Select
                    label="Módulo (opcional)"
                    name="module_id"
                    value={formData.module_id || ''}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Sin módulo específico' },
                        ...modules.map(m => ({ value: m.id, label: m.title })),
                    ]}
                    variant="light"
                />

                <Select
                    label="Lección (opcional)"
                    name="lesson_id"
                    value={formData.lesson_id || ''}
                    onChange={handleChange}
                    disabled={!selectedModuleId}
                    options={[
                        { value: '', label: 'Sin lección específica' },
                        ...(selectedModuleId ? lessons.map(l => ({ value: l.id, label: l.title })) : []),
                    ]}
                    variant="light"
                />

                {materialId && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
                        />
                        <label className="text-sm font-medium text-gray-900">
                            Material activo
                        </label>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading || isCreating || isUpdating}
                    disabled={loading || isCreating || isUpdating}
                >
                    {materialId ? 'Actualizar Material' : 'Crear Material'}
                </Button>
            </div>
        </form>
    );
}

