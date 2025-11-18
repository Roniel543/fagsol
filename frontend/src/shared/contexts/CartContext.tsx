'use client';

import { useCourses } from '@/shared/hooks/useCourses';
import { Course } from '@/shared/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

    // Obtener todos los cursos del backend para poder buscar detalles
    const { courses, isLoading: coursesLoading } = useCourses({ status: 'published' });

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
    // Ahora usa datos reales del backend en lugar de MOCK_COURSES
    const cartItemsWithDetails = useMemo((): CartItemWithDetails[] => {
        if (coursesLoading || !isLoaded) {
            return [];
        }

        return cartItems
            .map((item) => {
                const course = courses.find((c) => c.id === item.id);
                if (!course) {
                    console.warn(`⚠️ Course ${item.id} not found in backend courses`);
                    return null;
                }
                return { ...item, course };
            })
            .filter((item): item is CartItemWithDetails => item !== null);
    }, [cartItems, courses, coursesLoading, isLoaded]);

    // Limpiar items inválidos del carrito cuando se detecten
    useEffect(() => {
        if (!isLoaded || coursesLoading) return;

        const validItemIds = cartItemsWithDetails.map(item => item.id);
        const invalidItems = cartItems.filter(item => !validItemIds.includes(item.id));

        if (invalidItems.length > 0) {
            console.log(`🧹 Removing ${invalidItems.length} invalid items from cart`);
            setCartItems(validItemIds.map(id => cartItems.find(item => item.id === id)!));
        }
    }, [cartItemsWithDetails, cartItems, isLoaded, coursesLoading]);

    // Calcular total (MEMOIZADO)
    const total = useMemo(() => {
        return cartItemsWithDetails.reduce((sum, item) => {
            const price = item.course.discountPrice || item.course.price;
            return sum + price * item.qty;
        }, 0);
    }, [cartItemsWithDetails]);

    // Calcular cantidad de items (MEMOIZADO)
    // Usa cartItemsWithDetails para solo contar items válidos que existen en el backend
    const itemCount = useMemo(() => {
        return cartItemsWithDetails.length;
    }, [cartItemsWithDetails]);

    const value = {
        cartItems,
        cartItemsWithDetails,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        itemCount,
        isLoaded: isLoaded && !coursesLoading, // Considerar cargado solo cuando ambos están listos
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

