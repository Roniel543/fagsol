'use client';

import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'student': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'instructor': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
            case 'admin': return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    return (
        <header className="relative bg-gradient-to-r from-primary-black via-secondary-dark-gray/90 to-primary-black backdrop-blur-sm shadow-lg border-b border-primary-orange/20 overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <Link href="/dashboard" className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105">
                        <div className="relative w-22 h-22 flex items-center justify-center rounded-full p-1.5 transition-all duration-300">
                            <Image
                                src="/assets/fav-fagsol.png"
                                alt="FagSol Logo"
                                width={50}
                                height={50}
                                className="object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-primary-white group-hover:text-primary-orange transition-colors">
                                FagSol Escuela Virtual
                            </h1>
                            <p className="text-xs text-primary-orange font-semibold tracking-wider">
                                Panel de Control
                            </p>
                        </div>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-base font-semibold text-primary-white">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user?.role || '')}`}>
                                    {getRoleDisplayName(user?.role || '')}
                                </span>
                            </div>
                            <p className="text-sm text-secondary-light-gray">{user?.email}</p>
                        </div>
                        <Button
                            onClick={onLogout}
                            variant="danger"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
