import { Role, SubscriptionStatus } from "@prisma/client";
import {
  canAccessAdmin,
  canAccessAmbassadorPortal,
  canAccessPartnerPortal,
  canAccessProviderPortal,
} from "@/lib/rbac";

export type PricingViewer = {
  id?: string;
  role?: Role | string | null;
  subscriptionStatus?: string | null;
} | null | undefined;

/** Approved members and staff can see service and shop pricing on the public site. */
export function canViewServicePrices(viewer?: PricingViewer): boolean {
  if (!viewer?.id) return false;

  const role = viewer.role;
  if (
    canAccessAdmin(role as Role) ||
    canAccessPartnerPortal(role as Role) ||
    canAccessProviderPortal(role as Role) ||
    canAccessAmbassadorPortal(role as Role)
  ) {
    return true;
  }

  if (role === Role.MEMBER || role === "MEMBER") {
    return (
      viewer.subscriptionStatus === SubscriptionStatus.ACTIVE ||
      viewer.subscriptionStatus === "ACTIVE"
    );
  }

  return false;
}

export function memberPricingGateCopy(viewer?: PricingViewer) {
  if (!viewer?.id) {
    return {
      title: "Member pricing",
      description:
        "Service and product pricing is reserved for approved members. Sign in after your account is activated to view rates.",
      primaryHref: "/login",
      primaryLabel: "Sign in",
      secondaryHref: "/signup",
      secondaryLabel: "Apply for membership",
    };
  }

  return {
    title: "Approval required",
    description:
      "Your account is signed in, but pricing unlocks after consultation, onboarding, and membership approval.",
    primaryHref: "/signup",
    primaryLabel: "View onboarding steps",
    secondaryHref: "/pricing",
    secondaryLabel: "Membership info",
  };
}

/** Short inline label when a price would appear for guests. */
export const MEMBER_PRICING_LABEL = "Member pricing after approval";

const DOLLAR_AMOUNT =
  /\(\$[\d,]+(?:\.\d{2})?\)|\$[\d,]+(?:\.\d{2})?(?:\/(?:mo|month|session))?|\bfrom\s+\$[\d,]+(?:\.\d{2})?/gi;

/** Remove visible dollar amounts from marketing copy when pricing is gated. */
export function redactPricesFromText(text: string): string {
  return text
    .replace(DOLLAR_AMOUNT, "")
    .replace(/\(\s*save\s*\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/\s+—\s+—/g, " — ")
    .trim();
}

export function redactPricesFromLines(lines: string[]): string[] {
  return lines.map(redactPricesFromText).filter(Boolean);
}
