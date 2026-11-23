import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { applySecurityHeaders, clientIp, rateLimit } from "@/lib/anti-bot";

/** Edge-safe role checks — do not import @prisma/client (blows past 1MB Edge limit). */
type PortalKind = "partner" | "ambassador" | "practitioner";

function canAccessAdmin(role?: string | null) {
  return role === "ADMIN" || role === "OPERATIONS" || role === "EDITOR";
}

function canAccessPartnerPortal(role?: string | null, portals?: PortalKind[] | null) {
  if (role === "PARTNER" || role === "ADMIN") return true;
  if (role === "AMBASSADOR" || role === "PROVIDER") return true;
  return Boolean(portals?.includes("partner"));
}

function canAccessAmbassadorPortal(role?: string | null, portals?: PortalKind[] | null) {
  if (role === "AMBASSADOR" || role === "ADMIN") return true;
  return Boolean(portals?.includes("ambassador"));
}

function canAccessProviderPortal(role?: string | null, portals?: PortalKind[] | null) {
  if (role === "PROVIDER" || role === "ADMIN") return true;
  return Boolean(portals?.includes("practitioner"));
}

function canAccessMemberDashboard(role?: string | null, portals?: PortalKind[] | null) {
  if (!role && !portals?.length) return false;
  if (canAccessAdmin(role)) return false;
  if (role === "MEMBER" || role === "GUEST") return true;
  if (role === "PROVIDER" || role === "PARTNER" || role === "AMBASSADOR") return true;
  return Boolean(portals?.length);
}

function getPortalHomeForRole(role?: string | null) {
  switch (role) {
    case "ADMIN":
    case "OPERATIONS":
    case "EDITOR":
      return "/admin";
    case "PARTNER":
      return "/partner";
    case "AMBASSADOR":
      return "/ambassador";
    case "PROVIDER":
      return "/provider";
    default:
      return "/dashboard";
  }
}

const adminPaths = ["/admin"];
const partnerPaths = ["/partner"];
const ambassadorPaths = ["/ambassador"];
const providerPaths = ["/provider"];
const memberDashboardPaths = ["/dashboard"];
const memberOnlyPaths = ["/practitioners", "/athletes"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = clientIp(req);

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/intake") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/welcome"
  ) {
    const limit = pathname.startsWith("/api/auth") ? 40 : pathname.startsWith("/api/intake") ? 40 : 30;
    const limited = rateLimit(`kian:${ip}:${pathname.split("/").slice(0, 3).join("/")}`, limit, 60_000);
    if (!limited.ok) {
      return new NextResponse("Too many requests.", { status: 429, headers: { "Retry-After": "60" } });
    }
  }

  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isPartnerRoute = partnerPaths.some((path) => pathname.startsWith(path));
  const isAmbassadorRoute = ambassadorPaths.some((path) => pathname.startsWith(path));
  const isProviderRoute = providerPaths.some((path) => pathname.startsWith(path));
  const isMemberDashboard = memberDashboardPaths.some((path) => pathname.startsWith(path));
  const isMemberOnlyRoute = memberOnlyPaths.some((path) => pathname.startsWith(path));

  let res: NextResponse;

  if (
    !isAdminRoute &&
    !isPartnerRoute &&
    !isAmbassadorRoute &&
    !isProviderRoute &&
    !isMemberDashboard &&
    !isMemberOnlyRoute
  ) {
    res = NextResponse.next();
    applySecurityHeaders(res.headers);
    return res;
  }

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    if (isMemberOnlyRoute) {
      const target = pathname.startsWith("/athletes") ? "athletes" : "practitioners";
      res = NextResponse.redirect(new URL(`/access-required?target=${target}`, req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    res = NextResponse.redirect(login);
    applySecurityHeaders(res.headers);
    return res;
  }

  const role = token.role as string | undefined;
  const portals = (Array.isArray(token.portals) ? token.portals : []) as PortalKind[];
  const roleHome = getPortalHomeForRole(role);

  if (
    isMemberDashboard &&
    token.memberOnboardingComplete === false &&
    (role === "MEMBER" || role === "GUEST")
  ) {
    res = NextResponse.redirect(new URL("/onboarding", req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isMemberDashboard && !canAccessMemberDashboard(role, portals)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isMemberOnlyRoute) {
    res = NextResponse.next();
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isProviderRoute && !canAccessProviderPortal(role, portals)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isAmbassadorRoute && !canAccessAmbassadorPortal(role, portals)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isPartnerRoute) {
    if (!canAccessPartnerPortal(role, portals)) {
      res = NextResponse.redirect(new URL(roleHome, req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
    if (
      (role === "AMBASSADOR" || portals.includes("ambassador")) &&
      !portals.includes("partner") &&
      role !== "PARTNER"
    ) {
      res = NextResponse.redirect(new URL("/ambassador", req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
  }

  if (isAdminRoute && !canAccessAdmin(role)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  res = NextResponse.next();
  applySecurityHeaders(res.headers);
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/partner/:path*",
    "/ambassador/:path*",
    "/provider/:path*",
    "/dashboard/:path*",
    "/practitioners/:path*",
    "/athletes/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/welcome",
    "/api/auth/:path*",
    "/api/intake/:path*",
  ],
};
