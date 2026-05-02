import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageAnalyticsTracker } from "@/components/analytics/page-analytics-tracker";
import { buildSeoMetadata } from "@/lib/seo/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "KIAN Privé",
    description: "Premium concierge wellness for discerning clients and practitioners.",
    canonicalPath: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)]">
        <AppSessionProvider>
          <PageAnalyticsTracker />
          <Navbar />
          <TrustBadges />
          <main className="flex-1 bg-[var(--bg)]">{children}</main>
          <Footer />
          <CartDrawer />
        </AppSessionProvider>
      </body>
    </html>
  );
}
