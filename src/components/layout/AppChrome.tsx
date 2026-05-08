"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[var(--bg)]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <TrustBadges />
      <main className="flex-1 bg-[var(--bg)]">{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsAppButton />
    </>
  );
}
