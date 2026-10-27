import { Role } from "@prisma/client";
import type { PortalKind } from "@/lib/rbac";
import {
  canAccessAmbassadorPortal,
  canAccessPartnerPortal,
  canAccessProviderPortal,
} from "@/lib/rbac";

/** Primary home after login for each role (first stop — portals still reachable). */
export function getPortalHomeForRole(role?: Role | string | null) {
  switch (role) {
    case Role.ADMIN:
    case Role.OPERATIONS:
    case Role.EDITOR:
    case "ADMIN":
    case "OPERATIONS":
    case "EDITOR":
      return "/admin";
    case Role.PARTNER:
    case "PARTNER":
      return "/partner";
    case Role.AMBASSADOR:
    case "AMBASSADOR":
      return "/ambassador";
    case Role.PROVIDER:
    case "PROVIDER":
      return "/provider";
    case Role.MEMBER:
    case "MEMBER":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export function getPortalLabelForRole(role?: Role | string | null) {
  switch (role) {
    case Role.ADMIN:
    case Role.OPERATIONS:
    case Role.EDITOR:
    case "ADMIN":
    case "OPERATIONS":
    case "EDITOR":
      return "Admin";
    case Role.PARTNER:
    case "PARTNER":
      return "Partner portal";
    case Role.AMBASSADOR:
    case "AMBASSADOR":
      return "Ambassador portal";
    case Role.PROVIDER:
    case "PROVIDER":
      return "Practitioner portal";
    default:
      return "Dashboard";
  }
}

function pathAllowedForUser(
  path: string,
  role: Role | string | null | undefined,
  portals?: PortalKind[] | null,
) {
  if (path.startsWith("/admin")) {
    return (
      role === Role.ADMIN ||
      role === "ADMIN" ||
      role === Role.OPERATIONS ||
      role === "OPERATIONS" ||
      role === Role.EDITOR ||
      role === "EDITOR"
    );
  }
  if (path.startsWith("/partner")) return canAccessPartnerPortal(role, portals);
  if (path.startsWith("/ambassador")) return canAccessAmbassadorPortal(role, portals);
  if (path.startsWith("/provider")) return canAccessProviderPortal(role, portals);
  if (path.startsWith("/dashboard")) return true;
  return true;
}

/** Resolve post-login destination, respecting safe callback URLs and dual portal access. */
export function resolvePostLoginPath(
  role: Role | string | null | undefined,
  callbackUrl?: string | null,
  flags?: {
    mustSetPassword?: boolean;
    memberOnboardingComplete?: boolean;
    portals?: PortalKind[] | null;
  },
) {
  if (flags?.mustSetPassword) return "/welcome";
  if (
    flags?.memberOnboardingComplete === false &&
    (role === Role.MEMBER || role === Role.GUEST || role === "MEMBER" || role === "GUEST")
  ) {
    return "/onboarding";
  }

  const home = getPortalHomeForRole(role);
  if (!callbackUrl) return home;
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return home;

  if (pathAllowedForUser(callbackUrl, role, flags?.portals)) {
    return callbackUrl;
  }
  return home;
}
