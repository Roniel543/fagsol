'use client';

import { AuthBackground, Button, Input, PasswordInput } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { RegisterRequest } from '@/shared/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterForm() {
    const [formData, setFormData] = useState<RegisterRequest>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student' // Siempre estudiante en registro público
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'confirm_password') {
            setConfirmPassword(value);
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones del frontend
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        if (formData.password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await register(formData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setError(response.message || 'Error en el registro');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };


    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Fondo con imagen y overlay */}
                <AuthBackground variant="academy" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 border border-status-success/30 shadow-2xl shadow-status-success/10 animate-fade-in">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-status-success/20 rounded-full">
                                    <svg className="w-8 h-8 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-primary-white mb-2">¡Registro Exitoso!</h2>
                            <p className="text-gray-400 mb-4">Tu cuenta ha sido creada correctamente.</p>
                            <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <span className="text-primary-white">Crear </span>
                            <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                                Cuenta
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
                                    label="Nombre"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Apellido"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Tu apellido"
                                    required
                                />
                            </div>

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
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    error={error && formData.password.length < 8 ? error : undefined}
                                />
                            </div>

                            <div>
                                <PasswordInput
                                    label="Confirmar Contraseña"
                                    name="confirm_password"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repite tu contraseña"
                                    required
                                    error={error && formData.password !== confirmPassword && confirmPassword.length > 0 ? error : undefined}
                                />
                            </div>
                        </div>

                        {/* Mensaje de error general (solo si no es de validación de campos específicos) */}
                        {error && formData.password.length >= 8 && formData.password === confirmPassword && (
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
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>

                        {/* Links adicionales */}
                        <div className="space-y-3 pt-4 border-t border-gray-800">
                            <div className="text-center">
                                <p className="text-sm text-gray-400">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link
                                        href="/auth/login"
                                        className="font-medium text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                    >
                                        Inicia sesión aquí
                                    </Link>
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-400">
                                    ¿Quieres ser instructor?{' '}
                                    <Link
                                        href="/auth/become-instructor"
                                        className="font-medium text-primary-orange hover:text-amber-500 transition-colors duration-200"
                                    >
                                        Solicita aquí
                                    </Link>
                                </p>
                            </div>
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
