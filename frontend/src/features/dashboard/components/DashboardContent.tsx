'use client';

import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';
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

    // Si es admin, usar el layout con sidebar (sin requireAuth porque ya está protegido)
    if (user.role === 'admin') {
        return (
            <AdminLayout requireAuth={false}>
                {renderDashboard()}
            </AdminLayout>
        );
    }

    // Para otros roles, usar el layout tradicional con fondo oscuro
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-black via-secondary-dark-gray to-primary-black">
            <DashboardHeader onLogout={logout} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                {renderDashboard()}
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
