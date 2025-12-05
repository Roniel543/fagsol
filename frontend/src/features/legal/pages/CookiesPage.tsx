'use client';

import { ContentSection, PageHero } from '@/features/empresa/components';
import { Footer, Header } from '@/shared/components';
import { BarChart3, Cookie, Settings, Shield, User } from 'lucide-react';

export function CookiesPage() {
    const tiposCookies = [
        {
            icon: Shield,
            tipo: 'Cookies Esenciales',
            descripcion: 'Estas cookies son necesarias para el funcionamiento básico del sitio web y no pueden desactivarse.',
            proposito: 'Permiten funciones básicas como la navegación, el acceso a áreas seguras y la autenticación de usuarios.',
            ejemplos: [
                'Cookies de sesión para mantener tu sesión activa',
                'Cookies de seguridad para prevenir fraudes',
                'Cookies de autenticación para recordar tu inicio de sesión'
            ],
            duracion: 'Sesión o hasta 30 días'
        },
        {
            icon: BarChart3,
            tipo: 'Cookies de Rendimiento y Análisis',
            descripcion: 'Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.',
            proposito: 'Recopilan información sobre el uso del sitio para mejorar su funcionamiento y experiencia del usuario.',
            ejemplos: [
                'Google Analytics para analizar el tráfico del sitio',
                'Cookies de seguimiento de páginas visitadas',
                'Cookies de tiempo de permanencia en el sitio'
            ],
            duracion: 'Hasta 2 años'
        },
        {
            icon: User,
            tipo: 'Cookies de Funcionalidad',
            descripcion: 'Estas cookies permiten que el sitio web recuerde tus preferencias y personalice tu experiencia.',
            proposito: 'Mejoran la funcionalidad y personalización del sitio según tus preferencias.',
            ejemplos: [
                'Cookies de idioma preferido',
                'Cookies de preferencias de tema (claro/oscuro)',
                'Cookies de configuración de usuario'
            ],
            duracion: 'Hasta 1 año'
        },
        {
            icon: Cookie,
            tipo: 'Cookies de Marketing',
            descripcion: 'Estas cookies se utilizan para mostrar anuncios relevantes y medir la efectividad de nuestras campañas.',
            proposito: 'Personalizan los anuncios según tus intereses y miden el rendimiento de las campañas publicitarias.',
            ejemplos: [
                'Cookies de seguimiento de conversiones',
                'Cookies de remarketing',
                'Cookies de redes sociales para compartir contenido'
            ],
            duracion: 'Hasta 2 años'
        }
    ];

    const gestionCookies = [
        {
            navegador: 'Google Chrome',
            pasos: [
                'Abre Chrome y haz clic en el menú (tres puntos)',
                'Selecciona "Configuración"',
                'Haz clic en "Privacidad y seguridad"',
                'Selecciona "Cookies y otros datos de sitios"',
                'Configura tus preferencias de cookies'
            ]
        },
        {
            navegador: 'Mozilla Firefox',
            pasos: [
                'Abre Firefox y haz clic en el menú (tres líneas)',
                'Selecciona "Opciones" o "Preferencias"',
                'Haz clic en "Privacidad y seguridad"',
                'En la sección "Cookies y datos del sitio", configura tus preferencias',
                'Puedes bloquear cookies de terceros o todas las cookies'
            ]
        },
        {
            navegador: 'Safari',
            pasos: [
                'Abre Safari y selecciona "Preferencias"',
                'Haz clic en "Privacidad"',
                'Selecciona "Bloquear todas las cookies" o configura opciones específicas',
                'También puedes gestionar cookies por sitio web'
            ]
        },
        {
            navegador: 'Microsoft Edge',
            pasos: [
                'Abre Edge y haz clic en el menú (tres puntos)',
                'Selecciona "Configuración"',
                'Haz clic en "Cookies y permisos del sitio"',
                'Configura tus preferencias de cookies',
                'Puedes bloquear cookies de terceros o todas las cookies'
            ]
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />

            <PageHero
                title="Política de Cookies"
                subtitle="Uso de Cookies"
                description="Información sobre cómo utilizamos cookies en Fagsol Academy y cómo puedes gestionarlas."
            />

            {/* Introducción */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert max-w-none">

                        <p className="text-gray-300 leading-relaxed mb-6">
                            Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en Fagsol Academy, qué tipos de cookies
                            utilizamos, qué información recopilan y cómo se utiliza esa información. También explica cómo puedes controlar
                            nuestras cookies.
                        </p>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 my-6">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <Cookie className="w-6 h-6 text-primary-orange" />
                                ¿Qué son las cookies?
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
                                Permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, por lo que no
                                tienes que volver a configurarlas cada vez que regresas al sitio o navegas de una página a otra.
                            </p>
                        </div>
                    </div>
                </div>
            </ContentSection>

            {/* Tipos de cookies */}
            <ContentSection background="dark">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                        <span className="text-white">Tipos de </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Cookies
                        </span>
                    </h2>
                    <div className="space-y-6">
                        {tiposCookies.map((tipo, index) => {
                            const IconComponent = tipo.icon;
                            return (
                                <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-primary-orange/10 rounded-xl flex-shrink-0">
                                            <IconComponent className="w-6 h-6 text-primary-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                                {tipo.tipo}
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed mb-3">
                                                {tipo.descripcion}
                                            </p>
                                            <p className="text-sm text-gray-400 mb-3">
                                                <strong>Propósito:</strong> {tipo.proposito}
                                            </p>
                                            <div className="mb-3">
                                                <p className="text-sm font-semibold text-white mb-2">Ejemplos:</p>
                                                <ul className="space-y-1 ml-4">
                                                    {tipo.ejemplos.map((ejemplo, ejIndex) => (
                                                        <li key={ejIndex} className="text-sm text-gray-400 flex items-start gap-2">
                                                            <span className="text-primary-orange mt-1">•</span>
                                                            <span>{ejemplo}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <p className="text-xs text-primary-orange font-semibold">
                                                Duración: {tipo.duracion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ContentSection>

            {/* Gestión de cookies */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                        <span className="text-white">Cómo Gestionar </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Cookies
                        </span>
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-8 text-center">
                        Puedes controlar y gestionar las cookies de varias maneras. Ten en cuenta que eliminar o bloquear cookies puede
                        afectar tu experiencia de usuario y algunas partes del sitio pueden no funcionar correctamente.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gestionCookies.map((navegador, index) => (
                            <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-primary-orange" />
                                    {navegador.navegador}
                                </h3>
                                <ol className="space-y-2">
                                    {navegador.pasos.map((paso, pasoIndex) => (
                                        <li key={pasoIndex} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-primary-orange font-bold flex-shrink-0">{pasoIndex + 1}.</span>
                                            <span>{paso}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            </ContentSection>

            {/* Consentimiento */}
            <ContentSection background="gradient">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                            Consentimiento
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Al continuar navegando por nuestro sitio web, aceptas el uso de cookies de acuerdo con esta política.
                            Si no estás de acuerdo con el uso de cookies, puedes configurar tu navegador para rechazarlas, aunque esto
                            puede afectar la funcionalidad del sitio.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Puedes retirar tu consentimiento en cualquier momento modificando la configuración de cookies de tu navegador.
                        </p>
                    </div>
                </div>
            </ContentSection>

            {/* Contacto */}
            <ContentSection>
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        ¿Tienes preguntas sobre cookies?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Si tienes preguntas sobre nuestra política de cookies o cómo utilizamos las cookies, contáctanos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:dev.fagsol.sac@gmail.com"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                        >
                            Contactar
                        </a>
                        <a
                            href="/privacidad"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            Ver Política de Privacidad
                        </a>
                    </div>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}

