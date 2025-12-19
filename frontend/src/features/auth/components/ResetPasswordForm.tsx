'use client';

import { AuthBackground, Button, PasswordInput } from '@/shared/components';
import { authAPI } from '@/shared/services/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ResetPasswordFormProps {
    uid: string;
    token: string;
}

export function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    // Validar token al cargar
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await authAPI.validateResetToken(uid, token);
                // El backend retorna { success: true, valid: true } directamente
                // La función validateResetToken ya extrae 'valid' al nivel raíz
                const isValid = response.success && response.valid === true;

                if (isValid) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    setError(response.message || 'El link de restablecimiento es inválido o ha expirado');
                }
            } catch (err) {
                console.error('Error validating token:', err);
                setTokenValid(false);
                setError('Error al validar el link. Por favor, solicita un nuevo link de restablecimiento.');
            } finally {
                setValidating(false);
            }
        };

        if (uid && token) {
            validateToken();
        } else {
            setValidating(false);
            setTokenValid(false);
            setError('Link de restablecimiento inválido');
        }
    }, [uid, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones
        if (!formData.newPassword || !formData.confirmPassword) {
            setError('Por favor, completa todos los campos');
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            // IMPORTANTE: Limpiar espacios en blanco antes de enviar
            const cleanedNewPassword = formData.newPassword.trim();
            const cleanedConfirmPassword = formData.confirmPassword.trim();

            // Validar nuevamente después de trim
            if (cleanedNewPassword.length < 8) {
                setError('La contraseña debe tener al menos 8 caracteres');
                setLoading(false);
                return;
            }

            if (cleanedNewPassword !== cleanedConfirmPassword) {
                setError('Las contraseñas no coinciden');
                setLoading(false);
                return;
            }

            const response = await authAPI.resetPassword(
                uid,
                token,
                cleanedNewPassword,
                cleanedConfirmPassword
            );

            if (response.success) {
                setSuccess(true);
                // Redirigir a login después de 3 segundos
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            } else {
                setError(response.message || 'Error al restablecer la contraseña');
            }
        } catch (err: any) {
            console.error('Error en reset password:', err);
            setError(err.message || 'Error de conexión con el servidor. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Mostrar loading mientras valida token
    if (validating) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AuthBackground variant="academy" />
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-10 sm:p-12 border border-primary-orange/20 shadow-2xl shadow-primary-orange/10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
                            <p className="text-primary-white">Validando link de restablecimiento...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar error si token es inválido
    if (!tokenValid) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AuthBackground variant="academy" />
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-10 sm:p-12 border border-red-500/20 shadow-2xl shadow-red-500/10 animate-fade-in">
                        <div className="text-center mb-10">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/assets/logo_school.png"
                                    alt="FagSol Logo"
                                    width={120}
                                    height={120}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-3 text-red-400">
                                Link Inválido
                            </h2>
                            <p className="text-base text-gray-400 mt-2 mb-6">
                                {error || 'El link de restablecimiento es inválido o ha expirado'}
                            </p>
                            <div className="space-y-4">
                                <Button
                                    onClick={() => router.push('/auth/forgot-password')}
                                    className="w-full"
                                    variant="primary"
                                >
                                    Solicitar Nuevo Link
                                </Button>
                                <Link
                                    href="/auth/login"
                                    className="block text-sm text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                >
                                    ← Volver al login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar mensaje de éxito
    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                <AuthBackground variant="academy" />
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-10 sm:p-12 border border-green-500/20 shadow-2xl shadow-green-500/10 animate-fade-in">
                        <div className="text-center mb-10">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/assets/logo_school.png"
                                    alt="FagSol Logo"
                                    width={200}
                                    height={200}
                                    className="object-contain"
                                />
                            </div>
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-3 text-green-400">
                                ¡Contraseña Restablecida!
                            </h2>
                            <p className="text-base text-gray-400 mt-2 mb-6">
                                Tu contraseña ha sido restablecida exitosamente.
                                <br />
                                <span className="text-green-400 font-semibold">Ya puedes iniciar sesión con tu nueva contraseña.</span>
                                <br />
                                Serás redirigido al login en unos segundos...
                            </p>
                            <Button
                                onClick={() => router.push('/auth/login')}
                                className="w-full"
                                variant="primary"
                            >
                                Ir a Iniciar Sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar formulario de reset
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Fondo con imagen y overlay */}
            <AuthBackground variant="academy" />

            {/* Contenido */}
            <div className="relative z-10 w-full max-w-lg">
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
                            <span className="text-primary-white">Nueva </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Contraseña
                            </span>
                        </h2>
                        <p className="text-base text-gray-400 mt-2">
                            Ingresa tu nueva contraseña
                        </p>
                    </div>

                    {/* Formulario */}
                    <form className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <PasswordInput
                                    label="Nueva Contraseña"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    error={error || undefined}
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    La contraseña debe tener al menos 8 caracteres
                                </p>
                            </div>

                            <div>
                                <PasswordInput
                                    label="Confirmar Contraseña"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repite tu nueva contraseña"
                                    required
                                />
                            </div>
                        </div>

                        {/* Botón de submit */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading || !formData.newPassword || !formData.confirmPassword}
                            className="w-full"
                            variant="primary"
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </Button>

                        {/* Link de vuelta */}
                        <div className="text-center pt-4 border-t border-gray-800">
                            <Link
                                href="/auth/login"
                                className="text-sm text-primary-orange hover:text-amber-500 transition-colors duration-200"
                            >
                                ← Volver al login
                            </Link>
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

