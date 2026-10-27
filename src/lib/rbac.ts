import { Role } from "@prisma/client";

export type PortalKind = "partner" | "ambassador" | "practitioner";

const adminRoles = new Set<Role>([Role.ADMIN, Role.OPERATIONS, Role.EDITOR]);

export function canAccessAdmin(role?: Role | string | null) {
  if (!role) return false;
  return adminRoles.has(role as Role);
}

/** Partner portal: primary PARTNER role or an attached partner network profile. */
export function canAccessPartnerPortal(
  role?: Role | string | null,
  portals?: PortalKind[] | null,
) {
  if (role === Role.PARTNER || role === "PARTNER" || role === Role.ADMIN || role === "ADMIN") {
    return true;
  }
  // Legacy: ambassador/provider roles were also allowed into /partner (then redirected).
  if (role === Role.AMBASSADOR || role === "AMBASSADOR" || role === Role.PROVIDER || role === "PROVIDER") {
    return true;
  }
  return Boolean(portals?.includes("partner"));
}

export function canAccessAmbassadorPortal(
  role?: Role | string | null,
  portals?: PortalKind[] | null,
) {
  if (role === Role.AMBASSADOR || role === "AMBASSADOR" || role === Role.ADMIN || role === "ADMIN") {
    return true;
  }
  return Boolean(portals?.includes("ambassador"));
}

/** Practitioner portal: PROVIDER role or an attached practitioner network profile. */
export function canAccessProviderPortal(
  role?: Role | string | null,
  portals?: PortalKind[] | null,
) {
  if (role === Role.PROVIDER || role === "PROVIDER" || role === Role.ADMIN || role === "ADMIN") {
    return true;
  }
  return Boolean(portals?.includes("practitioner"));
}

/** Member dashboard: members/guests, or any staff who also shop as a patient. */
export function canAccessMemberDashboard(
  role?: Role | string | null,
  portals?: PortalKind[] | null,
) {
  if (!role && !portals?.length) return false;
  if (canAccessAdmin(role)) return false;
  if (role === Role.MEMBER || role === "MEMBER" || role === Role.GUEST || role === "GUEST") {
    return true;
  }
  // Providers / partners / ambassadors may also keep a personal member dashboard.
  if (
    role === Role.PROVIDER ||
    role === "PROVIDER" ||
    role === Role.PARTNER ||
    role === "PARTNER" ||
    role === Role.AMBASSADOR ||
    role === "AMBASSADOR"
  ) {
    return true;
  }
  return Boolean(portals?.length);
}

export function canPublishContent(role?: Role | null) {
  if (!role) return false;
  return role === Role.ADMIN || role === Role.EDITOR;
}

export function canManageOrders(role?: Role | null) {
  if (!role) return false;
  return role === Role.ADMIN || role === Role.OPERATIONS;
}
