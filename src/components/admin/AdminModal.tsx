"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type AdminModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

export function AdminModal({ open, title, eyebrow, description, onClose, children, footer, wide }: AdminModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-[#1f1a15]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#e4d5bc] bg-[#fffcf8] shadow-[0_24px_80px_rgba(31,26,21,0.28)] sm:rounded-2xl ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#efe4d4] px-5 py-4 sm:px-6">
          <div>
            {eyebrow ? (
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8f6f3e]">{eyebrow}</p>
            ) : null}
            <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-[#6f6251]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d5bc] text-[#6f6251] transition hover:bg-[#fff6e8]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efe4d4] bg-[#fffcf8] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
