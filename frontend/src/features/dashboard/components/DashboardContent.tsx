'use client';

import { ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { AdminDashboard } from './AdminDashboard';
import { DashboardHeader } from './DashboardHeader';
import { InstructorDashboard } from './InstructorDashboard';
import { StudentDashboard } from './StudentDashboard';

function DashboardContentInner() {
    const { user, logout } = useAuth();

    // SEGURIDAD CRÍTICA: ProtectedRoute garantiza que user no es null antes de renderizar este componente
    // Si user es null aquí, ProtectedRoute ya redirigió a login y este código nunca se ejecuta
    // Este check es una validación de seguridad adicional + type guard para TypeScript
    if (!user) {
        // Este código NUNCA debería ejecutarse en producción
        // Si se ejecuta, es un bug crítico de seguridad que debe ser reportado inmediatamente
        console.error('CRITICAL SECURITY ERROR: DashboardContentInner rendered without user - ProtectedRoute validation failed');
        return null;
    }

    // Renderizar dashboard según el rol
    const renderDashboard = () => {
        switch (user.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'instructor':
                return <InstructorDashboard />;
            case 'student':
                return <StudentDashboard />;
            default:
                return <StudentDashboard />; // Por defecto mostrar dashboard de estudiante
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader onLogout={logout} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {renderDashboard()}
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
