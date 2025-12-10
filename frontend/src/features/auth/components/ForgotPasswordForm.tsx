'use client';

import { AuthBackground, Button, Input } from '@/shared/components';
import { authAPI } from '@/shared/services/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
        if (success) setSuccess(false);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validar email
        if (!email || !email.trim()) {
            setError('El email es requerido');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Por favor, ingresa un email válido');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.forgotPassword(email.trim().toLowerCase());

            if (response.success) {
                setSuccess(true);
                // Limpiar email después de éxito (por seguridad)
                setEmail('');
            } else {
                setError(response.message || 'Error al solicitar restablecimiento de contraseña');
            }
        } catch (err) {
            console.error('Error en forgot password:', err);
            setError('Error de conexión con el servidor. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

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
                            <span className="text-primary-white">Restablecer </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Contraseña
                            </span>
                        </h2>
                        <p className="text-base text-gray-400 mt-2">
                            Ingresa tu email y te enviaremos un link para restablecer tu contraseña
                        </p>
                    </div>

                    {/* Mensaje de éxito */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg animate-fade-in">
                            <p className="text-sm text-green-400 text-center">
                                Si el email existe en nuestro sistema, recibirás un link para restablecer tu contraseña.
                                <br />
                                <span className="text-xs text-gray-400 mt-1 block">
                                    Revisa tu bandeja de entrada y carpeta de spam.
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Formulario */}
                    {!success && (
                        <form className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit}>
                            <div>
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    required
                                    error={error || undefined}
                                />
                            </div>

                            {/* Botón de submit */}
                            <Button
                                type="submit"
                                loading={loading}
                                disabled={loading || !email.trim()}
                                className="w-full"
                                variant="primary"
                            >
                                {loading ? 'Enviando...' : 'Enviar Link de Restablecimiento'}
                            </Button>

                            {/* Link de vuelta a login */}
                            <div className="text-center pt-4 border-t border-gray-800">
                                <p className="text-sm text-gray-400">
                                    ¿Recordaste tu contraseña?{' '}
                                    <Link
                                        href="/auth/login"
                                        className="font-medium text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Botón de volver después de éxito */}
                    {success && (
                        <div className="space-y-4 animate-fade-in">
                            <Button
                                onClick={() => router.push('/auth/login')}
                                className="w-full"
                                variant="primary"
                            >
                                Volver a Iniciar Sesión
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                >
                                    ← Volver al login
                                </Link>
                            </div>
                        </div>
                    )}
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

