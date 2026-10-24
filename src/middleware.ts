import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import {
  canAccessAdmin,
  canAccessAmbassadorPortal,
  canAccessPartnerPortal,
  canAccessProviderPortal,
} from "@/lib/rbac";
import { applySecurityHeaders, clientIp, rateLimit } from "@/lib/anti-bot";

const adminPaths = ["/admin"];
const partnerPaths = ["/partner"];
const ambassadorPaths = ["/ambassador"];
const providerPaths = ["/provider"];
const memberDashboardPaths = ["/dashboard"];
const memberOnlyPaths = ["/practitioners", "/athletes"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = clientIp(req);

  // Rate-limit auth + public intake/contact surfaces
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

  if (isMemberDashboard && roleHome !== "/dashboard") {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isMemberOnlyRoute) {
    res = NextResponse.next();
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isProviderRoute && !canAccessProviderPortal(role as never)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isAmbassadorRoute && !canAccessAmbassadorPortal(role as never)) {
    res = NextResponse.redirect(new URL(roleHome, req.url));
    applySecurityHeaders(res.headers);
    return res;
  }

  if (isPartnerRoute) {
    if (!canAccessPartnerPortal(role as never)) {
      res = NextResponse.redirect(new URL(roleHome, req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
    if (role === "AMBASSADOR") {
      res = NextResponse.redirect(new URL("/ambassador", req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
    if (role === "PROVIDER") {
      res = NextResponse.redirect(new URL("/provider", req.url));
      applySecurityHeaders(res.headers);
      return res;
    }
  }

  if (isAdminRoute && !canAccessAdmin(role as never)) {
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
