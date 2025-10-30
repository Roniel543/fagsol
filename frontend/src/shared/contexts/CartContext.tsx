'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Course } from '@/shared/types';
import { MOCK_COURSES } from '@/features/academy/services/catalog.mock';

export interface CartItem {
    id: string;
    qty: number;
}

export interface CartItemWithDetails extends CartItem {
    course: Course;
}

interface CartContextType {
    cartItems: CartItem[];
    cartItemsWithDetails: CartItemWithDetails[];
    addToCart: (courseId: string) => void;
    removeFromCart: (courseId: string) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar carrito desde localStorage al montar
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        setIsLoaded(true);
        console.log('🛒 Cart loaded from localStorage:', cart.length, 'items');
    }, []);

    // Sincronizar con localStorage cuando cambia el carrito
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
            window.dispatchEvent(new Event('cartUpdated'));
            console.log('🛒 Cart updated - Total items:', cartItems.length);
        }
    }, [cartItems, isLoaded]);

    // Agregar al carrito
    const addToCart = useCallback((courseId: string) => {
        console.log('➕ Adding to cart:', courseId);
        setCartItems((prev) => {
            const exists = prev.find((item) => item.id === courseId);
            if (exists) {
                console.log('⚠️ Item already in cart');
                return prev;
            }
            const newCart = [...prev, { id: courseId, qty: 1 }];
            console.log('✅ Item added. New cart size:', newCart.length);
            return newCart;
        });
    }, []);

    // Remover del carrito
    const removeFromCart = useCallback((courseId: string) => {
        console.log('➖ Removing from cart:', courseId);
        setCartItems((prev) => prev.filter((item) => item.id !== courseId));
    }, []);

    // Vaciar carrito
    const clearCart = useCallback(() => {
        console.log('🗑️ Clearing cart');
        setCartItems([]);
    }, []);

    // Obtener items con detalles completos (MEMOIZADO)
    const cartItemsWithDetails = useMemo((): CartItemWithDetails[] => {
        return cartItems
            .map((item) => {
                const course = MOCK_COURSES.find((c) => c.id === item.id);
                if (!course) return null;
                return { ...item, course };
            })
            .filter((item): item is CartItemWithDetails => item !== null);
    }, [cartItems]);

    // Calcular total (MEMOIZADO)
    const total = useMemo(() => {
        return cartItemsWithDetails.reduce((sum, item) => {
            const price = item.course.discountPrice || item.course.price;
            return sum + price * item.qty;
        }, 0);
    }, [cartItemsWithDetails]);

    // Calcular cantidad de items (MEMOIZADO)
    const itemCount = useMemo(() => {
        return cartItems.length;
    }, [cartItems]);

    const value = {
        cartItems,
        cartItemsWithDetails,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        itemCount,
        isLoaded,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
}

