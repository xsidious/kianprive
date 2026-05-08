import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessAdmin } from "@/lib/rbac";

const adminPaths = ["/admin"];
const memberOnlyPaths = ["/practitioners", "/athletes"];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isMemberOnlyRoute = memberOnlyPaths.some((path) => pathname.startsWith(path));
  if (!isAdminRoute && !isMemberOnlyRoute) return NextResponse.next();

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

  if (!canAccessAdmin(token.role as never)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/practitioners/:path*", "/athletes/:path*"],
};
