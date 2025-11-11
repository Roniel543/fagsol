'use client';

import { Footer, SafeHTML, useToast } from '@/shared/components';
import { useCart } from '@/shared/contexts/CartContext';
import { notFound, useParams } from 'next/navigation';
import { useMemo } from 'react';
import { AcademyHeader } from '../components/AcademyHeader';
import { CourseCard } from '../components/CourseCard';
import { CourseSection, getCourseDetailBySlug, MOCK_COURSES } from '../services/catalog.mock';

export default function CourseDetailPage() {
    // using next/navigation in client for simplicity (App Router)
    // fallback: this page is client-rendered with mock data
    const params = useParams<{ slug: string }>();
    const slug = params?.slug as string;
    const { showToast } = useToast();
    const { addToCart, cartItems } = useCart();

    const detail = useMemo(() => getCourseDetailBySlug(slug), [slug]);

    // Verificar si el curso ya está en el carrito (se actualiza automáticamente con cartItems)
    // Debe estar antes del return condicional para cumplir las reglas de hooks
    const isInCart = useMemo(() => {
        if (!detail) return false;
        return cartItems.some((item) => item.id === detail.id);
    }, [cartItems, detail]);

    if (!detail) return notFound();

    const handleAddToCart = () => {
        // Validar si ya está en el carrito
        if (isInCart) {
            showToast('Este curso ya está en tu carrito', 'info');
            return;
        }

        // Agregar al carrito usando el hook (esto dispara el evento automáticamente)
        addToCart(detail.id);
        showToast('¡Curso agregado al carrito!', 'cart');
    };

    const priceBlock = (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sticky top-6">
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-primary-orange">{detail.discountPrice ? `S/ ${detail.discountPrice}` : `S/ ${detail.price}`}</div>
                {detail.discountPrice && (
                    <div className="text-sm text-gray-400 line-through">S/ {detail.price}</div>
                )}
            </div>
            <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`mt-4 w-full rounded-lg font-semibold py-3 transition-all ${isInCart
                    ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-orange text-primary-black hover:opacity-90 hover:scale-105'
                    }`}
            >
                {isInCart ? '✓ Ya está en el carrito' : 'Agregar al carrito'}
            </button>
            <div className="mt-3 text-xs text-gray-400">Acceso de por vida • Certificado • Actualizaciones incluidas</div>
        </div>
    );

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <span className="text-xs text-primary-orange font-semibold">{detail.category} • {detail.provider === 'fagsol' ? 'Fagsol' : 'Instructor'}</span>
                            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold">{detail.title}</h1>
                            <SafeHTML html={detail.description} className="mt-2 text-gray-300" tag="div" />

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h2 className="font-semibold">Qué aprenderás</h2>
                                    <ul className="mt-2 list-disc list-inside text-gray-300 text-sm space-y-1">
                                        {detail.objectives.map((o: string, i: number) => (
                                            <li key={i}>{o}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="font-semibold">Requisitos</h2>
                                    <ul className="mt-2 list-disc list-inside text-gray-300 text-sm space-y-1">
                                        {detail.requirements.map((r: string, i: number) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="font-semibold">Contenido del curso</h2>
                                <div className="mt-3 space-y-3">
                                    {detail.sections.map((section: CourseSection, si: number) => (
                                        <div key={si} className="rounded-lg border border-zinc-800">
                                            <div className="px-4 py-3 bg-zinc-900/60 font-medium">{section.title}</div>
                                            <ul className="p-4 space-y-2">
                                                {section.lessons.map((l: { title: string; durationMin: number; preview?: boolean }, li: number) => (
                                                    <li key={li} className="flex items-center justify-between text-sm text-gray-300">
                                                        <span>
                                                            {l.title} {l.preview && <span className="ml-2 text-xs text-primary-orange">Preview</span>}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{l.durationMin} min</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>{priceBlock}</div>
                    </div>

                    <div className="mt-12">
                        <h3 className="text-lg font-bold">Otros cursos recomendados</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {MOCK_COURSES.filter(c => c.id !== detail.id).slice(0, 3).map(c => (
                                <CourseCard key={c.id} course={c} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}


