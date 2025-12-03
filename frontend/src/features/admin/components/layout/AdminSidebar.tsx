'use client';

import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import {
    BookOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    UserCheck,
    Users,
    X,
    Mail
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Usuarios',
        href: '/admin/users',
        icon: <Users className="w-5 h-5" />,
    },
    {
        label: 'Cursos',
        href: '/admin/courses',
        icon: <BookOpen className="w-5 h-5" />,
    },
    {
        label: 'Solicitudes de Instructor',
        href: '/admin/instructor-applications',
        icon: <UserCheck className="w-5 h-5" />,
    },
    {
        label: 'Mensajes de Contacto',
        href: '/admin/contact-messages',
        icon: <Mail className="w-5 h-5" />,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (href: string) => {
        // Dashboard es especial: debe coincidir exactamente con /dashboard
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }

        // Para /admin/courses, activo si estás en cualquier ruta relacionada con cursos
        // (incluyendo módulos, lecciones, materiales, estudiantes dentro de cursos)
        if (href === '/admin/courses') {
            return pathname?.startsWith('/admin/courses');
        }

        // Para /admin/instructor-applications, activo si estás en esa ruta exacta
        if (href === '/admin/instructor-applications') {
            return pathname === '/admin/instructor-applications';
        }

        // Para /admin/contact-messages, activo si estás en esa ruta exacta
        if (href === '/admin/contact-messages') {
            return pathname === '/admin/contact-messages';
        }

        // Para otras rutas, verificar si la ruta actual comienza con el href
        return pathname?.startsWith(href);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-64 bg-gradient-to-b from-primary-black via-primary-black to-secondary-dark-gray
                    text-primary-white shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6 border-b border-primary-orange/20 bg-gradient-to-r from-primary-black to-secondary-dark-gray/50">
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
                        >
                            <div className="relative w-12 h-12 flex items-center justify-center group-hover:shadow-primary-orange/50 transition-all duration-300">
                                <Image
                                    src="/assets/fav-fagsol.png"
                                    alt="FagSol Logo"
                                    width={50}
                                    height={50}
                                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-primary-white group-hover:text-primary-orange transition-colors">
                                    FagSol
                                </span>
                                <span className="text-xs text-primary-orange font-semibold tracking-wider">
                                    ADMIN
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden text-secondary-light-gray hover:text-primary-orange transition-colors p-1 rounded-lg hover:bg-secondary-dark-gray"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        <ul className="space-y-1">
                            {sidebarItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                group flex items-center space-x-3 px-4 py-3 rounded-xl
                                                transition-all duration-200 relative
                                                ${active
                                                    ? 'bg-gradient-to-r from-primary-orange to-amber-500 text-primary-black font-semibold shadow-lg shadow-primary-orange/30'
                                                    : 'text-secondary-light-gray hover:bg-secondary-dark-gray/80 hover:text-primary-white hover:translate-x-1'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                ${active ? 'text-primary-black' : 'text-secondary-light-gray group-hover:text-primary-orange'}
                                                transition-colors duration-200
                                            `}>
                                                {item.icon}
                                            </div>
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge && item.badge > 0 && (
                                                <span className={`
                                                    ml-auto text-xs font-bold px-2 py-1 rounded-full
                                                    ${active
                                                        ? 'bg-primary-black/20 text-primary-black'
                                                        : 'bg-status-error text-primary-white'
                                                    }
                                                `}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {active && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-black rounded-r-full" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* User Info & Footer */}
                    <div className="mt-auto border-t border-primary-orange/20 bg-gradient-to-t from-secondary-dark-gray to-primary-black/50">
                        {/* User Info */}
                        {user && (
                            <div className="p-4 border-b border-primary-orange/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-amber-500 rounded-full flex items-center justify-center text-primary-black font-bold text-sm shadow-lg">
                                        {user.first_name?.[0]?.toUpperCase() || 'A'}
                                        {user.last_name?.[0]?.toUpperCase() || 'D'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-primary-white truncate">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="text-xs text-primary-orange truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Logout Button */}
                        <div className="p-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-secondary-light-gray hover:text-primary-white rounded-xl hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-200 group"
                            >
                                <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}

