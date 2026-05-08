"use client";

import { MessageCircleMore } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/contact";

export function FloatingWhatsAppButton() {
  const href = buildWhatsAppUrl("Hi KIAN Privé team, I have a question about my services.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with KIAN Privé on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[#25d36680] bg-[#25d366] px-4 py-3 text-sm font-medium text-white shadow-[0_20px_45px_-24px_rgba(0,0,0,0.45)]"
    >
      <MessageCircleMore size={17} />
      <span className="hidden sm:inline">WhatsApp Concierge</span>
    </a>
  );
}
