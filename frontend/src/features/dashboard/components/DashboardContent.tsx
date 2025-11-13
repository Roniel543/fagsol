'use client';

import { Button, Card, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';

function DashboardContentInner() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // SEGURIDAD CRÍTICA: ProtectedRoute garantiza que user no es null antes de renderizar este componente
    // Si user es null aquí, ProtectedRoute ya redirigió a login y este código nunca se ejecuta
    // Este check es una validación de seguridad adicional + type guard para TypeScript
    if (!user) {
        // Este código NUNCA debería ejecutarse en producción
        // Si se ejecuta, es un bug crítico de seguridad que debe ser reportado inmediatamente
        console.error('CRITICAL SECURITY ERROR: DashboardContentInner rendered without user - ProtectedRoute validation failed');
        // Redirigir inmediatamente como medida de seguridad
        router.push('/auth/login');
        return null;
    }

    // TypeScript ahora sabe que user no es null gracias al type guard arriba

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudiante';
            case 'teacher': return 'Docente';
            case 'admin': return 'Administrador';
            default: return role;
        }
    };

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
                                <Button 
                                    variant="primary"
                                    onClick={() => router.push('/academy/catalog')}
                                >
                                    Ver Cursos
                                </Button>
                                {(user.role === 'admin' || user.role === 'instructor') && (
                                    <Button 
                                        variant="success"
                                        onClick={() => router.push('/admin/courses')}
                                    >
                                        Administrar Cursos
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export function DashboardContent() {
    return (
        <ProtectedRoute>
            <DashboardContentInner />
        </ProtectedRoute>
    );
}
