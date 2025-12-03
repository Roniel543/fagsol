'use client';

import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface InstructorHeaderProps {
    title?: string;
    subtitle?: string;
    showBackButton?: boolean;
    backHref?: string;
    backLabel?: string;
    rightAction?: React.ReactNode;
}

export function InstructorHeader({
    title,
    subtitle,
    showBackButton = false,
    backHref,
    backLabel,
    rightAction,
}: InstructorHeaderProps) {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Detectar scroll para cambiar estilo del header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calcular altura del header después de renderizar
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };

        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);
        return () => window.removeEventListener('resize', updateHeaderHeight);
    }, [title, subtitle, showBackButton, rightAction]);

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
        <>
            <header 
                ref={headerRef}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-gradient-to-r from-primary-black via-secondary-dark-gray/90 to-primary-black backdrop-blur-sm shadow-lg border-b border-primary-orange/20 overflow-hidden ${
                    isScrolled 
                        ? 'bg-primary-black/95 backdrop-blur-xl shadow-2xl border-primary-orange/30' 
                        : ''
                }`}
            >
                {/* Elementos decorativos de fondo */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Primera fila: Logo, Dashboard, Usuario y Logout */}
                <div className="flex justify-between items-center py-4 border-b border-primary-orange/10">
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
                            <h1 className="text-xl font-bold text-primary-white group-hover:text-primary-orange transition-colors">
                                FagSol Escuela Virtual
                            </h1>
                            <p className="text-xs text-primary-orange font-semibold tracking-wider">
                                Panel de Instructor
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {/* Botón para regresar al dashboard */}
                        <Link href="/dashboard">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Button>
                        </Link>

                        {/* Información del usuario */}
                        <div className="text-right hidden md:block">
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

                        {/* Botón de logout */}
                        <Button
                            onClick={logout}
                            variant="danger"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>

                {/* Segunda fila: Título de la página y acciones */}
                {(title || showBackButton || rightAction) && (
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            {showBackButton && backHref && (
                                <Link
                                    href={backHref}
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-dark-gray/60 hover:bg-secondary-dark-gray border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 group"
                                >
                                    <ArrowLeft className="w-5 h-5 text-primary-orange group-hover:text-amber-400" />
                                </Link>
                            )}
                            {title && (
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-amber-400 bg-clip-text text-transparent">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-secondary-light-gray font-medium mt-1 text-sm sm:text-base">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        {rightAction && (
                            <div className="flex items-center space-x-3">
                                {rightAction}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
            {/* Spacer para compensar el header fijo - altura dinámica */}
            <div 
                style={{ height: `${headerHeight || (title || showBackButton || rightAction ? 140 : 100)}px` }} 
                className="w-full"
            ></div>
        </>
    );
}

