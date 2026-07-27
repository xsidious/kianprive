export const adminShell =
  "min-h-screen bg-[linear-gradient(180deg,#f7f2e8_0%,#f3ebe0_45%,#efe6d8_100%)]";

export const adminEyebrow = "text-[10px] font-medium uppercase tracking-[0.22em] text-[#8f6f3e]";

export const adminTitle = "mt-1 font-serif text-3xl text-[#1f1a15] md:text-4xl";

export const adminMuted = "mt-2 max-w-2xl text-sm leading-relaxed text-[#6f6251]";

export const adminPanel =
  "rounded-sm border border-[#d9c7a866] bg-white/90 shadow-[0_10px_30px_rgba(47,36,22,0.04)]";

export const adminStat =
  "rounded-sm border border-[#d9c7a866] bg-white/90 p-4 shadow-[0_8px_24px_rgba(47,36,22,0.03)]";

export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-sm bg-[#8a682e] px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#735624]";

export const adminBtnGhost =
  "inline-flex items-center justify-center rounded-sm border border-[#b6a185] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#6f5a3a] transition hover:bg-[#fff8ef]";

export const adminInput =
  "w-full rounded-sm border border-[#d9c7a8] bg-[#fffdf9] px-3 py-2 text-sm text-[#2b2218] outline-none focus:border-[#8a682e]";

export const adminSelect =
  "rounded-sm border border-[#d9c7a8] bg-[#fffdf9] px-2 py-1.5 text-xs text-[#2b2218] outline-none focus:border-[#8a682e]";

export function statusTone(status: string) {
  const key = status.toUpperCase();
  if (key.includes("APPROVED") || key.includes("ACTIVE") || key.includes("PAID") || key.includes("COMPLETED")) {
    return "bg-[#e8f4ea] text-[#2f6b3a]";
  }
  if (key.includes("DECLINED") || key.includes("SUSPENDED") || key.includes("CANCELED")) {
    return "bg-[#f8e8e8] text-[#8a3a3a]";
  }
  if (key.includes("FOLLOW") || key.includes("PENDING") || key.includes("INVITED")) {
    return "bg-[#fff4e2] text-[#8a682e]";
  }
  return "bg-[#f3eee6] text-[#6f6251]";
}
