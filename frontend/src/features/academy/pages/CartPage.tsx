'use client';

import { Footer, useToast, CoursePlaceholder, MultiCurrencyPrice } from '@/shared/components';
import { AcademyHeader } from '../components/AcademyHeader';
import { useCart } from '@/shared/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

export default function CartPage() {
    const { cartItemsWithDetails, removeFromCart, clearCart, total, itemCount } = useCart();
    const { showToast } = useToast();

    // Calcular total en USD para mostrar con MultiCurrencyPrice
    const totalUsd = useMemo(() => {
        return cartItemsWithDetails.reduce((sum, item) => {
            const priceUsd = item.course.price_usd || item.course.price / 3.75;
            const discountPriceUsd = item.course.discountPrice 
                ? (item.course.price_usd || item.course.discountPrice / 3.75)
                : priceUsd;
            return sum + discountPriceUsd * item.qty;
        }, 0);
    }, [cartItemsWithDetails]);

    // Calcular descuento total en USD
    const discountTotalUsd = useMemo(() => {
        return cartItemsWithDetails.reduce((sum, item) => {
            if (item.course.discountPrice) {
                const priceUsd = item.course.price_usd || item.course.price / 3.75;
                const discountPriceUsd = item.course.price_usd || item.course.discountPrice / 3.75;
                return sum + (priceUsd - discountPriceUsd) * item.qty;
            }
            return sum;
        }, 0);
    }, [cartItemsWithDetails]);

    const handleRemove = (courseId: string, courseTitle: string) => {
        removeFromCart(courseId);
        showToast(`"${courseTitle}" eliminado del carrito`, 'info');
    };

    const handleClearCart = () => {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            clearCart();
            showToast('Carrito vaciado', 'info');
        }
    };

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8 text-primary-orange" />
                            Mi Carrito
                        </h1>
                        <p className="mt-1 text-gray-400">
                            {itemCount === 0 
                                ? 'No hay cursos en tu carrito' 
                                : `${itemCount} ${itemCount === 1 ? 'curso' : 'cursos'} en tu carrito`
                            }
                        </p>
                    </div>
                    <Link
                        href="/academy/catalog"
                        className="flex items-center gap-2 text-primary-orange hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Seguir comprando
                    </Link>
                </div>

                {cartItemsWithDetails.length === 0 ? (
                    /* Carrito vacío */
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
                        <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
                        <p className="text-gray-400 mb-6">
                            Explora nuestro catálogo y encuentra los cursos perfectos para ti
                        </p>
                        <Link
                            href="/academy/catalog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-orange text-primary-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Explorar cursos
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    /* Carrito con items */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItemsWithDetails.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        <Link
                                            href={`/academy/course/${item.course.slug}`}
                                            className="relative w-32 h-24 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0"
                                        >
                                            {item.course.thumbnailUrl ? (
                                                <Image
                                                    src={item.course.thumbnailUrl}
                                                    alt={item.course.title}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <CoursePlaceholder size="default" />
                                            )}
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <Link
                                                        href={`/academy/course/${item.course.slug}`}
                                                        className="font-semibold text-primary-white hover:text-primary-orange transition-colors"
                                                    >
                                                        {item.course.title}
                                                    </Link>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="px-2 py-0.5 rounded-full border border-zinc-700">
                                                            {item.course.category}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{item.course.hours}h</span>
                                                        <span>•</span>
                                                        <span>{item.course.lessons} lecciones</span>
                                                    </div>
                                                    {item.course.instructor && (
                                                        <p className="mt-1 text-sm text-gray-400">
                                                            Por {item.course.instructor.name}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Precio */}
                                                <div className="text-right">
                                                    <MultiCurrencyPrice
                                                        priceUsd={item.course.price_usd || (item.course.discountPrice || item.course.price) / 3.75}
                                                        pricePen={item.course.discountPrice || item.course.price}
                                                        size="lg"
                                                        showUsd={true}
                                                    />
                                                    {item.course.discountPrice && (
                                                        <div className="text-sm text-gray-500 line-through mt-1">
                                                            <MultiCurrencyPrice
                                                                priceUsd={item.course.price_usd || item.course.price / 3.75}
                                                                pricePen={item.course.price}
                                                                size="sm"
                                                                showUsd={false}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="mt-3 flex items-center gap-3">
                                                <button
                                                    onClick={() => handleRemove(item.id, item.course.title)}
                                                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Botón vaciar carrito */}
                            {itemCount > 1 && (
                                <button
                                    onClick={handleClearCart}
                                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Vaciar carrito
                                </button>
                            )}
                        </div>

                        {/* Resumen */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sticky top-6">
                                <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>Subtotal ({itemCount} {itemCount === 1 ? 'curso' : 'cursos'})</span>
                                        <div className="text-right">
                                            <MultiCurrencyPrice
                                                priceUsd={totalUsd}
                                                pricePen={total}
                                                size="sm"
                                                showUsd={false}
                                            />
                                        </div>
                                    </div>
                                    {discountTotalUsd > 0 && (
                                        <div className="flex justify-between items-center text-gray-400">
                                            <span>Descuento</span>
                                            <span className="text-green-500">
                                                - <MultiCurrencyPrice
                                                    priceUsd={discountTotalUsd}
                                                    pricePen={cartItemsWithDetails.reduce((sum, item) => {
                                                        if (item.course.discountPrice) {
                                                            return sum + (item.course.price - item.course.discountPrice) * item.qty;
                                                        }
                                                        return sum;
                                                    }, 0)}
                                                    size="sm"
                                                    showUsd={false}
                                                />
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-zinc-800 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold">Total</span>
                                            <div className="text-right">
                                                <MultiCurrencyPrice
                                                    priceUsd={totalUsd}
                                                    pricePen={total}
                                                    size="lg"
                                                    showUsd={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/academy/checkout"
                                    className="block w-full rounded-lg bg-primary-orange text-primary-black font-semibold py-3 text-center hover:opacity-90 hover:scale-105 transition-all"
                                >
                                    Proceder al pago
                                </Link>

                                <div className="mt-4 text-xs text-gray-400 space-y-1">
                                    <p>✓ Acceso de por vida</p>
                                    <p>✓ Certificado de finalización</p>
                                    <p>✓ Actualizaciones incluidas</p>
                                    <p>✓ Soporte del instructor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>

                <Footer />
            </main>
        </>
    );
}

