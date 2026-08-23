import { z } from "zod";

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
] as const;

export type BillTo = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
};

export const billToSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  address: z.string().trim().min(3, "Street address is required."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().length(2, "Select a state."),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code."),
  country: z.string().optional(),
});

export function splitFullName(fullName?: string | null): Pick<BillTo, "firstName" | "lastName"> {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function validateBillTo(input: Partial<BillTo>): { ok: true; value: BillTo } | { ok: false; error: string } {
  const parsed = billToSchema.safeParse({
    ...input,
    country: input.country ?? "US",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Billing address is incomplete." };
  }
  return { ok: true, value: { ...parsed.data, country: parsed.data.country ?? "US" } };
}

export function formatBillToLabel(billTo: BillTo) {
  return `${billTo.address}, ${billTo.city}, ${billTo.state} ${billTo.zip}`;
}
