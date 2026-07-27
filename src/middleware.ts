import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessAdmin, canAccessAmbassadorPortal, canAccessPartnerPortal } from "@/lib/rbac";

const adminPaths = ["/admin"];
const partnerPaths = ["/partner"];
const ambassadorPaths = ["/ambassador"];
const memberOnlyPaths = ["/practitioners", "/athletes"];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isPartnerRoute = partnerPaths.some((path) => pathname.startsWith(path));
  const isAmbassadorRoute = ambassadorPaths.some((path) => pathname.startsWith(path));
  const isMemberOnlyRoute = memberOnlyPaths.some((path) => pathname.startsWith(path));
  if (!isAdminRoute && !isPartnerRoute && !isAmbassadorRoute && !isMemberOnlyRoute) return NextResponse.next();

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    if (isMemberOnlyRoute) {
      const target = pathname.startsWith("/athletes") ? "athletes" : "practitioners";
      return NextResponse.redirect(new URL(`/access-required?target=${target}`, req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isMemberOnlyRoute) {
    return NextResponse.next();
  }

  if (isAmbassadorRoute) {
    if (!canAccessAmbassadorPortal(token.role as never)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (isPartnerRoute) {
    if (!canAccessPartnerPortal(token.role as never)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if ((token.role as string) === "AMBASSADOR") {
      return NextResponse.redirect(new URL("/ambassador", req.url));
    }
    return NextResponse.next();
  }

  if (!canAccessAdmin(token.role as never)) {
    if ((token.role as string) === "PARTNER") {
      return NextResponse.redirect(new URL("/partner", req.url));
    }
    if ((token.role as string) === "AMBASSADOR") {
      return NextResponse.redirect(new URL("/ambassador", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/partner/:path*",
    "/ambassador/:path*",
    "/practitioners/:path*",
    "/athletes/:path*",
  ],
};
