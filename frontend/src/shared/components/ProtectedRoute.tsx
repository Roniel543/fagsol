'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { LoadingSpinner } from './index';

interface ProtectedRouteProps {
    children: ReactNode;
    /**
     * Roles permitidos. Si no se especifica, cualquier usuario autenticado puede acceder.
     * Ejemplo: ['admin', 'instructor']
     */
    allowedRoles?: string[];
    /**
     * Ruta a la que redirigir si no está autenticado
     */
    redirectTo?: string;
    /**
     * Ruta a la que redirigir si el rol no es permitido
     */
    fallbackRoute?: string;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * Uso:
 * ```tsx
 * <ProtectedRoute allowedRoles={['admin', 'instructor']}>
 *   <YourComponent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/auth/login',
    fallbackRoute = '/dashboard',
}: ProtectedRouteProps) {
    const { user, isAuthenticated, loadingUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Esperar a que termine de cargar la autenticación
        if (loadingUser) {
            return;
        }

        // Si no está autenticado, redirigir a login
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // Si se especificaron roles permitidos, verificar que el usuario tenga uno de ellos
        if (allowedRoles && allowedRoles.length > 0 && user) {
            if (!allowedRoles.includes(user.role)) {
                router.push(fallbackRoute);
                return;
            }
        }
    }, [isAuthenticated, user, loadingUser, allowedRoles, redirectTo, fallbackRoute, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado o no tiene el rol permitido, no renderizar nada
    // (el useEffect ya se encargó de la redirección)
    if (!isAuthenticated) {
        return null;
    }

    // Si llegamos aquí sin user, es un error crítico del sistema
    if (!user) {
        console.error('CRITICAL SECURITY ERROR: ProtectedRoute rendered without user despite isAuthenticated=true');
        // Redirigir inmediatamente a login como medida de seguridad
        router.push(redirectTo);
        return null;
    }

    // Verificar roles si se especificaron
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            return null;
        }
    }

    // Todo está bien, renderizar el contenido protegido
    // En este punto, user está garantizado que no es null
    return <>{children}</>;
}

