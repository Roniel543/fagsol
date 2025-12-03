'use client';

import { Button, ImageUploader, Input, LoadingSpinner, Select } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRequestCourseReview } from '@/shared/hooks/useCourses';
import { CreateCourseRequest, UpdateCourseRequest, getCourseById } from '@/shared/services/courses';
import { AlertCircle, AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock, DollarSign, Eye, FileText, Image as ImageIcon, Info, Layers, Plus, Shield, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
        status: 'draft' as 'draft' | 'pending_review' | 'needs_revision' | 'published' | 'archived',
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewComments, setReviewComments] = useState<string>(''); // Comentarios de revisión (solo para admin)
    const [courseReviewComments, setCourseReviewComments] = useState<string | null>(null); // Comentarios del curso (para mostrar al instructor)
    const router = useRouter();

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
                // Cargar comentarios de revisión si existen
                const reviewCommentsFromBackend = (course as any).review_comments;

                // Cargar comentarios en ambos estados (para admin e instructor)
                if (reviewCommentsFromBackend) {
                    setReviewComments(reviewCommentsFromBackend);
                    setCourseReviewComments(reviewCommentsFromBackend);
                } else {
                    // Limpiar si no hay comentarios
                    setReviewComments('');
                    setCourseReviewComments(null);
                }
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

        // Validar que instructores no puedan editar cursos en pending_review o published
        if (courseId && user?.role === 'instructor' && (currentStatus === 'pending_review' || currentStatus === 'published')) {
            if (currentStatus === 'pending_review') {
                setError('No puedes editar este curso mientras está en revisión. Espera a que se complete la revisión o se soliciten cambios.');
            } else if (currentStatus === 'published') {
                setError('No puedes editar este curso mientras está publicado. Si necesitas hacer cambios, contacta a un administrador.');
            }
            return;
        }

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

                // Si el admin está editando y hay comentarios de revisión, incluirlos
                // Esto aplica tanto si cambia el estado a needs_revision como si el curso ya está en needs_revision
                if (user?.role === 'admin') {
                    const newStatus = updateData.status || currentStatus;
                    // Solo incluir comentarios si el estado es o será needs_revision
                    if (newStatus === 'needs_revision') {
                        // Incluir comentarios incluso si están vacíos (para permitir limpiarlos)
                        (updateData as any).review_comments = reviewComments.trim();
                    }
                }

                response = await updateCourse(courseId, updateData);
            } else {
                // Crear curso
                response = await createCourse(formData);
            }

            if (response.success) {
                if (courseId) {
                    // Curso actualizado - mostrar toast
                    if (user?.role === 'instructor') {
                        showToast('Curso actualizado exitosamente. Los cambios se han guardado.', 'success');
                    } else {
                        showToast('Curso actualizado exitosamente', 'success');
                    }

                    // Redirigir después de actualizar
                    setTimeout(() => {
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            if (user?.role === 'instructor') {
                                router.push('/instructor/courses');
                            } else {
                                router.push('/admin/courses');
                            }
                        }
                    }, 1000);
                } else {
                    // Curso creado - mostrar modal con pasos siguientes
                    const newCourseId = response.data?.id;
                    if (newCourseId) {
                        setCreatedCourseId(newCourseId);
                        setShowSuccessModal(true);
                    } else {
                        // Fallback si no hay ID
                        showToast('Curso creado exitosamente', 'success');
                        setTimeout(() => {
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                if (user?.role === 'instructor') {
                                    router.push('/instructor/courses');
                                } else {
                                    router.push('/admin/courses');
                                }
                            }
                        }, 1000);
                    }
                }
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
                <p className="ml-4 text-secondary-light-gray font-medium">Cargando curso...</p>
            </div>
        );
    }

    const isInstructor = user?.role === 'instructor';

    // Determinar si el formulario debe estar deshabilitado para instructores
    const isFormDisabled: boolean = !!(courseId && isInstructor && (currentStatus === 'pending_review' || currentStatus === 'published'));

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mensajes de error y estado */}
            {error && (
                <div className="relative bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Alerta de comentarios de revisión (solo para instructores cuando el curso requiere cambios) */}
            {isInstructor && currentStatus === 'needs_revision' && (
                <div className="relative bg-orange-900/30 border border-orange-500/50 text-orange-200 px-6 py-5 rounded-xl backdrop-blur-sm shadow-lg mb-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-orange-200 mb-2 flex items-center space-x-2">
                                <span>El curso requiere cambios</span>
                            </h3>
                            {courseReviewComments ? (
                                <>
                                    <p className="text-sm text-orange-200/90 mb-3">
                                        El administrador ha revisado tu curso y ha solicitado los siguientes cambios:
                                    </p>
                                    <div className="bg-primary-black/40 border border-orange-500/30 rounded-lg p-4 mt-3">
                                        <p className="text-sm text-primary-white whitespace-pre-wrap leading-relaxed">
                                            {courseReviewComments}
                                        </p>
                                    </div>
                                    <p className="text-xs text-orange-200/70 mt-3">
                                        Por favor, realiza los cambios solicitados y vuelve a solicitar revisión cuando esté listo.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-orange-200/90 mb-3">
                                        El administrador ha marcado tu curso como "Requiere Cambios".
                                    </p>
                                    <p className="text-sm text-orange-200/90 mb-3">
                                        Por favor, revisa el contenido de tu curso y realiza las mejoras necesarias.
                                        Una vez completados los cambios, puedes volver a solicitar revisión.
                                    </p>
                                    <p className="text-xs text-orange-200/70 mt-3">
                                        💡 <strong>Tip:</strong> Si necesitas más detalles sobre qué cambios realizar, contacta al administrador.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje informativo para instructores con cursos en revisión */}
            {courseId && isInstructor && currentStatus === 'pending_review' && (
                <div className="relative bg-blue-900/30 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            Este curso está en revisión. No puedes editarlo hasta que se complete la revisión o se soliciten cambios. Te notificaremos cuando haya un resultado.
                        </p>
                    </div>
                </div>
            )}
            {/* Mensaje informativo para instructores con cursos publicados */}
            {courseId && isInstructor && currentStatus === 'published' && (
                <div className="relative bg-amber-900/30 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            Este curso ya está publicado. No puedes editarlo directamente. Si necesitas hacer cambios, contacta a un administrador.
                        </p>
                    </div>
                </div>
            )}

            {/* Sección 1: Información Básica */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-primary-orange/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary-white">Información Básica</h2>
                        <p className="text-sm text-secondary-light-gray">Datos principales de tu curso</p>
                    </div>
                </div>

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
                            variant="dark"
                            disabled={isFormDisabled}
                        />
                        {isInstructor && !errors.title && (
                            <p className="mt-1 text-xs text-secondary-light-gray flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>Usa un título claro y descriptivo que capture la atención</span>
                            </p>
                        )}
                    </div>

                    {/* Descripción Corta */}
                    <div className="md:col-span-2">
                        <label className="flex text-sm font-medium text-primary-white mb-2 items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary-orange" />
                            <span>Descripción Corta</span>
                        </label>
                        <textarea
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            placeholder="Breve descripción que aparecerá en el catálogo (máx. 500 caracteres)"
                            rows={3}
                            maxLength={500}
                            disabled={isFormDisabled}
                            className="block w-full px-4 py-3 bg-primary-black/40 border border-primary-orange/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-primary-white placeholder-secondary-light-gray backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-secondary-light-gray">
                                {formData.short_description?.length || 0}/500 caracteres
                            </p>
                            {isInstructor && (
                                <p className="text-xs text-secondary-light-gray">
                                    Aparecerá en las tarjetas del catálogo
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Descripción Completa */}
                    <div className="md:col-span-2">
                        <label className="flex text-sm font-medium text-primary-white mb-2 items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary-orange" />
                            <span>Descripción Completa</span>
                            <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descripción detallada del curso. Explica qué aprenderán los estudiantes, los objetivos, y el valor que ofrece tu curso..."
                            rows={8}
                            required
                            disabled={isFormDisabled}
                            className={`block w-full px-4 py-3 bg-primary-black/40 border ${errors.description ? 'border-red-500/50' : 'border-primary-orange/20'
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-primary-white placeholder-secondary-light-gray backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        {errors.description ? (
                            <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.description}</span>
                            </p>
                        ) : (
                            isInstructor && (
                                <p className="mt-2 text-xs text-secondary-light-gray flex items-center space-x-1">
                                    <Info className="w-3 h-3" />
                                    <span>Describe detalladamente el contenido y los beneficios del curso</span>
                                </p>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Sección 2: Precio y Configuración */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-primary-orange/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary-white">Precio y Configuración</h2>
                        <p className="text-sm text-secondary-light-gray">Define el precio y características del curso</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                            variant="dark"
                            disabled={isFormDisabled}
                        />
                        {isInstructor && !errors.price && (
                            <p className="mt-1 text-xs text-secondary-light-gray">
                                Considera el valor que ofreces
                            </p>
                        )}
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
                            variant="dark"
                            disabled={isFormDisabled}
                        />
                        {isInstructor && !errors.discount_price && (
                            <p className="mt-1 text-xs text-secondary-light-gray">
                                Opcional: para promociones especiales
                            </p>
                        )}
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
                                variant="dark"
                            />
                        </div>
                    )}

                    {/* Campo de comentarios de revisión (solo para admin cuando cambia a needs_revision) */}
                    {user?.role === 'admin' && formData.status === 'needs_revision' && (
                        <div>
                            <label className="flex text-sm font-medium text-primary-white mb-2 items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-primary-orange" />
                                <span>Comentarios de Revisión</span>
                                <span className="text-xs text-secondary-light-gray">(Opcional pero recomendado)</span>
                            </label>
                            <textarea
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                placeholder="Explica qué cambios requiere el curso. Estos comentarios serán visibles para el instructor."
                                rows={4}
                                maxLength={2000}
                                disabled={isFormDisabled}
                                className="block w-full px-4 py-3 bg-primary-black/40 border border-primary-orange/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-primary-white placeholder-secondary-light-gray backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-secondary-light-gray">
                                    {reviewComments.length}/2000 caracteres
                                </p>
                                <p className="text-xs text-secondary-light-gray">
                                    El instructor verá estos comentarios cuando revise su curso
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Categoría */}
                    <div>
                        <Input
                            label="Categoría"
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            placeholder="Ej: Programación, Diseño, Marketing..."
                            variant="dark"
                            disabled={isFormDisabled}
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
                            variant="dark"
                            disabled={isFormDisabled}
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
                            variant="dark"
                            disabled={isFormDisabled}
                        />
                        {isInstructor && !errors.hours && (
                            <p className="mt-1 text-xs text-secondary-light-gray">
                                Duración estimada del curso
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sección 3: Imágenes y Multimedia */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-primary-orange/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary-white">Imágenes y Multimedia</h2>
                        <p className="text-sm text-secondary-light-gray">URLs de imágenes para tu curso</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Miniatura */}
                    <div>
                        <ImageUploader
                            label="Miniatura del Curso"
                            value={formData.thumbnail_url || ''}
                            onChange={(url) => {
                                setFormData(prev => ({ ...prev, thumbnail_url: url }));
                                // Limpiar error si existe
                                if (errors.thumbnail_url) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.thumbnail_url;
                                        return newErrors;
                                    });
                                }
                            }}
                            imageType="thumbnail"
                            recommendedSize="400x300px"
                            error={errors.thumbnail_url}
                            disabled={isFormDisabled}
                        />
                    </div>

                    {/* Banner */}
                    <div>
                        <ImageUploader
                            label="Banner del Curso"
                            value={formData.banner_url || ''}
                            onChange={(url) => {
                                setFormData(prev => ({ ...prev, banner_url: url }));
                                // Limpiar error si existe
                                if (errors.banner_url) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.banner_url;
                                        return newErrors;
                                    });
                                }
                            }}
                            imageType="banner"
                            recommendedSize="1920x600px"
                            error={errors.banner_url}
                            disabled={isFormDisabled}
                        />
                    </div>
                </div>
            </div>

            {/* Sección 4: Tags y Clasificación */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-primary-orange/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary-white">Tags y Clasificación</h2>
                        <p className="text-sm text-secondary-light-gray">Ayuda a los estudiantes a encontrar tu curso</p>
                    </div>
                </div>

                <div>
                    <label className="flex text-sm font-medium text-primary-white mb-2 items-center space-x-2">
                        <Tag className="w-4 h-4 text-primary-orange" />
                        <span>Tags (separados por comas)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.tags?.join(', ') || ''}
                        onChange={handleTagsChange}
                        placeholder="python, programación, web, desarrollo"
                        disabled={isFormDisabled}
                        className="block w-full px-4 py-3 bg-primary-black/40 border border-primary-orange/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm text-primary-white placeholder-secondary-light-gray backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-secondary-light-gray">
                            {formData.tags?.length || 0} {formData.tags?.length === 1 ? 'tag' : 'tags'}
                        </p>
                        {isInstructor && (
                            <p className="text-xs text-secondary-light-gray">
                                Usa palabras clave relevantes
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Botones y Estado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-primary-orange/20">
                {/* Botón de solicitar revisión (solo para instructores con cursos en draft o needs_revision) */}
                {courseId && isInstructor && (currentStatus === 'draft' || currentStatus === 'needs_revision') && (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setShowReviewModal(true)}
                        disabled={isRequesting || loading}
                        className="flex items-center space-x-2"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Solicitar Revisión</span>
                    </Button>
                )}

                {/* Estado del curso (solo para instructores) */}
                {courseId && isInstructor && (
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-secondary-light-gray">Estado actual:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${currentStatus === 'draft' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            currentStatus === 'pending_review' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                currentStatus === 'needs_revision' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                    currentStatus === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                        'bg-secondary-dark-gray/60 text-secondary-light-gray border-primary-orange/30'
                            }`}>
                            {currentStatus === 'draft' ? 'Borrador' :
                                currentStatus === 'pending_review' ? 'Pendiente de Revisión' :
                                    currentStatus === 'needs_revision' ? 'Requiere Cambios' :
                                        currentStatus === 'published' ? 'Publicado' :
                                            currentStatus}
                        </span>
                    </div>
                )}

                <div className="flex space-x-4 ml-auto">
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
                        disabled={loading || isRequesting || isFormDisabled}
                        className="flex items-center space-x-2"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>{courseId ? 'Actualizar Curso' : 'Crear Curso'}</span>
                    </Button>
                </div>
            </div>

            {/* Modal de éxito al crear curso */}
            {showSuccessModal && createdCourseId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
                    <div
                        className="bg-secondary-dark-gray border border-primary-orange/30 rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-fade-in overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-primary-orange/20 via-amber-500/10 to-primary-orange/20 border-b border-primary-orange/30 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary-white mb-1">
                                            ¡Curso Creado Exitosamente!
                                        </h3>
                                        <p className="text-secondary-light-gray">
                                            Tu curso está en estado <span className="font-semibold text-amber-400">"Borrador"</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-10 h-10 rounded-lg bg-primary-black/40 hover:bg-primary-black/60 border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 flex items-center justify-center group"
                                >
                                    <X className="w-5 h-5 text-secondary-light-gray group-hover:text-primary-white transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6 space-y-6">
                            {/* Mensaje principal */}
                            <div className="bg-primary-black/40 border border-primary-orange/20 rounded-lg p-4">
                                <p className="text-primary-white text-center font-medium">
                                    {user?.role === 'instructor'
                                        ? 'Ahora puedes agregar contenido a tu curso. Sigue estos pasos para completarlo:'
                                        : 'El curso ha sido creado exitosamente. Puedes agregar contenido y configurarlo según sea necesario:'
                                    }
                                </p>
                            </div>

                            {/* Pasos siguientes */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-primary-white flex items-center space-x-2">
                                    <Layers className="w-5 h-5 text-primary-orange" />
                                    <span>Próximos Pasos</span>
                                </h4>

                                {/* Paso 1 */}
                                <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg hover:border-primary-orange/40 transition-all duration-300 group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center font-bold text-primary-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-primary-white mb-1 flex items-center space-x-2">
                                            <Plus className="w-4 h-4 text-primary-orange" />
                                            <span>Agregar Módulos y Lecciones</span>
                                        </h5>
                                        <p className="text-sm text-secondary-light-gray">
                                            Organiza el contenido de tu curso en módulos y agrega lecciones con videos, textos y materiales.
                                        </p>
                                    </div>
                                </div>

                                {/* Paso 2 */}
                                <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg hover:border-primary-orange/40 transition-all duration-300 group opacity-75">
                                    <div className="flex-shrink-0 w-10 h-10 bg-secondary-dark-gray rounded-lg flex items-center justify-center font-bold text-secondary-light-gray border border-primary-orange/20">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-secondary-light-gray mb-1 flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-secondary-light-gray" />
                                            <span>Revisar y Completar Información</span>
                                        </h5>
                                        <p className="text-sm text-secondary-light-gray">
                                            Asegúrate de que toda la información esté completa y las imágenes sean de calidad.
                                        </p>
                                    </div>
                                </div>

                                {/* Paso 3 - Diferente según el rol */}
                                {user?.role === 'instructor' ? (
                                    <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg hover:border-primary-orange/40 transition-all duration-300 group opacity-75">
                                        <div className="flex-shrink-0 w-10 h-10 bg-secondary-dark-gray rounded-lg flex items-center justify-center font-bold text-secondary-light-gray border border-primary-orange/20">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-secondary-light-gray mb-1 flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-secondary-light-gray" />
                                                <span>Solicitar Revisión</span>
                                            </h5>
                                            <p className="text-sm text-secondary-light-gray">
                                                Cuando tu curso esté completo, solicita revisión para que un administrador lo apruebe y publique.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg hover:border-primary-orange/40 transition-all duration-300 group opacity-75">
                                        <div className="flex-shrink-0 w-10 h-10 bg-secondary-dark-gray rounded-lg flex items-center justify-center font-bold text-secondary-light-gray border border-primary-orange/20">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-secondary-light-gray mb-1 flex items-center space-x-2">
                                                <CheckCircle2 className="w-4 h-4 text-secondary-light-gray" />
                                                <span>Publicar el Curso</span>
                                            </h5>
                                            <p className="text-sm text-secondary-light-gray">
                                                Una vez que el contenido esté completo, puedes cambiar el estado del curso a "Publicado" para que esté disponible para los estudiantes.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-between pt-4 border-t border-primary-orange/20">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        if (onSuccess) {
                                            onSuccess();
                                        } else {
                                            if (user?.role === 'instructor') {
                                                router.push('/instructor/courses');
                                            } else {
                                                router.push('/admin/courses');
                                            }
                                        }
                                    }}
                                >
                                    {user?.role === 'instructor' ? 'Ver Mis Cursos' : 'Ver Todos los Cursos'}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        if (user?.role === 'instructor') {
                                            router.push(`/instructor/courses/${createdCourseId}/modules`);
                                        } else {
                                            router.push(`/admin/courses/${createdCourseId}/modules`);
                                        }
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Agregar Contenido</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Solicitar Revisión */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
                    <div
                        className="bg-secondary-dark-gray border border-primary-orange/30 rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-fade-in overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-primary-orange/20 via-amber-500/10 to-primary-orange/20 border-b border-primary-orange/30 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary-white mb-1">
                                            Solicitar Revisión del Curso
                                        </h3>
                                        <p className="text-secondary-light-gray">
                                            {formData.title || 'Tu curso será revisado por un administrador'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="w-10 h-10 rounded-lg bg-primary-black/40 hover:bg-primary-black/60 border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 flex items-center justify-center group"
                                >
                                    <X className="w-5 h-5 text-secondary-light-gray group-hover:text-primary-white transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6 space-y-6">
                            {/* Información principal */}
                            <div className="bg-primary-black/40 border border-primary-orange/20 rounded-lg p-4">
                                <p className="text-primary-white text-center font-medium">
                                    ¿Estás seguro de que deseas solicitar revisión de este curso?
                                </p>
                            </div>

                            {/* Proceso de revisión */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-primary-white flex items-center space-x-2">
                                    <Eye className="w-5 h-5 text-primary-orange" />
                                    <span>¿Qué pasará después?</span>
                                </h4>

                                <div className="space-y-3">
                                    {/* Paso 1 */}
                                    <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center font-bold text-primary-white text-sm shadow-lg">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-primary-white mb-1">Revisión por Administrador</h5>
                                            <p className="text-sm text-secondary-light-gray">
                                                Un administrador revisará el contenido, calidad y cumplimiento de políticas de tu curso.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Paso 2 */}
                                    <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center font-bold text-primary-white text-sm shadow-lg">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-primary-white mb-1">Cambio de Estado</h5>
                                            <p className="text-sm text-secondary-light-gray">
                                                El estado de tu curso cambiará a <span className="font-semibold text-blue-300">"Pendiente de Revisión"</span> y no podrás editarlo hasta que se complete la revisión.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Paso 3 */}
                                    <div className="flex items-start space-x-4 p-4 bg-primary-black/40 border border-primary-orange/20 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center font-bold text-primary-white text-sm shadow-lg">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-primary-white mb-1">Resultado de la Revisión</h5>
                                            <p className="text-sm text-secondary-light-gray">
                                                El administrador puede <span className="font-semibold text-green-300">aprobar y publicar</span> tu curso, o <span className="font-semibold text-orange-300">solicitar cambios</span> si es necesario. Si se solicitan cambios, podrás editarlo nuevamente y volver a solicitar revisión.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist de requisitos */}
                            <div className="space-y-3">
                                <h4 className="text-lg font-bold text-primary-white flex items-center space-x-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary-orange" />
                                    <span>Requisitos para Revisión</span>
                                </h4>
                                <div className="bg-primary-black/40 border border-primary-orange/20 rounded-lg p-4 space-y-2">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.title ? 'text-green-400' : 'text-gray-500'}`} />
                                        <span className={`text-sm ${formData.title ? 'text-primary-white' : 'text-secondary-light-gray'}`}>
                                            Título del curso completo
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.description ? 'text-green-400' : 'text-gray-500'}`} />
                                        <span className={`text-sm ${formData.description ? 'text-primary-white' : 'text-secondary-light-gray'}`}>
                                            Descripción completa del curso
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.thumbnail_url ? 'text-green-400' : 'text-gray-500'}`} />
                                        <span className={`text-sm ${formData.thumbnail_url ? 'text-primary-white' : 'text-secondary-light-gray'}`}>
                                            Imagen miniatura subida
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.banner_url ? 'text-green-400' : 'text-gray-500'}`} />
                                        <span className={`text-sm ${formData.banner_url ? 'text-primary-white' : 'text-secondary-light-gray'}`}>
                                            Imagen banner subida
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" />
                                        <span className="text-sm text-secondary-light-gray">
                                            <span className="font-semibold text-amber-300">Recomendado:</span> Agregar módulos y lecciones antes de solicitar revisión
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tiempo estimado */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-300 mb-1">Tiempo de Revisión</p>
                                        <p className="text-xs text-secondary-light-gray">
                                            El proceso de revisión generalmente toma entre 24 y 48 horas. Te notificaremos cuando se complete.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-between pt-4 border-t border-primary-orange/20">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowReviewModal(false)}
                                    disabled={isRequesting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={async () => {
                                        try {
                                            const result = await requestReview(courseId!);
                                            if (result.success) {
                                                setShowReviewModal(false);
                                                showToast('Revisión solicitada exitosamente. El administrador revisará tu curso.', 'success');
                                                // Recargar el curso para actualizar el estado
                                                loadCourse();
                                            } else {
                                                showToast(`${result.message || 'Error al solicitar revisión'}`, 'error');
                                            }
                                        } catch (err: any) {
                                            showToast(`${err.message || 'Error al solicitar revisión'}`, 'error');
                                        }
                                    }}
                                    disabled={isRequesting || loading}
                                    className="flex items-center space-x-2"
                                >
                                    {isRequesting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Solicitando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            <span>Solicitar Revisión</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

