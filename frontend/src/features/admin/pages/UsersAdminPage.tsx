'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useActivateUser, useAdminUsers, useDeactivateUser, useDeleteUser } from '@/shared/hooks/useAdminUsers';
import Link from 'next/link';
import { useState } from 'react';

function UsersAdminPageContent() {
    const { users, isLoading, mutate } = useAdminUsers();
    const { deleteUser, isDeleting } = useDeleteUser();
    const { activateUser, isActivating } = useActivateUser();
    const { deactivateUser, isDeactivating } = useDeactivateUser();
    const { showToast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ role?: string; is_active?: string; search?: string }>({});

    const handleDelete = async (userId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar (desactivar) este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeletingId(userId);
        setError(null);

        try {
            await deleteUser(userId);
            showToast('Usuario eliminado exitosamente', 'success');
            mutate();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el usuario');
            showToast(err.message || 'Error al eliminar el usuario', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleActivate = async (userId: number) => {
        try {
            await activateUser(userId);
            showToast('Usuario activado exitosamente', 'success');
            mutate();
        } catch (err: any) {
            showToast(err.message || 'Error al activar el usuario', 'error');
        }
    };

    const handleDeactivate = async (userId: number) => {
        if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
            return;
        }
        try {
            await deactivateUser(userId);
            showToast('Usuario desactivado exitosamente', 'success');
            mutate();
        } catch (err: any) {
            showToast(err.message || 'Error al desactivar el usuario', 'error');
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            teacher: 'bg-blue-100 text-blue-800',
            instructor: 'bg-blue-100 text-blue-800',
            student: 'bg-green-100 text-green-800',
        };
        const labels = {
            admin: 'Administrador',
            teacher: 'Instructor',
            instructor: 'Instructor',
            student: 'Estudiante',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                {labels[role as keyof typeof labels] || role}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactivo
            </span>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-700 font-medium mt-1">Administra los usuarios de la plataforma</p>
                    </div>
                    <Link href="/admin/users/new">
                        <Button variant="primary" size="sm">
                            Crear Nuevo Usuario
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Buscar
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre, email..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Rol
                        </label>
                        <select
                            value={filters.role || ''}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                        >
                            <option value="">Todos</option>
                            <option value="admin">Administrador</option>
                            <option value="teacher">Instructor</option>
                            <option value="student">Estudiante</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Estado
                        </label>
                        <select
                            value={filters.is_active || ''}
                            onChange={(e) => setFilters({ ...filters, is_active: e.target.value || undefined })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                        >
                            <option value="">Todos</option>
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-700 font-medium">Cargando usuarios...</p>
                </div>
            )}

            {/* Users List */}
            {!isLoading && (
                <>
                    {users.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
                            <p className="text-gray-700 font-medium mb-4">No hay usuarios registrados aún.</p>
                            <Link href="/admin/users/new">
                                <Button variant="primary">Crear Primer Usuario</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                                {users
                                    .filter((user) => {
                                        if (filters.search) {
                                            const search = filters.search.toLowerCase();
                                            const matchesSearch = 
                                                (user.first_name?.toLowerCase().includes(search) || '') ||
                                                (user.last_name?.toLowerCase().includes(search) || '') ||
                                                user.email.toLowerCase().includes(search);
                                            if (!matchesSearch) return false;
                                        }
                                        if (filters.role && user.role !== filters.role) return false;
                                        if (filters.is_active !== undefined) {
                                            const isActive = filters.is_active === 'true';
                                            if (user.is_active !== isActive) return false;
                                        }
                                        return true;
                                    })
                                    .map((user) => (
                                        <li key={user.id}>
                                            <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 flex-1">
                                                        {/* Avatar */}
                                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-amber-500 rounded-full flex items-center justify-center text-primary-black font-bold text-lg shadow-lg">
                                                            {user.first_name?.[0]?.toUpperCase() || 'U'}
                                                            {user.last_name?.[0]?.toUpperCase() || 'S'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 flex-wrap">
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {user.first_name || ''} {user.last_name || ''}
                                                                </h3>
                                                                {getRoleBadge(user.role)}
                                                                {getStatusBadge(user.is_active)}
                                                            </div>
                                                            <p className="text-sm text-gray-700 font-medium mt-1">
                                                                {user.email}
                                                            </p>
                                                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                                <span className="font-medium">ID: {user.id}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4 flex-wrap gap-2">
                                                        <Link href={`/admin/users/${user.id}`}>
                                                            <Button variant="secondary" size="sm">
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Button variant="primary" size="sm">
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        {user.is_active ? (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleDeactivate(user.id)}
                                                                disabled={isDeactivating}
                                                            >
                                                                {isDeactivating ? 'Desactivando...' : 'Desactivar'}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleActivate(user.id)}
                                                                disabled={isActivating}
                                                            >
                                                                {isActivating ? 'Activando...' : 'Activar'}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={deletingId === user.id || isDeleting}
                                                        >
                                                            {deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function UsersAdminPage() {
    return <UsersAdminPageContent />;
}

