'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/features/academy/hooks/useCart';
import { CoursePlaceholder } from './CoursePlaceholder';

export function MiniCart() {
    const { cartItemsWithDetails, removeFromCart, total, itemCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Listener adicional para asegurar sincronización (por si acaso)
    useEffect(() => {
        const handleCartUpdate = () => {
            console.log('🔔 MiniCart: cartUpdated event received');
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    // Debug: Log cuando itemCount cambia
    useEffect(() => {
        console.log('🔢 MiniCart: itemCount updated to', itemCount);
    }, [itemCount]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div 
            className="relative" 
            ref={dropdownRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Botón del carrito */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-300 hover:text-primary-orange hover:bg-zinc-900 transition-all duration-300"
                aria-label="Carrito de compras"
            >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-orange text-primary-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Dropdown del mini-cart - se abre con hover o click */}
            {(isOpen || isHovered) && (
                <div className="absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)] bg-zinc-950 border-2 border-zinc-800 rounded-xl shadow-2xl shadow-black/70 overflow-hidden animate-slide-down z-[9999]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                        <h3 className="font-semibold text-primary-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Mi Carrito ({itemCount})
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-zinc-800 rounded transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="max-h-96 overflow-y-auto">
                        {cartItemsWithDetails.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Tu carrito está vacío</p>
                                <Link
                                    href="/academy/catalog"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-block mt-4 text-sm text-primary-orange hover:underline"
                                >
                                    Explorar cursos →
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {cartItemsWithDetails.map((item) => (
                                    <div key={item.id} className="px-4 py-3 hover:bg-zinc-900/40 transition-colors group">
                                        <div className="flex gap-3">
                                            {/* Thumbnail */}
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                                {item.course.thumbnailUrl ? (
                                                    <Image
                                                        src={item.course.thumbnailUrl}
                                                        alt={item.course.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <CoursePlaceholder size="small" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/academy/course/${item.course.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-sm font-medium text-primary-white hover:text-primary-orange transition-colors line-clamp-2"
                                                >
                                                    {item.course.title}
                                                </Link>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-primary-orange">
                                                        S/ {item.course.discountPrice || item.course.price}
                                                    </span>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                                                        aria-label="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItemsWithDetails.length > 0 && (
                        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/60">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">Total:</span>
                                <span className="text-xl font-bold text-primary-orange">S/ {total.toFixed(2)}</span>
                            </div>
                            <Link
                                href="/academy/cart"
                                onClick={() => setIsOpen(false)}
                                className="block w-full rounded-lg bg-primary-orange text-primary-black font-semibold py-3 text-center hover:opacity-90 transition-opacity"
                            >
                                Ver carrito completo
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MiniCart;

