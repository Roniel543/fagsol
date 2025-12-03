"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  TrendingUp,
  ArrowLeft,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { MiniCart, Button } from "@/shared/components";
import { useAuth } from "@/shared/hooks/useAuth";
import { ProfileDropdown } from "./ProfileDropdown";
import { HeaderAuthSkeleton } from "./HeaderAuthSkeleton";

export function AcademyHeader() {
  const { user, isAuthenticated, loadingUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Marcar como montado después de la hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener URL de redirect (página actual)
  const getRedirectUrl = () => {
    return pathname || "/academy";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    {
      name: "Explorar",
      href: "/academy/catalog",
      icon: BookOpen,
      requiresAuth: false,
    },
    {
      name: "Mis Cursos",
      href: "/academy/mis-cursos",
      icon: GraduationCap,
      requiresAuth: true,
    },
    {
      name: "Mi Progreso",
      href: "/academy/progreso",
      icon: TrendingUp,
      requiresAuth: true,
    },
  ];

  const suggestedCourses = [
    {
      title: "Curso de Programación Web",
      category: "Tecnología",
      students: 1250,
    },
    {
      title: "Marketing Digital Completo",
      category: "Negocios",
      students: 980,
    },
    { title: "Diseño Gráfico Profesional", category: "Diseño", students: 750 },
    { title: "Inglés Avanzado", category: "Idiomas", students: 1100 },
    { title: "Fotografía y Edición", category: "Artes", students: 650 },
    { title: "Emprendimiento y Startups", category: "Negocios", students: 850 },
    { title: "Diseño UX/UI", category: "Diseño", students: 720 },
    { title: "Excel Avanzado", category: "Negocios", students: 680 },
  ];

  const filteredCourses = searchQuery.trim()
    ? suggestedCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/95 backdrop-blur-xl shadow-2xl border-b border-zinc-800"
            : "bg-black/40 backdrop-blur-md"
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

          <div className="flex items-center justify-between h-24 sm:h-28 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <a href="/academy" className="flex items-center gap-3 group">
                <Image
                  src="/assets/logo_school.png"
                  alt="Fagsol Academy"
                  width={200}
                  height={60}
                  priority
                  className="h-16 sm:h-20 w-auto transition-all duration-300 group-hover:scale-105"
                />
                <div className="hidden sm:block">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-lg">
                    ACADEMY
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation - Contenedor de búsqueda con ancho controlado */}
            <div className="hidden lg:flex items-center gap-8 flex-1 min-w-0 max-w-2xl mx-6">
              {/* Barra de búsqueda prominente */}
              <div ref={searchRef} className="relative w-full min-w-0">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                      isSearchFocused ? "text-primary-orange" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Buscar cursos de cualquier industria..."
                    className={`w-full pl-12 pr-4 py-3 bg-zinc-900/80 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                      isSearchFocused
                        ? "border-primary-orange focus:ring-2 focus:ring-primary-orange/20 shadow-xl shadow-primary-orange/10"
                        : "border-zinc-700 hover:border-zinc-600"
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
                              <p className="text-gray-500 text-xs">
                                {course.category} • {course.students}{" "}
                                estudiantes
                              </p>
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
                              <p className="text-gray-500 text-xs">
                                {course.category} • {course.students}{" "}
                                estudiantes
                              </p>
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
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
              {/* Enlace "Explorar" siempre visible */}
              <Link
                href="/academy/catalog"
                className="flex items-center gap-2 text-gray-300 hover:text-primary-orange text-sm font-medium transition-colors group flex-shrink-0"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Explorar</span>
              </Link>

              {/* Mostrar skeleton durante carga o antes de montar (evita hidratación mismatch) */}
              {!isMounted || loadingUser ? (
                <HeaderAuthSkeleton />
              ) : (
                <>
                  {isAuthenticated ? (
                    <>
                      {/* Navigation Links - Solo mostrar si está autenticado */}
                      <nav className="flex items-center gap-4 xl:gap-6">
                        {navLinks
                          .filter((link) => link.requiresAuth)
                          .map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center gap-2 text-gray-300 hover:text-primary-orange text-sm font-medium transition-colors group"
                              >
                                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>{link.name}</span>
                              </Link>
                            );
                          })}
                      </nav>

                      {/* Carrito con MiniCart */}
                      <div className="group relative">
                        <MiniCart />
                      </div>

                      {/* Perfil Dropdown */}
                      <ProfileDropdown />
                    </>
                  ) : (
                    <>
                      {/* Botones de Login/Registro cuando NO hay sesión */}
                      <Link
                        href={`/auth/login?redirect=${encodeURIComponent(getRedirectUrl())}`}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Iniciar Sesión</span>
                        </Button>
                      </Link>
                      <Link
                        href={`/auth/register?redirect=${encodeURIComponent(getRedirectUrl())}`}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Registrarse</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
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
                {/* Explorar siempre visible */}
                <Link
                  href="/academy/catalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300 animate-slide-down"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Explorar</span>
                </Link>

                {/* Enlaces que requieren autenticación - Solo mostrar cuando termine de cargar y esté montado */}
                {isMounted && !loadingUser && (
                  <>
                    {isAuthenticated
                      ? navLinks
                          .filter((link) => link.requiresAuth)
                          .map((link, index) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300 animate-slide-down"
                                style={{
                                  animationDelay: `${(index + 1) * 0.1}s`,
                                }}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{link.name}</span>
                              </Link>
                            );
                          })
                      : navLinks
                          .filter((link) => link.requiresAuth)
                          .map((link, index) => {
                            const Icon = link.icon;
                            return (
                              <button
                                key={link.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsMobileMenuOpen(false);
                                  router.push(
                                    `/auth/login?redirect=${encodeURIComponent(link.href)}`,
                                  );
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300 animate-slide-down"
                                style={{
                                  animationDelay: `${(index + 1) * 0.1}s`,
                                }}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{link.name}</span>
                              </button>
                            );
                          })}
                  </>
                )}
              </nav>

              {/* Mobile Actions - Solo mostrar cuando termine de cargar y esté montado */}
              {isMounted && !loadingUser && (
                <div className="pt-4 space-y-3 border-t border-zinc-800">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/academy/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-5 h-5 text-primary-orange" />
                          <span className="text-white font-medium">
                            Mi Carrito
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/academy/perfil"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-orange to-amber-600 text-white font-semibold"
                      >
                        <User className="w-5 h-5" />
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all text-gray-300"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          await logout();
                          router.push("/academy");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/auth/login?redirect=${encodeURIComponent(getRedirectUrl())}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all text-white font-medium"
                      >
                        <LogIn className="w-5 h-5 text-primary-orange" />
                        <span>Iniciar Sesión</span>
                      </Link>

                      <Link
                        href={`/auth/register?redirect=${encodeURIComponent(getRedirectUrl())}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-orange to-amber-600 text-white font-semibold"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>Registrarse</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-[160px] sm:h-[172px]"></div>
    </>
  );
}

export default AcademyHeader;
