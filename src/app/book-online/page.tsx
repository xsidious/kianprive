import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOnlineWizard } from "@/components/booking/BookOnlineWizard";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Book Online",
  description:
    "Reserve a KIAN Privé consultation or treatment — concierge wellness booking for Miami and North Miami Beach.",
  canonicalPath: "/book-online",
});

export default function BookOnlinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#fffaf2] to-[#f4efe6]">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#e8dcc8] border-t-[#b78d4b]" />
          <p className="text-lg text-[#6f6251]">Preparing your booking experience…</p>
        </div>
      }
    >
      <BookOnlineWizard />
    </Suspense>
  );
}
