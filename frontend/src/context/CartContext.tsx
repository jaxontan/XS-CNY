'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/api';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bakkwa-cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                localStorage.removeItem('bakkwa-cart');
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('bakkwa-cart', JSON.stringify(items));
    }, [items]);

    // PF-001 FIX: Get current quantity for a product
    const getItemQuantity = (productId: string): number => {
        const item = items.find(i => i.product.$id === productId);
        return item ? item.quantity : 0;
    };

    // PF-001 FIX: Add stock validation
    const addItem = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.$id === product.$id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = Math.min(currentQty + quantity, product.stock); // Cap at stock

            if (existing) {
                return prev.map(item =>
                    item.product.$id === product.$id
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
        });
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.$id !== productId));
    };

    // PF-002 FIX: Validate quantity against stock
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev =>
            prev.map(item => {
                if (item.product.$id === productId) {
                    // Cap quantity at stock
                    const maxQty = Math.min(quantity, item.product.stock);
                    return { ...item, quantity: maxQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => setItems([]);

    const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            total,
            itemCount,
            getItemQuantity,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
