'use client';

import { ContentSection, PageHero } from '@/features/empresa/components';
import { Footer, Header } from '@/shared/components';
import { AlertCircle, BookOpen, CheckCircle2, FileText, Users } from 'lucide-react';

export function TerminosPage() {
    const secciones = [
        {
            icon: Users,
            title: '1. Aceptación de los Términos',
            content: [
                'Al acceder y utilizar Fagsol Academy, aceptas cumplir con estos Términos y Condiciones.',
                'Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.',
                'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarse en el sitio.',
                'Es tu responsabilidad revisar periódicamente estos términos para estar informado de cualquier cambio.'
            ]
        },
        {
            icon: BookOpen,
            title: '2. Uso de la Plataforma',
            content: [
                'Debes ser mayor de 18 años o tener el consentimiento de un tutor legal para utilizar nuestros servicios.',
                'Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.',
                'No debes compartir tu cuenta con terceros.',
                'Debes proporcionar información precisa y actualizada al crear tu cuenta.',
                'No está permitido utilizar la plataforma para fines ilegales o no autorizados.',
                'No debes intentar acceder a áreas restringidas o interferir con el funcionamiento del sitio.'
            ]
        },
        {
            icon: CheckCircle2,
            title: '3. Inscripciones y Pagos',
            content: [
                'Los precios de los cursos están expresados en soles peruanos (PEN) e incluyen impuestos aplicables.',
                'El pago se procesa de forma segura a través de MercadoPago.',
                'Una vez completado el pago, recibirás acceso inmediato al curso.',
                'Las inscripciones son personales e intransferibles.',
                'No se permiten reembolsos después de 7 días de la compra, salvo casos excepcionales contemplados en nuestra política de reembolso.',
                'Nos reservamos el derecho de modificar los precios en cualquier momento.'
            ]
        },
        {
            icon: AlertCircle,
            title: '4. Contenido y Propiedad Intelectual',
            content: [
                'Todo el contenido de los cursos (videos, materiales, textos) es propiedad de Fagsol SAC o sus licenciantes.',
                'El contenido está protegido por leyes de propiedad intelectual y derechos de autor.',
                'No está permitido copiar, reproducir, distribuir o compartir el contenido del curso sin autorización.',
                'Puedes utilizar el contenido únicamente para tu aprendizaje personal.',
                'Está prohibido grabar, descargar o distribuir videos o materiales del curso.',
                'Las violaciones de propiedad intelectual pueden resultar en la terminación de tu cuenta y acciones legales.'
            ]
        },
        {
            icon: FileText,
            title: '5. Conducta del Usuario',
            content: [
                'Debes mantener un comportamiento respetuoso hacia otros usuarios e instructores.',
                'No está permitido el acoso, discriminación o comportamiento ofensivo.',
                'No debes publicar contenido difamatorio, obsceno o ilegal.',
                'Está prohibido el spam, publicidad no autorizada o envío de mensajes masivos.',
                'Nos reservamos el derecho de suspender o terminar cuentas que violen estas reglas.',
                'Los instructores deben cumplir con estándares profesionales y de calidad.'
            ]
        },
        {
            icon: AlertCircle,
            title: '6. Limitación de Responsabilidad',
            content: [
                'Fagsol SAC no garantiza resultados específicos de aprendizaje o certificaciones.',
                'No somos responsables por interrupciones del servicio debido a mantenimiento o causas fuera de nuestro control.',
                'No garantizamos la disponibilidad continua o ininterrumpida de la plataforma.',
                'No somos responsables por pérdidas indirectas, incidentales o consecuentes.',
                'Nuestra responsabilidad total está limitada al monto pagado por el curso.',
                'El usuario es responsable de verificar que cumple con los requisitos técnicos para acceder a los cursos.'
            ]
        }
    ];

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <Header />

            <PageHero
                title="Términos y Condiciones"
                subtitle="Condiciones de Uso"
                description="Términos y condiciones que rigen el uso de Fagsol Academy y nuestros servicios educativos."
            />

            {/* Introducción */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert max-w-none">

                        <p className="text-gray-300 leading-relaxed mb-6">
                            Bienvenido a Fagsol Academy. Estos Términos y Condiciones establecen las reglas y regulaciones para el uso de
                            nuestra plataforma educativa y servicios relacionados. Al acceder y utilizar nuestros servicios, aceptas cumplir
                            con estos términos.
                        </p>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Por favor, lee estos términos cuidadosamente antes de utilizar nuestros servicios. Si no estás de acuerdo con alguna
                            parte de estos términos, te recomendamos que no utilices nuestra plataforma.
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

            {/* Resolución de Disputas */}
            <ContentSection>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
                        <span className="text-white">Resolución de </span>
                        <span className="bg-gradient-to-r from-primary-orange via-amber-500 to-primary-orange bg-clip-text text-transparent">
                            Disputas
                        </span>
                    </h2>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8">
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Cualquier disputa relacionada con estos términos o nuestros servicios será resuelta mediante arbitraje
                            de acuerdo con las leyes de Perú. Ambas partes acuerdan someterse a la jurisdicción exclusiva de los tribunales
                            de Arequipa, Perú.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Antes de iniciar cualquier procedimiento legal, te invitamos a contactarnos para intentar resolver cualquier
                            disputa de manera amigable.
                        </p>
                    </div>
                </div>
            </ContentSection>

            {/* Contacto */}
            <ContentSection background="gradient">
                <div className="text-center py-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                        ¿Tienes preguntas sobre estos términos?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Si tienes preguntas o necesitas aclaraciones sobre estos términos y condiciones, no dudes en contactarnos.
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

