"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";

function SignedInContextBar() {
  const { data, status } = useSession();
  if (status !== "authenticated" || !data?.user) return null;
  const label = data.user.name ?? data.user.email ?? "Member";
  return (
    <div className="border-b border-[#2e7d3228] bg-[#f0f9f0] px-4 py-2 text-center text-[11px] text-[#2e7d32] sm:text-xs">
      <span className="font-medium text-[#1b5e20]">Signed in</span>
      <span className="mx-1.5 text-[#6f6251]">—</span>
      <span className="text-[#3b3024]">{label}</span>
      <span className="mx-2 hidden text-[#c4c4c4] sm:inline">|</span>
      <Link href="/dashboard" className="text-[#1b5e20] underline decoration-[#2e7d3240] underline-offset-2 hover:decoration-[#1b5e20]">
        Dashboard
      </Link>
      <span className="mx-2 text-[#c4c4c4]">|</span>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="text-[#5f5344] underline decoration-[#b78d4b55] underline-offset-2 hover:text-[#3b3024]"
      >
        Sign out
      </button>
    </div>
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[var(--bg)]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <SignedInContextBar />
      <TrustBadges />
      <main className="flex-1 bg-[var(--bg)]">{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsAppButton />
    </>
  );
}
