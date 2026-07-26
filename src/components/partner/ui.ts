/** Shared partner portal UI class helpers — cream/espresso editorial chrome. */
export const partnerPanel = "border border-[#e4d9c8] bg-white";
export const partnerInput =
  "mt-1 w-full rounded-sm border border-[#e4d9c8] bg-[#fffaf4] px-3 py-2.5 text-sm text-[#1f1a15] outline-none focus:border-[#b78d4b]";
export const partnerBtnPrimary =
  "rounded-sm bg-[#b78d4b] px-3 py-2 text-sm text-white transition hover:bg-[#a07a3f] disabled:opacity-50";
export const partnerBtnGhost =
  "rounded-sm border border-[#b78d4b70] bg-white px-3 py-2 text-sm text-[#4f4335] transition hover:bg-[#fff6e8] disabled:opacity-50";
export const partnerBtnDanger =
  "rounded-sm border border-[#d07b7b80] bg-white px-3 py-2 text-sm text-[#7c2c2c] transition hover:bg-[#fff5f5] disabled:opacity-50";
export const partnerEyebrow = "text-xs tracking-[0.22em] text-[#b78d4b]";
export const partnerTitle = "mt-2 font-serif text-4xl text-[#1f1a15]";
export const partnerMuted = "mt-2 text-[#6f6251]";

export function money(value: number | string | null | undefined) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(value: string) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
