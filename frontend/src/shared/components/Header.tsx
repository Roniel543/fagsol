'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from ".";
import { Menu, X, ChevronRight, Search } from 'lucide-react';

const Header = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(80);

    // Marcar como montado después de la hidratación (evita errores de hidratación)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Calcular altura dinámica del header
    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, [isScrolled, isMobileMenuOpen]);

    // Detectar scroll para cambiar estilo del header (consistente con AcademyHeader)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menu móvil al cambiar tamaño de ventana (consistente con AcademyHeader: lg = 1024px)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevenir scroll cuando el menu móvil está abierto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    // Cerrar dropdown de búsqueda al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cursos sugeridos para búsqueda
    const suggestedCourses = [
        { name: 'Programación Web', category: 'Tecnología', icon: '💻' },
        { name: 'Marketing Digital', category: 'Negocios', icon: '📱' },
        { name: 'Diseño Gráfico', category: 'Diseño', icon: '🎨' },
        { name: 'Inglés Avanzado', category: 'Idiomas', icon: '🌍' },
        { name: 'Fotografía', category: 'Artes', icon: '📸' },
        { name: 'Excel Avanzado', category: 'Negocios', icon: '📊' },
        { name: 'Diseño UX/UI', category: 'Diseño', icon: '🎯' }
    ];

    // Filtrar cursos basados en búsqueda
    const filteredCourses = searchQuery.trim()
        ? suggestedCourses.filter(course =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : suggestedCourses;

    // Manejar búsqueda: redirigir a /academy con query
    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/academy?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchFocused(false);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { name: 'Inicio', href: '#inicio', section: 'inicio' },
        { name: 'Marketplace', href: '/marketplace', section: 'marketplace' },
        { name: 'Contacto', href: '/contacto', section: 'contacto' }
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, section: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(section);
                setIsMobileMenuOpen(false);
            }
        }
    };

    return (
        <>
            <header 
                ref={headerRef}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled 
                        ? 'bg-black/95 backdrop-blur-xl shadow-2xl border-b border-zinc-800' 
                        : 'bg-black/40 backdrop-blur-md'
                }`}
            >
                <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between h-20 sm:h-24 gap-4">
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link 
                                href="/" 
                                className="group relative flex items-center gap-3 transition-all duration-300 hover:scale-105"
                                onClick={(e) => handleNavClick(e, '#inicio', 'inicio')}
                            >
                                <Image
                                    width={200}
                                    height={60}
                                    src="/assets/logo_school.png"
                                    alt="Fagsol S.A.C"
                                    priority
                                    className="h-12 sm:h-16 w-auto transition-all duration-300 group-hover:opacity-90"
                                />
                            </Link>
                        </div>

                        {/* Search Bar - Solo Desktop (consistente con AcademyHeader) */}
                        <div className="hidden lg:flex items-center gap-8 flex-1 min-w-0 max-w-2xl mx-6" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit} className="relative w-full min-w-0">
                                <div className="relative">
                                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        isSearchFocused ? 'text-primary-orange' : 'text-gray-400'
                                    }`} />
                                    <input
                                        type="text"
                                        placeholder="¿Qué quieres aprender?"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        className={`w-full pl-12 pr-4 py-2.5 bg-zinc-900/70 border-2 rounded-xl text-sm text-gray-200 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                                            isSearchFocused
                                                ? 'border-primary-orange focus:ring-primary-orange/30 bg-zinc-900 shadow-xl shadow-primary-orange/30'
                                                : 'border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-900'
                                        }`}
                                    />
                                </div>
                            </form>

                            {/* Dropdown de Sugerencias */}
                            {isSearchFocused && isMounted && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border-2 border-zinc-800/80 rounded-xl shadow-2xl shadow-black/70 overflow-hidden z-50 backdrop-blur-xl">
                                    <div className="p-3">
                                        {filteredCourses.length > 0 ? (
                                            <>
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                                    {searchQuery.trim() ? 'Resultados' : 'Cursos Populares'}
                                                </div>
                                                {filteredCourses.map((course, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchQuery(course.name);
                                                            handleSearchSubmit();
                                                        }}
                                                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-zinc-900 hover:to-zinc-900/50 transition-all duration-200 group border border-transparent hover:border-primary-orange/20 text-left"
                                                    >
                                                        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{course.icon}</span>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-200 group-hover:text-primary-orange transition-colors">
                                                                {course.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 group-hover:text-gray-400">
                                                                {course.category}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-orange group-hover:translate-x-1 transition-all duration-200" />
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-3 py-8 text-center">
                                                <div className="text-gray-500 text-sm">
                                                    No se encontraron cursos para &quot;{searchQuery}&quot;
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleSearchSubmit}
                                                    className="mt-3 text-sm text-primary-orange hover:underline"
                                                >
                                                    Buscar en Academy →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation (consistente con AcademyHeader) */}
                        <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href, link.section)}
                                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                                        activeSection === link.section
                                            ? 'text-primary-orange'
                                            : 'text-gray-300 hover:text-primary-orange'
                                    }`}
                                >
                                    {link.name}
                                    {/* Underline animado */}
                                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-orange to-amber-600 rounded-full transform origin-left transition-all duration-300 ${
                                        activeSection === link.section ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                    }`}></span>
                                </Link>
                            ))}
                        </div>

                        {/* Academy Link - Destacado (consistente con AcademyHeader) */}
                        <Link
                            href="/academy"
                            className="hidden lg:flex items-center gap-2 px-4 xl:px-6 py-2.5 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/50 shadow-lg shadow-primary-orange/30 relative overflow-hidden group flex-shrink-0"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span>Fagsol Academy</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                                NUEVO
                            </span>
                            {/* Efecto shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </Link>
                        {/* Mobile Buttons (consistente con AcademyHeader) */}
                        <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
                            {/* Search Button Mobile */}
                            <button
                                onClick={() => setIsSearchFocused(!isSearchFocused)}
                                className="p-2 rounded-lg text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300"
                                aria-label="Buscar cursos"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
                    isMobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                {/* Menu Panel */}
                <div
                    className={`absolute left-0 right-0 bg-zinc-950 border-t border-zinc-800 transform transition-transform duration-300 ${
                        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}
                    style={{ top: `${headerHeight}px` }}
                >
                    <nav className="px-4 py-6 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href, link.section)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    activeSection === link.section
                                        ? 'bg-gradient-to-r from-primary-orange/20 to-amber-600/20 text-primary-orange border-2 border-primary-orange/50'
                                        : 'text-gray-300 hover:bg-zinc-900 hover:text-primary-orange border-2 border-transparent'
                                }`}
                            >
                                {link.name}
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                                    activeSection === link.section ? 'translate-x-1' : ''
                                }`} />
                            </Link>
                        ))}

                        {/* Mobile Academy Link */}
                        <div className="pt-4 border-t border-zinc-800">
                            <Link
                                href="/academy"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-orange to-amber-600 text-white font-semibold text-sm rounded-xl hover:from-amber-600 hover:to-primary-orange transition-all duration-300 relative shadow-xl shadow-primary-orange/40"
                            >
                                <span>Fagsol Academy</span>
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Search Modal */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
                    isSearchFocused && !isMobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsSearchFocused(false)}
                ></div>

                {/* Search Panel */}
                <div 
                    className="absolute left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 overflow-y-auto"
                    style={{ top: `${headerHeight}px`, maxHeight: `calc(100vh - ${headerHeight}px)` }}
                >
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-orange" />
                        <input
                            type="text"
                            placeholder="¿Qué quieres aprender?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            autoFocus
                            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border-2 border-primary-orange rounded-xl text-sm text-gray-200 placeholder-gray-400 focus:outline-none shadow-xl shadow-primary-orange/30 focus:ring-2 focus:ring-primary-orange/40"
                        />
                    </form>

                    {/* Results */}
                    <div className="space-y-2">
                        {filteredCourses.length > 0 ? (
                            <>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    {searchQuery.trim() ? 'Resultados' : 'Cursos Populares'}
                                </div>
                                {filteredCourses.map((course, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(course.name);
                                            handleSearchSubmit();
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 text-left"
                                    >
                                        <span className="text-2xl">{course.icon}</span>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-200">
                                                {course.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {course.category}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-8 text-center">
                                <div className="text-gray-500 text-sm">
                                    No se encontraron cursos para &quot;{searchQuery}&quot;
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="mt-3 text-sm text-primary-orange hover:underline"
                                >
                                    Buscar en Academy →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer dinámico para el fixed header (consistente con AcademyHeader) */}
            <div style={{ height: `${headerHeight}px` }}></div>
        </>
    );
};

export default Header;