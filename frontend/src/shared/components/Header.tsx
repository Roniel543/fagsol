'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from ".";
import { Menu, X, ChevronRight, Search } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Detectar scroll para cambiar estilo del header
    //EL hook useEffect sirve para ejecutar un efecto secundario cuando el componente se monta o se desmonta
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menu móvil al cambiar tamaño de ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
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
        { name: 'Procesos Metalúrgicos del Oro', category: 'Metalurgia', icon: '⚗️' },
        { name: 'Energías Renovables Aplicadas', category: 'Energías', icon: '☀️' },
        { name: 'Procesos Agroindustriales', category: 'Agroindustria', icon: '🌾' },
        { name: 'Tratamiento de Aguas', category: 'Ambiental', icon: '💧' },
        { name: 'Mantenimiento Industrial', category: 'Técnico', icon: '🔧' },
    ];

    // Filtrar cursos basados en búsqueda
    const filteredCourses = searchQuery.trim()
        ? suggestedCourses.filter(course =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : suggestedCourses;

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
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled 
                        ? 'bg-black/90 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-zinc-800/50' 
                        : 'bg-black/20 backdrop-blur-md'
                }`}
            >
                <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                    <div className="flex items-center">
                            <a 
                                href="/" 
                                className="group relative w-40 sm:w-48 transition-all duration-300 hover:scale-105 hover:rotate-1"
                                onClick={(e) => handleNavClick(e, '#inicio', 'inicio')}
                            >
                            <img
                                width="100%"
                                src="/assets/logo_text.svg"
                                alt="Fagsol S.A.C"
                                    className="transition-all duration-300 group-hover:opacity-90 group-hover:drop-shadow-lg"
                            />
                        </a>
                    </div>

                        {/* Search Bar - Solo Desktop */}
                        <div className="hidden lg:block flex-1 max-w-3xl mx-10 relative" ref={searchRef}>
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
                                    className={`w-full pl-12 pr-4 py-3 bg-zinc-900/70 border-2 rounded-xl text-base text-gray-200 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                                        isSearchFocused
                                            ? 'border-primary-orange focus:ring-primary-orange/30 bg-zinc-900 shadow-xl shadow-primary-orange/30'
                                            : 'border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-900'
                                    }`}
                                />
                            </div>

                            {/* Dropdown de Sugerencias */}
                            {isSearchFocused && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-950 border-2 border-zinc-800/80 rounded-xl shadow-2xl shadow-black/70 overflow-hidden animate-slide-down z-50 backdrop-blur-xl">
                                    <div className="p-3">
                                        {filteredCourses.length > 0 ? (
                                            <>
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                                    {searchQuery.trim() ? 'Resultados' : 'Cursos Populares'}
                                                </div>
                                                {filteredCourses.map((course, index) => (
                                                    <a
                                                        key={index}
                                                        href="#cursos"
                                                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-zinc-900 hover:to-zinc-900/50 transition-all duration-200 group border border-transparent hover:border-primary-orange/20"
                                                        onClick={() => {
                                                            setIsSearchFocused(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{course.icon}</span>
                                                        <div className="flex-1">
                                                            <div className="text-base font-semibold text-gray-200 group-hover:text-primary-orange transition-colors">
                                                                {course.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 group-hover:text-gray-400">
                                                                {course.category}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-orange group-hover:translate-x-2 transition-all duration-200" />
                                                    </a>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-3 py-8 text-center">
                                                <div className="text-gray-500 text-sm">
                                                    No se encontraron cursos para "{searchQuery}"
                                                </div>
                                                <a
                                                    href="#cursos"
                                                    className="inline-block mt-3 text-sm text-primary-orange hover:underline"
                                                    onClick={() => {
                                                        setIsSearchFocused(false);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    Ver todos los cursos →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-10">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href, link.section)}
                                    className={`relative px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg group ${
                                        activeSection === link.section
                                            ? 'text-primary-orange scale-105'
                                            : 'text-gray-300 hover:text-primary-orange hover:scale-105'
                                    }`}
                                >
                                    {link.name}
                                    {/* Underline animado */}
                                    <span className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-orange to-amber-600 rounded-full transform origin-left transition-all duration-300 ${
                                        activeSection === link.section ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                    }`}></span>
                                </a>
                            ))}
                        </div>

                        {/* Academy Link - Destacado */}
                        <a
                            href="/academy"
                            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-bold text-base rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary-orange/60 shadow-lg shadow-primary-orange/30 relative overflow-hidden group ring-2 ring-primary-orange/20 hover:ring-primary-orange/40"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="hidden lg:inline text-xl">🎓</span>
                                <span>Fagsol Academy</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                            {/* Badge "Nuevo" */}
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                                NUEVO
                            </span>
                            {/* Efecto shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/0 via-white/10 to-primary-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        </a>
                        {/* Mobile Buttons */}
                        <div className="flex items-center gap-2 lg:hidden">
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
                                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300"
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
                    className={`absolute top-[72px] left-0 right-0 bg-zinc-950 border-t border-zinc-800 transform transition-transform duration-300 ${
                        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}
                >
                    <nav className="px-4 py-6 space-y-3 max-h-[calc(100vh-72px)] overflow-y-auto">
                        {navLinks.map((link, index) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href, link.section)}
                                className={`flex items-center justify-between px-5 py-4 rounded-xl text-base font-medium transition-all duration-300 animate-slide-down ${
                                    activeSection === link.section
                                        ? 'bg-gradient-to-r from-primary-orange/20 to-amber-600/20 text-primary-orange border-2 border-primary-orange/50 shadow-lg shadow-primary-orange/20'
                                        : 'text-gray-300 hover:bg-zinc-900 hover:text-primary-orange border-2 border-transparent'
                                }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {link.name}
                                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                                    activeSection === link.section ? 'translate-x-2' : ''
                                }`} />
                            </a>
                        ))}

                        {/* Mobile Academy Link */}
                        <div className="pt-4 border-t border-zinc-800">
                            <a
                                href="/academy"
                                className="flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-primary-orange to-amber-600 text-white font-bold text-base rounded-xl hover:from-amber-600 hover:to-primary-orange transition-all duration-300 relative shadow-xl shadow-primary-orange/40 ring-2 ring-primary-orange/30"
                            >
                                <span className="text-xl">🎓</span>
                                <span>Fagsol Academy</span>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                                    NUEVO
                                </span>
                            </a>
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
                <div className="absolute top-[72px] left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 max-h-[calc(100vh-72px)] overflow-y-auto">
                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-orange" />
                        <input
                            type="text"
                            placeholder="¿Qué quieres aprender?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-primary-orange rounded-xl text-base text-gray-200 placeholder-gray-400 focus:outline-none shadow-xl shadow-primary-orange/30 focus:ring-2 focus:ring-primary-orange/40"
                        />
                    </div>

                    {/* Results */}
                    <div className="space-y-2">
                        {filteredCourses.length > 0 ? (
                            <>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    {searchQuery.trim() ? 'Resultados' : 'Cursos Populares'}
                                </div>
                                {filteredCourses.map((course, index) => (
                                    <a
                                        key={index}
                                        href="#cursos"
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200"
                                        onClick={() => {
                                            setIsSearchFocused(false);
                                            setSearchQuery('');
                                        }}
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
                                    </a>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-8 text-center">
                                <div className="text-gray-500 text-sm">
                                    No se encontraron cursos para "{searchQuery}"
                                </div>
                                <a
                                    href="#cursos"
                                    className="inline-block mt-3 text-sm text-primary-orange hover:underline"
                                    onClick={() => {
                                        setIsSearchFocused(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    Ver todos los cursos →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer para el fixed header */}
            <div className="h-[72px]"></div>
        </>
    );
};

export default Header;