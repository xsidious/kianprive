"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
};

type AddCartItem = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "kianprive_cart";
const STORAGE_CART_ID_KEY = "kianprive_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  async function syncCartItem(input: {
    productId: string;
    quantity: number;
  }) {
    try {
      const cartId = localStorage.getItem(STORAGE_CART_ID_KEY);
      const response = await fetch("/api/commerce/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          productId: input.productId,
          quantity: input.quantity,
        }),
      });
      const payload = (await response.json()) as { cart?: { id?: string } };
      if (payload.cart?.id) {
        localStorage.setItem(STORAGE_CART_ID_KEY, payload.cart.id);
      }
    } catch {
      // Keep client cart available even if backend sync fails.
    }
  }

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      isOpen,
      hydrated,
      itemCount,
      subtotal,
      addItem: (item) => {
        void syncCartItem({ productId: item.id, quantity: 1 });
        setItems((prev) => {
          const existing = prev.find((p) => p.id === item.id);
          if (existing) {
            return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
          }
          return [...prev, { ...item, quantity: 1 }];
        });
      },
      removeItem: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          return;
        }
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
      },
      clearCart: () => setItems([]),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev),
    };
  }, [hydrated, isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
