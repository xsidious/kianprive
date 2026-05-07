import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessAdmin } from "@/lib/rbac";

const adminPaths = ["/admin"];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  if (!isAdminRoute) return NextResponse.next();

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!canAccessAdmin(token.role as never)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
