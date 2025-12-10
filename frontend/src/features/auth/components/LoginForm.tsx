'use client';

import { AuthBackground, Button, Input, PasswordInput } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginRequest } from '@/shared/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login(formData);

            if (response.success) {
                // Redirigir inmediatamente después de login exitoso
                // El estado ya está actualizado en useAuth
                router.push('/dashboard');
            } else {
                setError(response.message || 'Error en el login');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
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
                            <span className="text-primary-white">Iniciar </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Sesión
                            </span>
                        </h2>
                        <p className="text-base text-gray-400 mt-2">
                            FagSol Escuela Virtual
                        </p>
                    </div>

                    {/* Formulario */}
                    <form className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <PasswordInput
                                    label="Contraseña"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Tu contraseña"
                                    required
                                    error={error || undefined}
                                />
                            </div>
                        </div>

                        {/* Link de olvidé contraseña */}
                        <div className="text-right">
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-primary-orange hover:text-amber-500 transition-colors duration-200"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Botón de submit */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full"
                            variant="primary"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>

                        {/* Link de registro */}
                        <div className="text-center pt-4 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    href="/auth/register"
                                    className="font-medium text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                >
                                    Regístrate aquí
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
