'use client';

import { notFound, useParams } from 'next/navigation';
import { useMemo } from 'react';
import { CourseCard } from '../components/CourseCard';
import { getCourseDetailBySlug, MOCK_COURSES } from '../services/catalog.mock';

export default function CourseDetailPage() {
    // using next/navigation in client for simplicity (App Router)
    // fallback: this page is client-rendered with mock data
    const params = useParams<{ slug: string }>();
    const slug = params?.slug as string;

    const detail = useMemo(() => getCourseDetailBySlug(slug), [slug]);
    if (!detail) return notFound();

    const priceBlock = (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sticky top-6">
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-primary-orange">{detail.discountPrice ? `S/ ${detail.discountPrice}` : `S/ ${detail.price}`}</div>
                {detail.discountPrice && (
                    <div className="text-sm text-gray-400 line-through">S/ {detail.price}</div>
                )}
            </div>
            <button
                onClick={() => {
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    if (!cart.find((c: any) => c.id === detail.id)) cart.push({ id: detail.id, qty: 1 });
                    localStorage.setItem('cart', JSON.stringify(cart));
                    alert('Agregado al carrito');
                }}
                className="mt-4 w-full rounded-lg bg-primary-orange text-primary-black font-semibold py-3 hover:opacity-90"
            >
                Agregar al carrito
            </button>
            <div className="mt-3 text-xs text-gray-400">Acceso de por vida • Certificado • Actualizaciones incluidas</div>
        </div>
    );

    return (
        <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <span className="text-xs text-primary-orange font-semibold">{detail.category} • {detail.provider === 'fagsol' ? 'Fagsol' : 'Instructor'}</span>
                        <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold">{detail.title}</h1>
                        <p className="mt-2 text-gray-300">{detail.description}</p>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="font-semibold">Qué aprenderás</h2>
                                <ul className="mt-2 list-disc list-inside text-gray-300 text-sm space-y-1">
                                    {detail.objectives.map((o, i) => (
                                        <li key={i}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h2 className="font-semibold">Requisitos</h2>
                                <ul className="mt-2 list-disc list-inside text-gray-300 text-sm space-y-1">
                                    {detail.requirements.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="font-semibold">Contenido del curso</h2>
                            <div className="mt-3 space-y-3">
                                {detail.sections.map((section, si) => (
                                    <div key={si} className="rounded-lg border border-zinc-800">
                                        <div className="px-4 py-3 bg-zinc-900/60 font-medium">{section.title}</div>
                                        <ul className="p-4 space-y-2">
                                            {section.lessons.map((l, li) => (
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
    );
}


