'use client';

import { ProtectedRoute } from '@/shared/components';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    requireAuth?: boolean; // Si es true, requiere autenticación y rol admin
}

/**
 * Layout con sidebar para admin
 * Si requireAuth es true, protege la ruta (para /admin/*)
 * Si es false, solo muestra el layout (para /dashboard cuando ya está protegido)
 */
export function AdminLayout({ children, requireAuth = true }: AdminLayoutProps) {
    const layoutContent = (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar />
            <main className="flex-1 lg:ml-0 overflow-x-hidden bg-white">
                <div className="p-4 lg:p-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );

    if (requireAuth) {
        return (
            <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
                {layoutContent}
            </ProtectedRoute>
        );
    }

    return layoutContent;
}

