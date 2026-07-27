import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { canAccessAdmin, canAccessAmbassadorPortal, canAccessPartnerPortal } from "@/lib/rbac";

const adminPaths = ["/admin"];
const partnerPaths = ["/partner"];
const ambassadorPaths = ["/ambassador"];
const memberDashboardPaths = ["/dashboard"];
const memberOnlyPaths = ["/practitioners", "/athletes"];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isPartnerRoute = partnerPaths.some((path) => pathname.startsWith(path));
  const isAmbassadorRoute = ambassadorPaths.some((path) => pathname.startsWith(path));
  const isMemberDashboard = memberDashboardPaths.some((path) => pathname.startsWith(path));
  const isMemberOnlyRoute = memberOnlyPaths.some((path) => pathname.startsWith(path));

  if (!isAdminRoute && !isPartnerRoute && !isAmbassadorRoute && !isMemberDashboard && !isMemberOnlyRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    if (isMemberOnlyRoute) {
      const target = pathname.startsWith("/athletes") ? "athletes" : "practitioners";
      return NextResponse.redirect(new URL(`/access-required?target=${target}`, req.url));
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = token.role as string | undefined;
  const roleHome = getPortalHomeForRole(role);

  // Ambassadors / partners / staff should never stay on the member dashboard.
  if (isMemberDashboard && roleHome !== "/dashboard") {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  if (isMemberOnlyRoute) {
    return NextResponse.next();
  }

  if (isAmbassadorRoute) {
    if (!canAccessAmbassadorPortal(role as never)) {
      return NextResponse.redirect(new URL(roleHome, req.url));
    }
    return NextResponse.next();
  }

  if (isPartnerRoute) {
    if (!canAccessPartnerPortal(role as never)) {
      return NextResponse.redirect(new URL(roleHome, req.url));
    }
    if (role === "AMBASSADOR") {
      return NextResponse.redirect(new URL("/ambassador", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!canAccessAdmin(role as never)) {
      return NextResponse.redirect(new URL(roleHome, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/partner/:path*",
    "/ambassador/:path*",
    "/dashboard/:path*",
    "/practitioners/:path*",
    "/athletes/:path*",
  ],
};
