'use client';

import { ContentSection, PageHero } from '@/features/empresa/components';
import { Footer, Header } from '@/shared/components';
import { Eye, FileText, Lock, Shield } from 'lucide-react';

export function PrivacidadPage() {
    const secciones = [
        {
            icon: FileText,
            title: '1. Información que Recopilamos',
            content: [
                'Información personal: nombre, dirección de correo electrónico, número de teléfono, dirección postal.',
                'Información de cuenta: nombre de usuario, contraseña (encriptada), preferencias de usuario.',
                'Información de pago: datos de tarjeta de crédito procesados de forma segura a través de MercadoPago.',
                'Información de uso: páginas visitadas, tiempo de permanencia, cursos inscritos, progreso de aprendizaje.',
                'Información técnica: dirección IP, tipo de navegador, sistema operativo, cookies.'
            ]
        },
        {
            icon: Eye,
            title: '2. Uso de la Información',
            content: [
                'Proporcionar y mejorar nuestros servicios educativos y plataforma.',
                'Procesar pagos y gestionar inscripciones a cursos.',
                'Comunicarnos contigo sobre tu cuenta, cursos y actualizaciones importantes.',
                'Personalizar tu experiencia de aprendizaje.',
                'Enviar newsletters y comunicaciones promocionales (con tu consentimiento).',
                'Cumplir con obligaciones legales y resolver disputas.',
                'Prevenir fraudes y garantizar la seguridad de la plataforma.'
            ]
        },
        {
            icon: Lock,
            title: '3. Protección de Datos',
            content: [
                'Utilizamos tecnologías de encriptación SSL/TLS para proteger la transmisión de datos.',
                'Las contraseñas se almacenan usando algoritmos de hash seguros (Argon2).',
                'Limitamos el acceso a información personal solo a empleados autorizados.',
                'Realizamos auditorías de seguridad regulares.',
                'No compartimos información personal con terceros sin tu consentimiento explícito, excepto cuando sea requerido por ley.'
            ]
        },
        {
            icon: Shield,
            title: '4. Tus Derechos',
            content: [
                'Acceso: puedes solicitar una copia de tus datos personales.',
                'Rectificación: puedes corregir información incorrecta o incompleta.',
                'Eliminación: puedes solicitar la eliminación de tu cuenta y datos personales.',
                'Oposición: puedes oponerte al procesamiento de tus datos para ciertos fines.',
                'Portabilidad: puedes solicitar la transferencia de tus datos a otro proveedor.',
                'Retirar consentimiento: puedes retirar tu consentimiento en cualquier momento.'
            ]
        }
    ];

    const cookies = [
        {
            tipo: 'Cookies Esenciales',
            descripcion: 'Necesarias para el funcionamiento básico del sitio. Incluyen autenticación y seguridad.',
            duracion: 'Sesión'
        },
        {
            tipo: 'Cookies de Rendimiento',
            descripcion: 'Nos ayudan a entender cómo los visitantes interactúan con el sitio web.',
            duracion: '30 días'
        },
        {
            tipo: 'Cookies de Funcionalidad',
            descripcion: 'Permiten recordar tus preferencias y personalizar tu experiencia.',
            duracion: '90 días'
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />

            <PageHero
                title="Política de Privacidad"
                subtitle="Protección de Datos"
                description="Comprometidos con la protección de tu información personal y el respeto a tu privacidad."
            />

            {/* Introducción */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-relaxed mb-6">
                            En Fagsol SAC, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal.
                            Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tus datos cuando utilizas
                            nuestra plataforma educativa y servicios relacionados.
                        </p>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política. Si no estás de acuerdo con
                            alguna parte de esta política, te recomendamos que no utilices nuestros servicios.
                        </p>
                    </div>
                </div>
            </ContentSection>

            {/* Secciones principales */}
            <ContentSection background="dark">
                <div className="max-w-4xl mx-auto space-y-12">
                    {secciones.map((seccion, index) => {
                        const IconComponent = seccion.icon;
                        return (
                            <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex items-center justify-center w-12 h-12 bg-primary-orange/10 rounded-xl flex-shrink-0">
                                        <IconComponent className="w-6 h-6 text-primary-orange" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                        {seccion.title}
                                    </h2>
                                </div>
                                <ul className="space-y-3 ml-16">
                                    {seccion.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                                            <span className="text-primary-orange mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </ContentSection>

            {/* Cookies */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                        <span className="text-white">Uso de </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Cookies
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {cookies.map((cookie, index) => (
                            <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">{cookie.tipo}</h3>
                                <p className="text-gray-400 text-sm mb-3 leading-relaxed">{cookie.descripcion}</p>
                                <p className="text-xs text-primary-orange font-semibold">Duración: {cookie.duracion}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador.
                        Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
                    </p>
                </div>
            </ContentSection>

            {/* Contacto */}
            <ContentSection background="gradient">
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        ¿Tienes preguntas sobre privacidad?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Si tienes preguntas o inquietudes sobre esta política o sobre cómo manejamos tus datos, contáctanos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:dev.fagsol.sac@gmail.com"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-orange/40"
                        >
                            Contactar
                        </a>
                        <a
                            href="/#contacto"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-primary-orange text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            Formulario de Contacto
                        </a>
                    </div>
                </div>
            </ContentSection>

            <Footer />
        </main>
    );
}

