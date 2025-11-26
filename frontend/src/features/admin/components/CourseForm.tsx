'use client';

import { Button, Input, LoadingSpinner, Select } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRequestCourseReview } from '@/shared/hooks/useCourses';
import { CreateCourseRequest, UpdateCourseRequest, getCourseById } from '@/shared/services/courses';
import { useCallback, useEffect, useState } from 'react';

interface CourseFormProps {
    courseId?: string; // Si existe, es edición; si no, es creación
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CourseForm({ courseId, onSuccess, onCancel }: CourseFormProps) {
    const [formData, setFormData] = useState<CreateCourseRequest>({
        title: '',
        description: '',
        short_description: '',
        price: 0,
        currency: 'PEN',
        status: 'draft',
        category: 'General',
        level: 'beginner',
        thumbnail_url: '',
        banner_url: '',
        discount_price: undefined,
        hours: 0,
        instructor: {
            id: 'i-001',
            name: 'Equipo Fagsol',
        },
        tags: [],
        provider: 'fagsol',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingCourse, setLoadingCourse] = useState(!!courseId);
    const [error, setError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string>('draft');

    // Hooks para solicitar revisión (FASE 2)
    const { user } = useAuth();
    const { requestReview, isRequesting } = useRequestCourseReview();
    const { showToast } = useToast();

    const loadCourse = useCallback(async () => {
        try {
            setLoadingCourse(true);
            setError(null);
            const response = await getCourseById(courseId!);
            if (response.success && response.data) {
                const course = response.data;
                const courseStatus = (course.status as any) || 'draft';
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    short_description: course.short_description || '',
                    price: course.price || 0,
                    currency: course.currency || 'PEN',
                    status: courseStatus,
                    category: (course as any).category || 'General',
                    level: ((course as any).level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
                    thumbnail_url: course.thumbnail_url || '',
                    banner_url: course.banner_url || '',
                    discount_price: (course as any).discount_price || undefined,
                    hours: (course as any).hours || 0,
                    instructor: (course as any).instructor || {
                        id: 'i-001',
                        name: 'Equipo Fagsol',
                    },
                    tags: Array.isArray((course as any).tags) ? (course as any).tags : [],
                    provider: (course as any).provider || 'fagsol',
                });
                setCurrentStatus(courseStatus);
            } else {
                const errorMessage = (response as any).message || 'Error al cargar el curso';
                setError(errorMessage);
                showToast(`❌ ${errorMessage}`, 'error');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Error al cargar el curso';
            setError(errorMessage);
            showToast(`❌ ${errorMessage}`, 'error');
        } finally {
            setLoadingCourse(false);
        }
    }, [courseId, showToast]);

    // Cargar curso si es edición
    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId, loadCourse]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'title':
                if (!value || value.trim().length < 3) {
                    return 'El título debe tener al menos 3 caracteres';
                }
                if (value.length > 200) {
                    return 'El título no puede exceder 200 caracteres';
                }
                return '';
            case 'description':
                if (!value || value.trim().length < 10) {
                    return 'La descripción debe tener al menos 10 caracteres';
                }
                return '';
            case 'price':
                if (value === '' || value === null || value === undefined) {
                    return 'El precio es requerido';
                }
                const priceNum = parseFloat(value);
                if (isNaN(priceNum) || priceNum < 0) {
                    return 'El precio debe ser un número mayor o igual a 0';
                }
                return '';
            case 'discount_price':
                if (value && value !== '') {
                    const discountNum = parseFloat(value);
                    if (isNaN(discountNum) || discountNum < 0) {
                        return 'El precio con descuento debe ser un número mayor o igual a 0';
                    }
                    if (discountNum >= formData.price) {
                        return 'El precio con descuento debe ser menor al precio normal';
                    }
                }
                return '';
            case 'hours':
                if (value && value !== '') {
                    const hoursNum = parseInt(value);
                    if (isNaN(hoursNum) || hoursNum < 0) {
                        return 'Las horas deben ser un número mayor o igual a 0';
                    }
                }
                return '';
            case 'thumbnail_url':
            case 'banner_url':
                if (value && value.trim() !== '') {
                    try {
                        new URL(value);
                    } catch {
                        return 'Debe ser una URL válida';
                    }
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Convertir valores numéricos
        let processedValue: any = value;
        if (name === 'price' || name === 'discount_price') {
            processedValue = value === '' ? undefined : parseFloat(value);
            if (isNaN(processedValue)) processedValue = value;
        } else if (name === 'hours') {
            processedValue = value === '' ? undefined : parseInt(value);
            if (isNaN(processedValue)) processedValue = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));

        // Validar en tiempo real
        const error = validateField(name, processedValue);
        setErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        setFormData(prev => ({
            ...prev,
            tags,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        Object.keys(formData).forEach(key => {
            if (key === 'title' || key === 'description' || key === 'price') {
                const error = validateField(key, (formData as any)[key]);
                if (error) {
                    newErrors[key] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            setError('Por favor, corrige los errores en el formulario');
            return;
        }

        setLoading(true);

        try {
            const { createCourse, updateCourse } = await import('@/shared/services/courses');

            let response;
            if (courseId) {
                // Actualizar curso
                const updateData: UpdateCourseRequest = { ...formData };

                // Si el usuario es instructor y el curso ya está publicado,
                // no enviar el campo status para evitar errores
                if (user?.role === 'instructor' && currentStatus === 'published' && updateData.status === 'published') {
                    // No enviar status si ya está publicado (mantener el estado actual)
                    delete updateData.status;
                }

                response = await updateCourse(courseId, updateData);
            } else {
                // Crear curso
                response = await createCourse(formData);
            }

            if (response.success) {
                // Mostrar toast de éxito
                if (courseId) {
                    // Curso actualizado
                    if (user?.role === 'instructor') {
                        showToast('✅ Curso actualizado exitosamente. Los cambios se han guardado.', 'success');
                    } else {
                        showToast('✅ Curso actualizado exitosamente', 'success');
                    }
                } else {
                    // Curso creado
                    if (user?.role === 'instructor') {
                        showToast('✅ Curso creado exitosamente. Está en estado "Borrador". Puedes solicitar revisión cuando esté listo.', 'success');
                    } else {
                        showToast('✅ Curso creado exitosamente', 'success');
                    }
                }

                // Pequeño delay para que el usuario vea el toast antes de redirigir
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        // Redirigir a la lista de cursos según el rol
                        if (user?.role === 'instructor') {
                            window.location.href = '/instructor/courses';
                        } else {
                            window.location.href = '/admin/courses';
                        }
                    }
                }, 1000);
            } else {
                const errorMessage = (response as any).message || 'Error al guardar el curso';
                setError(errorMessage);
                showToast(`❌ ${errorMessage}`, 'error');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Error de conexión con el servidor';
            setError(errorMessage);
            showToast(`❌ ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCourse) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando curso...</p>
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

            {/* Mensaje informativo para instructores con cursos publicados */}
            {courseId && user?.role === 'instructor' && currentStatus === 'published' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">
                        ℹ️ Este curso ya está publicado. Puedes actualizar su contenido, pero no puedes cambiar su estado. Si necesitas hacer cambios significativos, contacta a un administrador.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                    <Input
                        label="Título del Curso"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ej: Introducción a Python"
                        required
                        error={errors.title}
                        variant="light"
                    />
                </div>

                {/* Descripción Corta */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Descripción Corta
                    </label>
                    <textarea
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        placeholder="Breve descripción que aparecerá en el catálogo (máx. 500 caracteres)"
                        rows={2}
                        maxLength={500}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-gray-900 bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.short_description?.length || 0}/500 caracteres
                    </p>
                </div>

                {/* Descripción Completa */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Descripción Completa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descripción detallada del curso..."
                        rows={6}
                        required
                        className={`block w-full px-4 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-gray-900 bg-white`}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                {/* Precio */}
                <div>
                    <Input
                        label="Precio (PEN)"
                        type="number"
                        name="price"
                        value={formData.price ? String(formData.price) : ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        error={errors.price}
                        variant="light"
                    />
                </div>

                {/* Precio con Descuento */}
                <div>
                    <Input
                        label="Precio con Descuento (PEN)"
                        type="number"
                        name="discount_price"
                        value={formData.discount_price ? String(formData.discount_price) : ''}
                        onChange={handleChange}
                        placeholder="Opcional"
                        error={errors.discount_price}
                        variant="light"
                    />
                </div>

                {/* Estado (solo para admin) */}
                {user?.role === 'admin' && (
                    <div>
                        <Select
                            label="Estado"
                            name="status"
                            value={formData.status || 'draft'}
                            onChange={handleChange}
                            options={[
                                { value: 'draft', label: 'Borrador' },
                                { value: 'pending_review', label: 'Pendiente de Revisión' },
                                { value: 'needs_revision', label: 'Requiere Cambios' },
                                { value: 'published', label: 'Publicado' },
                                { value: 'archived', label: 'Archivado' },
                            ]}
                            variant="light"
                        />
                    </div>
                )}

                {/* Categoría */}
                <div>
                    <Input
                        label="Categoría"
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        placeholder="Ej: Programación"
                        variant="light"
                    />
                </div>

                {/* Nivel */}
                <div>
                    <Select
                        label="Nivel"
                        name="level"
                        value={formData.level || 'beginner'}
                        onChange={handleChange}
                        options={[
                            { value: 'beginner', label: 'Principiante' },
                            { value: 'intermediate', label: 'Intermedio' },
                            { value: 'advanced', label: 'Avanzado' },
                        ]}
                        variant="light"
                    />
                </div>

                {/* Horas */}
                <div>
                    <Input
                        label="Horas Totales"
                        type="number"
                        name="hours"
                        value={formData.hours ? String(formData.hours) : ''}
                        onChange={handleChange}
                        placeholder="0"
                        error={errors.hours}
                        variant="light"
                    />
                </div>

                {/* URL Miniatura */}
                <div className="md:col-span-2">
                    <Input
                        label="URL de Miniatura"
                        type="url"
                        name="thumbnail_url"
                        value={formData.thumbnail_url || ''}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        error={errors.thumbnail_url}
                        variant="light"
                    />
                </div>

                {/* URL Banner */}
                <div className="md:col-span-2">
                    <Input
                        label="URL de Banner"
                        type="url"
                        name="banner_url"
                        value={formData.banner_url || ''}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/banner.jpg"
                        error={errors.banner_url}
                        variant="light"
                    />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Tags (separados por comas)
                    </label>
                    <input
                        type="text"
                        value={formData.tags?.join(', ') || ''}
                        onChange={handleTagsChange}
                        placeholder="python, programación, web"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.tags?.length || 0} tags
                    </p>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between items-center pt-6 border-t">
                {/* Botón de solicitar revisión (solo para instructores con cursos en draft o needs_revision) */}
                {courseId && user?.role === 'instructor' && (currentStatus === 'draft' || currentStatus === 'needs_revision') && (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={async () => {
                            if (!confirm('¿Estás seguro de que deseas solicitar revisión de este curso? El administrador lo revisará antes de publicarlo.')) {
                                return;
                            }
                            try {
                                const result = await requestReview(courseId);
                                if (result.success) {
                                    showToast('Revisión solicitada exitosamente. El administrador revisará tu curso.', 'success');
                                    // Recargar el curso para actualizar el estado
                                    loadCourse();
                                } else {
                                    showToast(result.message || 'Error al solicitar revisión', 'error');
                                }
                            } catch (err: any) {
                                showToast(err.message || 'Error al solicitar revisión', 'error');
                            }
                        }}
                        disabled={isRequesting || loading}
                    >
                        {isRequesting ? 'Solicitando...' : 'Solicitar Revisión'}
                    </Button>
                )}

                {/* Estado del curso (solo para instructores) */}
                {courseId && user?.role === 'instructor' && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus === 'draft' ? 'bg-gray-100 text-gray-800' :
                            currentStatus === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                                currentStatus === 'needs_revision' ? 'bg-orange-100 text-orange-800' :
                                    currentStatus === 'published' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {currentStatus === 'draft' ? 'Borrador' :
                                currentStatus === 'pending_review' ? 'Pendiente de Revisión' :
                                    currentStatus === 'needs_revision' ? 'Requiere Cambios' :
                                        currentStatus === 'published' ? 'Publicado' :
                                            currentStatus}
                        </span>
                    </div>
                )}
                <div className="flex space-x-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        type="submit"
                        loading={loading}
                        disabled={loading || isRequesting}
                    >
                        {courseId ? 'Actualizar Curso' : 'Crear Curso'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

