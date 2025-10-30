'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, BookOpen, GraduationCap, TrendingUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { MiniCart } from '@/shared/components/MiniCart';
import { useCart } from '@/shared/contexts/CartContext';

export function AcademyHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { itemCount } = useCart();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {    
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Explorar', href: '/academy/cursos', icon: BookOpen },
        { name: 'Mis Cursos', href: '/academy/mis-cursos', icon: GraduationCap },
        { name: 'Mi Progreso', href: '/academy/progreso', icon: TrendingUp }
    ];

    const suggestedCourses = [
        { title: 'Procesamiento de Minerales Auríferos', category: 'Metalurgia', students: 657 },
        { title: 'Energías Renovables Aplicadas', category: 'Energías', students: 523 },
        { title: 'Tratamiento de Aguas Industriales', category: 'Tratamiento', students: 445 },
        { title: 'Procesos Agroindustriales', category: 'Agroindustria', students: 389 },
        { title: 'Mantenimiento Industrial Preventivo', category: 'Mantenimiento', students: 312 }
    ];

    const filteredCourses = searchQuery.trim()
        ? suggestedCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled
                        ? 'bg-black/95 backdrop-blur-xl shadow-2xl border-b border-zinc-800'
                        : 'bg-black/40 backdrop-blur-md'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Link de regreso a corporativa */}
                    <div className="border-b border-zinc-800/50 py-2">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-primary-orange transition-colors group"
                        >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            <span>Volver a Fagsol Corporativo</span>
                        </a>
                    </div>

                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <a href="/academy" className="flex items-center gap-3 group">
                                <Image
                                    src="/assets/logo_text.svg"
                                    alt="Fagsol Academy"
                                    width={160}
                                    height={50}
                                    className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
                                />
                                <div className="hidden sm:block">
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-lg">
                                        ACADEMY
                                    </span>
                                </div>
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8 flex-1 max-w-4xl mx-10">
                            {/* Barra de búsqueda prominente */}
                            <div ref={searchRef} className="relative flex-1">
                                <div className="relative">
                                    <Search
                                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                                            isSearchFocused ? 'text-primary-orange' : 'text-gray-400'
                                        }`}
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        placeholder="Buscar cursos de metalurgia, energías, agroindustria..."
                                        className={`w-full pl-12 pr-4 py-3 bg-zinc-900/80 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                            isSearchFocused
                                                ? 'border-primary-orange focus:ring-2 focus:ring-primary-orange/20 shadow-xl shadow-primary-orange/10'
                                                : 'border-zinc-700 hover:border-zinc-600'
                                        }`}
                                    />
                                </div>

                                {/* Dropdown de resultados */}
                                {isSearchFocused && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-950 border-2 border-zinc-800/80 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
                                        {filteredCourses.length > 0 ? (
                                            <div className="py-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Resultados
                                                </div>
                                                {filteredCourses.map((course, index) => (
                                                    <a
                                                        key={index}
                                                        href={`/academy/curso/${index + 1}`}
                                                        className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-zinc-900 hover:to-zinc-900/50 transition-all duration-200 group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-primary-orange/10 flex items-center justify-center group-hover:bg-primary-orange/20 transition-colors">
                                                            <BookOpen className="w-5 h-5 text-primary-orange" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white text-sm font-medium group-hover:text-primary-orange transition-colors">
                                                                {course.title}
                                                            </p>
                                                            <p className="text-gray-500 text-xs">{course.category} • {course.students} estudiantes</p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : searchQuery.trim() ? (
                                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                                No se encontraron cursos
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Cursos Populares
                                                </div>
                                                {suggestedCourses.map((course, index) => (
                                                    <a
                                                        key={index}
                                                        href={`/academy/curso/${index + 1}`}
                                                        className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-zinc-900 hover:to-zinc-900/50 transition-all duration-200 group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-primary-orange/10 flex items-center justify-center group-hover:bg-primary-orange/20 transition-colors">
                                                            <BookOpen className="w-5 h-5 text-primary-orange" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white text-sm font-medium group-hover:text-primary-orange transition-colors">
                                                                {course.title}
                                                            </p>
                                                            <p className="text-gray-500 text-xs">{course.category} • {course.students} estudiantes</p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden lg:flex items-center gap-6">
                            {/* Navigation Links */}
                            <nav className="flex items-center gap-6">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            className="flex items-center gap-2 text-gray-300 hover:text-primary-orange text-sm font-medium transition-colors group"
                                        >
                                            <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>{link.name}</span>
                                        </a>
                                    );
                                })}
                            </nav>

                            {/* Carrito */}
                            <MiniCart />

                            {/* Perfil */}
                            <a
                                href="/academy/perfil"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                            >
                                <User className="w-4 h-4" />
                                <span>Mi Perfil</span>
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-[120px] bg-black/95 backdrop-blur-xl z-40 animate-fade-in">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar cursos..."
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-900 border-2 border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange"
                                />
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="space-y-2">
                                {navLinks.map((link, index) => {
                                    const Icon = link.icon;
                                    return (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300 animate-slide-down"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{link.name}</span>
                                        </a>
                                    );
                                })}
                            </nav>

                            {/* Mobile Actions */}
                            <div className="pt-4 space-y-3 border-t border-zinc-800">
                                <a
                                    href="/academy/cart"
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-5 h-5 text-primary-orange" />
                                        <span className="text-white font-medium">Mi Carrito</span>
                                    </div>
                                    {itemCount > 0 && (
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                            {itemCount}
                                        </span>
                                    )}
                                </a>

                                <a
                                    href="/academy/perfil"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-orange to-amber-600 text-white font-semibold"
                                >
                                    <User className="w-5 h-5" />
                                    <span>Mi Perfil</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer */}
            <div className="h-[152px]"></div>
        </>
    );
}

export default AcademyHeader;

