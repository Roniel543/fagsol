'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { ChevronDown, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function ProfileDropdown() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudiante';
            case 'instructor': return 'Instructor';
            case 'admin': return 'Administrador';
            default: return role;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'student': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'instructor': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
            case 'admin': return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        router.push('/academy');
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div ref={dropdownRef} className="relative">
            {/* Botón del perfil */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
            >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4" />
                </div>
                <span className="hidden xl:inline">Mi Perfil</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border-2 border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-down z-50">
                    {/* Información del usuario */}
                    <div className="px-4 py-4 border-b border-zinc-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-orange to-amber-500 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-gray-400 text-sm truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role || '')}`}>
                            {getRoleDisplayName(user.role || '')}
                        </span>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-2">
                        <Link
                            href="/academy/perfil"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-200 group"
                        >
                            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Ver Perfil</span>
                        </Link>

                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-200 group"
                        >
                            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Dashboard</span>
                        </Link>

                        <Link
                            href="/academy/perfil?tab=settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-200 group"
                        >
                            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Configuración</span>
                        </Link>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-zinc-800"></div>

                    {/* Cerrar Sesión */}
                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

