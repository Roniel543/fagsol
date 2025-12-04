'use client';

import { Badge, useToast } from '@/shared/components';
import { ContactFormData, sendContactMessage } from '@/shared/services/contact';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactSection() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'name':
                if (value.trim().length < 3) {
                    return 'El nombre debe tener al menos 3 caracteres';
                }
                return '';
            case 'phone':
                if (!/^\+?[\d\s-]{9,}$/.test(value)) {
                    return 'Ingrese un teléfono válido';
                }
                return '';
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Ingrese un email válido';
                }
                return '';
            case 'message':
                if (value.trim().length < 10) {
                    return 'El mensaje debe tener al menos 10 caracteres';
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validar en tiempo real
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar todos los campos
        const newErrors = {
            name: validateField('name', formData.name),
            phone: validateField('phone', formData.phone),
            email: validateField('email', formData.email),
            message: validateField('message', formData.message)
        };

        setErrors(newErrors);

        // Si hay errores, no enviar
        if (Object.values(newErrors).some(error => error !== '')) {
            return;
        }

        setIsSubmitting(true);
        setErrors({}); // Limpiar errores previos

        try {
            // Enviar mensaje al backend
            const response = await sendContactMessage(formData);

            if (response.success) {
                // Éxito
                setIsSuccess(true);
                setFormData({ name: '', phone: '', email: '', message: '' });
                showToast('Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.', 'success');

                // Resetear success después de 5 segundos
                setTimeout(() => setIsSuccess(false), 5000);
            } else {
                // Errores del backend
                if (response.errors) {
                    setErrors(response.errors);
                    showToast('Por favor, corrige los errores en el formulario.', 'error');
                } else {
                    showToast(response.message || 'Error al enviar el mensaje. Por favor, inténtalo más tarde.', 'error');
                }
            }
        } catch (error: any) {
            // Error de red o del servidor
            console.error('Error al enviar mensaje de contacto:', error);

            // El error puede venir de diferentes formas
            if (error?.message?.includes('429') || error?.status === 429) {
                showToast('Has enviado demasiados mensajes. Por favor, espera un momento antes de intentar nuevamente.', 'error');
            } else if (error?.message) {
                showToast(error.message, 'error');
            } else {
                showToast('Error al enviar el mensaje. Por favor, inténtalo más tarde.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Dirección',
            details: ['Av. Polinesia 1234', 'Arequipa, Perú 04001']
        },
        {
            icon: Phone,
            title: 'Teléfono',
            details: ['+51 1 234 5678', '+51 954 885 777']
        },
        {
            icon: Mail,
            title: 'Email',
            details: ['dev.fagsol.sac@gmail.com', 'atencion@gmail.com']
        },
        {
            icon: Clock,
            title: 'Horarios',
            details: ['Lunes - Viernes: 8:00 AM - 16:00 PM', 'Sábados: 8:00 AM - 1:00 PM']
        }
    ];

    return (
        <section id="contacto" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="warning" className="mb-4">
                        Estamos Listos para Ayudarte
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-primary-white">Contáctanos</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
                        Estamos listos para ayudarte con tu próximo proyecto. Contáctanos y
                        recibe una solución personalizada.
                    </p>
                </div>

                {/* Formulario y Info de Contacto */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Formulario */}
                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-xl animate-fade-in">
                        <h3 className="text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h3>

                        {isSuccess && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-green-400 font-semibold text-sm">¡Mensaje enviado con éxito!</p>
                                    <p className="text-green-300/70 text-xs mt-1">Nos pondremos en contacto contigo pronto.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nombre Completo */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-black/50 border ${errors.name ? 'border-red-500/50' : 'border-zinc-700'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-300`}
                                    placeholder="Tu nombre completo"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-black/50 border ${errors.phone ? 'border-red-500/50' : 'border-zinc-700'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-300`}
                                    placeholder="+51 999 999 999"
                                />
                                {errors.phone && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>
                                )}
                            </div>

                            {/* Correo Electrónico */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-black/50 border ${errors.email ? 'border-red-500/50' : 'border-zinc-700'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-300`}
                                    placeholder="tu@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className={`w-full px-4 py-3 bg-black/50 border ${errors.message ? 'border-red-500/50' : 'border-zinc-700'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-300 resize-none`}
                                    placeholder="Cuéntanos sobre tu proyecto..."
                                />
                                {errors.message && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                                )}
                            </div>

                            {/* Botón Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-orange to-amber-600 hover:from-amber-600 hover:to-primary-orange text-white font-semibold text-base rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        <span>Enviar Mensaje</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <div
                                    key={index}
                                    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-primary-orange/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/20"
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-orange/10 text-primary-orange group-hover:bg-primary-orange group-hover:text-white transition-all duration-300">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary-orange transition-colors">
                                                {info.title}
                                            </h4>
                                            {info.details.map((detail, idx) => (
                                                <p key={idx} className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    {detail}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* CTA adicional */}
                        <div className="bg-gradient-to-br from-primary-orange/10 via-amber-500/10 to-primary-orange/10 rounded-xl p-6 border border-primary-orange/30">
                            <h4 className="text-lg font-bold text-white mb-2">¿Necesitas Ayuda Inmediata?</h4>
                            <p className="text-sm text-gray-300 mb-4">
                                Nuestro equipo está disponible para responder tus preguntas en tiempo real.
                            </p>
                            <a
                                href="https://wa.me/51954885777"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-600/40"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                <span>Chatear por WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

