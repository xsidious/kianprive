import { Role } from "@prisma/client";

/** Primary home after login for each role. */
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

/** Resolve post-login destination, respecting safe callback URLs. */
export function resolvePostLoginPath(role: Role | string | null | undefined, callbackUrl?: string | null) {
  const home = getPortalHomeForRole(role);
  if (!callbackUrl) return home;
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return home;

  if (role === Role.ADMIN || role === Role.OPERATIONS || role === Role.EDITOR || role === "ADMIN" || role === "OPERATIONS" || role === "EDITOR") {
    return callbackUrl.startsWith("/admin") ? callbackUrl : home;
  }
  if (role === Role.PARTNER || role === "PARTNER") {
    return callbackUrl.startsWith("/partner") ? callbackUrl : home;
  }
  if (role === Role.AMBASSADOR || role === "AMBASSADOR") {
    return callbackUrl.startsWith("/ambassador") ? callbackUrl : home;
  }
  if (role === Role.PROVIDER || role === "PROVIDER") {
    return callbackUrl.startsWith("/provider") ? callbackUrl : home;
  }

  if (
    callbackUrl.startsWith("/admin") ||
    callbackUrl.startsWith("/partner") ||
    callbackUrl.startsWith("/ambassador") ||
    callbackUrl.startsWith("/provider")
  ) {
    return home;
  }
  return callbackUrl;
}
