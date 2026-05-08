"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/providers/cart-provider";

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
