'use client';

import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { LogOut, Menu, X, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface DashboardHeaderProps {
    onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

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
    }, [isMobileMenuOpen]);

    // Cerrar menú móvil al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                !headerRef.current?.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

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

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3 sm:py-4 md:py-5 lg:py-6">
                        {/* Logo y título - Responsive */}
                        <Link 
                            href="/dashboard" 
                            className="flex items-center space-x-2 sm:space-x-3 group transition-all duration-300 hover:scale-105 flex-shrink-0"
                        >
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full p-1 transition-all duration-300">
                                <Image
                                    src="/assets/fav-fagsol.png"
                                    alt="FagSol Logo"
                                    width={56}
                                    height={56}
                                    className="object-contain transition-transform duration-300 group-hover:scale-110 w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary-white group-hover:text-primary-orange transition-colors leading-tight">
                                    FagSol Escuela Virtual
                                </h1>
                                <p className="text-[10px] sm:text-xs text-primary-orange font-semibold tracking-wider hidden sm:block">
                                    Panel de Control
                                </p>
                            </div>
                        </Link>

                        {/* Desktop: Información del usuario y logout */}
                        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                            <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap justify-end">
                                    <p className="text-sm lg:text-base font-semibold text-primary-white truncate max-w-[150px] lg:max-w-none">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getRoleBadgeColor(user?.role || '')}`}>
                                        {getRoleDisplayName(user?.role || '')}
                                    </span>
                                </div>
                                <p className="text-xs lg:text-sm text-secondary-light-gray truncate max-w-[200px] lg:max-w-none">
                                    {user?.email}
                                </p>
                            </div>
                            <Button
                                onClick={onLogout}
                                variant="danger"
                                size="sm"
                                className="flex items-center space-x-2 flex-shrink-0"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden lg:inline">Cerrar Sesión</span>
                            </Button>
                        </div>

                        {/* Mobile/Tablet: Botón de menú */}
                        <div className="md:hidden flex items-center space-x-2">
                            {/* Avatar pequeño en móvil/tablet */}
                            <div className="hidden sm:flex items-center space-x-2 pr-2 sm:pr-3 border-r border-primary-orange/20">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-orange to-amber-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-primary-white truncate max-w-[80px] sm:max-w-[120px]">
                                        {user?.first_name}
                                    </p>
                                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${getRoleBadgeColor(user?.role || '')}`}>
                                        {getRoleDisplayName(user?.role || '')}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 sm:p-2.5 rounded-lg bg-secondary-dark-gray/60 hover:bg-secondary-dark-gray border border-primary-orange/20 hover:border-primary-orange/40 transition-all duration-300 active:scale-95"
                                aria-label="Menú"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary-orange" />
                                ) : (
                                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-primary-orange" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menú móvil desplegable */}
                {isMobileMenuOpen && (
                    <div
                        ref={mobileMenuRef}
                        className="md:hidden border-t border-primary-orange/20 bg-primary-black/95 backdrop-blur-xl animate-slide-down shadow-2xl"
                    >
                        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
                            {/* Información del usuario en móvil */}
                            <div className="pb-3 sm:pb-4 border-b border-primary-orange/10">
                                <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary-orange to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-lg font-semibold text-primary-white truncate mb-1">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-sm sm:text-base text-secondary-light-gray truncate mb-2">
                                            {user?.email}
                                        </p>
                                        <span className={`inline-block px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getRoleBadgeColor(user?.role || '')}`}>
                                            {getRoleDisplayName(user?.role || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de logout en móvil */}
                            <Button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onLogout();
                                }}
                                variant="danger"
                                size="lg"
                                className="w-full flex items-center justify-center space-x-2 sm:space-x-3 py-3 sm:py-3.5 text-base sm:text-lg"
                            >
                                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Cerrar Sesión</span>
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer para compensar el header fijo - altura dinámica */}
            <div 
                style={{ height: `${headerHeight || 80}px` }} 
                className="w-full"
            ></div>
        </>
    );
}
