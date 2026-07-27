export const adminShell =
  "min-h-screen bg-[radial-gradient(ellipse_at_top,#fff9f0_0%,#f4ebe0_45%,#ebe1d4_100%)]";

export const adminEyebrow = "text-[10px] font-medium uppercase tracking-[0.22em] text-[#8f6f3e]";

export const adminTitle = "mt-1 font-serif text-3xl text-[#1f1a15] md:text-[2.5rem] md:leading-tight";

export const adminMuted = "mt-2 max-w-2xl text-sm leading-relaxed text-[#6f6251]";

export const adminPanel =
  "rounded-2xl border border-[#e5d7c2]/90 bg-white/90 shadow-[0_12px_40px_rgba(47,36,22,0.05)] backdrop-blur-sm";

export const adminStat =
  "rounded-2xl border border-[#e5d7c2]/90 bg-white/90 p-5 shadow-[0_10px_30px_rgba(47,36,22,0.04)]";

export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-full bg-[#8a682e] px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#735624] disabled:opacity-50";

export const adminBtnGhost =
  "inline-flex items-center justify-center rounded-full border border-[#cbb58f] bg-white/80 px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-[#6f5a3a] transition hover:bg-[#fff8ef] disabled:opacity-50";

export const adminBtnSoft =
  "inline-flex items-center justify-center rounded-full bg-[#fff4e4] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#8a682e] transition hover:bg-[#ffe9c8]";

export const adminInput =
  "w-full rounded-xl border border-[#e0d0b8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#2b2218] outline-none transition focus:border-[#8a682e] focus:ring-2 focus:ring-[#8a682e22]";

export const adminSelect =
  "rounded-xl border border-[#e0d0b8] bg-[#fffdf9] px-3 py-2 text-xs text-[#2b2218] outline-none focus:border-[#8a682e]";

export const adminTextarea =
  "w-full min-h-[96px] rounded-xl border border-[#e0d0b8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#2b2218] outline-none transition focus:border-[#8a682e] focus:ring-2 focus:ring-[#8a682e22]";

export function statusTone(status: string) {
  const key = status.toUpperCase();
  if (key.includes("APPROVED") || key.includes("ACTIVE") || key.includes("PAID") || key.includes("COMPLETED") || key.includes("FULFILLED") || key.includes("DELIVERED")) {
    return "bg-[#e8f4ea] text-[#2f6b3a]";
  }
  if (key.includes("DECLINED") || key.includes("SUSPENDED") || key.includes("CANCELED") || key.includes("FAILED") || key.includes("REFUNDED")) {
    return "bg-[#f8e8e8] text-[#8a3a3a]";
  }
  if (key.includes("FOLLOW") || key.includes("PENDING") || key.includes("INVITED") || key.includes("PROCESSING") || key.includes("DRAFT")) {
    return "bg-[#fff4e2] text-[#8a682e]";
  }
  return "bg-[#f3eee6] text-[#6f6251]";
}

export function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
