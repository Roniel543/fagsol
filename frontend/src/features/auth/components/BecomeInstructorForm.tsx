'use client';

import { AuthBackground, Button, Input } from '@/shared/components';
import { authAPI } from '@/shared/services/api';
import { ApiResponse } from '@/shared/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (error) setError('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                setError('El archivo debe ser un PDF');
                return;
            }
            // Validar tamaño (máximo 5MB)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones
        if (!formData.motivation.trim()) {
            setError('La motivación es requerida');
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

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AuthBackground variant="academy" />

                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-10 sm:p-12 border border-status-success/30 shadow-2xl shadow-status-success/10 animate-fade-in">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-status-success/20 rounded-full">
                                    <svg className="w-8 h-8 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-primary-white mb-2">¡Solicitud Enviada!</h2>
                            <p className="text-gray-400 mb-4">
                                Tu solicitud para ser instructor ha sido enviada exitosamente.
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Te notificaremos cuando sea revisada por nuestro equipo.
                            </p>
                            <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <AuthBackground variant="academy" />

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-10 sm:p-12 border border-primary-orange/20 shadow-2xl shadow-primary-orange/10 animate-fade-in">
                    {/* Logo y Header */}
                    <div className="text-center mb-10 animate-slide-down">
                        <div className="flex justify-center mb-6">
                            <Image
                                src="/assets/logo_school.png"
                                alt="FagSol Logo"
                                width={120}
                                height={120}
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold mb-3">
                            <span className="text-primary-white">Solicita Ser </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Instructor
                            </span>
                        </h2>
                        <p className="text-base text-gray-400 mt-2">
                            Completa el formulario para solicitar ser instructor en FagSol
                        </p>
                    </div>

                    {/* Formulario */}
                    <form className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <Input
                                    label="Título Profesional"
                                    type="text"
                                    name="professional_title"
                                    value={formData.professional_title}
                                    onChange={handleChange}
                                    placeholder="Ej: Ingeniero, Licenciado, etc."
                                />
                            </div>

                            <div>
                                <label htmlFor="experience_years" className="block text-sm font-medium text-primary-white mb-1">
                                    Años de Experiencia
                                </label>
                                <input
                                    id="experience_years"
                                    name="experience_years"
                                    type="number"
                                    value={formData.experience_years}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="appearance-none relative block w-full px-4 py-3 border border-secondary-medium-gray placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                />
                            </div>

                            <div>
                                <Input
                                    label="Especialidad"
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="Ej: Metalurgia, Energías Renovables, etc."
                                />
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-primary-white mb-1">
                                    Biografía
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Cuéntanos sobre ti y tu experiencia profesional"
                                    rows={4}
                                    className="appearance-none relative block w-full px-4 py-3 border border-secondary-medium-gray placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm resize-none"
                                />
                            </div>

                            <div>
                                <Input
                                    label="Portfolio/Website"
                                    type="url"
                                    name="portfolio_url"
                                    value={formData.portfolio_url}
                                    onChange={handleChange}
                                    placeholder="https://tu-portfolio.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="motivation" className="block text-sm font-medium text-primary-white mb-1">
                                    Motivación <span className="text-status-error ml-1">*</span>
                                </label>
                                <textarea
                                    id="motivation"
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    placeholder="¿Por qué quieres ser instructor en FagSol? ¿Qué te motiva a enseñar?"
                                    rows={5}
                                    required
                                    className={`appearance-none relative block w-full px-4 py-3 border ${error && !formData.motivation.trim() ? 'border-status-error' : 'border-secondary-medium-gray'} placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm resize-none`}
                                />
                                {error && !formData.motivation.trim() && (
                                    <p className="mt-1 text-sm text-status-error">{error}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="cv_file" className="block text-sm font-medium text-primary-white mb-1">
                                    CV (PDF) - Opcional
                                </label>
                                <div className="flex items-center gap-4">
                                    <label
                                        htmlFor="cv_file"
                                        className="flex-1 px-4 py-3 border border-secondary-medium-gray text-primary-white bg-secondary-dark-gray rounded-lg cursor-pointer hover:border-primary-orange transition-colors text-sm"
                                    >
                                        <span className="text-secondary-light-gray">
                                            {cvFileName || 'Seleccionar archivo PDF (máx. 5MB)'}
                                        </span>
                                        <input
                                            id="cv_file"
                                            name="cv_file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {cvFileName && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, cv_file: null });
                                                setCvFileName('');
                                            }}
                                            className="px-4 py-2 text-sm text-status-error hover:text-status-error/80 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                                {error && (error.includes('PDF') || error.includes('5MB')) && (
                                    <p className="mt-1 text-sm text-status-error">{error}</p>
                                )}
                            </div>
                        </div>

                        {/* Mensaje de error general */}
                        {error && formData.motivation.trim() && !error.includes('PDF') && !error.includes('5MB') && (
                            <div className="bg-status-error/10 border border-status-error/30 text-status-error px-4 py-3 rounded-lg text-sm text-center animate-slide-down">
                                {error}
                            </div>
                        )}

                        {/* Botón de submit */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full"
                            variant="primary"
                        >
                            {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                        </Button>

                        {/* Links */}
                        <div className="text-center pt-4 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                                ¿Ya eres instructor?{' '}
                                <Link
                                    href="/dashboard"
                                    className="font-medium text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                >
                                    Ir al Dashboard
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer adicional */}
                <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-xs text-gray-500">
                        © 2025 FagSol Escuela Virtual. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
