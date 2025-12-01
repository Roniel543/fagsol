'use client';

import { AuthBackground, Button } from '@/shared/components';
import { authAPI } from '@/shared/services/api';
import { ApiResponse } from '@/shared/types';
import { FileText, GraduationCap, Briefcase, Globe, Heart, Upload, X, CheckCircle2, AlertCircle, Info, Sparkles, ArrowRight, Users, DollarSign, Award, Clock, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface InstructorApplicationForm {
    professional_title: string;
    experience_years: string;
    specialization: string;
    bio: string;
    portfolio_url: string;
    motivation: string;
    cv_file: File | null;
}

export function BecomeInstructorForm() {
    const [formData, setFormData] = useState<InstructorApplicationForm>({
        professional_title: '',
        experience_years: '',
        specialization: '',
        bio: '',
        portfolio_url: '',
        motivation: '',
        cv_file: null,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cvFileName, setCvFileName] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const router = useRouter();

    // Validar motivación cuando cambia
    useEffect(() => {
        if (formData.motivation.trim().length >= 50 && fieldErrors.motivation) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.motivation;
                return newErrors;
            });
        }
    }, [formData.motivation, fieldErrors.motivation]);

    const validateField = (name: string, value: string) => {
        const errors: Record<string, string> = {};
        
        if (name === 'motivation') {
            if (!value.trim()) {
                errors.motivation = 'La motivación es requerida';
            } else if (value.trim().length < 50) {
                errors.motivation = 'La motivación debe tener al menos 50 caracteres';
            }
        }
        
        if (name === 'portfolio_url' && value && !value.match(/^https?:\/\/.+/)) {
            errors.portfolio_url = 'Debe ser una URL válida (http:// o https://)';
        }
        
        if (name === 'experience_years' && value && (isNaN(Number(value)) || Number(value) < 0)) {
            errors.experience_years = 'Debe ser un número válido mayor o igual a 0';
        }

        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (errors[name]) {
                newErrors[name] = errors[name];
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
        return !errors[name];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        if (touched[name]) {
            validateField(name, value);
        }
        
        if (error) setError('');
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('El archivo debe ser un PDF');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo no puede exceder 5MB');
                return;
            }
            setFormData({
                ...formData,
                cv_file: file
            });
            setCvFileName(file.name);
            if (error) setError('');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        Object.keys(formData).forEach(key => {
            setTouched(prev => ({ ...prev, [key]: true }));
        });

        let isValid = true;
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'cv_file') {
                if (!validateField(key, value as string)) {
                    isValid = false;
                }
            }
        });

        if (!isValid || !formData.motivation.trim() || formData.motivation.trim().length < 50) {
            setError('Por favor, completa todos los campos requeridos correctamente');
            setLoading(false);
            return;
        }

        try {
            const response: ApiResponse = await authAPI.applyToBeInstructor({
                professional_title: formData.professional_title || undefined,
                experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
                specialization: formData.specialization || undefined,
                bio: formData.bio || undefined,
                portfolio_url: formData.portfolio_url || undefined,
                motivation: formData.motivation,
                cv_file: formData.cv_file || undefined,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } else {
                setError(response.message || 'Error al enviar solicitud');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.motivation.trim().length >= 50 && !Object.keys(fieldErrors).length;

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <AuthBackground variant="academy" />
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-status-success/30 shadow-2xl">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-status-success/20 rounded-full">
                                    <CheckCircle2 className="w-10 h-10 text-status-success" />
                                </div>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary-white mb-3">¡Solicitud Enviada!</h2>
                            <p className="text-gray-400 mb-2">Tu solicitud ha sido enviada exitosamente.</p>
                            <p className="text-sm text-gray-500">Te notificaremos cuando sea revisada.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-6 sm:py-8">
            <AuthBackground variant="academy" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Sidebar izquierdo - Beneficios y motivación */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-8 space-y-6">
                            {/* Card de beneficios */}
                            <div className="bg-gradient-to-br from-primary-orange/10 via-amber-500/10 to-primary-orange/10 border border-primary-orange/20 rounded-xl p-6 backdrop-blur-sm">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary-orange" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-white">¿Por qué ser Instructor?</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Users className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-primary-white">Llega a más estudiantes</p>
                                            <p className="text-xs text-gray-400">Comparte tu conocimiento con una audiencia global</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <DollarSign className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-primary-white">Genera ingresos</p>
                                            <p className="text-xs text-gray-400">Monetiza tu experiencia y conocimiento</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Award className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-primary-white">Construye tu marca</p>
                                            <p className="text-xs text-gray-400">Establece tu reputación como experto</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Zap className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-primary-white">Flexibilidad total</p>
                                            <p className="text-xs text-gray-400">Crea cursos a tu ritmo y horario</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card de proceso */}
                            <div className="bg-secondary-dark-gray/60 border border-secondary-medium-gray rounded-xl p-6 backdrop-blur-sm">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-white">Proceso de Revisión</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                                        <div>
                                            <p className="text-sm font-medium text-primary-white">Envía tu solicitud</p>
                                            <p className="text-xs text-gray-400">Completa el formulario con tu información</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                                        <div>
                                            <p className="text-sm font-medium text-primary-white">Revisión del equipo</p>
                                            <p className="text-xs text-gray-400">Evaluamos tu perfil en 24-48 horas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                                        <div>
                                            <p className="text-sm font-medium text-primary-white">Notificación</p>
                                            <p className="text-xs text-gray-400">Te enviamos el resultado por email</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card de tips */}
                            <div className="bg-secondary-dark-gray/60 border border-secondary-medium-gray rounded-xl p-6 backdrop-blur-sm">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-white">Tips para tu Solicitud</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>Sé específico en tu motivación</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>Destaca tu experiencia única</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>Incluye ejemplos de tu trabajo</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>Muestra pasión por enseñar</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Formulario central */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl border border-primary-orange/20 shadow-2xl overflow-hidden">
                            {/* Header compacto */}
                            <div className="bg-gradient-to-r from-primary-orange/10 via-amber-500/10 to-primary-orange/10 border-b border-primary-orange/20 p-4 sm:p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src="/assets/logo_school.png"
                                                alt="FagSol Logo"
                                                width={60}
                                                height={60}
                                                className="object-contain"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5">
                                                <span className="text-primary-white">Solicita Ser </span>
                                                <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                                    Instructor
                                                </span>
                                            </h1>
                                            <p className="text-xs sm:text-sm text-gray-400">Comparte tu conocimiento y ayuda a otros</p>
                                        </div>
                                    </div>
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-orange flex-shrink-0" />
                                </div>
                            </div>

                            {/* Formulario */}
                            <form className="p-4 sm:p-6 lg:p-8 space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="professional_title" className="flex items-center text-sm font-medium text-primary-white mb-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary-orange" />
                                            Título Profesional
                                        </label>
                                        <input
                                            id="professional_title"
                                            name="professional_title"
                                            type="text"
                                            value={formData.professional_title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Ej: Ingeniero, Licenciado"
                                            className="w-full px-3 py-2.5 text-sm border border-secondary-medium-gray placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="experience_years" className="flex items-center text-sm font-medium text-primary-white mb-1.5">
                                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-primary-orange" />
                                            Años de Experiencia
                                        </label>
                                        <input
                                            id="experience_years"
                                            name="experience_years"
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="0"
                                            min="0"
                                            className={`w-full px-3 py-2.5 text-sm border ${fieldErrors.experience_years ? 'border-status-error' : 'border-secondary-medium-gray'} placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all`}
                                        />
                                        {fieldErrors.experience_years && (
                                            <p className="mt-1 text-xs text-status-error">{fieldErrors.experience_years}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="specialization" className="flex items-center text-sm font-medium text-primary-white mb-1.5">
                                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary-orange" />
                                        Especialidad
                                    </label>
                                    <input
                                        id="specialization"
                                        name="specialization"
                                        type="text"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Metalurgia, Energías Renovables, etc."
                                        className="w-full px-3 py-2.5 text-sm border border-secondary-medium-gray placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                                    />
                                </div>

                                {/* Motivación - Campo principal destacado */}
                                <div className={`bg-primary-orange/5 border-2 rounded-lg p-4 transition-all ${fieldErrors.motivation || (touched.motivation && formData.motivation.trim().length < 50) ? 'border-status-error/50' : formData.motivation.trim().length >= 50 ? 'border-status-success/50' : 'border-primary-orange/20'}`}>
                                    <label htmlFor="motivation" className="flex items-center text-sm font-semibold text-primary-white mb-2">
                                        <Heart className="w-4 h-4 mr-1.5 text-primary-orange" />
                                        Motivación
                                        <span className="ml-2 text-status-error">*</span>
                                    </label>
                                    <textarea
                                        id="motivation"
                                        name="motivation"
                                        value={formData.motivation}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="¿Por qué quieres ser instructor? ¿Qué te motiva a enseñar? (mínimo 50 caracteres)"
                                        rows={4}
                                        required
                                        className={`w-full px-3 py-2.5 text-sm border ${fieldErrors.motivation || (touched.motivation && formData.motivation.trim().length < 50) ? 'border-status-error' : formData.motivation.trim().length >= 50 ? 'border-status-success' : 'border-primary-orange/30'} placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none`}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex-1">
                                            {(fieldErrors.motivation || (touched.motivation && formData.motivation.trim().length < 50)) && (
                                                <p className="text-xs text-status-error flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {fieldErrors.motivation || `Mínimo 50 caracteres. Faltan ${50 - formData.motivation.trim().length}`}
                                                </p>
                                            )}
                                            {!fieldErrors.motivation && formData.motivation.trim().length >= 50 && (
                                                <p className="text-xs text-status-success flex items-center">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    ¡Perfecto! Tu motivación es clara y completa.
                                                </p>
                                            )}
                                        </div>
                                        <p className={`text-xs font-medium ${formData.motivation.trim().length >= 50 ? 'text-status-success' : formData.motivation.trim().length >= 40 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                            {formData.motivation.length}/50
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium text-primary-white mb-1.5">
                                            Biografía
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Sobre ti y tu experiencia..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full px-3 py-2.5 text-sm border border-secondary-medium-gray placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500</p>
                                    </div>

                                    <div>
                                        <label htmlFor="portfolio_url" className="flex items-center text-sm font-medium text-primary-white mb-1.5">
                                            <Globe className="w-3.5 h-3.5 mr-1.5 text-primary-orange" />
                                            Portfolio / Website
                                        </label>
                                        <input
                                            id="portfolio_url"
                                            name="portfolio_url"
                                            type="url"
                                            value={formData.portfolio_url}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="https://tu-portfolio.com"
                                            className={`w-full px-3 py-2.5 text-sm border ${fieldErrors.portfolio_url ? 'border-status-error' : 'border-secondary-medium-gray'} placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all`}
                                        />
                                        {fieldErrors.portfolio_url && (
                                            <p className="mt-1 text-xs text-status-error">{fieldErrors.portfolio_url}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="cv_file" className="flex items-center text-sm font-medium text-primary-white mb-1.5">
                                        <Upload className="w-3.5 h-3.5 mr-1.5 text-primary-orange" />
                                        CV (PDF) - Opcional
                                    </label>
                                    {!cvFileName ? (
                                        <label
                                            htmlFor="cv_file"
                                            className="flex items-center justify-center w-full h-20 border-2 border-dashed border-secondary-medium-gray rounded-lg cursor-pointer hover:border-primary-orange hover:bg-primary-orange/5 transition-all group"
                                        >
                                            <div className="text-center">
                                                <Upload className="w-6 h-6 mx-auto mb-1 text-secondary-light-gray group-hover:text-primary-orange transition-colors" />
                                                <p className="text-xs text-secondary-light-gray group-hover:text-primary-white">
                                                    Haz clic para subir PDF (máx. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="cv_file"
                                                name="cv_file"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-secondary-dark-gray border border-primary-orange/30 rounded-lg">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <FileText className="w-5 h-5 text-primary-orange flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-primary-white truncate">{cvFileName}</p>
                                                    {formData.cv_file && (
                                                        <p className="text-xs text-gray-500">{formatFileSize(formData.cv_file.size)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, cv_file: null });
                                                    setCvFileName('');
                                                }}
                                                className="ml-3 p-1.5 text-status-error hover:bg-status-error/10 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {error && (error.includes('PDF') || error.includes('5MB')) && (
                                        <p className="mt-1 text-xs text-status-error">{error}</p>
                                    )}
                                </div>

                                {error && !error.includes('PDF') && !error.includes('5MB') && (
                                    <div className="bg-status-error/10 border border-status-error/30 text-status-error px-4 py-2.5 rounded-lg text-sm flex items-start space-x-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        loading={loading}
                                        disabled={loading || !isFormValid}
                                        className="flex-1 sm:flex-none sm:min-w-[180px]"
                                        variant="primary"
                                    >
                                        {loading ? 'Enviando...' : (
                                            <>
                                                Enviar Solicitud
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                    <Link href="/dashboard" className="flex-1 sm:flex-none">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full sm:w-auto"
                                        >
                                            Cancelar
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
