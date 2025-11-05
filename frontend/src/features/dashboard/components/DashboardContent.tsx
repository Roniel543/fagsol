'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DashboardContent() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setLoading(false);
    }, [user, router]);

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudiante';
            case 'teacher': return 'Docente';
            case 'admin': return 'Administrador';
            default: return role;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Caragando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Se redirigirá al login
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                FagSol Escuela Virtual
                            </h1>
                            <p className="text-gray-600">Panel de Control</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{getRoleDisplayName(user.role)}</p>
                            </div>
                            <Button
                                onClick={logout}
                                variant="danger"
                                size="sm"
                            >
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                ¡Bienvenido, {user.first_name}!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Has iniciado sesión exitosamente en FagSol Escuela Virtual
                            </p>

                            {/* User Info Card */}
                            <Card className="max-w-md mx-auto">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Información de tu Cuenta
                                </h3>
                                <div className="space-y-3 text-left">
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-600">{user.email}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Nombre:</span>
                                        <span className="ml-2 text-gray-600">{user.first_name} {user.last_name}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Rol:</span>
                                        <span className="ml-2 text-gray-600">{getRoleDisplayName(user.role)}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Estado:</span>
                                        <span className={`ml-2 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Action Buttons */}
                            <div className="mt-8 space-x-4">
                                <Button variant="primary">
                                    Ver Cursos
                                </Button>
                                <Button variant="success">
                                    Mi Perfil
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
