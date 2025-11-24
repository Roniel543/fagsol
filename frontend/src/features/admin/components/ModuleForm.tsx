'use client';

import { Button, Input, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useCreateModule, useUpdateModule } from '@/shared/hooks/useAdminModules';
import { CreateModuleRequest, UpdateModuleRequest, listCourseModules } from '@/shared/services/adminModules';
import { useCallback, useEffect, useState } from 'react';

interface ModuleFormProps {
    courseId: string;
    moduleId?: string; // Si existe, es edición; si no, es creación
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ModuleForm({ courseId, moduleId, onSuccess, onCancel }: ModuleFormProps) {
    const [formData, setFormData] = useState<CreateModuleRequest>({
        title: '',
        description: '',
        price: 0,
        is_purchasable: false,
        order: 0,
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingModule, setLoadingModule] = useState(!!moduleId);
    const [error, setError] = useState<string | null>(null);

    const { createModule, isCreating } = useCreateModule();
    const { updateModule, isUpdating } = useUpdateModule();
    const { showToast } = useToast();

    // Cargar módulo si es edición
    useEffect(() => {
        if (moduleId) {
            loadModule();
        } else {
            // Al crear, obtener el siguiente orden
            loadNextOrder();
        }
    }, [moduleId, courseId]);

    const loadNextOrder = async () => {
        try {
            const response = await listCourseModules(courseId);
            const maxOrder = response.data.length > 0
                ? Math.max(...response.data.map(m => m.order))
                : -1;
            setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
        } catch (err) {
            // Ignorar error, usar 0 por defecto
        }
    };

    const loadModule = useCallback(async () => {
        if (!moduleId) return;
        try {
            setLoadingModule(true);
            const response = await listCourseModules(courseId);
            const module = response.data.find(m => m.id === moduleId);
            if (module) {
                setFormData({
                    title: module.title || '',
                    description: module.description || '',
                    price: module.price || 0,
                    is_purchasable: module.is_purchasable || false,
                    order: module.order || 0,
                    is_active: module.is_active,
                });
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar el módulo');
            showToast(err.message || 'Error al cargar el módulo', 'error');
        } finally {
            setLoadingModule(false);
        }
    }, [moduleId, courseId, showToast]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'title':
                if (!value || value.trim().length < 3) {
                    return 'El título debe tener al menos 3 caracteres';
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;

        if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            newValue = value === '' ? 0 : parseFloat(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        const error = validateField(name, newValue);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key as keyof CreateModuleRequest]);
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
            if (moduleId) {
                // Editar módulo
                const updateData: UpdateModuleRequest = {
                    title: formData.title,
                    description: formData.description || undefined,
                    price: formData.price,
                    is_purchasable: formData.is_purchasable,
                    order: formData.order,
                    is_active: formData.is_active,
                };
                await updateModule(moduleId, updateData);
                showToast('Módulo actualizado exitosamente', 'success');
            } else {
                // Crear módulo
                await createModule(courseId, formData);
                showToast('Módulo creado exitosamente', 'success');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.message || (moduleId ? 'Error al actualizar el módulo' : 'Error al crear el módulo');
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingModule) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando módulo...</p>
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
                        label="Título del Módulo"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        error={errors.title}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => handleChange(e as any)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                </div>

                <Input
                    label="Orden"
                    name="order"
                    type="number"
                    value={formData.order.toString()}
                    onChange={handleChange}
                    required
                    error={errors.order}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio (si se vende por separado)
                    </label>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={(formData.price || 0).toString()}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent`}
                    />
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="is_purchasable"
                        checked={formData.is_purchasable}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
                    />
                    <label className="text-sm font-medium text-gray-700">
                        Se puede comprar por separado
                    </label>
                </div>

                {moduleId && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Módulo activo
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
                    {moduleId ? 'Actualizar Módulo' : 'Crear Módulo'}
                </Button>
            </div>
        </form>
    );
}

