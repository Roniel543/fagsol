'use client';

import { Button, Input, LoadingSpinner, Select } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useCreateLesson, useUpdateLesson } from '@/shared/hooks/useAdminLessons';
import { CreateLessonRequest, UpdateLessonRequest, listModuleLessons } from '@/shared/services/adminLessons';
import { useCallback, useEffect, useState } from 'react';

interface LessonFormProps {
    moduleId: string;
    lessonId?: string; // Si existe, es edición; si no, es creación
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function LessonForm({ moduleId, lessonId, onSuccess, onCancel }: LessonFormProps) {
    const [formData, setFormData] = useState<CreateLessonRequest>({
        title: '',
        description: '',
        lesson_type: 'video',
        content_url: '',
        content_text: '',
        duration_minutes: 0,
        order: 0,
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingLesson, setLoadingLesson] = useState(!!lessonId);
    const [error, setError] = useState<string | null>(null);

    const { createLesson, isCreating } = useCreateLesson();
    const { updateLesson, isUpdating } = useUpdateLesson();
    const { showToast } = useToast();

    // Cargar lección si es edición
    useEffect(() => {
        if (lessonId) {
            loadLesson();
        } else {
            // Al crear, obtener el siguiente orden
            loadNextOrder();
        }
    }, [lessonId, moduleId]);

    const loadNextOrder = async () => {
        try {
            const response = await listModuleLessons(moduleId);
            const maxOrder = response.data.length > 0
                ? Math.max(...response.data.map(l => l.order))
                : -1;
            setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
        } catch (err) {
            // Ignorar error, usar 0 por defecto
        }
    };

    const loadLesson = useCallback(async () => {
        if (!lessonId) return;
        try {
            setLoadingLesson(true);
            const response = await listModuleLessons(moduleId);
            const lesson = response.data.find(l => l.id === lessonId);
            if (lesson) {
                setFormData({
                    title: lesson.title || '',
                    description: lesson.description || '',
                    lesson_type: lesson.lesson_type || 'video',
                    content_url: lesson.content_url || '',
                    content_text: lesson.content_text || '',
                    duration_minutes: lesson.duration_minutes || 0,
                    order: lesson.order || 0,
                    is_active: lesson.is_active,
                });
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar la lección');
            showToast(err.message || 'Error al cargar la lección', 'error');
        } finally {
            setLoadingLesson(false);
        }
    }, [lessonId, moduleId, showToast]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'title':
                if (!value || value.trim().length < 3) {
                    return 'El título debe tener al menos 3 caracteres';
                }
                return '';
            case 'content_url':
                if (formData.lesson_type === 'video' && value && !value.match(/^https?:\/\//)) {
                    return 'La URL debe comenzar con http:// o https://';
                }
                return '';
            case 'duration_minutes':
                if (value < 0) {
                    return 'La duración debe ser mayor o igual a 0';
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

        // Si se cambia el tipo de lección, limpiar campos que no corresponden
        if (name === 'lesson_type') {
            setFormData((prev) => {
                const updated: any = {
                    ...prev,
                    [name]: newValue,
                };
                // Limpiar campos según el nuevo tipo
                if (newValue === 'text') {
                    updated.content_url = '';
                    updated.duration_minutes = 0;
                } else if (newValue === 'video') {
                    updated.content_text = '';
                } else {
                    // document o quiz
                    updated.content_text = '';
                    updated.duration_minutes = 0;
                }
                return updated;
            });
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
            if (key === 'content_url' && formData.lesson_type !== 'video') {
                // content_url solo es requerido para videos
                return;
            }
            const error = validateField(key, formData[key as keyof CreateLessonRequest]);
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
            if (lessonId) {
                // Editar lección
                const updateData: UpdateLessonRequest = {
                    title: formData.title,
                    description: formData.description || undefined,
                    lesson_type: formData.lesson_type,
                    order: formData.order,
                    is_active: formData.is_active,
                };

                // Solo incluir campos según el tipo y limpiar los que no corresponden
                if (formData.lesson_type === 'video') {
                    updateData.content_url = formData.content_url || undefined;
                    updateData.duration_minutes = formData.duration_minutes || 0;
                    updateData.content_text = undefined; // Limpiar si había texto
                } else if (formData.lesson_type === 'text') {
                    updateData.content_text = formData.content_text || undefined;
                    updateData.content_url = undefined; // Limpiar si había URL
                    updateData.duration_minutes = undefined; // Limpiar duración
                } else {
                    // document o quiz
                    updateData.content_url = formData.content_url || undefined;
                    updateData.content_text = undefined; // Limpiar si había texto
                    updateData.duration_minutes = undefined; // Limpiar duración
                }

                await updateLesson(lessonId, updateData);
                showToast('Lección actualizada exitosamente', 'success');
            } else {
                // Crear lección
                const createData: CreateLessonRequest = {
                    title: formData.title,
                    description: formData.description || undefined,
                    lesson_type: formData.lesson_type,
                    order: formData.order,
                    is_active: formData.is_active,
                };

                // Solo incluir campos según el tipo
                if (formData.lesson_type === 'video') {
                    createData.content_url = formData.content_url || undefined;
                    createData.duration_minutes = formData.duration_minutes || 0;
                } else if (formData.lesson_type === 'text') {
                    createData.content_text = formData.content_text || undefined;
                } else {
                    // document o quiz
                    createData.content_url = formData.content_url || undefined;
                }

                await createLesson(moduleId, createData);
                showToast('Lección creada exitosamente', 'success');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.message || (lessonId ? 'Error al actualizar la lección' : 'Error al crear la lección');
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingLesson) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-700 font-medium">Cargando lección...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 font-semibold px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="Título de la Lección"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-gray-900 bg-white placeholder-gray-400 transition-all duration-300"
                    />
                </div>

                <Select
                    label="Tipo de Lección"
                    name="lesson_type"
                    value={formData.lesson_type}
                    onChange={handleChange}
                    required
                    options={[
                        { value: 'video', label: 'Video (Vimeo)' },
                        { value: 'document', label: 'Documento' },
                        { value: 'quiz', label: 'Quiz' },
                        { value: 'text', label: 'Texto' },
                    ]}
                    error={errors.lesson_type}
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

                {/* Campos según el tipo de lección */}
                {formData.lesson_type === 'video' && (
                    <>
                        <div className="md:col-span-2">
                            <Input
                                label="URL del Video (Vimeo)"
                                name="content_url"
                                type="url"
                                value={formData.content_url || ''}
                                onChange={handleChange}
                                placeholder="https://vimeo.com/..."
                                error={errors.content_url}
                                variant="light"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                                Ingresa la URL completa del video de Vimeo
                            </p>
                        </div>
                        <Input
                            label="Duración (minutos)"
                            name="duration_minutes"
                            type="number"
                            value={(formData.duration_minutes || 0).toString()}
                            onChange={handleChange}
                            error={errors.duration_minutes}
                            variant="light"
                        />
                    </>
                )}

                {formData.lesson_type === 'text' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Contenido de Texto
                        </label>
                        <textarea
                            name="content_text"
                            value={formData.content_text}
                            onChange={handleChange}
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-gray-900 bg-white placeholder-gray-400 transition-all duration-300"
                            placeholder="Escribe el contenido de la lección aquí..."
                        />
                    </div>
                )}

                {(formData.lesson_type === 'document' || formData.lesson_type === 'quiz') && (
                    <div className="md:col-span-2">
                        <Input
                            label="URL del Contenido"
                            name="content_url"
                            type="url"
                            value={formData.content_url || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                            error={errors.content_url}
                            variant="light"
                        />
                    </div>
                )}

                {lessonId && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange focus:ring-2"
                        />
                        <label className="text-sm font-medium text-gray-900">
                            Lección activa
                        </label>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
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
                    {lessonId ? 'Actualizar Lección' : 'Crear Lección'}
                </Button>
            </div>
        </form>
    );
}

