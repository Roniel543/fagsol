'use client';

import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';

interface DashboardHeaderProps {
    onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
    const { user } = useAuth();

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudiante';
            case 'instructor': return 'Instructor';
            case 'admin': return 'Administrador';
            default: return role;
        }
    };

    return (
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
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                        </div>
                        <Button
                            onClick={onLogout}
                            variant="danger"
                            size="sm"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

