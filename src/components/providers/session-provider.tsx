"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/providers/cart-provider";

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
