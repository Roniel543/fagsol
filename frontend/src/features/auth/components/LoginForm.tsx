'use client';

import { AuthBackground, Button, Input } from '@/shared/components';
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
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 border border-primary-orange/20 shadow-2xl shadow-primary-orange/10 animate-fade-in">
                    {/* Logo y Header */}
                    <div className="text-center mb-8 animate-slide-down">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/assets/logo_school.png"
                                alt="FagSol Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                            <span className="text-primary-white">Iniciar </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Sesión
                            </span>
                        </h2>
                        <p className="text-sm text-gray-400 mt-2">
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
                                    error={error && error.includes('email') ? error : undefined}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Contraseña"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Tu contraseña"
                                    required
                                    error={error && error.includes('contraseña') ? error : undefined}
                                />
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {error && (
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
