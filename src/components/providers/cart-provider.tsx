"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { calculateShipping } from "@/lib/commerce/shipping";

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
  shipping: number;
  total: number;
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
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const syncCartToServer = useCallback(async (nextItems: CartItem[]) => {
    try {
      const cartId = localStorage.getItem(STORAGE_CART_ID_KEY);
      const response = await fetch("/api/commerce/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          items: nextItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as { cart?: { id?: string } };
      if (payload.cart?.id) {
        localStorage.setItem(STORAGE_CART_ID_KEY, payload.cart.id);
      }
    } catch {
      // Client cart remains usable if sync fails.
    }
  }, []);

  const scheduleSync = useCallback(
    (nextItems: CartItem[]) => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        void syncCartToServer(nextItems);
      }, 250);
    },
    [syncCartToServer],
  );

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    return {
      items,
      isOpen,
      hydrated,
      itemCount,
      subtotal,
      shipping,
      total,
      addItem: (item) => {
        setItems((prev) => {
          const existing = prev.find((p) => p.id === item.id);
          const next = existing
            ? prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p))
            : [...prev, { ...item, quantity: 1 }];
          scheduleSync(next);
          return next;
        });
      },
      removeItem: (id) => {
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== id);
          scheduleSync(next);
          return next;
        });
      },
      updateQuantity: (id, quantity) => {
        setItems((prev) => {
          const next =
            quantity <= 0
              ? prev.filter((item) => item.id !== id)
              : prev.map((item) => (item.id === id ? { ...item, quantity } : item));
          scheduleSync(next);
          return next;
        });
      },
      clearCart: () => {
        localStorage.removeItem(STORAGE_CART_ID_KEY);
        setItems([]);
        scheduleSync([]);
      },
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev),
    };
  }, [hydrated, isOpen, items, scheduleSync]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
