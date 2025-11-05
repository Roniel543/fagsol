'use client';

import { Button, Input, Select } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { RegisterRequest } from '@/shared/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterForm() {
    const [formData, setFormData] = useState<RegisterRequest>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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

    const roleOptions = [
        { value: 'student', label: 'Estudiante' },
        { value: 'teacher', label: 'Docente' },
        { value: 'admin', label: 'Administrador' },
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full text-center">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <h2 className="text-xl font-bold mb-2">¡Registro Exitoso!</h2>
                        <p>Tu cuenta ha sido creada correctamente.</p>
                        <p className="text-sm mt-2">Redirigiendo al dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        FagSol Escuela Virtual
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Nombre"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            required
                        />

                        <Input
                            label="Apellido"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Tu apellido"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required
                        />

                        <Select
                            label="Tipo de Usuario"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            options={roleOptions}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                    >
                        Crear Cuenta
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Inicia sesión aquí
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
