'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube, Send, CheckCircle2 } from 'lucide-react';

export function Footer() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return;
        }

        setIsLoading(true);
        
        // Simular suscripción
        setTimeout(() => {
            setIsLoading(false);
            setIsSubscribed(true);
            setEmail('');
            
            setTimeout(() => setIsSubscribed(false), 5000);
        }, 1000);
    };

    const currentYear = new Date().getFullYear();

    const footerSections = {
        company: {
            title: 'Empresa',
            links: [
                { name: 'Sobre Nosotros', href: '#inicio' },
                { name: 'Nuestros Procesos', href: '#procesos' },
                { name: 'Equipos', href: '#marketplace' },
                { name: 'Blog', href: '/blog' },
                { name: 'Carreras', href: '/carreras' }
            ]
        },
        education: {
            title: 'Educación',
            links: [
                { name: 'Fagsol Academy', href: '/academy' },
                { name: 'Cursos Disponibles', href: '/academy/cursos' },
                { name: 'Conviértete en Instructor', href: '#enseña' },
                { name: 'Certificaciones', href: '/academy/certificaciones' },
                { name: 'Preguntas Frecuentes', href: '/faq' }
            ]
        },
        services: {
            title: 'Servicios',
            links: [
                { name: 'Consultoría Metalúrgica', href: '#servicios' },
                { name: 'Análisis de Laboratorio', href: '#servicios' },
                { name: 'Asesoría Técnica', href: '#servicios' },
                { name: 'Capacitación In-House', href: '#servicios' },
                { name: 'Venta de Equipos', href: '#marketplace' }
            ]
        },
        legal: {
            title: 'Legal',
            links: [
                { name: 'Política de Privacidad', href: '/privacidad' },
                { name: 'Términos y Condiciones', href: '/terminos' },
                { name: 'Política de Cookies', href: '/cookies' },
                { name: 'Política de Reembolso', href: '/reembolso' }
            ]
        }
    };

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/fagsol', color: 'hover:text-blue-500' },
        { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/fagsol', color: 'hover:text-pink-500' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/fagsol', color: 'hover:text-blue-600' },
        { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/fagsol', color: 'hover:text-red-600' }
    ];

    const contactInfo = [
        { icon: Phone, text: '+51 1 234 5678' },
        { icon: Mail, text: 'dev.fagsol.sac@gmail.com' },
        { icon: MapPin, text: 'Av. Polinesia 1234, Arequipa, Perú' }
    ];

    return (
        <footer className="relative bg-black border-t border-zinc-800">
            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
                {/* Newsletter Section */}
                <div className="border-b border-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    Mantente <span className="bg-gradient-to-r from-primary-orange to-amber-500 bg-clip-text text-transparent">Actualizado</span>
                                </h3>
                                <p className="text-gray-400 text-sm sm:text-base">
                                    Recibe las últimas noticias sobre cursos, tecnología metalúrgica y ofertas exclusivas.
                                </p>
                            </div>

                            <div>
                                {isSubscribed ? (
                                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-green-400 font-semibold text-sm">¡Suscripción exitosa!</p>
                                            <p className="text-green-300/70 text-xs">Te enviaremos nuestras actualizaciones.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-300"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Enviando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Suscribirme</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
                        {/* Logo y descripción */}
                        <div className="sm:col-span-2 lg:col-span-2">
                            <div className="mb-6">
                                <Image
                                    src="/assets/logo_text.svg"
                                    alt="Fagsol SAC"
                                    width={240}
                                    height={80}
                                    className="h-16 w-auto mb-4"
                                />
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Líderes en servicios metalúrgicos y educación especializada. 
                                    Transformando la industria minera con tecnología y conocimiento.
                                </p>
                                
                                {/* Información de contacto */}
                                <div className="space-y-3">
                                    {contactInfo.map((info, index) => {
                                        const Icon = info.icon;
                                        return (
                                            <div key={index} className="flex items-start gap-3 text-sm text-gray-400 hover:text-primary-orange transition-colors group">
                                                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                                <span>{info.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Links - Empresa */}
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                                {footerSections.company.title}
                            </h4>
                            <ul className="space-y-3">
                                {footerSections.company.links.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-primary-orange text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links - Educación */}
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                                {footerSections.education.title}
                            </h4>
                            <ul className="space-y-3">
                                {footerSections.education.links.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-primary-orange text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links - Servicios */}
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                                {footerSections.services.title}
                            </h4>
                            <ul className="space-y-3">
                                {footerSections.services.links.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-primary-orange text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links - Legal */}
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                                {footerSections.legal.title}
                            </h4>
                            <ul className="space-y-3">
                                {footerSections.legal.links.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-primary-orange text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Copyright */}
                            <div className="text-gray-400 text-sm text-center sm:text-left">
                                © {currentYear} <span className="text-primary-orange font-semibold">FAGSOL SAC</span>. Todos los derechos reservados.
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-4">
                                {socialLinks.map((social, index) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-gray-400 ${social.color} border border-zinc-800 hover:border-current transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                                            aria-label={social.name}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Made with love */}
                        <div className="text-center mt-4 pt-4 border-t border-zinc-900">
                            <p className="text-xs text-gray-600">
                                Hecho con <span className="text-red-500 animate-pulse">❤️</span> por el equipo de Fagsol
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

